package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.ContentEntryDto;
import com.worldlens.backend.service.ContentEntryService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/content")
public class ContentController {
  private final ContentEntryService contentEntryService;

  public ContentController(ContentEntryService contentEntryService) {
    this.contentEntryService = contentEntryService;
  }

  @GetMapping("/{module}")
  public ApiResponse<List<ContentEntryDto>> list(
      @PathVariable String module,
      @RequestParam(required = false, name = "q") String keyword
  ) {
    return ApiResponse.ok(contentEntryService.listPublic(module, keyword));
  }
}
