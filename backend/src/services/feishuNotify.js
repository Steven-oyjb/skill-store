/**
 * 飞书消息推送服务
 * 支持向用户或群聊发送消息通知
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// 配置（从环境变量读取）
const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
const FEISHU_BOT_OPEN_ID = process.env.FEISHU_BOT_OPEN_ID; // 机器人 open_id

// 租户访问令牌缓存
let tenantAccessToken = null;
let tenantTokenExpiresAt = 0;

/**
 * 获取租户访问令牌
 * 用于发送消息等需要应用身份的接口
 */
async function getTenantAccessToken() {
  // 检查缓存的令牌是否有效
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
  // 提前5分钟过期
  tenantTokenExpiresAt = Date.now() + (data.data.expires_in - 5 * 60) * 1000;
  
  return tenantAccessToken;
}

/**
 * 发送文本消息给用户
 * @param {string} receiveId - 接收者 ID (open_id 或 chat_id)
 * @param {string} content - 消息内容
 * @param {string} receiveIdType - 接收者类型: 'open_id' 或 'chat_id'
 */
async function sendTextMessage(receiveId, content, receiveIdType = 'open_id') {
  const token = await getTenantAccessToken();
  
  const response = await fetch('https://open.feishu.cn/open-apis/im/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      receive_id: receiveId,
      msg_type: 'text',
      content: JSON.stringify({ text: content }),
      receive_id_type: receiveIdType
    })
  });
  
  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`发送消息失败: ${data.msg}`);
  }
  
  return data.data;
}

/**
 * 发送富文本消息（Post消息）给用户
 * @param {string} receiveId - 接收者 ID
 * @param {object} postContent - Post 消息内容结构
 * @param {string} receiveIdType - 接收者类型
 */
async function sendPostMessage(receiveId, postContent, receiveIdType = 'open_id') {
  const token = await getTenantAccessToken();
  
  const response = await fetch('https://open.feishu.cn/open-apis/im/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      receive_id: receiveId,
      msg_type: 'post',
      content: JSON.stringify(postContent),
      receive_id_type: receiveIdType
    })
  });
  
  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`发送消息失败: ${data.msg}`);
  }
  
  return data.data;
}

/**
 * 发送消息卡片
 * @param {string} receiveId - 接收者 ID
 * @param {object} cardContent - 卡片 JSON 内容
 * @param {string} receiveIdType - 接收者类型
 */
async function sendCardMessage(receiveId, cardContent, receiveIdType = 'open_id') {
  const token = await getTenantAccessToken();
  
  const response = await fetch('https://open.feishu.cn/open-apis/im/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      receive_id: receiveId,
      msg_type: 'interactive',
      content: JSON.stringify(cardContent),
      receive_id_type: receiveIdType
    })
  });
  
  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`发送卡片消息失败: ${data.msg}`);
  }
  
  return data.data;
}

/**
 * 发送消息卡片（使用模板）
 * @param {string} receiveId - 接收者 ID
 * @param {string} templateId - 卡片模板 ID
 * @param {object} variables - 模板变量
 * @param {string} receiveIdType - 接收者类型
 */
async function sendCardTemplateMessage(receiveId, templateId, variables, receiveIdType = 'open_id') {
  const token = await getTenantAccessToken();
  
  const response = await fetch('https://open.feishu.cn/open-apis/im/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      receive_id: receiveId,
      msg_type: 'interactive',
      content: JSON.stringify({
        type: 'template',
        data: {
          template_id: templateId,
          variables
        }
      }),
      receive_id_type: receiveIdType
    })
  });
  
  const data = await response.json();
  
  if (data.code !== 0) {
    throw new Error(`发送模板卡片失败: ${data.msg}`);
  }
  
  return data.data;
}

// ========== 预定义消息模板 ==========

/**
 * Skill 发布通知
 */
