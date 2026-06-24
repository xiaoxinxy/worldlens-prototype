package com.worldlens.backend.service;

import com.worldlens.backend.common.AppException;
import com.worldlens.backend.dto.FavoriteDto;
import com.worldlens.backend.dto.FavoriteRequest;
import com.worldlens.backend.entity.FavoriteEntity;
import com.worldlens.backend.entity.UserEntity;
import com.worldlens.backend.mapper.FavoriteMapper;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class FavoriteService {
  private final FavoriteMapper favoriteMapper;

  public FavoriteService(FavoriteMapper favoriteMapper) {
    this.favoriteMapper = favoriteMapper;
  }

  public List<FavoriteDto> list(UserEntity user) {
    return favoriteMapper.findByUserId(user.getId()).stream().map(FavoriteDto::from).toList();
  }

  public List<FavoriteDto> save(UserEntity user, FavoriteRequest request) {
    String itemId = clean(request.itemId());
    if (itemId.isEmpty()) {
      throw new AppException(HttpStatus.BAD_REQUEST, "itemId 不能为空");
    }
    FavoriteEntity favorite = new FavoriteEntity();
    favorite.setUserId(user.getId());
    favorite.setItemId(itemId);
    favorite.setItemType(defaultText(request.itemType(), "place"));
    favorite.setTitle(defaultText(request.title(), itemId));
    favorite.setCoverImage(clean(request.coverImage()));
    favorite.setPayload(clean(request.payload()));

    if (favoriteMapper.findOne(user.getId(), itemId) == null) favoriteMapper.insert(favorite);
    else favoriteMapper.update(favorite);
    return list(user);
  }

  public List<FavoriteDto> remove(UserEntity user, String itemId) {
    favoriteMapper.deleteOne(user.getId(), itemId);
    return list(user);
  }

  public List<FavoriteDto> clear(UserEntity user) {
    favoriteMapper.deleteAll(user.getId());
    return list(user);
  }

  private static String clean(String value) {
    return value == null ? "" : value.trim();
  }

  private static String defaultText(String value, String fallback) {
    String text = clean(value);
    return text.isEmpty() ? fallback : text;
  }
}
