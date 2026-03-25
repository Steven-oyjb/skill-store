#!/bin/bash

# Skill Store 部署脚本
# 用法: ./deploy.sh [environment]
# 环境: local, production

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认配置
ENV=${1:-local}
PROJECT_NAME="skill-store"
COMPOSE_FILE="docker-compose.yml"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  Skill Store 部署脚本${NC}"
echo -e "${BLUE}======================================${NC}"
echo ""

# 检查环境
if [ "$ENV" = "production" ]; then
    echo -e "${YELLOW}部署环境: 生产环境${NC}"
else
    echo -e "${YELLOW}部署环境: 本地开发${NC}"
fi

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}错误: Docker Compose 未安装${NC}"
    exit 1
fi

# 检查环境变量文件
if [ ! -f .env ]; then
    echo -e "${YELLOW}警告: .env 文件不存在，正在从 .env.example 创建...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}请编辑 .env 文件填入实际配置后重新运行${NC}"
    exit 1
fi

# 检查必要配置
source .env

if [ -z "$FEISHU_APP_ID" ] || [ "$FEISHU_APP_ID" = "cli_xxxxxxxxxxxxx" ]; then
    echo -e "${RED}错误: 请在 .env 中配置 FEISHU_APP_ID${NC}"
    exit 1
fi

if [ -z "$FEISHU_APP_SECRET" ] || [ "$FEISHU_APP_SECRET" = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" ]; then
    echo -e "${RED}错误: 请在 .env 中配置 FEISHU_APP_SECRET${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 配置检查通过${NC}"
echo ""

# 停止旧容器
echo -e "${YELLOW}停止旧容器...${NC}"
if docker compose -f $COMPOSE_FILE down 2>/dev/null; then
    echo -e "${GREEN}✓ 已停止旧容器${NC}"
else
    echo -e "${YELLOW}没有运行中的容器${NC}"
fi

# 构建镜像
echo ""
echo -e "${YELLOW}构建 Docker 镜像...${NC}"
docker compose -f $COMPOSE_FILE build --no-cache

# 启动服务
echo ""
echo -e "${YELLOW}启动服务...${NC}"
docker compose -f $COMPOSE_FILE up -d

# 等待服务启动
echo ""
echo -e "${YELLOW}等待服务启动...${NC}"
sleep 10

# 检查服务状态
echo ""
echo -e "${YELLOW}检查服务状态...${NC}"

# 检查后端
if curl -s http://localhost:${BACKEND_PORT:-3001}/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 后端服务运行正常${NC}"
else
    echo -e "${RED}✗ 后端服务启动失败${NC}"
    docker compose -f $COMPOSE_FILE logs backend
    exit 1
fi

# 检查前端
if curl -s http://localhost:${FRONTEND_PORT:-3000} > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 前端服务运行正常${NC}"
else
    echo -e "${RED}✗ 前端服务启动失败${NC}"
    docker compose -f $COMPOSE_FILE logs frontend
    exit 1
fi

echo ""
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}======================================${NC}"
echo ""
echo -e "前端地址: http://localhost:${FRONTEND_PORT:-3000}"
echo -e "后端地址: http://localhost:${BACKEND_PORT:-3001}"
echo ""
echo "查看日志: docker compose -f $COMPOSE_FILE logs -f"
echo "停止服务: docker compose -f $COMPOSE_FILE down"
echo ""
