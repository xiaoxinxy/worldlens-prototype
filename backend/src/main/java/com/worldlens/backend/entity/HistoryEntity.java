package com.worldlens.backend.entity;

import java.time.LocalDateTime;

public class HistoryEntity {
  private Long id;
  private Long userId;
  private String itemId;
  private String itemType;
  private String title;
  private String slug;
  private String coverImage;
  private Integer visitedCount;
  private LocalDateTime lastVisitedAt;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getUserId() {
    return userId;
  }

  public void setUserId(Long userId) {
    this.userId = userId;
  }

  public String getItemId() {
    return itemId;
  }

  public void setItemId(String itemId) {
    this.itemId = itemId;
  }

  public String getItemType() {
    return itemType;
  }

  public void setItemType(String itemType) {
    this.itemType = itemType;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getSlug() {
    return slug;
  }

  public void setSlug(String slug) {
    this.slug = slug;
  }

  public String getCoverImage() {
    return coverImage;
  }

  public void setCoverImage(String coverImage) {
    this.coverImage = coverImage;
  }

  public Integer getVisitedCount() {
    return visitedCount;
  }

  public void setVisitedCount(Integer visitedCount) {
    this.visitedCount = visitedCount;
  }

  public LocalDateTime getLastVisitedAt() {
    return lastVisitedAt;
  }

  public void setLastVisitedAt(LocalDateTime lastVisitedAt) {
    this.lastVisitedAt = lastVisitedAt;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }
}
