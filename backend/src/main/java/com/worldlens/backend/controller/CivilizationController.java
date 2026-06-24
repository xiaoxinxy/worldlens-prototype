package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.CivilizationCountryMetricDto;
import com.worldlens.backend.dto.CivilizationLayerDto;
import com.worldlens.backend.service.CountryProfileService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/civilization")
public class CivilizationController {
  private final CountryProfileService countryProfileService;

  public CivilizationController(CountryProfileService countryProfileService) {
    this.countryProfileService = countryProfileService;
  }

  @GetMapping("/layers")
  public ApiResponse<List<CivilizationLayerDto>> layers() {
    return ApiResponse.ok(countryProfileService.layers());
  }

  @GetMapping("/countries")
  public ApiResponse<Map<String, CivilizationCountryMetricDto>> countries() {
    return ApiResponse.ok(countryProfileService.civilizationCountryMetrics());
  }
}
