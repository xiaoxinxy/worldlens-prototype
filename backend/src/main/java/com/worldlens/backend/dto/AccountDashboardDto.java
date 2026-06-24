package com.worldlens.backend.dto;

import java.util.List;

public record AccountDashboardDto(
    int favoriteCount,
    int historyCount,
    List<FavoriteDto> recentFavorites,
    List<HistoryDto> recentHistory,
    List<TypeStatDto> typeStats
) {
}
