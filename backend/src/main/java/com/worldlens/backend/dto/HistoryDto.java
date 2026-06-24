package com.worldlens.backend.dto;

import com.worldlens.backend.entity.HistoryEntity;
import java.time.LocalDateTime;

public record HistoryDto(
    Long id,
    String itemId,
    String itemType,
    String title,
    String slug,
    String coverImage,
    Integer visitedCount,
    LocalDateTime lastVisitedAt
) {
  public static HistoryDto from(HistoryEntity history) {
    return new HistoryDto(
      history.getId(),
      history.getItemId(),
      history.getItemType(),
      history.getTitle(),
      history.getSlug(),
      history.getCoverImage(),
      history.getVisitedCount(),
      history.getLastVisitedAt()
    );
  }
}
