package com.worldlens.backend.dto;

import java.util.List;

public record AdminSummaryDto(
    int totalUsers,
    int adminUsers,
    int countryCount,
    int oceanCurrentCount,
    int terrainFeatureCount,
    int contentEntryCount,
    List<AdminSummaryModuleDto> modules
) {
}
