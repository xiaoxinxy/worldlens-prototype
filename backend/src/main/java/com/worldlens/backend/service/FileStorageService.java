package com.worldlens.backend.service;

import com.worldlens.backend.common.AppException;
import com.worldlens.backend.dto.FileUploadDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class FileStorageService {
  private static final long MAX_IMAGE_SIZE = 5L * 1024L * 1024L;
  private static final Set<String> IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
  private static final Map<String, String> EXTENSIONS = Map.of(
    "image/jpeg", ".jpg",
    "image/png", ".png",
    "image/webp", ".webp",
    "image/gif", ".gif"
  );

  private final Path uploadRoot;

  public FileStorageService(@Value("${worldlens.upload.root:./uploads}") String uploadRoot) {
    this.uploadRoot = Path.of(uploadRoot).toAbsolutePath().normalize();
  }

  public FileUploadDto storeImage(MultipartFile file, String folder) {
    validate(file, folder);
    String contentType = normalizeContentType(file.getContentType());
    String originalName = cleanOriginalName(file.getOriginalFilename());
    String filename = UUID.randomUUID() + extensionFor(originalName, contentType);
    Path directory = uploadRoot.resolve(folder).normalize();
    Path target = directory.resolve(filename).normalize();

    if (!target.startsWith(directory)) {
      throw new AppException(HttpStatus.BAD_REQUEST, "文件名不合法");
    }

    try {
      Files.createDirectories(directory);
      try (InputStream input = file.getInputStream()) {
        Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
      }
    } catch (IOException exception) {
      throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "文件保存失败");
    }

    return new FileUploadDto("/uploads/" + folder + "/" + filename, originalName, contentType, file.getSize());
  }

  private static void validate(MultipartFile file, String folder) {
    if (file == null || file.isEmpty()) {
      throw new AppException(HttpStatus.BAD_REQUEST, "请选择要上传的图片");
    }
    if (!Set.of("avatar", "content").contains(folder)) {
      throw new AppException(HttpStatus.BAD_REQUEST, "上传目录不合法");
    }
    if (file.getSize() > MAX_IMAGE_SIZE) {
      throw new AppException(HttpStatus.BAD_REQUEST, "图片不能超过 5MB");
    }
    String contentType = normalizeContentType(file.getContentType());
    if (!IMAGE_TYPES.contains(contentType)) {
      throw new AppException(HttpStatus.BAD_REQUEST, "只支持 JPG、PNG、WebP 或 GIF 图片");
    }
  }

  private static String cleanOriginalName(String originalName) {
    if (originalName == null || originalName.isBlank()) {
      return "image";
    }
    String normalized = originalName.replace('\\', '/');
    int slash = normalized.lastIndexOf('/');
    return slash >= 0 ? normalized.substring(slash + 1) : normalized;
  }

  private static String normalizeContentType(String contentType) {
    return contentType == null ? "" : contentType.toLowerCase(Locale.ROOT);
  }

  private static String extensionFor(String originalName, String contentType) {
    String lower = originalName.toLowerCase(Locale.ROOT);
    for (String extension : EXTENSIONS.values()) {
      if (lower.endsWith(extension)) {
        return extension;
      }
    }
    return EXTENSIONS.getOrDefault(contentType, ".img");
  }
}
