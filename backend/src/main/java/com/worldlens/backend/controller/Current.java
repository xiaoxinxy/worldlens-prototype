package com.worldlens.backend.controller;

import com.worldlens.backend.config.AuthInterceptor;
import com.worldlens.backend.entity.UserEntity;
import jakarta.servlet.http.HttpServletRequest;

final class Current {
  private Current() {
  }

  static UserEntity user(HttpServletRequest request) {
    return (UserEntity) request.getAttribute(AuthInterceptor.CURRENT_USER_ATTRIBUTE);
  }

  static String token(HttpServletRequest request) {
    Object token = request.getAttribute(AuthInterceptor.CURRENT_TOKEN_ATTRIBUTE);
    return token == null ? "" : token.toString();
  }
}
