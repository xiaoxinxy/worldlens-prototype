package com.worldlens.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.worldlens.backend.common.AppException;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class DeepSeekHttpClient implements DeepSeekClient {
  private final ObjectMapper objectMapper;
  private final HttpClient httpClient;
  private final DeepSeekCredentialProvider credentialProvider;

  @Value("${deepseek.base-url:https://api.deepseek.com/chat/completions}")
  private String baseUrl;

  @Value("${deepseek.model:deepseek-chat}")
  private String model;

  public DeepSeekHttpClient(
    ObjectMapper objectMapper,
    DeepSeekCredentialProvider credentialProvider
  ) {
    this.objectMapper = objectMapper;
    this.credentialProvider = credentialProvider;
    this.httpClient = HttpClient.newBuilder()
      .connectTimeout(Duration.ofSeconds(12))
      .build();
  }

  @Override
  public String completeJson(String systemPrompt, String userPrompt) {
    String apiKey = credentialProvider.requireApiKey();

    try {
      ObjectNode payload = objectMapper.createObjectNode();
      payload.put("model", model);
      payload.put("temperature", 0.25);
      payload.putObject("response_format").put("type", "json_object");
      ArrayNode messages = payload.putArray("messages");
      messages.addObject().put("role", "system").put("content", systemPrompt);
      messages.addObject().put("role", "user").put("content", userPrompt);

      HttpRequest request = HttpRequest.newBuilder(URI.create(baseUrl))
        .timeout(Duration.ofSeconds(35))
        .header("Authorization", "Bearer " + apiKey.trim())
        .header("Content-Type", "application/json")
        .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
        .build();

      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        throw new AppException(HttpStatus.BAD_GATEWAY, "DeepSeek API returned HTTP " + response.statusCode());
      }
      JsonNode root = objectMapper.readTree(response.body());
      String content = root.path("choices").path(0).path("message").path("content").asText("");
      if (content.isBlank()) {
        throw new AppException(HttpStatus.BAD_GATEWAY, "DeepSeek API returned empty content");
      }
      return stripJsonFence(content);
    } catch (InterruptedException exception) {
      Thread.currentThread().interrupt();
      throw new AppException(HttpStatus.BAD_GATEWAY, "DeepSeek API request was interrupted");
    } catch (IOException exception) {
      throw new AppException(HttpStatus.BAD_GATEWAY, "DeepSeek API request failed");
    }
  }

  private static String stripJsonFence(String content) {
    String text = content.trim();
    if (text.startsWith("```")) {
      text = text.replaceFirst("^```(?:json)?", "").replaceFirst("```$", "").trim();
    }
    return text;
  }
}
