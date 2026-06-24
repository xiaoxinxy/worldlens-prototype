package com.worldlens.backend.dto;

import java.util.List;

public record OceanInfluenceDto(
    List<Double> center,
    Double radius,
    String role
) {
}
