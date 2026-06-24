package com.worldlens.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record CountryProfileDto(
    String code,
    String name,
    @JsonProperty("name_en") String nameEn,
    String continent,
    String region,
    String capital,
    Double latitude,
    Double longitude,
    Long population,
    Double areaKm2,
    List<String> languages,
    String languageGroup,
    String languageGroupLabel,
    String languageColor,
    String toneGroup,
    String toneGroupLabel,
    String toneColor,
    String summary,
    String cultureNote,
    List<String> civilizationTags,
    String coverImage,
    Boolean enabled,
    Integer sortOrder
) {
}
