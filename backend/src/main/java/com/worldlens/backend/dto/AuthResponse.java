package com.worldlens.backend.dto;

public record AuthResponse(String token, UserDto user) {
}
