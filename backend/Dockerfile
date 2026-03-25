# Skill Store 后端 Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package 文件
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制源代码
COPY src ./src

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["node", "src/index.js"]
