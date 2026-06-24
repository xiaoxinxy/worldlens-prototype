package com.worldlens.backend.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.List;

public record DetailChatRequest(
    String subjectType,
    String subjectId,
    String subjectName,
    JsonNode context,
    List<DetailChatMessageDto> messages
) {
}
