package com.worldlens.backend.dto;

import java.util.List;

public record AiExploreResponse(
    String title,
    String subtitle,
    String country,
    String countryCode,
    List<Double> coordinates,
    String summary,
    List<AiExploreSectionDto> sections,
    String provider
) {
}
