package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.CountryProfileDto;
import com.worldlens.backend.dto.CountryProfileRequest;
import com.worldlens.backend.dto.EnabledRequest;
import com.worldlens.backend.dto.PageDto;
import com.worldlens.backend.service.CountryProfileService;
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
@RequestMapping("/api/admin/countries")
public class AdminCountryController {
  private final CountryProfileService countryProfileService;

  public AdminCountryController(CountryProfileService countryProfileService) {
    this.countryProfileService = countryProfileService;
  }

  @GetMapping
  public ApiResponse<List<CountryProfileDto>> list(
      HttpServletRequest request,
      @RequestParam(required = false) String continent,
      @RequestParam(required = false, name = "q") String keyword
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(countryProfileService.listAdmin(continent, keyword));
  }

  @GetMapping("/page")
  public ApiResponse<PageDto<CountryProfileDto>> page(
      HttpServletRequest request,
      @RequestParam(required = false) String continent,
      @RequestParam(required = false, name = "q") String keyword,
      @RequestParam(required = false) Integer page,
      @RequestParam(required = false) Integer pageSize
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(countryProfileService.listAdminPage(continent, keyword, page, pageSize));
  }

  @PostMapping
  public ApiResponse<CountryProfileDto> create(HttpServletRequest request, @RequestBody CountryProfileRequest country) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(countryProfileService.create(country));
  }

  @PutMapping("/{code}")
  public ApiResponse<CountryProfileDto> update(
      HttpServletRequest request,
      @PathVariable String code,
      @RequestBody CountryProfileRequest country
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(countryProfileService.update(code, country));
  }

  @PatchMapping("/{code}/status")
  public ApiResponse<CountryProfileDto> status(
      HttpServletRequest request,
      @PathVariable String code,
      @RequestBody EnabledRequest enabled
  ) {
    AdminGuard.requireAdmin(request);
    return ApiResponse.ok(countryProfileService.setEnabled(code, Boolean.TRUE.equals(enabled.enabled())));
  }

  @DeleteMapping("/{code}")
  public ApiResponse<Void> delete(HttpServletRequest request, @PathVariable String code) {
    AdminGuard.requireAdmin(request);
    countryProfileService.delete(code);
    return ApiResponse.ok(null);
  }
}
