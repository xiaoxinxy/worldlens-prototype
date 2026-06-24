package com.worldlens.backend.dto;

public record FavoriteRequest(String itemId, String itemType, String title, String coverImage, String payload) {
}
