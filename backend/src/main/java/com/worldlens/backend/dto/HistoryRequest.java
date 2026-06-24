package com.worldlens.backend.dto;

public record HistoryRequest(String itemId, String itemType, String title, String slug, String coverImage) {
}
