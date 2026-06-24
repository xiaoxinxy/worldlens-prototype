package com.worldlens.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldlens.backend.common.AppException;
import com.worldlens.backend.dto.OceanCurrentDto;
import com.worldlens.backend.dto.OceanCurrentRequest;
import com.worldlens.backend.dto.OceanInfluenceDto;
import com.worldlens.backend.entity.OceanCurrentEntity;
import com.worldlens.backend.mapper.OceanCurrentMapper;
import java.util.List;
import java.util.Set;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class OceanCurrentService {
  private static final TypeReference<List<String>> TAG_LIST = new TypeReference<>() {};
  private static final TypeReference<List<List<Double>>> PATH_LIST = new TypeReference<>() {};
  private static final Set<String> VALID_KINDS = Set.of("warm", "cold", "seasonal");

  private final OceanCurrentMapper oceanCurrentMapper;
  private final ObjectMapper objectMapper;

  public OceanCurrentService(OceanCurrentMapper oceanCurrentMapper, ObjectMapper objectMapper) {
    this.oceanCurrentMapper = oceanCurrentMapper;
    this.objectMapper = objectMapper;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void seedDefaultCurrents() {
    if (oceanCurrentMapper.count() > 0) return;
    for (int index = 0; index < DEFAULT_CURRENTS.size(); index++) {
      oceanCurrentMapper.insert(toEntity(DEFAULT_CURRENTS.get(index), index + 1));
    }
  }

  public List<OceanCurrentDto> list(String kind, String keyword) {
    return oceanCurrentMapper.findAll(cleanOrNull(kind), cleanOrNull(keyword)).stream()
      .map(this::toDto)
      .toList();
  }

  public OceanCurrentDto get(String id) {
    OceanCurrentEntity current = oceanCurrentMapper.findPublicById(cleanOrNull(id));
    if (current == null) {
      throw new AppException(HttpStatus.NOT_FOUND, "未找到洋流数据");
    }
    return toDto(current);
  }

  public List<OceanCurrentDto> listForAdmin(String kind, String keyword) {
    return oceanCurrentMapper.findAllForAdmin(cleanOrNull(kind), cleanOrNull(keyword)).stream()
      .map(this::toDto)
      .toList();
  }

  public OceanCurrentDto create(OceanCurrentRequest request) {
    String id = clean(request.id());
    if (!id.matches("[a-z0-9-]{3,120}")) {
      throw new AppException(HttpStatus.BAD_REQUEST, "洋流 ID 只能使用小写字母、数字和短横线");
    }
    if (oceanCurrentMapper.findById(id) != null) {
      throw new AppException(HttpStatus.CONFLICT, "洋流 ID 已存在");
    }
    OceanCurrentEntity current = toEntity(request, id);
    oceanCurrentMapper.insert(current);
    return toDto(oceanCurrentMapper.findById(id));
  }

  public OceanCurrentDto update(String id, OceanCurrentRequest request) {
    String currentId = requireExistingId(id);
    OceanCurrentEntity current = toEntity(request, currentId);
    oceanCurrentMapper.update(current);
    return toDto(oceanCurrentMapper.findById(currentId));
  }

  public OceanCurrentDto setEnabled(String id, boolean enabled) {
    String currentId = requireExistingId(id);
    oceanCurrentMapper.updateEnabled(currentId, enabled);
    return toDto(oceanCurrentMapper.findById(currentId));
  }

  public OceanCurrentDto setSortOrder(String id, int sortOrder) {
    String currentId = requireExistingId(id);
    oceanCurrentMapper.updateSortOrder(currentId, Math.max(0, sortOrder));
    return toDto(oceanCurrentMapper.findById(currentId));
  }

  public void delete(String id) {
    String currentId = requireExistingId(id);
    oceanCurrentMapper.delete(currentId);
  }

  private OceanCurrentDto toDto(OceanCurrentEntity current) {
    List<String> tags = readJson(current.getImpactTagsJson(), TAG_LIST, List.of());
    List<List<Double>> path = readJson(current.getPathJson(), PATH_LIST, List.of());
    OceanInfluenceDto influence = new OceanInfluenceDto(
      List.of(valueOrZero(current.getInfluenceLat()), valueOrZero(current.getInfluenceLng())),
      current.getInfluenceRadius(),
      current.getInfluenceRole()
    );
    return new OceanCurrentDto(
      current.getId(),
      current.getName(),
      current.getNameEn(),
      current.getKind(),
      current.getBasin(),
      current.getCurrentSystem(),
      current.getDirection(),
      current.getSource(),
      current.getEffect(),
      tags,
      current.getTextbookNote(),
      influence,
      path,
      current.getEnabled(),
      current.getSortOrder()
    );
  }

  private OceanCurrentEntity toEntity(SeedCurrent current, int sortOrder) {
    OceanCurrentEntity entity = new OceanCurrentEntity();
    entity.setId(current.id());
    entity.setName(current.name());
    entity.setNameEn(current.nameEn());
    entity.setKind(current.kind());
    entity.setBasin(current.basin());
    entity.setCurrentSystem(current.system());
    entity.setDirection(current.direction());
    entity.setSource(current.source());
    entity.setEffect(current.effect());
    entity.setImpactTagsJson(writeJson(current.impactTags()));
    entity.setTextbookNote(current.textbookNote());
    entity.setInfluenceLat(current.influence().lat());
    entity.setInfluenceLng(current.influence().lng());
    entity.setInfluenceRadius(current.influence().radius());
    entity.setInfluenceRole(current.influence().role());
    entity.setPathJson(writeJson(current.path()));
    entity.setEnabled(true);
    entity.setSortOrder(sortOrder);
    return entity;
  }

  private OceanCurrentEntity toEntity(OceanCurrentRequest request, String id) {
    OceanInfluenceDto influence = request.influence();
    List<List<Double>> path = request.path();
    if (influence == null || influence.center() == null || influence.center().size() != 2) {
      throw new AppException(HttpStatus.BAD_REQUEST, "影响区中心点必须包含纬度和经度");
    }
    if (influence.radius() == null || influence.radius() <= 0) {
      throw new AppException(HttpStatus.BAD_REQUEST, "影响区半径必须大于 0");
    }
    if (path == null || path.size() < 3) {
      throw new AppException(HttpStatus.BAD_REQUEST, "洋流路径至少需要 3 个坐标点");
    }
    validatePoint(influence.center());
    path.forEach(this::validatePoint);

    String kind = clean(request.kind());
    if (!VALID_KINDS.contains(kind)) {
      throw new AppException(HttpStatus.BAD_REQUEST, "洋流类型必须是 warm、cold 或 seasonal");
    }

    OceanCurrentEntity entity = new OceanCurrentEntity();
    entity.setId(id);
    entity.setName(requiredText(request.name(), "名称"));
    entity.setNameEn(requiredText(request.nameEn(), "英文名"));
    entity.setKind(kind);
    entity.setBasin(requiredText(request.basin(), "所属海域"));
    entity.setCurrentSystem(defaultText(request.system(), "未分类环流"));
    entity.setDirection(defaultText(request.direction(), ""));
    entity.setSource(defaultText(request.source(), ""));
    entity.setEffect(requiredText(request.effect(), "影响说明"));
    entity.setImpactTagsJson(writeJson(request.impactTags() == null ? List.of() : request.impactTags()));
    entity.setTextbookNote(defaultText(request.textbookNote(), ""));
    entity.setInfluenceLat(influence.center().get(0));
    entity.setInfluenceLng(influence.center().get(1));
    entity.setInfluenceRadius(influence.radius());
    entity.setInfluenceRole(defaultText(influence.role(), "ocean-current"));
    entity.setPathJson(writeJson(path));
    entity.setEnabled(request.enabled() == null || request.enabled());
    entity.setSortOrder(request.sortOrder() == null ? 100 : Math.max(0, request.sortOrder()));
    return entity;
  }

  private String requireExistingId(String id) {
    String currentId = clean(id);
    if (oceanCurrentMapper.findById(currentId) == null) {
      throw new AppException(HttpStatus.NOT_FOUND, "未找到洋流数据");
    }
    return currentId;
  }

  private void validatePoint(List<Double> point) {
    if (point == null || point.size() != 2) {
      throw new AppException(HttpStatus.BAD_REQUEST, "坐标点必须包含纬度和经度");
    }
    double lat = valueOrZero(point.get(0));
    double lng = valueOrZero(point.get(1));
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new AppException(HttpStatus.BAD_REQUEST, "坐标点超出地球经纬度范围");
    }
  }

  private <T> T readJson(String json, TypeReference<T> type, T fallback) {
    if (json == null || json.isBlank()) return fallback;
    try {
      return objectMapper.readValue(json, type);
    } catch (JsonProcessingException exception) {
      return fallback;
    }
  }

  private String writeJson(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JsonProcessingException exception) {
      throw new IllegalStateException("Ocean current seed data could not be serialized", exception);
    }
  }

  private static String cleanOrNull(String value) {
    if (value == null) return null;
    String text = value.trim();
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
    if (text.isEmpty()) {
      throw new AppException(HttpStatus.BAD_REQUEST, label + "不能为空");
    }
    return text;
  }

  private static double valueOrZero(Double value) {
    return value == null ? 0 : value;
  }

  private static List<Double> point(double lat, double lng) {
    return List.of(lat, lng);
  }

  private record InfluenceSeed(double lat, double lng, double radius, String role) {
  }

  private record SeedCurrent(
      String id,
      String name,
      String nameEn,
      String kind,
      String basin,
      String system,
      String direction,
      String source,
      String effect,
      List<String> impactTags,
      String textbookNote,
      InfluenceSeed influence,
      List<List<Double>> path
  ) {
  }

  private static final List<SeedCurrent> DEFAULT_CURRENTS = List.of(
    new SeedCurrent(
      "gulf-stream",
      "湾流",
      "Gulf Stream",
      "warm",
      "北大西洋",
      "副热带环流西边界暖流",
      "从墨西哥湾沿北美东岸向东北流",
      "加勒比海与墨西哥湾暖水",
      "把低纬暖水送向北大西洋，增温增湿北美东岸和西欧方向的海气环境。",
      List.of("增温增湿", "西欧温和", "航线影响"),
      "高中地理常用它说明暖流对沿岸气候的增温增湿作用。",
      new InfluenceSeed(38, -58, 0.22, "warm-moist"),
      List.of(point(24, -82), point(30, -76), point(36, -68), point(42, -55), point(48, -38))
    ),
    new SeedCurrent(
      "north-atlantic-drift",
      "北大西洋暖流",
      "North Atlantic Drift",
      "warm",
      "北大西洋",
      "湾流延续支流",
      "从北大西洋中部流向欧洲西岸",
      "湾流向东北延伸的暖水",
      "把热量带到欧洲西岸，使同纬度的西欧比大陆东岸更温和湿润。",
      List.of("西欧温和", "海洋性气候", "增湿"),
      "常用于解释英国、挪威沿岸冬季相对温和的原因。",
      new InfluenceSeed(55, -12, 0.2, "warm-moist"),
      List.of(point(48, -38), point(52, -28), point(56, -18), point(61, -8), point(66, 6))
    ),
    new SeedCurrent(
      "canary-current",
      "加那利寒流",
      "Canary Current",
      "cold",
      "北大西洋",
      "副热带环流东边界寒流",
      "沿西北非洲海岸向南流",
      "北大西洋东部较冷海水",
      "冷却西北非沿岸空气，抑制对流降水，增强沿岸干燥和海雾。",
      List.of("降温减湿", "沿岸干燥", "海雾"),
      "常与撒哈拉西岸干燥环境联系起来理解。",
      new InfluenceSeed(24, -18, 0.16, "cold-dry"),
      List.of(point(40, -16), point(32, -18), point(24, -18), point(16, -20), point(10, -22))
    ),
    new SeedCurrent(
      "labrador-current",
      "拉布拉多寒流",
      "Labrador Current",
      "cold",
      "北大西洋",
      "高纬寒流",
      "从北冰洋边缘沿加拿大东岸南下",
      "格陵兰和拉布拉多海冷水",
      "与湾流交汇，容易形成海雾，也把冷水和冰山带向纽芬兰附近海域。",
      List.of("海雾", "寒暖流交汇", "渔场"),
      "寒暖流交汇形成纽芬兰渔场的典型案例。",
      new InfluenceSeed(47, -50, 0.14, "mixing-fog"),
      List.of(point(62, -58), point(56, -54), point(50, -52), point(44, -50), point(39, -55))
    ),
    new SeedCurrent(
      "brazil-current",
      "巴西暖流",
      "Brazil Current",
      "warm",
      "南大西洋",
      "副热带环流西边界暖流",
      "沿巴西东岸向南流",
      "南赤道暖流抵达南美后的南向分支",
      "增温增湿巴西东部沿海，给沿岸暖湿空气和降水条件提供海洋背景。",
      List.of("增温增湿", "巴西东岸", "暖湿气流"),
      "可与南美西岸受寒流影响干旱形成对比。",
      new InfluenceSeed(-23, -38, 0.18, "warm-moist"),
      List.of(point(-5, -35), point(-14, -36), point(-24, -40), point(-34, -48), point(-42, -54))
    ),
    new SeedCurrent(
      "benguela-current",
      "本格拉寒流",
      "Benguela Current",
      "cold",
      "南大西洋",
      "副热带环流东边界寒流",
      "沿非洲西南岸向北流",
      "南大西洋高纬冷水和沿岸上升流",
      "冷却并稳定近岸空气，减少降水，同时上升流带来营养盐，塑造纳米布沿岸荒漠与渔场。",
      List.of("降温减湿", "纳米布沙漠", "上升流渔场"),
      "寒流与沿岸荒漠、渔场并存的典型例子。",
      new InfluenceSeed(-24, 12, 0.18, "cold-dry"),
      List.of(point(-38, 16), point(-30, 14), point(-22, 12), point(-14, 10), point(-6, 8))
    ),
    new SeedCurrent(
      "kuroshio",
      "黑潮",
      "Kuroshio Current",
      "warm",
      "北太平洋",
      "副热带环流西边界暖流",
      "沿菲律宾、台湾、日本东侧向东北流",
      "北赤道暖流西传后的暖水",
      "给东亚岛弧东侧带来暖湿海气背景，并影响日本附近渔场和风暴路径。",
      List.of("增温增湿", "东亚海域", "台风能量"),
      "常与亲潮交汇解释日本北海道附近渔场。",
      new InfluenceSeed(32, 136, 0.18, "warm-moist"),
      List.of(point(17, 122), point(24, 126), point(31, 134), point(37, 145), point(42, 154))
    ),
    new SeedCurrent(
      "oyashio",
      "亲潮寒流",
      "Oyashio Current",
      "cold",
      "北太平洋",
      "高纬寒流",
      "从白令海和千岛群岛附近向西南流",
      "北太平洋高纬冷水",
      "南下冷水与黑潮暖水交汇，形成营养盐丰富、海雾频繁的日本北部渔场。",
      List.of("寒暖流交汇", "渔场", "海雾"),
      "与黑潮交汇形成北海道附近重要渔场。",
      new InfluenceSeed(42, 148, 0.16, "mixing-fog"),
      List.of(point(55, 160), point(50, 154), point(45, 150), point(40, 146), point(36, 144))
    ),
    new SeedCurrent(
      "california-current",
      "加利福尼亚寒流",
      "California Current",
      "cold",
      "北太平洋",
      "副热带环流东边界寒流",
      "沿北美西岸向南流",
      "北太平洋东部较冷海水",
      "冷却美国西岸近海，增强沿岸干燥、海雾和上升流生态。",
      List.of("降温减湿", "海雾", "上升流"),
      "帮助理解北美西岸部分地区夏季凉爽多雾。",
      new InfluenceSeed(35, -124, 0.16, "cold-dry"),
      List.of(point(50, -130), point(43, -126), point(36, -123), point(29, -119), point(23, -114))
    ),
    new SeedCurrent(
      "humboldt",
      "秘鲁寒流（洪堡寒流）",
      "Peru / Humboldt Current",
      "cold",
      "南太平洋",
      "副热带环流东边界寒流",
      "沿南美西岸向北流",
      "南太平洋冷水和沿岸上升流",
      "冷却秘鲁、智利沿岸，抑制降水并带来营养盐，是阿塔卡马干旱和秘鲁渔场的重要背景。",
      List.of("降温减湿", "阿塔卡马干旱", "秘鲁渔场"),
      "高中地理中寒流导致沿岸荒漠和渔场的经典案例。",
      new InfluenceSeed(-18, -77, 0.2, "cold-dry"),
      List.of(point(-45, -78), point(-34, -75), point(-24, -75), point(-14, -78), point(-5, -82))
    ),
    new SeedCurrent(
      "east-australian-current",
      "东澳大利亚暖流",
      "East Australian Current",
      "warm",
      "南太平洋",
      "副热带环流西边界暖流",
      "沿澳大利亚东岸向南流",
      "南赤道暖流西传后的暖水",
      "增温增湿澳大利亚东岸，影响大堡礁附近暖水生态和沿岸降水。",
      List.of("增温增湿", "大堡礁", "东澳降水"),
      "可与西澳大利亚寒流对比理解澳洲东西岸差异。",
      new InfluenceSeed(-27, 154, 0.17, "warm-moist"),
      List.of(point(-15, 150), point(-23, 153), point(-31, 155), point(-38, 156), point(-44, 158))
    ),
    new SeedCurrent(
      "west-australian-current",
      "西澳大利亚寒流",
      "West Australian Current",
      "cold",
      "印度洋东部",
      "副热带环流东边界寒流",
      "沿澳大利亚西岸向北流",
      "南印度洋较冷海水",
      "冷却澳大利亚西岸，减弱蒸发和降水，是西澳沿岸干燥背景之一。",
      List.of("降温减湿", "西澳干燥", "寒流"),
      "常用于解释澳大利亚西岸荒漠和干燥气候。",
      new InfluenceSeed(-26, 112, 0.16, "cold-dry"),
      List.of(point(-40, 112), point(-32, 111), point(-24, 112), point(-16, 114), point(-10, 116))
    ),
    new SeedCurrent(
      "agulhas-current",
      "厄加勒斯暖流",
      "Agulhas Current",
      "warm",
      "西印度洋",
      "副热带环流西边界暖流",
      "沿非洲东南岸向西南流",
      "印度洋西部暖水",
      "给非洲东南岸带来暖湿海气条件，并在好望角附近影响印度洋与大西洋水交换。",
      List.of("增温增湿", "南非东岸", "洋盆交换"),
      "印度洋西边界强暖流，可与本格拉寒流形成非洲南部东西岸对比。",
      new InfluenceSeed(-32, 31, 0.17, "warm-moist"),
      List.of(point(-18, 44), point(-25, 39), point(-31, 33), point(-36, 24), point(-39, 18))
    ),
    new SeedCurrent(
      "somali-current",
      "索马里季风洋流",
      "Somali Current",
      "seasonal",
      "北印度洋",
      "季风环流",
      "随南亚季风发生季节性转向",
      "印度洋季风风场驱动",
      "夏季强烈上升流带来冷水和营养盐，影响阿拉伯海渔业、降水和航行条件。",
      List.of("季风反转", "上升流", "渔场"),
      "北印度洋洋流季节反转的代表。",
      new InfluenceSeed(5, 52, 0.17, "seasonal-upwelling"),
      List.of(point(-8, 45), point(-1, 49), point(6, 52), point(12, 55), point(18, 58))
    ),
    new SeedCurrent(
      "north-equatorial-current",
      "北赤道暖流",
      "North Equatorial Current",
      "warm",
      "热带大洋",
      "信风驱动赤道流",
      "在北半球低纬海域大体向西流",
      "东北信风驱动的表层暖水",
      "把热带暖水推向各大洋西侧，为黑潮、湾流等西边界暖流提供水源。",
      List.of("热量西传", "暖流源区", "信风驱动"),
      "理解大洋环流和西边界暖流的起点之一。",
      new InfluenceSeed(14, -145, 0.18, "warm-transfer"),
      List.of(point(14, -25), point(14, -55), point(13, -90), point(12, -140), point(13, 165))
    ),
    new SeedCurrent(
      "south-equatorial-current",
      "南赤道暖流",
      "South Equatorial Current",
      "warm",
      "热带大洋",
      "信风驱动赤道流",
      "在南半球低纬海域大体向西流",
      "东南信风驱动的表层暖水",
      "把热带暖水输送到南美、澳洲和非洲附近，是巴西暖流、东澳暖流等的源区。",
      List.of("热量西传", "暖流源区", "热带环流"),
      "常与巴西暖流、东澳大利亚暖流的形成联系起来。",
      new InfluenceSeed(-12, -120, 0.18, "warm-transfer"),
      List.of(point(-10, -15), point(-10, -45), point(-12, -90), point(-13, -150), point(-12, 160))
    ),
    new SeedCurrent(
      "equatorial-countercurrent",
      "赤道逆流",
      "Equatorial Countercurrent",
      "warm",
      "赤道大洋",
      "赤道补偿流",
      "在赤道附近向东流",
      "赤道两侧西传暖水堆积后的回流",
      "平衡赤道暖水分布，影响热带海温、降水带和厄尔尼诺背景场。",
      List.of("向东回流", "热带降水", "海温调节"),
      "帮助理解赤道表层水不是单向西流，而存在补偿回流。",
      new InfluenceSeed(4, -155, 0.14, "warm-transfer"),
      List.of(point(4, 145), point(4, 175), point(4, -155), point(4, -120), point(4, -90))
    ),
    new SeedCurrent(
      "antarctic-circumpolar",
      "南极绕极流",
      "Antarctic Circumpolar Current",
      "cold",
      "南大洋",
      "全球环流连接带",
      "环绕南极洲自西向东流",
      "西风带长期驱动的南大洋表层水",
      "连接大西洋、印度洋和太平洋，隔离南极冷水并参与全球热量和碳循环。",
      List.of("全球环流", "南极隔离", "碳循环"),
      "把三大洋连成一个环流系统，是全球海洋输送带的重要环节。",
      new InfluenceSeed(-57, 25, 0.34, "global-cold-ring"),
      List.of(point(-56, -160), point(-58, -100), point(-57, -30), point(-56, 45), point(-58, 120), point(-57, 170))
    )
  );
}
