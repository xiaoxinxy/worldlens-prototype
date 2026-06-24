package com.worldlens.backend.dto;

public record AdminSummaryModuleDto(
    String id,
    String name,
    String description,
    int count,
    String status
) {
}
