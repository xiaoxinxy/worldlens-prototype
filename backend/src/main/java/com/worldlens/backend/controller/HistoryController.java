package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.HistoryDto;
import com.worldlens.backend.dto.HistoryRequest;
import com.worldlens.backend.service.HistoryService;
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
@RequestMapping("/api/history")
public class HistoryController {
  private final HistoryService historyService;

  public HistoryController(HistoryService historyService) {
    this.historyService = historyService;
  }

  @GetMapping
  public ApiResponse<List<HistoryDto>> list(HttpServletRequest request) {
    return ApiResponse.ok(historyService.list(Current.user(request)));
  }

  @PostMapping
  public ApiResponse<List<HistoryDto>> save(HttpServletRequest request, @RequestBody HistoryRequest history) {
    return ApiResponse.ok(historyService.save(Current.user(request), history));
  }

  @DeleteMapping("/{itemId}")
  public ApiResponse<List<HistoryDto>> remove(HttpServletRequest request, @PathVariable String itemId) {
    return ApiResponse.ok(historyService.remove(Current.user(request), itemId));
  }

  @DeleteMapping
  public ApiResponse<List<HistoryDto>> clear(HttpServletRequest request) {
    return ApiResponse.ok(historyService.clear(Current.user(request)));
  }
}
