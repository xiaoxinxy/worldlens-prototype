package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.TerrainFeatureDto;
import com.worldlens.backend.dto.TerrainTypeDto;
import com.worldlens.backend.service.TerrainFeatureService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/terrain")
public class TerrainController {
  private final TerrainFeatureService terrainFeatureService;

  public TerrainController(TerrainFeatureService terrainFeatureService) {
    this.terrainFeatureService = terrainFeatureService;
  }

  @GetMapping
  public ApiResponse<List<TerrainFeatureDto>> list(
      @RequestParam(required = false) String type,
      @RequestParam(required = false, name = "q") String keyword
  ) {
    return ApiResponse.ok(terrainFeatureService.listPublic(type, keyword));
  }

  @GetMapping("/types")
  public ApiResponse<List<TerrainTypeDto>> types() {
    return ApiResponse.ok(terrainFeatureService.listTypes());
  }

  @GetMapping("/featured")
  public ApiResponse<List<TerrainFeatureDto>> featured() {
    return ApiResponse.ok(terrainFeatureService.featured());
  }

  @GetMapping("/{id}/related")
  public ApiResponse<List<TerrainFeatureDto>> related(@PathVariable String id) {
    return ApiResponse.ok(terrainFeatureService.related(id));
  }

  @GetMapping("/{id}")
  public ApiResponse<TerrainFeatureDto> get(@PathVariable String id) {
    return ApiResponse.ok(terrainFeatureService.getPublic(id));
  }
}