async function notifySkillPublished(openId, skillName, authorName) {
  const content = {
    zh_cn: {
      title: '🎉 Skill 已发布',
      content: [
        [
          { tag: 'text', text: `您的 Skill 「${skillName}」已成功发布！` }
        ],
        [
          { tag: 'text', text: `发布人: ${authorName}` }
        ],
        [
          { tag: 'text', text: '现在可以在 Skill 商店中被其他用户搜索和使用。' }
        ]
      ]
    }
  };
  
  return sendPostMessage(openId, content);
}

/**
 * Skill 审核通过通知
 */
async function notifySkillApproved(openId, skillName) {
  const content = {
    zh_cn: {
      title: '✅ Skill 审核通过',
      content: [
        [
          { tag: 'text', text: `您的 Skill 「${skillName}」已通过审核！` }
        ],
        [
          { tag: 'text', text: '现在可以在 Skill 商店中被其他用户搜索和使用。' }
        ]
      ]
    }
  };
  
  return sendPostMessage(openId, content);
}

/**
 * Skill 审核拒绝通知
 */
async function notifySkillRejected(openId, skillName, reason) {
  const content = {
    zh_cn: {
      title: '❌ Skill 审核未通过',
      content: [
        [
          { tag: 'text', text: `您的 Skill 「${skillName}」未通过审核。` }
        ],
        [
          { tag: 'text', text: `原因: ${reason || '未说明原因'}` }
        ],
        [
          { tag: 'text', text: '请修改后重新提交审核。' }
        ]
      ]
    }
  };
  
  return sendPostMessage(openId, content);
}

/**
 * 新评论通知
 */
async function notifyNewReview(openId, skillName, reviewerName, rating, comment) {
  const stars = '⭐'.repeat(rating);
  
  const content = {
    zh_cn: {
      title: '💬 新评价通知',
      content: [
        [
          { tag: 'text', text: `您的 Skill 「${skillName}」收到新评价！` }
        ],
        [
          { tag: 'text', text: `${stars} ${reviewerName}:` }
        ],
        [
          { tag: 'text', text: comment }
        ]
      ]
    }
  };
  
  return sendPostMessage(openId, content);
}

/**
 * 下载通知（作者收到下载通知）
 */
async function notifyDownload(openId, skillName, downloaderName) {
  const content = {
    zh_cn: {
      title: '📥 下载通知',
      content: [
        [
          { tag: 'text', text: `您的 Skill 「${skillName}」被用户下载！` }
        ],
        [
          { tag: 'text', text: `下载人: ${downloaderName}` }
        ]
      ]
    }
  };
  
  return sendPostMessage(openId, content);
}

/**
 * 审核待办通知（管理员）
 */
async function notifyAdminReviewRequired(openId, skillName, applicantName) {
  const content = {
    zh_cn: {
      title: '📋 审核待办',
      content: [
        [
          { tag: 'text', text: `有新的 Skill 待审核` }
        ],
        [
          { tag: 'text', text: `Skill 名称: ${skillName}` }
        ],
        [
          { tag: 'text', text: `申请人: ${applicantName}` }
        ],
        [
          { 
            tag: 'a', 
            text: '前往审核 →', 
            href: process.env.ADMIN_URL || 'http://localhost:3000/admin'
          }
        ]
      ]
    }
  };
  
  return sendPostMessage(openId, content);
}

/**
 * 系统公告
 */
async function sendSystemAnnouncement(receiveId, title, contentList, receiveIdType = 'open_id') {
  const content = {
    zh_cn: {
      title,
      content: contentList.map(item => [
        { tag: 'text', text: item }
      ])
    }
  };
  
  return sendPostMessage(receiveId, content, receiveIdType);
}

module.exports = {
  // 核心方法
  sendTextMessage,
  sendPostMessage,
  sendCardMessage,
  sendCardTemplateMessage,
  
  // 预定义通知
  notifySkillPublished,
  notifySkillApproved,
  notifySkillRejected,
  notifyNewReview,
  notifyDownload,
  notifyAdminReviewRequired,
  sendSystemAnnouncement,
  
  // 工具方法
  getTenantAccessToken
};
