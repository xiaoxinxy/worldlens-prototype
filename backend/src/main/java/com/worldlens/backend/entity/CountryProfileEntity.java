package com.worldlens.backend.entity;

import java.time.LocalDateTime;

public class CountryProfileEntity {
  private String code;
  private String name;
  private String nameEn;
  private String continent;
  private String region;
  private String capital;
  private Double latitude;
  private Double longitude;
  private Long population;
  private Double areaKm2;
  private String languagesJson;
  private String languageGroup;
  private String languageGroupLabel;
  private String languageColor;
  private String toneGroup;
  private String toneGroupLabel;
  private String toneColor;
  private String summary;
  private String cultureNote;
  private String civilizationTagsJson;
  private String coverImage;
  private Boolean enabled;
  private Integer sortOrder;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public String getCode() {
    return code;
  }

  public void setCode(String code) {
    this.code = code;
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

  public String getCapital() {
    return capital;
  }

  public void setCapital(String capital) {
    this.capital = capital;
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

  public Long getPopulation() {
    return population;
  }

  public void setPopulation(Long population) {
    this.population = population;
  }

  public Double getAreaKm2() {
    return areaKm2;
  }

  public void setAreaKm2(Double areaKm2) {
    this.areaKm2 = areaKm2;
  }

  public String getLanguagesJson() {
    return languagesJson;
  }

  public void setLanguagesJson(String languagesJson) {
    this.languagesJson = languagesJson;
  }

  public String getLanguageGroup() {
    return languageGroup;
  }

  public void setLanguageGroup(String languageGroup) {
    this.languageGroup = languageGroup;
  }

  public String getLanguageGroupLabel() {
    return languageGroupLabel;
  }

  public void setLanguageGroupLabel(String languageGroupLabel) {
    this.languageGroupLabel = languageGroupLabel;
  }

  public String getLanguageColor() {
    return languageColor;
  }

  public void setLanguageColor(String languageColor) {
    this.languageColor = languageColor;
  }

  public String getToneGroup() {
    return toneGroup;
  }

  public void setToneGroup(String toneGroup) {
    this.toneGroup = toneGroup;
  }

  public String getToneGroupLabel() {
    return toneGroupLabel;
  }

  public void setToneGroupLabel(String toneGroupLabel) {
    this.toneGroupLabel = toneGroupLabel;
  }

  public String getToneColor() {
    return toneColor;
  }

  public void setToneColor(String toneColor) {
    this.toneColor = toneColor;
  }

  public String getSummary() {
    return summary;
  }

  public void setSummary(String summary) {
    this.summary = summary;
  }

  public String getCultureNote() {
    return cultureNote;
  }

  public void setCultureNote(String cultureNote) {
    this.cultureNote = cultureNote;
  }

  public String getCivilizationTagsJson() {
    return civilizationTagsJson;
  }

  public void setCivilizationTagsJson(String civilizationTagsJson) {
    this.civilizationTagsJson = civilizationTagsJson;
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
