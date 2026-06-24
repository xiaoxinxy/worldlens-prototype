package com.worldlens.backend.service;

public interface DeepSeekClient {
  String completeJson(String systemPrompt, String userPrompt);
}
