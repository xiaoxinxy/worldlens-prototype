# 详情页本地 AI 助手设计

## 目标

为 WorldLens 中现有的地点/国家、地形、气候详情页增加一个仅在详情页出现的本地 AI 助手。助手固定使用本机 Ollama 的 `qwen2:7b`，围绕用户当前打开的详情内容进行多轮问答。

## 与首页 AI 探索的边界

- 首页竖向“AI 探索”保持不变，继续使用 `DeepSeekClient` 和 `/api/ai/intent`、`/api/ai/explore`、`/api/ai/route`。
- 详情页助手使用独立组件 `DetailAiAssistant.vue`、独立前端 API `detailAiApi.js`、独立后端接口 `/api/local-ai/detail-chat`。
- 详情页助手使用独立的 `OllamaClient`，不引用 `DeepSeekClient`。
- 用户界面自然显示“AI 助手”，不展示 Ollama、本地模型或 `qwen2:7b` 等技术标识。两套 AI 通过页面位置和用途区分，技术层仍完全隔离。

## 用户界面

- 仅在 `/place/:slug`、`/terrain/:id`、`/climate/:id` 页面渲染。
- 页面右下角显示圆形“AI 助手”按钮。
- 点击后在右下角展开聊天面板；面板包含当前详情名称、模型状态、消息列表、推荐问题、输入框、发送与清空按钮。
- 桌面端使用右下角浮层，移动端接近底部抽屉，不能遮住整个页面。
- 切换到另一个详情对象时清空旧对话，防止把上一个国家或地形的上下文带过来。

## 数据流

详情页把经过裁剪的当前对象资料作为 `context` 传给组件。组件发送：

```json
{
  "subjectType": "terrain",
  "subjectId": "himalayas",
  "subjectName": "喜马拉雅山脉",
  "context": {
    "summary": "...",
    "formationReason": "...",
    "region": "..."
  },
  "messages": [
    { "role": "user", "content": "它为什么还在升高？" }
  ]
}
```

Spring Boot 把上下文整理为系统提示词，并调用 Ollama：

```text
POST http://127.0.0.1:11434/api/chat
model: qwen2:7b
stream: false
```

后端只返回回答文本、模型名和提供方标识，不把 Ollama 地址暴露给浏览器。

## 错误处理

- 问题为空时前端不发送。
- 上下文和历史消息限制长度，防止请求无限增大。
- Ollama 未启动时返回“请先启动 Ollama”的中文提示。
- 未安装 `qwen2:7b` 时提示运行 `ollama pull qwen2:7b`。
- 模型响应为空、超时或格式异常时返回清晰错误，不影响详情页其他功能。

## 测试

- 后端测试验证接口公开可访问、固定使用 `qwen2:7b`、传入详情上下文和多轮消息、错误能转成统一响应。
- 前端测试验证组件仅接入三个详情页、调用独立 `/api/local-ai/detail-chat`，并明确显示“本地 AI”。
- 完成后运行后端完整测试、前端测试和 Vite 构建，并使用真实 Ollama 做一次问答冒烟测试。

## 文档

实现完成后更新桌面的《WorldLens项目技术栈与功能实现说明.md》，补充当前项目全部新增实现、本地 AI 与 DeepSeek 的区别、接口、测试现状，并在最后增加使用 IntelliJ IDEA 打开和启动前后端、Ollama 的初学者教程。
