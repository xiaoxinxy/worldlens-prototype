package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.AdminSummaryDto;
import com.worldlens.backend.service.AdminSummaryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminSummaryController {
  private final AdminSummaryService adminSummaryService;

  public AdminSummaryController(AdminSummaryService adminSummaryService) {
    this.adminSummaryService = adminSummaryService;
  }

  @GetMapping("/summary")
  public ApiResponse<AdminSummaryDto> summary(HttpServletRequest request) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(adminSummaryService.getSummary());
  }
}
