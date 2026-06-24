package com.worldlens.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.worldlens.backend.common.AppException;
import java.io.IOException;
import java.net.ConnectException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class OllamaHttpClient implements OllamaClient {
  private final ObjectMapper objectMapper;
  private final HttpClient httpClient;

  @Value("${ollama.base-url:http://127.0.0.1:11434}")
  private String baseUrl;

  public OllamaHttpClient(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
    this.httpClient = HttpClient.newBuilder()
      .connectTimeout(Duration.ofSeconds(5))
      .build();
  }

  @Override
  public String chat(String model, String systemPrompt, String conversationPrompt) {
    try {
      ObjectNode payload = objectMapper.createObjectNode();
      payload.put("model", model);
      payload.put("stream", false);
      payload.putObject("options").put("temperature", 0.35);
      ArrayNode messages = payload.putArray("messages");
      messages.addObject().put("role", "system").put("content", systemPrompt);
      messages.addObject().put("role", "user").put("content", conversationPrompt);

      HttpRequest request = HttpRequest.newBuilder(detailChatUri())
        .timeout(Duration.ofSeconds(90))
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
        .build();

      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        if (response.body().contains("not found")) {
          throw new AppException(HttpStatus.SERVICE_UNAVAILABLE, "本机没有 qwen2:7b，请先运行 ollama pull qwen2:7b");
        }
        throw new AppException(HttpStatus.BAD_GATEWAY, "Ollama 返回 HTTP " + response.statusCode());
      }

      JsonNode root = objectMapper.readTree(response.body());
      String answer = root.path("message").path("content").asText("").trim();
      if (answer.isBlank()) {
        throw new AppException(HttpStatus.BAD_GATEWAY, "本地模型没有返回回答");
      }
      return answer;
    } catch (AppException exception) {
      throw exception;
    } catch (InterruptedException exception) {
      Thread.currentThread().interrupt();
      throw new AppException(HttpStatus.BAD_GATEWAY, "本地模型请求已中断");
    } catch (ConnectException exception) {
      throw new AppException(HttpStatus.SERVICE_UNAVAILABLE, "无法连接 Ollama，请先启动 Ollama");
    } catch (IOException | IllegalArgumentException exception) {
      throw new AppException(HttpStatus.BAD_GATEWAY, "本地模型请求失败，请检查 Ollama 是否正常运行");
    }
  }

  private URI detailChatUri() {
    return URI.create(baseUrl.replaceAll("/+$", "") + "/api/chat");
  }
}
