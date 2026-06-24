package com.worldlens.backend.dto;

import java.util.List;

public record AiRouteResponse(
    String routeId,
    String title,
    String theme,
    String summary,
    List<AiRouteStopDto> stops,
    String provider
) {
}
