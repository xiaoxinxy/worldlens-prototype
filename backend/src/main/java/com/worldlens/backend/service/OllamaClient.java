package com.worldlens.backend.service;

public interface OllamaClient {
  String chat(String model, String systemPrompt, String conversationPrompt);
}
