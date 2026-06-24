package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.DetailChatRequest;
import com.worldlens.backend.dto.DetailChatResponse;
import com.worldlens.backend.service.DetailAiService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/local-ai")
public class LocalAiController {
  private final DetailAiService detailAiService;

  public LocalAiController(DetailAiService detailAiService) {
    this.detailAiService = detailAiService;
  }

  @PostMapping("/detail-chat")
  public ApiResponse<DetailChatResponse> detailChat(@RequestBody DetailChatRequest request) {
    return ApiResponse.ok(detailAiService.chat(request));
  }
}
