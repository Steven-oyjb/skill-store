/**
 * 飞书机器人 Skill 调用
 * 支持在飞书中通过 @机器人 调用 Skill
 */

const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const router = express.Router();

// 配置
const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;

// 导入 Skill 服务
const skillService = require('../services/skillService');

// 租户访问令牌
let tenantAccessToken = null;
let tenantTokenExpiresAt = 0;

/**
 * 获取租户访问令牌
 */
async function getTenantAccessToken() {
  if (tenantAccessToken && Date.now() < tenantTokenExpiresAt) {
    return tenantAccessToken;
  }
  
  const response = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: FEISHU_APP_ID,
      app_secret: FEISHU_APP_SECRET
    })
  });
  
  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`获取租户令牌失败: ${data.msg}`);
  }
  
  tenantAccessToken = data.data.tenant_access_token;
  tenantTokenExpiresAt = Date.now() + (data.data.expires_in - 5 * 60) * 1000;
  
  return tenantAccessToken;
}

/**
 * 解析 @机器人消息
 * 格式: @机器人 技能名 参数
 */
function parseBotMessage(messageContent) {
  // 移除 @机器人 的部分
  const text = messageContent.replace(/@[^ ]+/g, '').trim();
  
  // 解析命令格式: 技能名 --参数1=值1 --参数2=值2
  const parts = text.split(/\s+/);
  const skillName = parts[0];
  const args = {};
  
  parts.slice(1).forEach(part => {
    const match = part.match(/^--([^=]+)=(.+)$/);
    if (match) {
      args[match[1]] = match[2];
    }
  });
  
  return { skillName, args, raw: text };
}

/**
 * 发送回复消息
 */
async function sendReply(messageId, content, msgType = 'text') {
  const token = await getTenantAccessToken();
  
  const response = await fetch(`https://open.feishu.cn/open-apis/im/v1/messages/${messageId}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      msg_type: msgType,
      content: JSON.stringify(content)
    })
  });
  
  const data = await response.json();
  
  if (data.code !== 0) {
    console.error('发送回复失败:', data.msg);
    throw new Error(`发送回复失败: ${data.msg}`);
  }
  
  return data.data;
}

/**
 * 发送引用回复（带上下文）
 */
async function sendReplyWithQuote(messageId, content) {
  const token = await getTenantAccessToken();
  
  const response = await fetch(`https://open.feishu.cn/open-apis/im/v1/messages/${messageId}/reply`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      msg_type: 'post',
      content: JSON.stringify({
        zh_cn: {
          title: '',
          content: [
            [
              { tag: 'text', text: content }
            ]
          ]
        }
      })
    })
  });
  
  const data = await response.json();
  
  if (data.code !== 0) {
    console.error('发送回复失败:', data.msg);
  }
  
  return data.data;
}

/**
 * Webhook 回调处理
 * POST /api/bot/webhook
 * 
 * 飞书事件回调 URL，用于接收消息
 */
