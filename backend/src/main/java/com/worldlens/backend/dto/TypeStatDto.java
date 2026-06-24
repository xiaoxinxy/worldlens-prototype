package com.worldlens.backend.dto;

import com.worldlens.backend.entity.HistoryTypeStat;

public record TypeStatDto(String itemType, Long count) {
  public static TypeStatDto from(HistoryTypeStat stat) {
    return new TypeStatDto(stat.getItemType(), stat.getCount());
  }
}
