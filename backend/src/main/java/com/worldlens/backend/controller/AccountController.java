package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.AccountDashboardDto;
import com.worldlens.backend.service.AccountDashboardService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/account")
public class AccountController {
  private final AccountDashboardService accountDashboardService;

  public AccountController(AccountDashboardService accountDashboardService) {
    this.accountDashboardService = accountDashboardService;
  }

  @GetMapping("/dashboard")
  public ApiResponse<AccountDashboardDto> dashboard(HttpServletRequest request) {
    return ApiResponse.ok(accountDashboardService.getDashboard(Current.user(request)));
  }
}
