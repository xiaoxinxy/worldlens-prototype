package com.worldlens.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.entity.UserEntity;
import com.worldlens.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {
  public static final String CURRENT_USER_ATTRIBUTE = "currentUser";
  public static final String CURRENT_TOKEN_ATTRIBUTE = "currentToken";

  private final AuthService authService;
  private final ObjectMapper objectMapper;

  public AuthInterceptor(AuthService authService, ObjectMapper objectMapper) {
    this.authService = authService;
    this.objectMapper = objectMapper;
  }

  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) return true;
    String token = tokenFrom(request);
    try {
      UserEntity user = authService.requireUser(token);
      request.setAttribute(CURRENT_USER_ATTRIBUTE, user);
      request.setAttribute(CURRENT_TOKEN_ATTRIBUTE, token);
      return true;
    } catch (RuntimeException exception) {
      response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
      response.setContentType(MediaType.APPLICATION_JSON_VALUE);
      response.setCharacterEncoding("UTF-8");
      response.getWriter().write(objectMapper.writeValueAsString(ApiResponse.fail("请先登录")));
      return false;
    }
  }

  private static String tokenFrom(HttpServletRequest request) {
    String header = request.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")) return header.substring(7).trim();
    return "";
  }
}
