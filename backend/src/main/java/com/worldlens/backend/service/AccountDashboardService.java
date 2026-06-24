package com.worldlens.backend.service;

import com.worldlens.backend.dto.AccountDashboardDto;
import com.worldlens.backend.dto.FavoriteDto;
import com.worldlens.backend.dto.HistoryDto;
import com.worldlens.backend.dto.TypeStatDto;
import com.worldlens.backend.entity.UserEntity;
import com.worldlens.backend.mapper.FavoriteMapper;
import com.worldlens.backend.mapper.HistoryMapper;
import org.springframework.stereotype.Service;

@Service
public class AccountDashboardService {
  private final FavoriteMapper favoriteMapper;
  private final HistoryMapper historyMapper;

  public AccountDashboardService(FavoriteMapper favoriteMapper, HistoryMapper historyMapper) {
    this.favoriteMapper = favoriteMapper;
    this.historyMapper = historyMapper;
  }

  public AccountDashboardDto getDashboard(UserEntity user) {
    var favorites = favoriteMapper.findByUserId(user.getId());
    var recentFavorites = favorites.stream().limit(4).map(FavoriteDto::from).toList();
    var recentHistory = historyMapper.findRecent(user.getId(), 6).stream().map(HistoryDto::from).toList();
    var stats = historyMapper.countByType(user.getId()).stream().map(TypeStatDto::from).toList();
    return new AccountDashboardDto(
      favorites.size(),
      historyMapper.countByUserId(user.getId()),
      recentFavorites,
      recentHistory,
      stats
    );
  }
}