router.post('/webhook', express.json(), async (req, res) => {
  const { type, challenge, event } = req.body;
  
  // URL 验证
  if (type === 'url_verification') {
    return res.json({ challenge });
  }
  
  // 消息事件
  if (type === 'event_callback' && event && event.message) {
    const message = event.message;
    const messageId = message.message_id;
    const messageType = message.msg_type;
    const chatId = message.chat_id;
    
    // 只处理文本消息和被@的消息
    if (messageType !== 'text' && messageType !== 'at') {
      return res.json({ success: true });
    }
    
    // 获取消息内容
    let messageContent = '';
    try {
      const token = await getTenantAccessToken();
      const msgResponse = await fetch(
        `https://open.feishu.cn/open-apis/im/v1/messages/${messageId}?message_id=${messageId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const msgData = await msgResponse.json();
      
      if (msgData.code === 0 && msgData.data && msgData.data.message) {
        messageContent = msgData.data.message.body.content;
      }
    } catch (e) {
      console.error('获取消息内容失败:', e);
      return res.json({ success: true });
    }
    
    // 解析消息
    let parsed;
    try {
      const content = JSON.parse(messageContent);
      parsed = {
        text: content.text || '',
        isAt: content.at !== undefined,
        atUsers: content.at || []
      };
    } catch (e) {
      parsed = { text: messageContent, isAt: false, atUsers: [] };
    }
    
    // 解析 Skill 调用
    const { skillName, args, raw } = parseBotMessage(parsed.text);
    
    // 检查是否是调用 Skill
    if (!skillName) {
      // 只是普通@，发送帮助信息
      const helpText = `你好！我是 Skill 助手。

使用方法：
@机器人 [技能名] [--参数=值]

例如：
@机器人 天气 --城市=北京
@机器人 翻译 --文本=Hello

发送 "skill list" 查看所有可用技能`;
      
      try {
        await sendReply(messageId, { text: helpText });
      } catch (e) {
        console.error('发送帮助消息失败:', e);
      }
      
      return res.json({ success: true });
    }
    
    // 列出所有技能
    if (skillName.toLowerCase() === 'list' || skillName.toLowerCase() === '列表') {
      const skills = await skillService.getAllPublishedSkills();
      const skillList = skills.map(s => `• ${s.name}: ${s.description}`).join('\n');
      const helpText = `📋 可用技能列表：\n\n${skillList || '暂无公开技能'}\n\n使用: @机器人 [技能名] [--参数=值]`;
      
      try {
        await sendReply(messageId, { text: helpText });
      } catch (e) {
        console.error('发送技能列表失败:', e);
      }
      
      return res.json({ success: true });
    }
    
    // 查找 Skill
    const skill = await skillService.findSkillByName(skillName);
    
    if (!skill) {
      const errorText = `未找到技能: "${skillName}"\n\n发送 "skill list" 查看所有可用技能`;
      
      try {
        await sendReply(messageId, { text: errorText });
      } catch (e) {
        console.error('发送错误消息失败:', e);
      }
      
      return res.json({ success: true });
    }
    
    // 执行 Skill
    try {
      // 先发送"处理中"消息
      await sendReply(messageId, { text: `⏳ 正在执行 "${skill.name}"...` });
      
      // 执行 Skill 逻辑（这里可以调用 AI 服务）
      const result = await executeSkill(skill, args, { messageId, chatId });
      
      // 发送结果
      await sendReply(messageId, { text: result });
      
    } catch (e) {
      console.error('执行 Skill 失败:', e);
      await sendReply(messageId, { text: `❌ 执行失败: ${e.message}` });
    }
    
    return res.json({ success: true });
  }
  
  res.json({ success: true });
});

/**
 * 执行 Skill
 */
async function executeSkill(skill, args, context) {
  // 这里可以根据 skill 的配置执行不同的逻辑
  // 目前是一个简单的示例
  
  const { prompt, parameters } = skill;
  
  // 构建参数
  const usedArgs = {};
  (parameters || []).forEach(param => {
    usedArgs[param.name] = args[param.name] || param.description;
  });
  
  // 模拟执行（实际应该调用 AI 或其他服务）
  if (prompt) {
    // 如果有 prompt，可以调用 AI 服务生成响应
    return `✅ "${skill.name}" 执行完成\n\n输入参数: ${JSON.stringify(usedArgs, null, 2)}\n\nSkill 提示词: ${prompt.substring(0, 100)}...`;
  }
  
  return `✅ "${skill.name}" 执行完成\n\n输入参数: ${JSON.stringify(usedArgs, null, 2)}`;
}

/**
 * 手动触发 Skill（通过 API）
 * POST /api/bot/execute
 */
router.post('/execute', async (req, res) => {
  const { skillName, args, userId } = req.body;
  
  if (!skillName) {
    return res.status(400).json({
      success: false,
      error: 'missing_skill_name',
      message: '请提供 skillName 参数'
    });
  }
  
  try {
    // 查找 Skill
    const skill = await skillService.findSkillByName(skillName);
    
    if (!skill) {
      return res.status(404).json({
        success: false,
        error: 'skill_not_found',
        message: `未找到技能: ${skillName}`
      });
    }
    
    // 执行 Skill
    const result = await executeSkill(skill, args || {}, { userId });
    
    res.json({
      success: true,
      data: {
        skillId: skill.id,
        skillName: skill.name,
        result
      }
    });
    
  } catch (error) {
    console.error('执行 Skill 失败:', error);
    res.status(500).json({
      success: false,
      error: 'execution_failed',
      message: error.message
    });
  }
});

/**
 * 获取可用技能列表
 * GET /api/bot/skills
 */
router.get('/skills', async (req, res) => {
  try {
    const skills = await skillService.getAllPublishedSkills();
    
    res.json({
      success: true,
      data: skills.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        category: s.category,
        parameters: s.parameters || []
      }))
    });
  } catch (error) {
    console.error('获取技能列表失败:', error);
    res.status(500).json({
      success: false,
      error: 'fetch_failed',
      message: error.message
    });
  }
});

/**
 * 获取机器人信息
 * GET /api/bot/info
 */
router.get('/info', async (req, res) => {
  try {
    const token = await getTenantAccessToken();
    
    // 获取机器人信息
    const response = await fetch('https://open.feishu.cn/open-apis/bot/v3/info', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    
    res.json({
      success: true,
      data: data.data || {}
    });
  } catch (error) {
    console.error('获取机器人信息失败:', error);
    res.status(500).json({
      success: false,
      error: 'fetch_failed',
      message: error.message
    });
  }
});

module.exports = router;
