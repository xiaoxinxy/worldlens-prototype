package com.worldlens.backend.dto;

import java.util.List;

public record PageDto<T>(
    List<T> items,
    long total,
    int page,
    int pageSize,
    int totalPages
) {
  public static <T> PageDto<T> of(List<T> items, long total, int page, int pageSize) {
    int safePageSize = Math.max(1, pageSize);
    int totalPages = Math.max(1, (int) Math.ceil(total / (double) safePageSize));
    return new PageDto<>(items, total, page, safePageSize, totalPages);
  }
}
