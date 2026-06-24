package com.worldlens.backend.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record ContentEntryDto(
    Long id,
    String module,
    String entryId,
    String title,
    String subtitle,
    String summary,
    JsonNode payload,
    Boolean enabled,
    Integer sortOrder
) {
}
