package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.config.AuthInterceptor;
import com.worldlens.backend.dto.AuthRequests.LoginRequest;
import com.worldlens.backend.dto.AuthRequests.ProfileRequest;
import com.worldlens.backend.dto.AuthRequests.RegisterRequest;
import com.worldlens.backend.dto.AuthResponse;
import com.worldlens.backend.dto.UserDto;
import com.worldlens.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  public ApiResponse<AuthResponse> register(@RequestBody RegisterRequest request) {
    return ApiResponse.ok(authService.register(request));
  }

  @PostMapping("/login")
  public ApiResponse<AuthResponse> login(@RequestBody LoginRequest request) {
    return ApiResponse.ok(authService.login(request));
  }

  @GetMapping("/me")
  public ApiResponse<UserDto> me(HttpServletRequest request) {
    return ApiResponse.ok(UserDto.from(Current.user(request)));
  }

  @PutMapping("/profile")
  public ApiResponse<UserDto> updateProfile(HttpServletRequest request, @RequestBody ProfileRequest profile) {
    return ApiResponse.ok(authService.updateProfile(Current.token(request), profile));
  }

  @PostMapping("/logout")
  public ApiResponse<Void> logout(HttpServletRequest request) {
    authService.logout(Current.token(request));
    return ApiResponse.ok(null);
  }
}
