package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.CountryProfileDto;
import com.worldlens.backend.service.CountryProfileService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/countries")
public class CountryController {
  private final CountryProfileService countryProfileService;

  public CountryController(CountryProfileService countryProfileService) {
    this.countryProfileService = countryProfileService;
  }

  @GetMapping
  public ApiResponse<List<CountryProfileDto>> list(
      @RequestParam(required = false) String continent,
      @RequestParam(required = false, name = "q") String keyword
  ) {
    return ApiResponse.ok(countryProfileService.listPublic(continent, keyword));
  }

  @GetMapping("/continents")
  public ApiResponse<List<String>> continents() {
    return ApiResponse.ok(countryProfileService.continents());
  }

  @GetMapping("/featured")
  public ApiResponse<List<CountryProfileDto>> featured() {
    return ApiResponse.ok(countryProfileService.featured());
  }

  @GetMapping("/{code}/related")
  public ApiResponse<List<CountryProfileDto>> related(@PathVariable String code) {
    return ApiResponse.ok(countryProfileService.related(code));
  }

  @GetMapping("/{code}")
  public ApiResponse<CountryProfileDto> get(@PathVariable String code) {
    return ApiResponse.ok(countryProfileService.getPublic(code));
  }
}
