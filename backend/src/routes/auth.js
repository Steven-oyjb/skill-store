/**
 * 飞书 OAuth 登录与用户认证
 * 支持飞书开放平台 OAuth 2.0 授权流程
 */

const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const router = express.Router();

// 内存存储（生产环境应使用数据库）
const oauthStates = new Map(); // state -> { redirectUri, timestamp }
const userTokens = new Map(); // openId -> { accessToken, refreshToken, expiresAt }

// 配置（从环境变量读取）
const FEISHU_APP_ID = process.env.FEISHU_APP_ID;
const FEISHU_APP_SECRET = process.env.FEISHU_APP_SECRET;
const FEISHU_REDIRECT_URI = process.env.FEISHU_REDIRECT_URI || 'http://localhost:3001/api/auth/callback';
const FEISHU_STATE_SECRET = process.env.FEISHU_STATE_SECRET || 'skill-store-secret';

/**
 * 生成随机 state 参数
 */
function generateState() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * 飞书 OAuth 授权入口
 * GET /api/auth/authorize
 * 
 * @query redirect - 授权成功后的回跳地址（可选，默认 /）
 */
router.get('/authorize', (req, res) => {
  const state = generateState();
  const redirectUrl = encodeURIComponent(FEISHU_REDIRECT_URI);
  
  // 存储 state 关联信息
  oauthStates.set(state, {
    redirect: req.query.redirect || '/',
    timestamp: Date.now()
  });
  
  // 飞书 OAuth 授权页面
  const authUrl = `https://open.feishu.cn/open-apis/authen/v1/authorize?` +
    `app_id=${FEISHU_APP_ID}` +
    `&redirect_uri=${redirectUrl}` +
    `&state=${state}`;
  
  res.redirect(authUrl);
});

/**
 * 飞书 OAuth 回调处理
 * GET /api/auth/callback
 * 
 * @query code - 飞书返回的授权码
 * @query state - 防止 CSRF 攻击的状态参数
 */
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // 验证 state
  if (!state || !oauthStates.has(state)) {
    return res.status(400).json({ 
      success: false, 
      error: 'invalid_state',
      message: '无效的授权状态，请重试' 
    });
  }
  
  const stateData = oauthStates.get(state);
  oauthStates.delete(state); // 一次性使用
  
  // 检查 state 过期（10分钟）
  if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
    return res.status(400).json({ 
      success: false, 
      error: 'state_expired',
      message: '授权已过期，请重试' 
    });
  }
  
  try {
    // 使用 code 换取 access_token
    const tokenResponse = await fetch('https://open.feishu.cn/open-apis/authen/v1/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        client_id: FEISHU_APP_ID,
        client_secret: FEISHU_APP_SECRET
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.code !== 0) {
      throw new Error(tokenData.msg || '获取访问令牌失败');
    }
    
    const { access_token, refresh_token, token_type, expires_in } = tokenData.data;
    const expiresAt = Date.now() + expires_in * 1000;
    
    // 获取用户信息
    const userResponse = await fetch('https://open.feishu.cn/open-apis/authen/v1/user_info', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    
    const userData = await userResponse.json();
    
    if (userData.code !== 0) {
      throw new Error(userData.msg || '获取用户信息失败');
    }
    
    const { open_id, union_id, name, avatar_url } = userData.data;
    
    // 存储用户令牌
    userTokens.set(open_id, {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt,
      userInfo: {
        openId: open_id,
        unionId: union_id,
        name,
        avatar: avatar_url
      }
    });
    
    // 生成应用自己的会话令牌（简单实现）
    const sessionToken = Buffer.from(JSON.stringify({
      openId: open_id,
      expiresAt
    })).toString('base64');
    
    // 回跳到前端
    const redirectUrl = `${stateData.redirect}?token=${sessionToken}`;
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('飞书 OAuth 回调错误:', error);
    res.redirect(`/login?error=auth_failed&message=${encodeURIComponent(error.message)}`);
  }
});

/**
 * 刷新访问令牌
 * POST /api/auth/refresh
 */
