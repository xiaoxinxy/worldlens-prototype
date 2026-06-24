package com.worldlens.backend.service;

import com.worldlens.backend.common.AppException;
import com.worldlens.backend.dto.HistoryDto;
import com.worldlens.backend.dto.HistoryRequest;
import com.worldlens.backend.entity.HistoryEntity;
import com.worldlens.backend.entity.UserEntity;
import com.worldlens.backend.mapper.HistoryMapper;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class HistoryService {
  private final HistoryMapper historyMapper;

  public HistoryService(HistoryMapper historyMapper) {
    this.historyMapper = historyMapper;
  }

  public List<HistoryDto> list(UserEntity user) {
    return historyMapper.findByUserId(user.getId()).stream().map(HistoryDto::from).toList();
  }

  public List<HistoryDto> save(UserEntity user, HistoryRequest request) {
    String itemId = clean(request.itemId());
    if (itemId.isEmpty()) {
      throw new AppException(HttpStatus.BAD_REQUEST, "itemId 不能为空");
    }

    HistoryEntity history = new HistoryEntity();
    history.setUserId(user.getId());
    history.setItemId(itemId);
    history.setItemType(defaultText(request.itemType(), "place"));
    history.setTitle(defaultText(request.title(), itemId));
    history.setSlug(defaultText(request.slug(), itemId));
    history.setCoverImage(clean(request.coverImage()));

    if (historyMapper.findOne(user.getId(), itemId) == null) historyMapper.insert(history);
    else historyMapper.updateVisit(history);
    return list(user);
  }

  public List<HistoryDto> remove(UserEntity user, String itemId) {
    historyMapper.deleteOne(user.getId(), itemId);
    return list(user);
  }

  public List<HistoryDto> clear(UserEntity user) {
    historyMapper.deleteAll(user.getId());
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
