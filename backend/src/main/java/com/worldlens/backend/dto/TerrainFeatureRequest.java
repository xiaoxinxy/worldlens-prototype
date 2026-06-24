package com.worldlens.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record TerrainFeatureRequest(
    String id,
    String name,
    @JsonProperty("name_en") String nameEn,
    String type,
    @JsonProperty("type_label") String typeLabel,
    String continent,
    String region,
    @JsonProperty("country_codes") List<String> countryCodes,
    Double latitude,
    Double longitude,
    String summary,
    @JsonProperty("formation_reason") String formationReason,
    @JsonProperty("highest_point") String highestPoint,
    String length,
    String area,
    List<String> tags,
    @JsonProperty("cover_image") String coverImage,
    Boolean enabled,
    Integer sortOrder
) {
}
