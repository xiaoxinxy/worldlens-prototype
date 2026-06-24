# WorldLens

WorldLens 是一个基于 Vue 3、Three.js 和 Spring Boot 的 3D 地球探索平台。项目包含国家、地形、气候、海洋、洋流、板块、季节与文明路线等可视化内容，并提供账户、收藏、浏览历史、后台内容管理和两套相互独立的 AI 能力。

- 首页“AI 探索”连接 DeepSeek API，用于生成探索报告和动态路线。
- 国家、地形、气候等详情页的“AI 助手”连接本机 Ollama `qwen2:7b`。
- 默认数据库为 H2 文件数据库，也可以通过 `mysql` profile 切换到 MySQL。

## 技术栈

- 前端：Vue 3、Vue Router、Pinia、Three.js、Vite
- 后端：Java 17、Spring Boot、MyBatis
- 数据库：H2 / MySQL
- AI：DeepSeek API、Ollama
- 测试：Node.js Test Runner、JUnit 5、Spring MockMvc

## 环境要求

- Node.js 20.19 或更高版本
- Java 17
- Maven 3.8 或更高版本
- Ollama（仅详情页 AI 助手需要）

## 配置

复制根目录的 `.env.example` 为 `.env.local`：

```text
DEEPSEEK_API_KEY=你的DeepSeekKey
WORLDLENS_ADMIN_REGISTRATION_KEY=你自己生成的长随机管理员密钥
```

`.env.local` 已被 Git 忽略，不会提交到仓库。

`WORLDLENS_ADMIN_REGISTRATION_KEY` 只在创建管理员账户时使用。普通注册页面不能创建管理员，避免任何访问者自行提权。已有管理员账户不受影响。

## 启动项目

### 1. 启动后端

```bash
mvn -f backend/pom.xml spring-boot:run
```

后端地址：

```text
http://localhost:8088
```

健康检查：

```text
http://localhost:8088/api/health
```

### 2. 启动前端

```bash
npm install
npm run dev
```

前端地址：

```text
http://localhost:5173
```

Vite 会把 `/api` 请求代理到 `http://localhost:8088`。

### 3. 启动详情页本地 AI

```bash
ollama serve
ollama pull qwen2:7b
```

本地模型服务地址默认为：

```text
http://127.0.0.1:11434
```

## 创建管理员

管理员注册不在公开页面显示。需要先在 `.env.local` 配置 `WORLDLENS_ADMIN_REGISTRATION_KEY`，然后调用注册接口，并让 `adminKey` 与配置值一致：

```json
{
  "username": "admin",
  "password": "至少六位密码",
  "nickname": "管理员",
  "isAdmin": true,
  "adminKey": "与本地配置一致的管理员密钥"
}
```

接口：

```text
POST http://localhost:8088/api/auth/register
```

## 测试与构建

```bash
npm run test:frontend
npm run test:backend
npm test
npm run build
npm run check
```

`npm run check` 会依次执行全部前端测试、后端测试和生产构建。

## 目录结构

```text
worldlens-prototype/
├─ src/                  Vue 前端源码
├─ public/               地球纹理、地理数据和本地图片
├─ scripts/              前端数据与界面测试
├─ backend/              Spring Boot 后端
│  ├─ src/main/
│  └─ src/test/
├─ docs/                 设计与实施记录
├─ .env.example          私有配置模板
├─ package.json
└─ vite.config.js
```

## 安全说明

- 不要提交 `.env.local`、数据库文件、上传目录或日志。
- 不要在前端代码中保存 DeepSeek Key。
- 普通注册请求即使提交 `isAdmin=true`，没有正确管理员密钥也会被拒绝。
- DeepSeek 与 Ollama 使用独立接口，首页 AI 不会自动切换到本地模型。
