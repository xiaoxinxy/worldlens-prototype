package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.FileUploadDto;
import com.worldlens.backend.service.FileStorageService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class FileController {
  private final FileStorageService fileStorageService;

  public FileController(FileStorageService fileStorageService) {
    this.fileStorageService = fileStorageService;
  }

  @PostMapping("/files/avatar")
  public ApiResponse<FileUploadDto> uploadAvatar(HttpServletRequest request, @RequestParam("file") MultipartFile file) {
    Current.user(request);
    return ApiResponse.ok(fileStorageService.storeImage(file, "avatar"));
  }

  @PostMapping("/admin/files/content-image")
  public ApiResponse<FileUploadDto> uploadContentImage(HttpServletRequest request, @RequestParam("file") MultipartFile file) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(fileStorageService.storeImage(file, "content"));
  }
}
