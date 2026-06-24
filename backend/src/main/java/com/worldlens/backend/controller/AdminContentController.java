package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.ContentEntryDto;
import com.worldlens.backend.dto.ContentEntryRequest;
import com.worldlens.backend.dto.EnabledRequest;
import com.worldlens.backend.dto.PageDto;
import com.worldlens.backend.service.ContentEntryService;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/content")
public class AdminContentController {
  private final ContentEntryService contentEntryService;

  public AdminContentController(ContentEntryService contentEntryService) {
    this.contentEntryService = contentEntryService;
  }

  @GetMapping("/{module}")
  public ApiResponse<List<ContentEntryDto>> list(
      HttpServletRequest request,
      @PathVariable String module,
      @RequestParam(required = false, name = "q") String keyword
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(contentEntryService.listAdmin(module, keyword));
  }

  @GetMapping("/{module}/page")
  public ApiResponse<PageDto<ContentEntryDto>> page(
      HttpServletRequest request,
      @PathVariable String module,
      @RequestParam(required = false, name = "q") String keyword,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer pageSize
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(contentEntryService.listAdminPage(module, keyword, page, pageSize));
  }

  @PostMapping("/{module}")
  public ApiResponse<ContentEntryDto> create(
      HttpServletRequest request,
      @PathVariable String module,
      @RequestBody ContentEntryRequest entry
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(contentEntryService.create(new ContentEntryRequest(
      module,
      entry.entryId(),
      entry.title(),
      entry.subtitle(),
      entry.summary(),
      entry.payload(),
      entry.enabled(),
      entry.sortOrder()
    )));
  }

  @PutMapping("/{module}/{entryId}")
  public ApiResponse<ContentEntryDto> update(
      HttpServletRequest request,
      @PathVariable String module,
      @PathVariable String entryId,
      @RequestBody ContentEntryRequest entry
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(contentEntryService.update(module, entryId, entry));
  }

  @PatchMapping("/{module}/{entryId}/status")
  public ApiResponse<ContentEntryDto> status(
      HttpServletRequest request,
      @PathVariable String module,
      @PathVariable String entryId,
      @RequestBody EnabledRequest enabled
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(contentEntryService.setEnabled(module, entryId, Boolean.TRUE.equals(enabled.enabled())));
  }

  @DeleteMapping("/{module}/{entryId}")
  public ApiResponse<Void> delete(HttpServletRequest request, @PathVariable String module, @PathVariable String entryId) {
    AdminGuard.requireAdmin(request);
    contentEntryService.delete(module, entryId);
    return ApiResponse.ok(null);
  }
}
