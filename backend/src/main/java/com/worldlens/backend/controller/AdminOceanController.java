package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.common.AppException;
import com.worldlens.backend.dto.OceanCurrentDto;
import com.worldlens.backend.dto.OceanCurrentRequest;
import com.worldlens.backend.dto.OceanCurrentSortRequest;
import com.worldlens.backend.dto.OceanCurrentStatusRequest;
import com.worldlens.backend.service.OceanCurrentService;
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
@RequestMapping("/api/admin/ocean")
public class AdminOceanController {
  private final OceanCurrentService oceanCurrentService;

  public AdminOceanController(OceanCurrentService oceanCurrentService) {
    this.oceanCurrentService = oceanCurrentService;
  }

  @GetMapping("/currents")
  public ApiResponse<List<OceanCurrentDto>> currents(
      HttpServletRequest request,
      @RequestParam(required = false) String kind,
      @RequestParam(required = false, name = "q") String keyword
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(oceanCurrentService.listForAdmin(kind, keyword));
  }

  @PostMapping("/currents")
  public ApiResponse<OceanCurrentDto> create(HttpServletRequest request, @RequestBody OceanCurrentRequest current) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(oceanCurrentService.create(current));
  }

  @PutMapping("/currents/{id}")
  public ApiResponse<OceanCurrentDto> update(
      HttpServletRequest request,
      @PathVariable String id,
      @RequestBody OceanCurrentRequest current
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(oceanCurrentService.update(id, current));
  }

  @PatchMapping("/currents/{id}/status")
  public ApiResponse<OceanCurrentDto> updateStatus(
      HttpServletRequest request,
      @PathVariable String id,
      @RequestBody OceanCurrentStatusRequest status
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(oceanCurrentService.setEnabled(id, Boolean.TRUE.equals(status.enabled())));
  }

  @PatchMapping("/currents/{id}/sort")
  public ApiResponse<OceanCurrentDto> updateSort(
      HttpServletRequest request,
      @PathVariable String id,
      @RequestBody OceanCurrentSortRequest sort
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(oceanCurrentService.setSortOrder(id, sort.sortOrder() == null ? 100 : sort.sortOrder()));
  }

  @DeleteMapping("/currents/{id}")
  public ApiResponse<Void> delete(HttpServletRequest request, @PathVariable String id) {
    AdminGuard.requireAdmin(request);
    oceanCurrentService.delete(id);
    return ApiResponse.ok(null);
  }
}
