package com.worldlens.backend.entity;

public class HistoryTypeStat {
  private String itemType;
  private Long count;

  public String getItemType() {
    return itemType;
  }

  public void setItemType(String itemType) {
    this.itemType = itemType;
  }

  public Long getCount() {
    return count;
  }

  public void setCount(Long count) {
    this.count = count;
  }
}
