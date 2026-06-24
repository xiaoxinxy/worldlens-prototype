package com.worldlens.backend.controller;

import com.worldlens.backend.common.ApiResponse;
import com.worldlens.backend.dto.OceanCurrentDto;
import com.worldlens.backend.service.OceanCurrentService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ocean")
public class OceanController {
  private final OceanCurrentService oceanCurrentService;

  public OceanController(OceanCurrentService oceanCurrentService) {
    this.oceanCurrentService = oceanCurrentService;
  }

  @GetMapping("/currents")
  public ApiResponse<List<OceanCurrentDto>> currents(
      @RequestParam(required = false) String kind,
      @RequestParam(required = false, name = "q") String keyword
  ) {
    return ApiResponse.ok(oceanCurrentService.list(kind, keyword));
  }

  @GetMapping("/currents/{id}")
  public ApiResponse<OceanCurrentDto> current(@PathVariable String id) {
    return ApiResponse.ok(oceanCurrentService.get(id));
  }
}
