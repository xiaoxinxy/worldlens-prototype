package com.worldlens.backend.dto;

import java.util.List;

public record AiRouteStopDto(
    String id,
    String name,
    String country,
    String countryCode,
    List<Double> coordinates,
    String intro,
    String culture,
    List<String> highlights,
    int staySeconds
) {
}
