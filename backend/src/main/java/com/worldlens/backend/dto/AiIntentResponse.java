package com.worldlens.backend.dto;

import java.util.List;

public record AiIntentResponse(
    String intent,
    String target,
    String targetType,
    String country,
    String countryCode,
    List<Double> coordinates,
    String provider
) {
}
