package com.worldlens.backend.dto;

import com.worldlens.backend.entity.FavoriteEntity;
import java.time.LocalDateTime;

public record FavoriteDto(
    Long id,
    String itemId,
    String itemType,
    String title,
    String coverImage,
    String payload,
    LocalDateTime createdAt
) {
  public static FavoriteDto from(FavoriteEntity favorite) {
    return new FavoriteDto(
      favorite.getId(),
      favorite.getItemId(),
      favorite.getItemType(),
      favorite.getTitle(),
      favorite.getCoverImage(),
      favorite.getPayload(),
      favorite.getCreatedAt()
    );
  }
}
