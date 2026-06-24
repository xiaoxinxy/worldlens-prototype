package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.AiExploreRequest;
import com.worldlens.backend.dto.AiExploreResponse;
import com.worldlens.backend.dto.AiIntentRequest;
import com.worldlens.backend.dto.AiIntentResponse;
import com.worldlens.backend.dto.AiRouteRequest;
import com.worldlens.backend.dto.AiRouteResponse;
import com.worldlens.backend.service.AiExplorationService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiController {
  private final AiExplorationService aiExplorationService;

  public AiController(AiExplorationService aiExplorationService) {
    this.aiExplorationService = aiExplorationService;
  }

  @PostMapping("/intent")
  public ApiResponse<AiIntentResponse> intent(@RequestBody AiIntentRequest request) {
    return ApiResponse.ok(aiExplorationService.detectIntent(request));
  }

  @PostMapping("/explore")
  public ApiResponse<AiExploreResponse> explore(@RequestBody AiExploreRequest request) {
    return ApiResponse.ok(aiExplorationService.explore(request));
  }

  @PostMapping("/route")
  public ApiResponse<AiRouteResponse> route(@RequestBody AiRouteRequest request) {
    return ApiResponse.ok(aiExplorationService.generateRoute(request));
  }
}
