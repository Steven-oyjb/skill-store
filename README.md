# Skill Store 部署指南

## 项目概述

Skill Store 是一个企业级 Skill 管理和分发平台，支持飞书 OAuth 登录、消息推送通知、飞书机器人调用等功能。

## 功能特性

### 飞书集成
- ✅ 飞书 OAuth 2.0 登录
- ✅ 消息推送通知（Skill 发布、审核、评论等）
- ✅ 飞书机器人 Skill 调用

### 部署配置
- ✅ Docker 支持（前后端分离）
- ✅ Docker Compose 一键部署
- ✅ Nginx 配置（生产环境）
- ✅ 环境变量配置

### 用户功能
- 🎨 Skill 商店浏览与搜索
- 📝 Skill 创建与编辑
- ⭐ Skill 评价与评分
- 📥 Skill 下载使用
- 👤 个人中心

### 管理功能
- 📊 数据统计面板
- ✏️ Skill 审核管理
- 👥 用户管理

## 快速部署

### 1. 环境要求

- Docker >= 20.10
- Docker Compose >= 2.0
- 飞书开发者账号（创建应用获取 App ID 和 Secret）

### 2. 配置飞书应用

1. 打开 [飞书开放平台](https://open.feishu.cn/)
2. 创建企业自建应用
3. 获取 `App ID` 和 `App Secret`
4. 配置 OAuth 回调地址：`https://your-domain.com/api/auth/callback`
5. 添加应用权限：
   - `im.message.send_as_bot`
   - `im.message.receive`
   - `contact:user.base:readonly`
   - `authen:v1:user_info:readonly`

### 3. 配置环境变量

```bash
# 复制配置模板
cp .env.example .env

# 编辑配置
vim .env
```

必需配置项：
- `FEISHU_APP_ID` - 飞书应用 ID
- `FEISHU_APP_SECRET` - 飞书应用密钥

可选配置项：
- `ANTHROPIC_API_KEY` - Anthropic API Key（用于 AI 功能）
- `FRONTEND_PORT` - 前端端口（默认 3000）
- `BACKEND_PORT` - 后端端口（默认 3001）

### 4. 一键部署

```bash
# 使用部署脚本
./deploy.sh

# 或手动启动
docker compose up -d
```

### 5. 验证部署

访问 http://localhost:3000 检查前端
访问 http://localhost:3001/api/health 检查后端

## 飞书机器人配置

### Webhook 事件订阅

1. 在飞书开发者后台配置事件订阅 URL：
   - URL: `https://your-domain.com/api/bot/webhook`
   - 验证 Token 和 Encrypt Key

2. 订阅事件：
   - `im.message.receive.bot` - 接收消息事件
   - `im.message.message_at_bot` - @机器人消息

### 使用机器人调用 Skill

在群聊中 @机器人 并输入：
```
@机器人 技能名 --参数=值
```

示例：
```
@机器人 飞书任务创建 --标题=测试任务 --负责人=张三
```

发送 `skill list` 查看所有可用技能。

## Nginx 生产部署

### 单机器部署

```bash
# 1. 构建前端
cd frontend && npm run build

# 2. 配置 Nginx
sudo cp nginx.conf /etc/nginx/sites-available/skill-store
sudo ln -s /etc/nginx/sites-available/skill-store /etc/nginx/sites-enabled/
sudo nginx -t

# 3. 启动后端服务
cd backend && npm install && npm start
```

### Docker 部署（推荐）

```bash
# 使用 Docker Compose
docker compose up -d
```

## 目录结构

```
skill-store/
├── backend/              # 后端服务
│   ├── src/
│   │   ├── routes/      # API 路由
│   │   │   ├── auth.js      # 飞书 OAuth
│   │   │   ├── bot.js       # 飞书机器人
│   │   │   ├── skills.js    # Skill 管理
│   │   │   ├── users.js     # 用户管理
│   │   │   ├── ai.js        # AI 服务
│   │   │   └── admin.js     # 管理后台
│   │   └── services/    # 业务服务
│   │       ├── feishuNotify.js  # 消息推送
│   │       ├── skillService.js
│   │       └── aiService.js
│   └── Dockerfile
├── frontend/             # 前端应用
│   ├── src/
│   │   ├── components/  # React 组件
│   │   ├── pages/       # 页面组件
│   │   ├── services/    # API 服务
│   │   └── contexts/    # React Context
│   ├── nginx.conf       # Nginx 配置
│   └── Dockerfile
├── docker-compose.yml   # Docker Compose 配置
├── deploy.sh           # 部署脚本
├── nginx.conf          # Nginx 配置模板
└── .env.example        # 环境变量模板
```

## API 文档

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/auth/authorize | 飞书授权入口 |
| GET | /api/auth/callback | OAuth 回调 |
| GET | /api/auth/verify | 验证用户 |
| POST | /api/auth/logout | 退出登录 |
| GET | /api/auth/config | 获取授权配置 |

### 消息推送

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/bot/webhook | 消息回调 |
| POST | /api/bot/execute | 执行 Skill |
| GET | /api/bot/skills | 获取技能列表 |
| GET | /api/bot/info | 获取机器人信息 |

### Skill 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/skills | 获取 Skill 列表 |
| GET | /api/skills/:id | 获取详情 |
| POST | /api/skills | 创建 Skill |
| PUT | /api/skills/:id | 更新 Skill |
| DELETE | /api/skills/:id | 删除 Skill |

## 常见问题

### Q: 登录失败，提示 invalid_token
A: 检查 FEISHU_APP_ID 和 FEISHU_APP_SECRET 是否正确配置

### Q: 消息推送失败
A: 确保应用已开通 im.message.send_as_bot 权限

### Q: 机器人无法响应消息
A: 检查事件订阅配置，确保 URL 可公网访问

## 许可证

MIT License
