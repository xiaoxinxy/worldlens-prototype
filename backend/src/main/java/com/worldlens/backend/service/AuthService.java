package com.worldlens.backend.service;

import com.worldlens.backend.common.AppException;
import com.worldlens.backend.dto.AuthResponse;
import com.worldlens.backend.dto.AuthRequests.LoginRequest;
import com.worldlens.backend.dto.AuthRequests.ProfileRequest;
import com.worldlens.backend.dto.AuthRequests.RegisterRequest;
import com.worldlens.backend.dto.UserDto;
import com.worldlens.backend.entity.UserEntity;
import com.worldlens.backend.mapper.AuthTokenMapper;
import com.worldlens.backend.mapper.UserMapper;
import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AuthService {
  private final UserMapper userMapper;
  private final AuthTokenMapper authTokenMapper;
  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
  private final int tokenDays;
  private final String adminRegistrationKey;

  public AuthService(
      UserMapper userMapper,
      AuthTokenMapper authTokenMapper,
      @Value("${worldlens.auth.token-days:7}") int tokenDays,
      @Value("${worldlens.auth.admin-registration-key:${WORLDLENS_ADMIN_REGISTRATION_KEY:}}")
      String adminRegistrationKey
  ) {
    this.userMapper = userMapper;
    this.authTokenMapper = authTokenMapper;
    this.tokenDays = tokenDays;
    this.adminRegistrationKey = clean(adminRegistrationKey);
  }

  public AuthResponse register(RegisterRequest request) {
    String username = clean(request.username());
    String password = clean(request.password());
    if (username.length() < 3 || password.length() < 6) {
      throw new AppException(HttpStatus.BAD_REQUEST, "用户名至少3位，密码至少6位");
    }
    if (userMapper.findByUsername(username) != null) {
      throw new AppException(HttpStatus.CONFLICT, "用户名已存在");
    }

    UserEntity user = new UserEntity();
    user.setUsername(username);
    user.setPasswordHash(passwordEncoder.encode(password));
    user.setNickname(defaultText(request.nickname(), username));
    user.setAvatarUrl(defaultAvatar(request.avatarUrl(), username));
    user.setAdmin(resolveAdminRegistration(request));
    userMapper.insert(user);
    return issueToken(user);
  }

  public AuthResponse login(LoginRequest request) {
    String username = clean(request.username());
    UserEntity user = userMapper.findByUsername(username);
    if (user == null || !passwordEncoder.matches(clean(request.password()), user.getPasswordHash())) {
      throw new AppException(HttpStatus.UNAUTHORIZED, "用户名或密码错误");
    }
    return issueToken(user);
  }

  public UserDto currentUser(String token) {
    return UserDto.from(requireUser(token));
  }

  public UserDto updateProfile(String token, ProfileRequest request) {
    UserEntity user = requireUser(token);
    user.setNickname(defaultText(request.nickname(), user.getUsername()));
    user.setAvatarUrl(defaultAvatar(request.avatarUrl(), user.getUsername()));
    userMapper.updateProfile(user);
    return UserDto.from(userMapper.findById(user.getId()));
  }

  public void logout(String token) {
    if (StringUtils.hasText(token)) authTokenMapper.delete(token);
  }

  public UserEntity requireUser(String token) {
    if (!StringUtils.hasText(token)) {
      throw new AppException(HttpStatus.UNAUTHORIZED, "请先登录");
    }
    UserEntity user = authTokenMapper.findUserByToken(token);
    if (user == null) {
      throw new AppException(HttpStatus.UNAUTHORIZED, "登录已失效");
    }
    return user;
  }

  private AuthResponse issueToken(UserEntity user) {
    authTokenMapper.deleteByUserId(user.getId());
    String token = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
    authTokenMapper.insert(token, user.getId(), LocalDateTime.now().plusDays(tokenDays));
    return new AuthResponse(token, UserDto.from(user));
  }

  private boolean resolveAdminRegistration(RegisterRequest request) {
    if (!Boolean.TRUE.equals(request.admin())) {
      return false;
    }
    String providedKey = clean(request.adminKey());
    if (adminRegistrationKey.isEmpty() || providedKey.isEmpty()
        || !MessageDigest.isEqual(
          adminRegistrationKey.getBytes(StandardCharsets.UTF_8),
          providedKey.getBytes(StandardCharsets.UTF_8)
        )) {
      throw new AppException(HttpStatus.FORBIDDEN, "管理员注册密钥无效");
    }
    return true;
  }

  private static String clean(String value) {
    return value == null ? "" : value.trim();
  }

  private static String defaultText(String value, String fallback) {
    String text = clean(value);
    return text.isEmpty() ? fallback : text;
  }

  private static String defaultAvatar(String value, String username) {
    String text = clean(value);
    if (!text.isEmpty()) return text;
    return "https://api.dicebear.com/9.x/initials/svg?seed=" + username;
  }
}
