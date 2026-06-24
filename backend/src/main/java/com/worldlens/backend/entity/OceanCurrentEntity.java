package com.worldlens.backend.entity;

import java.time.LocalDateTime;

public class OceanCurrentEntity {
  private String id;
  private String name;
  private String nameEn;
  private String kind;
  private String basin;
  private String currentSystem;
  private String direction;
  private String source;
  private String effect;
  private String impactTagsJson;
  private String textbookNote;
  private Double influenceLat;
  private Double influenceLng;
  private Double influenceRadius;
  private String influenceRole;
  private String pathJson;
  private Boolean enabled;
  private Integer sortOrder;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getNameEn() {
    return nameEn;
  }

  public void setNameEn(String nameEn) {
    this.nameEn = nameEn;
  }

  public String getKind() {
    return kind;
  }

  public void setKind(String kind) {
    this.kind = kind;
  }

  public String getBasin() {
    return basin;
  }

  public void setBasin(String basin) {
    this.basin = basin;
  }

  public String getCurrentSystem() {
    return currentSystem;
  }

  public void setCurrentSystem(String currentSystem) {
    this.currentSystem = currentSystem;
  }

  public String getDirection() {
    return direction;
  }

  public void setDirection(String direction) {
    this.direction = direction;
  }

  public String getSource() {
    return source;
  }

  public void setSource(String source) {
    this.source = source;
  }

  public String getEffect() {
    return effect;
  }

  public void setEffect(String effect) {
    this.effect = effect;
  }

  public String getImpactTagsJson() {
    return impactTagsJson;
  }

  public void setImpactTagsJson(String impactTagsJson) {
    this.impactTagsJson = impactTagsJson;
  }

  public String getTextbookNote() {
    return textbookNote;
  }

  public void setTextbookNote(String textbookNote) {
    this.textbookNote = textbookNote;
  }

  public Double getInfluenceLat() {
    return influenceLat;
  }

  public void setInfluenceLat(Double influenceLat) {
    this.influenceLat = influenceLat;
  }

  public Double getInfluenceLng() {
    return influenceLng;
  }

  public void setInfluenceLng(Double influenceLng) {
    this.influenceLng = influenceLng;
  }

  public Double getInfluenceRadius() {
    return influenceRadius;
  }

  public void setInfluenceRadius(Double influenceRadius) {
    this.influenceRadius = influenceRadius;
  }

  public String getInfluenceRole() {
    return influenceRole;
  }

  public void setInfluenceRole(String influenceRole) {
    this.influenceRole = influenceRole;
  }

  public String getPathJson() {
    return pathJson;
  }

  public void setPathJson(String pathJson) {
    this.pathJson = pathJson;
  }

  public Boolean getEnabled() {
    return enabled;
  }

  public void setEnabled(Boolean enabled) {
    this.enabled = enabled;
  }

  public Integer getSortOrder() {
    return sortOrder;
  }

  public void setSortOrder(Integer sortOrder) {
    this.sortOrder = sortOrder;
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
