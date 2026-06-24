package com.worldlens.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldlens.backend.common.AppException;
import com.worldlens.backend.dto.TerrainFeatureDto;
import com.worldlens.backend.dto.TerrainFeatureRequest;
import com.worldlens.backend.dto.TerrainTypeDto;
import com.worldlens.backend.entity.TerrainFeatureEntity;
import com.worldlens.backend.mapper.TerrainFeatureMapper;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class TerrainFeatureService {
  private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {};

  private final TerrainFeatureMapper terrainFeatureMapper;
  private final ObjectMapper objectMapper;

  public TerrainFeatureService(TerrainFeatureMapper terrainFeatureMapper, ObjectMapper objectMapper) {
    this.terrainFeatureMapper = terrainFeatureMapper;
    this.objectMapper = objectMapper;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void seedDefaultTerrain() {
    insertSeed(seed(
      "himalayas",
      "喜马拉雅山脉",
      "Himalayas",
      "mountain",
      "山脉",
      "亚洲",
      "南亚 / 青藏高原",
      List.of("CHN", "IND", "NPL", "BTN", "PAK"),
      28.2,
      86.9,
      "世界最高山系，是板块碰撞、季风屏障和冰川水塔的集中体现。",
      "印度板块向北撞入欧亚板块，沉积岩被挤压、折叠并持续抬升。",
      "珠穆朗玛峰 8,849 m",
      "约 2,400 km",
      "亚洲高山带",
      List.of("板块碰撞", "世界屋脊", "季风屏障"),
      "/images/wiki/terrain/himalayas-cover.jpg",
      10
    ));
    insertSeed(seed(
      "sahara-desert",
      "撒哈拉沙漠",
      "Sahara Desert",
      "desert",
      "沙漠",
      "非洲",
      "北非",
      List.of("DZA", "EGY", "LBY", "MLI", "NER", "SDN", "TCD"),
      23,
      13,
      "地球最大的热带荒漠，受副热带高压和大陆性干旱共同控制。",
      "副热带高压使空气下沉变干，北非大陆位置又远离稳定水汽来源。",
      "",
      "东西约 4,800 km",
      "约 920 万 km²",
      List.of("副热带高压", "绿洲", "沙尘输送"),
      "/images/wiki/terrain/sahara-cover.jpg",
      20
    ));
    insertSeed(seed(
      "mariana-trench",
      "马里亚纳海沟",
      "Mariana Trench",
      "trench",
      "海沟",
      "大洋洲",
      "西太平洋",
      List.of(),
      11.35,
      142.2,
      "已知最深的海沟之一，是板块俯冲边界的极端地貌。",
      "太平洋板块向菲律宾海板块之下俯冲，海底被弯折并拉入地幔。",
      "约 10,984 m",
      "约 2,550 km",
      "西太平洋深海边界",
      List.of("板块俯冲", "深海", "海洋极端环境"),
      "/images/wiki/terrain/mariana-trench-cover.jpg",
      30
    ));
    insertSeed(seed(
      "andes",
      "安第斯山脉",
      "Andes",
      "mountain",
      "山脉",
      "南美洲",
      "南美洲西岸",
      List.of("ARG", "BOL", "CHL", "COL", "ECU", "PER", "VEN"),
      -13.16,
      -72.54,
      "世界最长的陆上山脉，像一道南北向屏障贴着南美洲西岸延伸。",
      "纳斯卡板块向南美板块之下俯冲，使地壳挤压抬升，并形成火山带和强震带。",
      "阿空加瓜山 6,961 m",
      "约 7,000 km",
      "南美西岸高山带",
      List.of("板块俯冲", "火山带", "雨影效应"),
      "/images/places/brazil-cover.jpg",
      40
    ));
    insertSeed(seed(
      "east-african-rift",
      "东非大裂谷",
      "East African Rift",
      "rift",
      "裂谷",
      "非洲",
      "东非高原",
      List.of("ETH", "KEN", "TZA", "UGA", "MWI", "MOZ"),
      -1.29,
      36.82,
      "东非大陆内部正在被拉开的巨大裂谷系统，串联湖泊、火山和高原边缘。",
      "非洲板块内部受张裂作用影响，岩石圈被拉伸变薄，断层下陷形成谷地并伴随火山活动。",
      "",
      "约 6,000 km",
      "东非裂谷带",
      List.of("大陆张裂", "断层湖", "火山活动"),
      "/images/places/south-africa-cover.jpg",
      50
    ));
    insertSeed(seed(
      "great-barrier-reef",
      "大堡礁",
      "Great Barrier Reef",
      "reef",
      "珊瑚礁",
      "大洋洲",
      "澳大利亚东北海岸",
      List.of("AUS"),
      -18.29,
      147.7,
      "世界上规模最大的珊瑚礁系统之一，是热带浅海生态、海岸保护和旅游经济的重要区域。",
      "温暖清澈的浅海、充足光照和较稳定盐度适合造礁珊瑚生长，长期堆积形成巨大的礁体系统。",
      "",
      "约 2,300 km",
      "约 34.4 万 km²",
      List.of("热带浅海", "珊瑚生态", "海岸屏障"),
      "/images/places/australia-cover.jpg",
      60
    ));
    insertSeed(seed(
      "tibetan-plateau",
      "青藏高原",
      "Tibetan Plateau",
      "plateau",
      "高原",
      "亚洲",
      "中国西部 / 喜马拉雅北侧",
      List.of("CHN"),
      32.0,
      88.0,
      "地球上海拔最高、面积巨大的高原，被称为亚洲水塔，并深刻影响季风环流。",
      "印度板块持续向欧亚板块碰撞挤压，地壳显著增厚并整体抬升，形成高寒高原环境。",
      "平均海拔约 4,000 m 以上",
      "东西约 2,800 km",
      "约 250 万 km²",
      List.of("板块碰撞", "亚洲水塔", "高寒生态"),
      "/images/places/china-cover.jpg",
      70
    ));
    insertSeed(seed(
      "amazon-river",
      "亚马孙河",
      "Amazon River",
      "river",
      "河流",
      "南美洲",
      "亚马孙盆地",
      List.of("BRA", "PER", "COL"),
      -3.1,
      -60.0,
      "世界水量最大的河流系统，连接安第斯山地、热带雨林和大西洋入海口。",
      "安第斯山降水和赤道雨林丰沛降水共同补给，低平盆地让巨大水系向东汇入大西洋。",
      "",
      "约 6,400 km",
      "流域约 700 万 km²",
      List.of("热带雨林", "河网", "水循环"),
      "/images/cached/special/amazon-river.jpg",
      80
    ));
    insertSeed(seed(
      "gobi-desert",
      "戈壁沙漠",
      "Gobi Desert",
      "desert",
      "沙漠",
      "亚洲",
      "蒙古高原南部 / 中国北部",
      List.of("CHN", "MNG"),
      42.5,
      103.0,
      "亚洲内陆典型温带荒漠，冬冷夏热，砾质荒漠和风蚀地貌明显。",
      "深居内陆、远离海洋水汽，并受山地阻挡和大陆性气候影响，降水稀少、蒸发强烈。",
      "",
      "东西约 1,600 km",
      "约 130 万 km²",
      List.of("温带荒漠", "大陆性气候", "风蚀地貌"),
      "/images/cached/special/gobi-desert.jpg",
      90
    ));
    insertSeed(seed(
      "greenland-ice-sheet",
      "格陵兰冰盖",
      "Greenland Ice Sheet",
      "ice-sheet",
      "冰盖",
      "北美洲",
      "格陵兰岛",
      List.of("GRL", "DNK"),
      72.0,
      -40.0,
      "北半球最大的陆地冰体，记录气候变化，并影响海平面和北大西洋淡水输入。",
      "高纬寒冷环境让多年积雪压实成冰，冰体在重力作用下缓慢向海岸流动并形成冰川。",
      "冰厚可超过 3,000 m",
      "南北约 2,400 km",
      "约 171 万 km²",
      List.of("极地冰盖", "海平面", "气候记录"),
      "/images/places/arctic-region-cover.jpg",
      100
    ));
    insertSeed(seed(
      "grand-canyon",
      "科罗拉多大峡谷",
      "Grand Canyon",
      "canyon",
      "峡谷",
      "北美洲",
      "美国亚利桑那州",
      List.of("USA"),
      36.1,
      -112.1,
      "科罗拉多河切开的巨大峡谷，清晰暴露多层岩层，是流水侵蚀与地壳抬升共同作用的典型案例。",
      "科罗拉多高原抬升后，河流获得更强下切能力，长期侵蚀切穿岩层并形成陡峭峡谷。",
      "深约 1,800 m",
      "约 446 km",
      "",
      List.of("流水侵蚀", "地层剖面", "高原抬升"),
      "/images/places/usa-cover.jpg",
      110
    ));
  }

  public List<TerrainFeatureDto> listPublic(String type, String keyword) {
    return terrainFeatureMapper.findPublic(cleanOrNull(type), cleanOrNull(keyword)).stream().map(this::toDto).toList();
  }

  public List<TerrainTypeDto> listTypes() {
    Map<String, String> labels = new LinkedHashMap<>();
    Map<String, Long> counts = new LinkedHashMap<>();
    for (TerrainFeatureDto feature : listPublic(null, null)) {
      labels.putIfAbsent(feature.type(), feature.typeLabel());
      counts.merge(feature.type(), 1L, Long::sum);
    }
    return counts.entrySet().stream()
      .map(entry -> new TerrainTypeDto(entry.getKey(), labels.get(entry.getKey()), entry.getValue()))
      .toList();
  }

  public List<TerrainFeatureDto> featured() {
    return listPublic(null, null).stream().limit(6).toList();
  }

  public TerrainFeatureDto getPublic(String id) {
    TerrainFeatureEntity feature = terrainFeatureMapper.findPublicById(clean(id));
    if (feature == null) throw new AppException(HttpStatus.NOT_FOUND, "未找到地形数据");
    return toDto(feature);
  }

  public List<TerrainFeatureDto> related(String id) {
    TerrainFeatureDto target = getPublic(id);
    return listPublic(null, null).stream()
      .filter(feature -> !feature.id().equals(target.id()))
      .filter(feature -> relatedScore(target, feature) > 0)
      .sorted(
        Comparator.comparingInt((TerrainFeatureDto feature) -> relatedScore(target, feature))
          .reversed()
          .thenComparing(TerrainFeatureDto::sortOrder)
      )
      .limit(6)
      .toList();
  }

  public List<TerrainFeatureDto> listAdmin(String type, String keyword) {
    return terrainFeatureMapper.findAdmin(cleanOrNull(type), cleanOrNull(keyword)).stream().map(this::toDto).toList();
  }

  public TerrainFeatureDto create(TerrainFeatureRequest request) {
    String id = clean(request.id());
    if (!id.matches("[a-z0-9-]{3,120}")) throw new AppException(HttpStatus.BAD_REQUEST, "地形 ID 只能使用小写字母、数字和短横线");
    if (terrainFeatureMapper.findById(id) != null) throw new AppException(HttpStatus.CONFLICT, "地形 ID 已存在");
    TerrainFeatureEntity entity = toEntity(request, id);
    terrainFeatureMapper.insert(entity);
    return toDto(terrainFeatureMapper.findById(id));
  }

  public TerrainFeatureDto update(String id, TerrainFeatureRequest request) {
    String featureId = requireExistingId(id);
    TerrainFeatureEntity entity = toEntity(request, featureId);
    terrainFeatureMapper.update(entity);
    return toDto(terrainFeatureMapper.findById(featureId));
  }

  public TerrainFeatureDto setEnabled(String id, boolean enabled) {
    String featureId = requireExistingId(id);
    terrainFeatureMapper.updateEnabled(featureId, enabled);
    return toDto(terrainFeatureMapper.findById(featureId));
  }

  public void delete(String id) {
    terrainFeatureMapper.delete(requireExistingId(id));
  }

  private void insertSeed(TerrainFeatureEntity terrain) {
    if (terrainFeatureMapper.findById(terrain.getId()) == null) {
      terrainFeatureMapper.insert(terrain);
    }
  }

  private int relatedScore(TerrainFeatureDto target, TerrainFeatureDto feature) {
    int score = 0;
    if (sameText(target.type(), feature.type())) score += 4;
    if (sameText(target.continent(), feature.continent())) score += 3;
    if (sharesAny(target.countryCodes(), feature.countryCodes())) score += 2;
    if (sharesAny(target.tags(), feature.tags())) score += 1;
    return score;
  }

  private boolean sharesAny(List<String> left, List<String> right) {
    if (left == null || right == null || left.isEmpty() || right.isEmpty()) return false;
    return left.stream().anyMatch(right::contains);
  }

  private boolean sameText(String left, String right) {
    return !clean(left).isEmpty() && clean(left).equals(clean(right));
  }

  private TerrainFeatureDto toDto(TerrainFeatureEntity feature) {
    return new TerrainFeatureDto(
      feature.getId(),
      feature.getName(),
      feature.getNameEn(),
      feature.getTerrainType(),
      feature.getTypeLabel(),
      feature.getContinent(),
      feature.getRegion(),
      readJson(feature.getCountryCodesJson()),
      feature.getLatitude(),
      feature.getLongitude(),
      feature.getSummary(),
      feature.getFormationReason(),
      feature.getHighestPoint(),
      feature.getLengthLabel(),
      feature.getAreaLabel(),
      readJson(feature.getTagsJson()),
      feature.getCoverImage(),
      feature.getEnabled(),
      feature.getSortOrder()
    );
  }

  private TerrainFeatureEntity toEntity(TerrainFeatureRequest request, String id) {
    double lat = request.latitude() == null ? 0 : request.latitude();
    double lng = request.longitude() == null ? 0 : request.longitude();
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new AppException(HttpStatus.BAD_REQUEST, "地形坐标超出范围");
    }
    TerrainFeatureEntity entity = new TerrainFeatureEntity();
    entity.setId(id);
    entity.setName(requiredText(request.name(), "名称"));
    entity.setNameEn(defaultText(request.nameEn(), id));
    entity.setTerrainType(requiredText(request.type(), "类型"));
    entity.setTypeLabel(defaultText(request.typeLabel(), request.type()));
    entity.setContinent(defaultText(request.continent(), ""));
    entity.setRegion(defaultText(request.region(), ""));
    entity.setCountryCodesJson(writeJson(request.countryCodes() == null ? List.of() : request.countryCodes()));
    entity.setLatitude(lat);
    entity.setLongitude(lng);
    entity.setSummary(requiredText(request.summary(), "简介"));
    entity.setFormationReason(requiredText(request.formationReason(), "形成原因"));
    entity.setHighestPoint(defaultText(request.highestPoint(), ""));
    entity.setLengthLabel(defaultText(request.length(), ""));
    entity.setAreaLabel(defaultText(request.area(), ""));
    entity.setTagsJson(writeJson(request.tags() == null ? List.of() : request.tags()));
    entity.setCoverImage(defaultText(request.coverImage(), ""));
    entity.setEnabled(request.enabled() == null || request.enabled());
    entity.setSortOrder(request.sortOrder() == null ? 100 : Math.max(0, request.sortOrder()));
    return entity;
  }

  private TerrainFeatureEntity seed(
      String id,
      String name,
      String nameEn,
      String type,
      String typeLabel,
      String continent,
      String region,
      List<String> countryCodes,
      double latitude,
      double longitude,
      String summary,
      String formationReason,
      String highestPoint,
      String length,
      String area,
      List<String> tags,
      String coverImage,
      int sortOrder
  ) {
    TerrainFeatureEntity entity = new TerrainFeatureEntity();
    entity.setId(id);
    entity.setName(name);
    entity.setNameEn(nameEn);
    entity.setTerrainType(type);
    entity.setTypeLabel(typeLabel);
    entity.setContinent(continent);
    entity.setRegion(region);
    entity.setCountryCodesJson(writeJson(countryCodes));
    entity.setLatitude(latitude);
    entity.setLongitude(longitude);
    entity.setSummary(summary);
    entity.setFormationReason(formationReason);
    entity.setHighestPoint(highestPoint);
    entity.setLengthLabel(length);
    entity.setAreaLabel(area);
    entity.setTagsJson(writeJson(tags));
    entity.setCoverImage(coverImage);
    entity.setEnabled(true);
    entity.setSortOrder(sortOrder);
    return entity;
  }

  private String requireExistingId(String id) {
    String featureId = clean(id);
    if (terrainFeatureMapper.findById(featureId) == null) throw new AppException(HttpStatus.NOT_FOUND, "未找到地形数据");
    return featureId;
  }

  private List<String> readJson(String json) {
    if (json == null || json.isBlank()) return List.of();
    try {
      return objectMapper.readValue(json, STRING_LIST);
    } catch (JsonProcessingException exception) {
      return List.of();
    }
  }

  private String writeJson(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JsonProcessingException exception) {
      throw new IllegalStateException("Terrain data could not be serialized", exception);
    }
  }

  private static String cleanOrNull(String value) {
    String text = clean(value);
    return text.isEmpty() ? null : text;
  }

  private static String clean(String value) {
    return value == null ? "" : value.trim();
  }

  private static String defaultText(String value, String fallback) {
    String text = clean(value);
    return text.isEmpty() ? fallback : text;
  }

  private static String requiredText(String value, String label) {
    String text = clean(value);
    if (text.isEmpty()) throw new AppException(HttpStatus.BAD_REQUEST, label + "不能为空");
    return text;
  }
}
