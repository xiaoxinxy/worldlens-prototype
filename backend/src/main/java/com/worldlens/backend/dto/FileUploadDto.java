package com.worldlens.backend.dto;

public record FileUploadDto(
  String url,
  String originalName,
  String contentType,
  long size
) {
}
