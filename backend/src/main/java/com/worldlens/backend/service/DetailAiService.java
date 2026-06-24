package com.worldlens.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldlens.backend.common.AppException;
import com.worldlens.backend.dto.DetailChatMessageDto;
import com.worldlens.backend.dto.DetailChatRequest;
import com.worldlens.backend.dto.DetailChatResponse;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class DetailAiService {
  public static final String MODEL = "qwen2:7b";
  private static final int MAX_MESSAGES = 12;
  private static final int MAX_MESSAGE_LENGTH = 2000;
  private static final int MAX_CONTEXT_LENGTH = 12000;

  private final OllamaClient ollamaClient;
  private final ObjectMapper objectMapper;

  public DetailAiService(OllamaClient ollamaClient, ObjectMapper objectMapper) {
    this.ollamaClient = ollamaClient;
    this.objectMapper = objectMapper;
  }

  public DetailChatResponse chat(DetailChatRequest request) {
    String subjectName = clean(request == null ? null : request.subjectName());
    List<DetailChatMessageDto> messages = request == null || request.messages() == null
      ? List.of()
      : request.messages();
    String latestQuestion = latestUserQuestion(messages);

    if (subjectName.isBlank()) {
      throw new AppException(HttpStatus.BAD_REQUEST, "subjectName is required");
    }
    if (latestQuestion.isBlank()) {
      throw new AppException(HttpStatus.BAD_REQUEST, "请先输入问题");
    }

    String answer = ollamaClient.chat(
      MODEL,
      systemPrompt(request, subjectName),
      conversationPrompt(messages)
    );
    return new DetailChatResponse(answer, MODEL, "ollama");
  }

  private String systemPrompt(DetailChatRequest request, String subjectName) {
    String context = contextJson(request.context());
    return """
      你是 WorldLens 详情页中的“本地 AI 助手”，由用户电脑上的 Ollama qwen2:7b 提供能力。
      当前详情对象类型：%s
      当前详情对象 ID：%s
      当前详情对象名称：%s
      页面提供的资料：
      %s

      回答规则：
      1. 优先依据页面资料回答当前对象相关问题，并结合可靠的通识知识补充解释。
      2. 使用简洁、易懂的中文；遇到形成机制或因果关系时分步骤说明。
      3. 不要声称自己是 DeepSeek，也不要介绍首页的 AI 探索功能。
      4. 不确定的内容要明确说“不确定”或“可能”，不要编造精确数据。
      5. 如果问题与当前详情无关，先简短回答，再提醒用户当前正在浏览“%s”。
      """.formatted(
        clean(request.subjectType()),
        clean(request.subjectId()),
        subjectName,
        context,
        subjectName
      );
  }

  private String conversationPrompt(List<DetailChatMessageDto> messages) {
    List<DetailChatMessageDto> recent = messages.size() <= MAX_MESSAGES
      ? messages
      : messages.subList(messages.size() - MAX_MESSAGES, messages.size());
    StringBuilder builder = new StringBuilder("以下是当前详情页中的对话，请回答最后一个用户问题：\n");
    for (DetailChatMessageDto message : recent) {
      if (message == null) continue;
      String content = truncate(clean(message.content()), MAX_MESSAGE_LENGTH);
      if (content.isBlank()) continue;
      builder.append("assistant".equals(normalizeRole(message.role())) ? "助手：" : "用户：")
        .append(content)
        .append('\n');
    }
    return builder.toString();
  }

  private String contextJson(JsonNode context) {
    if (context == null || context.isNull() || context.isMissingNode()) return "{}";
    try {
      return truncate(objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(context), MAX_CONTEXT_LENGTH);
    } catch (JsonProcessingException exception) {
      return "{}";
    }
  }

  private static String latestUserQuestion(List<DetailChatMessageDto> messages) {
    for (int index = messages.size() - 1; index >= 0; index -= 1) {
      DetailChatMessageDto message = messages.get(index);
      if (message == null || !"user".equals(normalizeRole(message.role()))) continue;
      String content = clean(message.content());
      if (!content.isBlank()) return content;
    }
    return "";
  }

  private static String normalizeRole(String role) {
    return "assistant".equalsIgnoreCase(clean(role)) ? "assistant" : "user";
  }

  private static String truncate(String value, int maxLength) {
    return value.length() <= maxLength ? value : value.substring(0, maxLength);
  }

  private static String clean(String value) {
    return value == null ? "" : value.trim();
  }
}
