# Detail Local AI Assistant Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a detail-page-only conversational assistant backed by local Ollama `qwen2:7b`, while preserving the existing DeepSeek-powered home exploration AI.

**Architecture:** A reusable Vue component receives a small detail context and calls a new frontend API module. Spring Boot exposes a separate public endpoint backed by an injected Ollama client, so no DeepSeek classes or endpoints are reused.

**Tech Stack:** Vue 3, Fetch API, Spring Boot 3.3.6, Java HttpClient, Jackson, Ollama `/api/chat`, Node test runner, JUnit/MockMvc.

---

### Task 1: Define and test the Ollama detail-chat backend contract

**Files:**
- Create: `backend/src/test/java/com/worldlens/backend/LocalDetailAiApiTest.java`
- Create: `backend/src/main/java/com/worldlens/backend/dto/DetailChatRequest.java`
- Create: `backend/src/main/java/com/worldlens/backend/dto/DetailChatMessageDto.java`
- Create: `backend/src/main/java/com/worldlens/backend/dto/DetailChatResponse.java`
- Create: `backend/src/main/java/com/worldlens/backend/service/OllamaClient.java`
- Create: `backend/src/main/java/com/worldlens/backend/service/OllamaHttpClient.java`
- Create: `backend/src/main/java/com/worldlens/backend/service/DetailAiService.java`
- Create: `backend/src/main/java/com/worldlens/backend/controller/LocalAiController.java`
- Modify: `backend/src/main/java/com/worldlens/backend/config/WebConfig.java`

- [ ] Write a MockMvc test that posts a terrain context and two messages to `/api/local-ai/detail-chat`.
- [ ] Run `mvn -f backend/pom.xml -Dtest=LocalDetailAiApiTest test` and confirm the missing endpoint makes it fail.
- [ ] Add DTOs and an injectable `OllamaClient` interface.
- [ ] Implement `DetailAiService` to validate input, construct a Chinese context-grounded system prompt, cap history, and always request `qwen2:7b`.
- [ ] Implement `OllamaHttpClient` using Java `HttpClient` against `${ollama.base-url:http://127.0.0.1:11434}` and `/api/chat` with `stream=false`.
- [ ] Add `LocalAiController` and explicitly allow `/api/local-ai/**` through the auth interceptor.
- [ ] Re-run the focused test and confirm it passes.

### Task 2: Define and test the frontend detail-chat API and component wiring

**Files:**
- Create: `scripts/detail-local-ai.test.mjs`
- Create: `src/api/detailAiApi.js`
- Create: `src/components/ai/DetailAiAssistant.vue`
- Modify: `src/views/PlaceDetail.vue`
- Modify: `src/views/TerrainDetail.vue`
- Modify: `src/views/ClimateDetail.vue`

- [ ] Write a Node test that requires a separate `/api/local-ai/detail-chat` API, a natural “AI 助手” label without visible model/provider names, and component usage in exactly the three detail views.
- [ ] Run the focused Node test and confirm it fails because the new files and wiring are absent.
- [ ] Implement `askDetailAi()` with normalized messages and readable HTTP errors.
- [ ] Implement the floating assistant with multi-turn messages, suggested questions, loading state, clear action, scroll-to-latest behavior, and context-reset behavior.
- [ ] Build compact context objects in each detail view and render the component only when its detail data exists.
- [ ] Re-run the focused Node test and confirm it passes.

### Task 3: Verify real local-model behavior and regressions

**Files:**
- Modify only if verification exposes a defect in files from Tasks 1–2.

- [ ] Start the Spring Boot backend and confirm Ollama responds at `http://127.0.0.1:11434/api/tags`.
- [ ] POST a real country or terrain question to `/api/local-ai/detail-chat` and verify the provider is `ollama`, model is `qwen2:7b`, and the answer references the supplied context.
- [ ] Run `mvn -f backend/pom.xml test`.
- [ ] Run all `scripts/*.test.mjs`, recording the pre-existing route-image duplication failure separately if it remains.
- [ ] Run `npm run build`.

### Task 4: Update the beginner-facing implementation document

**Files:**
- Modify: `C:\Users\陶泓启\Desktop\WorldLens项目技术栈与功能实现说明.md`

- [ ] Correct stale technology, database, API, admin, test, and feature descriptions against the current code.
- [ ] Add AI exploration, country/civilization APIs, generic content management, admin summary/pagination, and the two new database tables.
- [ ] Add a dedicated section explaining DeepSeek home exploration versus Ollama detail assistant.
- [ ] Add the verified test status and known route-image duplication issue.
- [ ] Add a final beginner tutorial for opening the project in IntelliJ IDEA, configuring JDK 17/Maven/Node, starting Ollama, running Spring Boot, running Vite, and checking the URLs.
- [ ] Scan the document for stale claims, placeholders, broken headings, and encoding problems.