router.post('/refresh', async (req, res) => {
  const { openId } = req.body;
  
  if (!openId || !userTokens.has(openId)) {
    return res.status(400).json({ 
      success: false, 
      error: 'invalid_user',
      message: '用户不存在' 
    });
  }
  
  const userToken = userTokens.get(openId);
  
  try {
    const response = await fetch('https://open.feishu.cn/open-apis/authen/v1/refresh_access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        refresh_token: userToken.refreshToken,
        client_id: FEISHU_APP_ID,
        client_secret: FEISHU_APP_SECRET
      })
    });
    
    const data = await response.json();
    
    if (data.code !== 0) {
      // 刷新失败，可能是令牌被撤销
      userTokens.delete(openId);
      return res.status(401).json({ 
        success: false, 
        error: 'token_revoked',
        message: '请重新登录' 
      });
    }
    
    const { access_token, refresh_token, expires_in } = data.data;
    userToken.accessToken = access_token;
    userToken.refreshToken = refresh_token;
    userToken.expiresAt = Date.now() + expires_in * 1000;
    
    res.json({ success: true, data: { expiresIn: expires_in } });
    
  } catch (error) {
    console.error('刷新令牌错误:', error);
    res.status(500).json({ 
      success: false, 
      error: 'refresh_failed',
      message: '刷新令牌失败' 
    });
  }
});

/**
 * 验证当前用户
 * GET /api/auth/verify
 */
router.get('/verify', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      error: 'no_token',
      message: '未提供认证令牌' 
    });
  }
  
  try {
    const sessionToken = authHeader.substring(7);
    const session = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
    
    const { openId, expiresAt } = session;
    
    if (Date.now() > expiresAt) {
      return res.status(401).json({ 
        success: false, 
        error: 'token_expired',
        message: '会话已过期，请重新登录' 
      });
    }
    
    if (!userTokens.has(openId)) {
      return res.status(401).json({ 
        success: false, 
        error: 'invalid_token',
        message: '用户不存在' 
      });
    }
    
    const userToken = userTokens.get(openId);
    
    // 检查是否需要刷新令牌
    if (userToken.expiresAt - Date.now() < 5 * 60 * 1000) {
      // 即将过期，尝试刷新
      try {
        const response = await fetch('https://open.feishu.cn/open-apis/authen/v1/refresh_access_token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grant_type: 'refresh_token',
            refresh_token: userToken.refreshToken,
            client_id: FEISHU_APP_ID,
            client_secret: FEISHU_APP_SECRET
          })
        });
        
        const data = await response.json();
        
        if (data.code === 0) {
          userToken.accessToken = data.data.access_token;
          userToken.refreshToken = data.data.refresh_token;
          userToken.expiresAt = Date.now() + data.data.expires_in * 1000;
        }
      } catch (e) {
        console.error('刷新令牌失败:', e);
      }
    }
    
    res.json({ 
      success: true, 
      data: { 
        user: userToken.userInfo,
        expiresAt: userToken.expiresAt
      } 
    });
    
  } catch (error) {
    console.error('验证令牌错误:', error);
    res.status(401).json({ 
      success: false, 
      error: 'invalid_token',
      message: '无效的认证令牌' 
    });
  }
});

/**
 * 退出登录
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const sessionToken = authHeader.substring(7);
      const session = JSON.parse(Buffer.from(sessionToken, 'base64').toString());
      
      if (session.openId && userTokens.has(session.openId)) {
        userTokens.delete(session.openId);
      }
    } catch (e) {
      // 忽略解析错误
    }
  }
  
  res.json({ success: true });
});

/**
 * 获取飞书授权配置信息（前端使用）
 * GET /api/auth/config
 */
router.get('/config', (req, res) => {
  res.json({
    success: true,
    data: {
      appId: FEISHU_APP_ID,
      redirectUri: FEISHU_REDIRECT_URI,
      authUrl: `https://open.feishu.cn/open-apis/authen/v1/authorize?app_id=${FEISHU_APP_ID}&redirect_uri=${encodeURIComponent(FEISHU_REDIRECT_URI)}`
    }
  });
});

module.exports = router;
