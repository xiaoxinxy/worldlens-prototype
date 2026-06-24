package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.EnabledRequest;
import com.worldlens.backend.dto.TerrainFeatureDto;
import com.worldlens.backend.dto.TerrainFeatureRequest;
import com.worldlens.backend.service.TerrainFeatureService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/terrain")
public class AdminTerrainController {
  private final TerrainFeatureService terrainFeatureService;

  public AdminTerrainController(TerrainFeatureService terrainFeatureService) {
    this.terrainFeatureService = terrainFeatureService;
  }

  @GetMapping
  public ApiResponse<List<TerrainFeatureDto>> list(
      HttpServletRequest request,
      @RequestParam(required = false) String type,
      @RequestParam(required = false, name = "q") String keyword
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(terrainFeatureService.listAdmin(type, keyword));
  }

  @PostMapping
  public ApiResponse<TerrainFeatureDto> create(HttpServletRequest request, @RequestBody TerrainFeatureRequest feature) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(terrainFeatureService.create(feature));
  }

  @PutMapping("/{id}")
  public ApiResponse<TerrainFeatureDto> update(
      HttpServletRequest request,
      @PathVariable String id,
      @RequestBody TerrainFeatureRequest feature
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(terrainFeatureService.update(id, feature));
  }

  @PatchMapping("/{id}/status")
  public ApiResponse<TerrainFeatureDto> status(
      HttpServletRequest request,
      @PathVariable String id,
      @RequestBody EnabledRequest enabled
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(terrainFeatureService.setEnabled(id, Boolean.TRUE.equals(enabled.enabled())));
  }

  @DeleteMapping("/{id}")
  public ApiResponse<Void> delete(HttpServletRequest request, @PathVariable String id) {
    AdminGuard.requireAdmin(request);
    terrainFeatureService.delete(id);
    return ApiResponse.ok(null);
  }
}
