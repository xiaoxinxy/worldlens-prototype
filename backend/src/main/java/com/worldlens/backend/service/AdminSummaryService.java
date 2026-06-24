package com.worldlens.backend.service;

import com.worldlens.backend.dto.AdminSummaryDto;
import com.worldlens.backend.dto.AdminSummaryModuleDto;
import com.worldlens.backend.mapper.ContentEntryMapper;
import com.worldlens.backend.mapper.CountryProfileMapper;
import com.worldlens.backend.mapper.OceanCurrentMapper;
import com.worldlens.backend.mapper.TerrainFeatureMapper;
import com.worldlens.backend.mapper.UserMapper;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class AdminSummaryService {
  private final UserMapper userMapper;
  private final CountryProfileMapper countryProfileMapper;
  private final OceanCurrentMapper oceanCurrentMapper;
  private final TerrainFeatureMapper terrainFeatureMapper;
  private final ContentEntryMapper contentEntryMapper;

  public AdminSummaryService(
      UserMapper userMapper,
      CountryProfileMapper countryProfileMapper,
      OceanCurrentMapper oceanCurrentMapper,
      TerrainFeatureMapper terrainFeatureMapper,
      ContentEntryMapper contentEntryMapper
  ) {
    this.userMapper = userMapper;
    this.countryProfileMapper = countryProfileMapper;
    this.oceanCurrentMapper = oceanCurrentMapper;
    this.terrainFeatureMapper = terrainFeatureMapper;
    this.contentEntryMapper = contentEntryMapper;
  }

  public AdminSummaryDto getSummary() {
    int countryCount = countryProfileMapper.count();
    int oceanCurrentCount = oceanCurrentMapper.count();
    int terrainFeatureCount = terrainFeatureMapper.count();
    int contentEntryCount = contentEntryMapper.countAll();

    List<AdminSummaryModuleDto> modules = new ArrayList<>();
    modules.add(module("countries", "国家文明", "国家、地区、语言、人口和文化标签", countryCount));
    modules.add(module("ocean", "海洋探索", "洋流、海沟、海岭、珊瑚礁和海洋图层", oceanCurrentCount));
    modules.add(module("terrain", "地形探索", "山脉、河流、沙漠、冰川和地貌形成", terrainFeatureCount));
    modules.add(contentModule("climate", "气候探索", "热带雨林、沙漠、季风、高山和极地气候"));
    modules.add(contentModule("dynamics", "地球动态", "板块、地震、火山和地球内部动力"));
    modules.add(contentModule("seasonal", "季节时间轴", "太阳直射、雨带、季风洋流和季节影响"));
    modules.add(contentModule("cosmos", "地球与宇宙", "昼夜、月相、潮汐、极昼极夜和宇宙关系"));
    modules.add(contentModule("routes", "文明路线", "迁徙路线、航线、贸易通道和文明传播"));

    return new AdminSummaryDto(
        userMapper.count(),
        userMapper.countAdmins(),
        countryCount,
        oceanCurrentCount,
        terrainFeatureCount,
        contentEntryCount,
        modules
    );
  }

  private AdminSummaryModuleDto contentModule(String id, String name, String description) {
    return module(id, name, description, contentEntryMapper.countByModule(id));
  }

  private AdminSummaryModuleDto module(String id, String name, String description, int count) {
    return new AdminSummaryModuleDto(id, name, description, count, count > 0 ? "ready" : "empty");
  }
}
