package com.worldlens.backend.entity;

import java.time.LocalDateTime;

public class TerrainFeatureEntity {
  private String id;
  private String name;
  private String nameEn;
  private String terrainType;
  private String typeLabel;
  private String continent;
  private String region;
  private String countryCodesJson;
  private Double latitude;
  private Double longitude;
  private String summary;
  private String formationReason;
  private String highestPoint;
  private String lengthLabel;
  private String areaLabel;
  private String tagsJson;
  private String coverImage;
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

  public String getTerrainType() {
    return terrainType;
  }

  public void setTerrainType(String terrainType) {
    this.terrainType = terrainType;
  }

  public String getTypeLabel() {
    return typeLabel;
  }

  public void setTypeLabel(String typeLabel) {
    this.typeLabel = typeLabel;
  }

  public String getContinent() {
    return continent;
  }

  public void setContinent(String continent) {
    this.continent = continent;
  }

  public String getRegion() {
    return region;
  }

  public void setRegion(String region) {
    this.region = region;
  }

  public String getCountryCodesJson() {
    return countryCodesJson;
  }

  public void setCountryCodesJson(String countryCodesJson) {
    this.countryCodesJson = countryCodesJson;
  }

  public Double getLatitude() {
    return latitude;
  }

  public void setLatitude(Double latitude) {
    this.latitude = latitude;
  }

  public Double getLongitude() {
    return longitude;
  }

  public void setLongitude(Double longitude) {
    this.longitude = longitude;
  }

  public String getSummary() {
    return summary;
  }

  public void setSummary(String summary) {
    this.summary = summary;
  }

  public String getFormationReason() {
    return formationReason;
  }

  public void setFormationReason(String formationReason) {
    this.formationReason = formationReason;
  }

  public String getHighestPoint() {
    return highestPoint;
  }

  public void setHighestPoint(String highestPoint) {
    this.highestPoint = highestPoint;
  }

  public String getLengthLabel() {
    return lengthLabel;
  }

  public void setLengthLabel(String lengthLabel) {
    this.lengthLabel = lengthLabel;
  }

  public String getAreaLabel() {
    return areaLabel;
  }

  public void setAreaLabel(String areaLabel) {
    this.areaLabel = areaLabel;
  }

  public String getTagsJson() {
    return tagsJson;
  }

  public void setTagsJson(String tagsJson) {
    this.tagsJson = tagsJson;
  }

  public String getCoverImage() {
    return coverImage;
  }

  public void setCoverImage(String coverImage) {
    this.coverImage = coverImage;
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
