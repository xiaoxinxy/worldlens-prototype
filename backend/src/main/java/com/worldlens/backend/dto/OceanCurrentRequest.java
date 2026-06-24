package com.worldlens.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record OceanCurrentRequest(
    String id,
    String name,
    @JsonProperty("name_en") String nameEn,
    String kind,
    String basin,
    String system,
    String direction,
    String source,
    String effect,
    List<String> impactTags,
    String textbookNote,
    OceanInfluenceDto influence,
    List<List<Double>> path,
    Boolean enabled,
    Integer sortOrder
) {
}
