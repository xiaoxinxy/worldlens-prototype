package com.worldlens.backend.dto;

public record CivilizationCountryMetricDto(
    String id,
    String name,
    Double lat,
    Double lng,
    String region,
    String subregion,
    Long population,
    String populationLabel,
    Double populationIntensity,
    String populationColor,
    String languageCode,
    String languageName,
    String languageGroup,
    String languageGroupLabel,
    String languageColor,
    Double toneIndex,
    String toneGroup,
    String toneGroupLabel,
    String toneLabel,
    String toneColor
) {
}
