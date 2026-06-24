package com.worldlens.backend.controller;

import com.worldlens.backend.common.AppException;
import com.worldlens.backend.entity.UserEntity;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;

final class AdminGuard {
  private AdminGuard() {
  }

  static UserEntity requireAdmin(HttpServletRequest request) {
    UserEntity user = Current.user(request);
    if (!Boolean.TRUE.equals(user.getAdmin())) {
      throw new AppException(HttpStatus.FORBIDDEN, "需要管理员权限");
    }
    return user;
  }
}
