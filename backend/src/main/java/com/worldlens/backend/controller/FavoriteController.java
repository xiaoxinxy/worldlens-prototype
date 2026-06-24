package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.FavoriteDto;
import com.worldlens.backend.dto.FavoriteRequest;
import com.worldlens.backend.service.FavoriteService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/favorites")
public class FavoriteController {
  private final FavoriteService favoriteService;

  public FavoriteController(FavoriteService favoriteService) {
    this.favoriteService = favoriteService;
  }

  @GetMapping
  public ApiResponse<List<FavoriteDto>> list(HttpServletRequest request) {
    return ApiResponse.ok(favoriteService.list(Current.user(request)));
  }

  @PostMapping
  public ApiResponse<List<FavoriteDto>> save(HttpServletRequest request, @RequestBody FavoriteRequest favorite) {
    return ApiResponse.ok(favoriteService.save(Current.user(request), favorite));
  }

  @DeleteMapping("/{itemId}")
  public ApiResponse<List<FavoriteDto>> remove(HttpServletRequest request, @PathVariable String itemId) {
    return ApiResponse.ok(favoriteService.remove(Current.user(request), itemId));
  }

  @DeleteMapping
  public ApiResponse<List<FavoriteDto>> clear(HttpServletRequest request) {
    return ApiResponse.ok(favoriteService.clear(Current.user(request)));
  }
}
