package com.worldlens.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.worldlens.backend.entity.UserEntity;

public record UserDto(
    Long id,
    String username,
    String nickname,
    String avatarUrl,
    @JsonProperty("isAdmin") boolean admin
) {
  public static UserDto from(UserEntity user) {
    return new UserDto(
      user.getId(),
      user.getUsername(),
      user.getNickname(),
      user.getAvatarUrl(),
      Boolean.TRUE.equals(user.getAdmin())
    );
  }
}
