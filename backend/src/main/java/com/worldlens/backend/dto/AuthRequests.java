package com.worldlens.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public final class AuthRequests {
  private AuthRequests() {
  }

  public record RegisterRequest(
      String username,
      String password,
      String nickname,
      String avatarUrl,
      @JsonProperty("isAdmin") Boolean admin,
      String adminKey
  ) {
  }

  public record LoginRequest(String username, String password) {
  }

  public record ProfileRequest(String nickname, String avatarUrl) {
  }
}
