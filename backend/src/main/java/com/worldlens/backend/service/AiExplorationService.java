package com.worldlens.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldlens.backend.common.AppException;
import com.worldlens.backend.dto.AiExploreRequest;
import com.worldlens.backend.dto.AiExploreResponse;
import com.worldlens.backend.dto.AiExploreSectionDto;
import com.worldlens.backend.dto.AiIntentRequest;
import com.worldlens.backend.dto.AiIntentResponse;
import com.worldlens.backend.dto.AiRouteRequest;
import com.worldlens.backend.dto.AiRouteResponse;
import com.worldlens.backend.dto.AiRouteStopDto;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class AiExplorationService {
  private static final Set<String> INTENTS = Set.of(
    "parallel_life",
    "ai_guide",
    "world_blindbox",
    "world_advisor",
    "civilization",
    "world_story",
    "country_intro"
  );

  private static final Set<String> EUROPE_CODES = Set.of(
    "FRA", "ITA", "CHE", "GRC", "ISL", "NOR", "FIN", "DEU", "GBR", "ESP", "PRT",
    "NLD", "BEL", "AUT", "CZE", "POL", "SWE", "DNK", "IRL", "TUR"
  );

  private static final String INTENT_PROMPT = """
    You are the intent router for WorldLens, a 3D digital globe exploration platform.
    Return JSON only. No Markdown, no HTML.
    Supported intents: parallel_life, ai_guide, world_advisor, world_blindbox, civilization, world_story, country_intro.
    Return: {"intent":"","target":"","targetType":""}.
    targetType should be country, place, region, civilization, route, or unknown.
    The target must be a concise country/place/civilization name in Chinese when possible.
    """;

  private static final String EXPLORE_PROMPT = """
    你是 WorldLens AI 探索中心。回答会直接驱动 3D 地球和结构化页面。
    只返回 JSON，不要 Markdown，不要 HTML。
    必须严格围绕用户提示中给出的 target、country 和 countryCode，不得自行更换国家或地点。
    required format:
    {
      "title":"",
      "subtitle":"",
      "country":"",
      "summary":"",
      "sections":[{"heading":"","body":""}]
    }
    sections 必须完整覆盖 moduleSections 中列出的主题，每一项都要有具体信息，不能只说“可以继续探索”。
    内容使用清晰自然的中文，优先解释地理、文化、历史和现实生活之间的关系。
    不要虚构精确统计数字、具体个人经历或不存在的事实。
    不确定时使用“可能”“通常”“常见情况”等谨慎表达。
    """;

  private static final String ROUTE_PROMPT = """
    你是 WorldLens AI 航线规划器。根据用户自然语言要求临时生成一条 3 到 6 站的真实世界路线。
    不要套用固定模板。必须遵守用户指定的区域和主题：欧洲路线只能出现欧洲站点，小国路线要选择小国，岛屿路线要选择岛屿。
    只返回 JSON，不要 Markdown，不要 HTML。
    Required format:
    {
      "title":"",
      "theme":"",
      "summary":"",
      "stops":[
        {
          "name":"",
          "country":"",
          "countryCode":"",
          "coordinates":[0,0],
          "intro":"",
          "culture":"",
          "highlights":["","",""]
        }
      ]
    }
    规则：
    - 只能使用真实国家、城市、岛屿、文化区域或地标。
    - coordinates 必须是 [纬度, 经度]。
    - countryCode 使用 ISO 3166-1 alpha-3。
    - 每个 intro 和 culture 必须与该站点直接相关，不能使用通用套话。
    - 站点顺序要适合在 3D 地球上连续播放。
    """;

  private static final Map<String, List<String>> SECTION_TITLES = Map.of(
    "parallel_life", List.of("成长环境", "教育体验", "生活方式", "工作环境", "社会文化", "与你当前生活最大的不同"),
    "ai_guide", List.of("推荐地点", "为什么值得探索", "最特别的地方", "适合什么人", "探索建议"),
    "world_blindbox", List.of("你抵达了哪里", "为什么会来到这里", "这里最特别的地方", "你可能不知道的事实"),
    "world_advisor", List.of("推荐国家", "推荐原因", "优势", "潜在问题", "适合人群"),
    "civilization", List.of("文明起源", "代表成就", "影响范围", "历史影响", "今天还能看到什么"),
    "world_story", List.of("故事开场", "地点与人物", "转折", "余味"),
    "country_intro", List.of("地理位置", "文化印象", "值得探索", "继续观察")
  );

  private final DeepSeekClient deepSeekClient;
  private final ObjectMapper objectMapper;
  private final List<TargetLocation> targets;

  public AiExplorationService(DeepSeekClient deepSeekClient, ObjectMapper objectMapper) {
    this.deepSeekClient = deepSeekClient;
    this.objectMapper = objectMapper;
    this.targets = buildTargets();
  }

  public AiIntentResponse detectIntent(AiIntentRequest request) {
    String message = clean(request == null ? null : request.message());
    if (message.isBlank()) throw new AppException(HttpStatus.BAD_REQUEST, "message is required");

    JsonNode root = readDeepSeekJsonOrEmpty(INTENT_PROMPT, message);
    String intent = normalizeIntent(text(root, "intent"), message);
    String target = defaultTarget(text(root, "target"), intent, message);
    String targetType = normalizeTargetType(defaultText(text(root, "targetType"), targetTypeForIntent(intent)), intent);
    TargetLocation location = resolveTarget(target, intent, message);

    return new AiIntentResponse(
      intent,
      location.name(),
      targetType,
      location.country(),
      location.countryCode(),
      coordinates(location),
      root.isMissingNode() ? "local-fallback" : "deepseek"
    );
  }

  public AiExploreResponse explore(AiExploreRequest request) {
    String intent = normalizeIntent(request == null ? "" : request.intent(), request == null ? "" : request.message());
    String rawTarget = clean(request == null ? null : request.target());
    String message = clean(request == null ? null : request.message());
    String target = defaultTarget(rawTarget, intent, message);
    TargetLocation location = resolveTarget(target, intent, message);

    String userPrompt = """
      intent: %s
      target: %s
      country: %s
      countryCode: %s
      moduleSections: %s
      userMessage: %s
      """.formatted(intent, location.name(), location.country(), location.countryCode(), SECTION_TITLES.getOrDefault(intent, SECTION_TITLES.get("country_intro")), message);

    JsonNode root = readDeepSeekJson(EXPLORE_PROMPT, userPrompt);
    List<AiExploreSectionDto> sections = sections(root.path("sections"), intent, location);
    if (sections.isEmpty()) {
      throw new AppException(HttpStatus.BAD_GATEWAY, "DeepSeek 没有生成有效的探索内容，请重试");
    }

    return new AiExploreResponse(
      defaultText(text(root, "title"), titleFor(intent, location)),
      defaultText(text(root, "subtitle"), subtitleFor(intent, location)),
      location.country(),
      location.countryCode(),
      coordinates(location),
      defaultText(text(root, "summary"), subtitleFor(intent, location)),
      sections,
      "deepseek"
    );
  }

  public AiRouteResponse generateRoute(AiRouteRequest request) {
    String message = clean(request == null ? null : request.message());
    if (message.isBlank()) throw new AppException(HttpStatus.BAD_REQUEST, "message is required");

    JsonNode root = readDeepSeekJson(ROUTE_PROMPT, message);
    List<AiRouteStopDto> stops = routeStops(root.path("stops"));
    boolean deepSeekRoute = !root.isMissingNode() && stops.size() >= 2 && routeMatchesRequest(message, stops);
    if (!deepSeekRoute) {
      throw new AppException(HttpStatus.BAD_GATEWAY, "DeepSeek 没有生成符合要求的路线，请重试");
    }

    String title = text(root, "title");
    String theme = text(root, "theme");
    if (title.isBlank() || theme.isBlank()) {
      throw new AppException(HttpStatus.BAD_GATEWAY, "DeepSeek 返回的路线信息不完整，请重试");
    }
    String summary = defaultText(text(root, "summary"), "WorldLens 已根据你的指令生成一条可自动巡航的探索航线。");
    String routeId = "ai-route-" + Integer.toHexString(Math.abs((message + title + theme).hashCode()));

    return new AiRouteResponse(routeId, title, theme, summary, stops, "deepseek");
  }

  private JsonNode readDeepSeekJsonOrEmpty(String systemPrompt, String userPrompt) {
    try {
      return readDeepSeekJson(systemPrompt, userPrompt);
    } catch (AppException exception) {
      return objectMapper.missingNode();
    }
  }

  private JsonNode readDeepSeekJson(String systemPrompt, String userPrompt) {
    String json = deepSeekClient.completeJson(systemPrompt, userPrompt);
    try {
      JsonNode root = objectMapper.readTree(json);
      if (!root.isObject()) throw new AppException(HttpStatus.BAD_GATEWAY, "DeepSeek response must be a JSON object");
      return root;
    } catch (JsonProcessingException exception) {
      throw new AppException(HttpStatus.BAD_GATEWAY, "DeepSeek response is not valid JSON");
    }
  }

  private List<AiExploreSectionDto> sections(JsonNode node, String intent, TargetLocation location) {
    List<AiExploreSectionDto> result = new ArrayList<>();
    if (node.isArray()) {
      for (JsonNode item : node) {
        String heading = defaultText(text(item, "heading"), text(item, "title"));
        String body = defaultText(text(item, "body"), text(item, "content"));
        if (!heading.isBlank() && !body.isBlank()) result.add(new AiExploreSectionDto(heading, body));
      }
    }
    return result;
  }

  private List<AiRouteStopDto> routeStops(JsonNode node) {
    List<AiRouteStopDto> result = new ArrayList<>();
    if (!node.isArray()) return result;
    int index = 0;
    for (JsonNode item : node) {
      List<Double> coordinates = coordinates(item.path("coordinates"));
      String name = defaultText(text(item, "name"), text(item, "title"));
      String country = text(item, "country");
      String countryCode = text(item, "countryCode").toUpperCase(Locale.ROOT);
      TargetLocation matched = findIdentityTarget((name + " " + country + " " + countryCode).toLowerCase(Locale.ROOT));
      if (coordinates.isEmpty() && matched != null) coordinates = coordinates(matched);
      if (country.isBlank() && matched != null) country = matched.country();
      if (countryCode.isBlank() && matched != null) countryCode = matched.countryCode();
      if (name.isBlank() || coordinates.isEmpty()) continue;
      result.add(new AiRouteStopDto(
        stableStopId(name, countryCode, index),
        name,
        defaultText(country, name),
        countryCode,
        coordinates,
        defaultText(text(item, "intro"), "%s 是这条航线中的一个关键停靠点。".formatted(name)),
        defaultText(text(item, "culture"), "这里适合从街区、饮食、日常节奏和地理位置观察当地生活。"),
        stringList(item.path("highlights")).stream().limit(4).toList(),
        8
      ));
      index += 1;
      if (result.size() >= 6) break;
    }
    return result;
  }

  private List<AiRouteStopDto> fallbackRouteStops(String message) {
    String text = clean(message).toLowerCase(Locale.ROOT);
    if (containsAny(text, "丝绸之路", "silk")) {
      return List.of(
        stop("xian", "西安", "中国", "CHN", 34.3416, 108.9398, "从古都西安出发，路线从东亚文明腹地展开。", "城墙、博物馆和市井饮食让历史不只是遗址。", "兵马俑", "古城墙", "回民街"),
        stop("dunhuang", "敦煌", "中国", "CHN", 40.1421, 94.6619, "敦煌是沙漠、商旅和艺术交汇的节点。", "石窟壁画和戈壁风景让路线进入更开阔的文明边界。", "莫高窟", "鸣沙山", "月牙泉"),
        stop("samarkand", "撒马尔罕", "乌兹别克斯坦", "UZB", 39.6542, 66.9597, "撒马尔罕连接中亚绿洲城市与远行商路。", "蓝色穹顶、集市和广场保存着丝路城市的交流气质。", "雷吉斯坦广场", "集市", "清真寺"),
        stop("istanbul", "伊斯坦布尔", "土耳其", "TUR", 41.0082, 28.9784, "伊斯坦布尔让欧亚大陆在海峡两岸相遇。", "街头渡轮、清真寺和市集让东西方影响同时出现。", "圣索菲亚", "博斯普鲁斯海峡", "大巴扎")
      );
    }
    if (containsAny(text, "极光", "aurora")) {
      return List.of(
        stop("reykjavik", "雷克雅未克", "冰岛", "ISL", 64.1466, -21.9426, "冰岛首都适合作为北大西洋极光路线的起点。", "温泉、火山地貌和低密度城市生活共同塑造这里的气质。", "蓝湖", "哈尔格林姆教堂", "海岸线"),
        stop("tromso", "特罗姆瑟", "挪威", "NOR", 69.6492, 18.9553, "特罗姆瑟位于北极圈内，是观察极光的经典城市。", "港口、雪地活动和北方社区让旅行带有强烈季节感。", "峡湾", "缆车", "极光营地"),
        stop("rovaniemi", "罗瓦涅米", "芬兰", "FIN", 66.5039, 25.7294, "罗瓦涅米把极地森林和拉普兰生活连接起来。", "木屋、雪原和驯鹿文化让这里更像冬季入口。", "北极圈线", "森林小屋", "冬季市集")
      );
    }
    if (containsAny(text, "小国", "冷门", "小众", "没听过")) {
      return List.of(
        stop("tbilisi", "第比利斯", "格鲁吉亚", "GEO", 41.7151, 44.8271, "第比利斯适合作为高加索冷门路线的起点。", "温泉、山城街巷和多元建筑让城市层次很丰富。", "老城", "温泉区", "纳里卡拉要塞"),
        stop("thimphu", "廷布", "不丹", "BTN", 27.4728, 89.6390, "廷布让路线进入喜马拉雅山地国家的日常。", "宗堡、山谷和慢节奏公共生活构成这里的独特气质。", "塔金保护区", "宗堡", "山谷"),
        stop("funafuti", "富纳富提", "图瓦卢", "TUV", -8.5211, 179.1962, "富纳富提让路线抵达太平洋上的微型岛国。", "环礁、海风和社区尺度让这里与大陆旅行完全不同。", "环礁潟湖", "海岸村落", "太平洋日落")
      );
    }
    return List.of(
      stop("paris", "巴黎", "法国", "FRA", 48.8566, 2.3522, "巴黎适合作为欧洲旅行路线的第一站。", "咖啡馆、博物馆和街区漫步构成这里的日常气质。", "卢浮宫", "塞纳河", "蒙马特"),
      stop("lucerne", "卢塞恩", "瑞士", "CHE", 47.0502, 8.3093, "卢塞恩把湖泊、山地和中欧小城节奏连在一起。", "木桥、湖岸和雪山视野让这里更适合慢下来观察。", "卡佩尔廊桥", "卢塞恩湖", "瑞吉山"),
      stop("rome", "罗马", "意大利", "ITA", 41.9028, 12.4964, "罗马让古典遗迹与现代城市生活交叠在一起。", "广场、喷泉、遗址和餐桌文化共同组成城市记忆。", "斗兽场", "万神殿", "特莱维喷泉"),
      stop("athens", "雅典", "希腊", "GRC", 37.9838, 23.7275, "雅典把地中海生活与古典文明放在同一座城市里。", "山丘、港口和街区咖啡让历史变得更接近日常。", "卫城", "普拉卡", "比雷埃夫斯港")
    );
  }

  private boolean routeMatchesRequest(String message, List<AiRouteStopDto> stops) {
    String text = clean(message).toLowerCase(Locale.ROOT);
    if (containsAny(text, "欧洲", "europe")) {
      long europeanStops = stops.stream()
        .filter(stop -> EUROPE_CODES.contains(clean(stop.countryCode()).toUpperCase(Locale.ROOT)))
        .count();
      return europeanStops == stops.size();
    }
    return true;
  }

  private AiRouteStopDto stop(String id, String name, String country, String countryCode, double lat, double lng, String intro, String culture, String... highlights) {
    return new AiRouteStopDto(id, name, country, countryCode, List.of(lat, lng), intro, culture, List.of(highlights), 8);
  }

  private List<Double> coordinates(JsonNode node) {
    if (!node.isArray() || node.size() < 2) return List.of();
    double lat = node.path(0).asDouble(Double.NaN);
    double lng = node.path(1).asDouble(Double.NaN);
    if (!Double.isFinite(lat) || !Double.isFinite(lng)) return List.of();
    return List.of(round4(lat), round4(lng));
  }

  private List<String> stringList(JsonNode node) {
    List<String> result = new ArrayList<>();
    if (!node.isArray()) return result;
    for (JsonNode item : node) {
      String value = item.asText("").trim();
      if (!value.isBlank()) result.add(value);
    }
    return result;
  }

  private String stableStopId(String name, String countryCode, int index) {
    String base = (defaultText(countryCode, "stop") + "-" + name).toLowerCase(Locale.ROOT);
    return "ai-stop-" + index + "-" + Integer.toHexString(Math.abs(base.hashCode()));
  }

  private String fallbackRouteTitle(String message) {
    if (message.contains("丝绸之路")) return "丝绸之路探索航线";
    if (message.contains("极光")) return "北境极光探索航线";
    if (message.contains("小国") || message.contains("冷门")) return "冷门小国发现航线";
    return "AI 动态探索航线";
  }

  private String fallbackRouteTheme(String message) {
    if (message.contains("摄影")) return "风景、城市光线与适合停留的取景点";
    if (message.contains("文明") || message.contains("历史")) return "历史文明、城市遗产与文化现场";
    if (message.contains("旅行")) return "旅行体验、风土人情与代表景点";
    return "根据你的指令临时生成的世界探索路线";
  }

  private String fallbackBody(String heading, String intent, TargetLocation location) {
    if ("world_story".equals(intent)) {
      return "故事会从%s的真实地理气质出发，用短篇叙事带你进入当地的光线、声音和日常。".formatted(location.name());
    }
    return "围绕%s观察%s时，可以把%s作为切入点继续探索。".formatted(location.name(), location.country(), heading);
  }

  private TargetLocation resolveTarget(String target, String intent, String message) {
    String messageText = clean(message).toLowerCase(Locale.ROOT);
    String targetText = clean(target).toLowerCase(Locale.ROOT);

    TargetLocation explicitMessageTarget = findIdentityTarget(messageText);
    if (explicitMessageTarget != null) return explicitMessageTarget;

    TargetLocation explicitModelTarget = findIdentityTarget(targetText);
    if (explicitModelTarget != null) return explicitModelTarget;

    TargetLocation recommendedTarget = recommendationTarget(intent, messageText + " " + targetText);
    if (recommendedTarget != null) return recommendedTarget;

    if ("world_blindbox".equals(intent) && target.isBlank()) return randomBlindBoxTarget();
    String text = (target + " " + message).toLowerCase(Locale.ROOT);
    return targets.stream()
      .map(item -> Map.entry(item, item.score(text)))
      .filter(entry -> entry.getValue() > 0)
      .max(Comparator.comparingInt(Map.Entry::getValue))
      .map(Map.Entry::getKey)
      .orElseGet(() -> defaultLocation(intent, text));
  }

  private TargetLocation findIdentityTarget(String text) {
    if (text.isBlank()) return null;
    return targets.stream()
      .filter(item ->
        text.contains(item.countryCode().toLowerCase(Locale.ROOT)) ||
          text.contains(item.name().toLowerCase(Locale.ROOT)) ||
          text.contains(item.country().toLowerCase(Locale.ROOT))
      )
      .findFirst()
      .orElse(null);
  }

  private TargetLocation recommendationTarget(String intent, String text) {
    if (!Set.of("ai_guide", "world_advisor", "world_blindbox", "country_intro").contains(intent)) return null;
    if (containsAny(text, "小国", "小国家", "袖珍", "微型国家", "很小的国家")) {
      return randomFromCodes("TUV", "BTN", "GEO", "OMN", "MNG");
    }
    if (containsAny(text, "神秘", "秘境", "隐秘", "未知", "奇怪")) {
      return randomFromCodes("BTN", "OMN", "GEO", "MNG", "PER", "MAR", "MDG");
    }
    if (containsAny(text, "冷门", "小众", "99%", "没听过", "很少人", "偏门")) {
      return randomFromCodes("TUV", "GEO", "OMN", "MDG", "BTN", "MNG", "MAR");
    }
    if (containsAny(text, "极光", "aurora")) {
      return randomFromCodes("ISL", "NOR", "FIN", "CAN");
    }
    if (containsAny(text, "程序员", "远程办公", "开发者")) {
      return randomFromCodes("FIN", "SGP", "CAN", "DEU", "NZL");
    }
    if (containsAny(text, "养老", "退休")) {
      return randomFromCodes("NZL", "FIN", "CAN", "JPN");
    }
    if (containsAny(text, "摄影", "拍照", "风景")) {
      return randomFromCodes("NZL", "CAN", "MAR", "PER", "MDG");
    }
    if (containsAny(text, "创业", "公司")) {
      return randomFromCodes("SGP", "USA", "DEU");
    }
    if (containsAny(text, "留学", "读书")) {
      return randomFromCodes("CAN", "USA", "GBR", "DEU");
    }
    if ("ai_guide".equals(intent) || "world_advisor".equals(intent)) return randomBlindBoxTarget();
    return null;
  }

  private TargetLocation randomFromCodes(String... countryCodes) {
    return find(countryCodes[ThreadLocalRandom.current().nextInt(countryCodes.length)]);
  }

  private static boolean containsAny(String text, String... keywords) {
    for (String keyword : keywords) {
      if (text.contains(keyword.toLowerCase(Locale.ROOT))) return true;
    }
    return false;
  }

  private TargetLocation randomBlindBoxTarget() {
    List<TargetLocation> blindboxTargets = targets.stream()
      .filter(TargetLocation::blindbox)
      .toList();
    return blindboxTargets.get(ThreadLocalRandom.current().nextInt(blindboxTargets.size()));
  }

  private TargetLocation defaultLocation(String intent, String text) {
    if (text.contains("极光") || text.contains("aurora")) return find("ISL");
    if (text.contains("程序员") || text.contains("远程办公")) return find("FIN");
    if (text.contains("养老")) return find("NZL");
    if (text.contains("创业")) return find("SGP");
    if (text.contains("留学")) return find("CAN");
    if (text.contains("古罗马") || text.contains("文艺复兴")) return find("ITA");
    if (text.contains("古埃及")) return find("EGY");
    if (text.contains("玛雅")) return find("MEX");
    if (text.contains("丝绸之路")) return find("CHN");
    if ("world_blindbox".equals(intent)) return randomBlindBoxTarget();
    return find("ISL");
  }

  private TargetLocation find(String countryCode) {
    return targets.stream()
      .filter(item -> item.countryCode().equals(countryCode))
      .findFirst()
      .orElse(targets.get(0));
  }

  private String normalizeIntent(String value, String message) {
    String text = clean(message);
    String inferred = inferIntent(text);
    if (!"country_intro".equals(inferred)) return inferred;

    String intent = clean(value);
    if (INTENTS.contains(intent)) return intent;
    return "country_intro";
  }

  private String inferIntent(String text) {
    if (text.contains("出生")) return "parallel_life";
    if (text.contains("今天去哪") || text.contains("随机") || text.contains("盲盒")) return "world_blindbox";
    if (text.contains("适合") || text.contains("哪个国家")) return "world_advisor";
    if (text.contains("古") || text.contains("文明") || text.contains("丝绸之路") || text.contains("文艺复兴")) return "civilization";
    if (text.contains("故事") || text.contains("讲一个")) return "world_story";
    if (text.contains("带我去") || text.contains("推荐") || text.contains("小国") || text.contains("冷门") || text.contains("神秘") || text.contains("99%")) return "ai_guide";
    return "country_intro";
  }

  private String normalizeTargetType(String value, String intent) {
    String targetType = clean(value);
    if (targetType.isBlank() || "unknown".equalsIgnoreCase(targetType)) return targetTypeForIntent(intent);
    return targetType;
  }

  private String defaultTarget(String target, String intent, String message) {
    String text = clean(target);
    if (!text.isBlank()) return text;
    if ("world_blindbox".equals(intent)) return "";
    if (message.contains("冰岛")) return "冰岛";
    if (message.contains("日本")) return "日本";
    if (message.contains("印度")) return "印度";
    if (message.contains("美国")) return "美国";
    if (message.contains("芬兰")) return "芬兰";
    if (message.contains("古罗马") || message.contains("文艺复兴")) return "意大利";
    if (message.contains("古埃及") || message.contains("埃及")) return "埃及";
    if (message.contains("玛雅")) return "墨西哥";
    if (message.contains("丝绸之路")) return "中国";
    return "";
  }

  private String targetTypeForIntent(String intent) {
    return switch (intent) {
      case "civilization" -> "civilization";
      case "world_story" -> "place";
      case "world_blindbox" -> "country";
      default -> "country";
    };
  }

  private String titleFor(String intent, TargetLocation location) {
    return switch (intent) {
      case "parallel_life" -> "如果你出生在" + location.country();
      case "ai_guide" -> "AI导游推荐：" + location.name();
      case "world_blindbox" -> "你今天抵达：" + location.name();
      case "world_advisor" -> "世界顾问推荐：" + location.country();
      case "civilization" -> location.name() + "文明探索";
      case "world_story" -> "一个关于" + location.name() + "的故事";
      default -> location.name() + "探索";
    };
  }

  private String subtitleFor(String intent, TargetLocation location) {
    return "地球已定位到 %s，继续沿着 AI 生成的线索探索。".formatted(location.name());
  }

  private List<Double> coordinates(TargetLocation location) {
    return List.of(location.lat(), location.lng());
  }

  private static double round4(double value) {
    return Math.round(value * 10000.0) / 10000.0;
  }

  private static String text(JsonNode node, String field) {
    if (node == null || node.isMissingNode() || node.isNull()) return "";
    return node.path(field).asText("").trim();
  }

  private static String defaultText(String value, String fallback) {
    String text = clean(value);
    return text.isBlank() ? fallback : text;
  }

  private static String clean(String value) {
    return value == null ? "" : value.trim();
  }

  private static List<TargetLocation> buildTargets() {
    Map<String, TargetLocation> targets = new LinkedHashMap<>();
    add(targets, "ISL", "冰岛", "冰岛", 64.9631, -19.0208, true, "iceland", "极光", "冷门", "神秘", "高纬");
    add(targets, "JPN", "日本", "日本", 36.2048, 138.2529, false, "japan");
    add(targets, "IND", "印度", "印度", 20.5937, 78.9629, false, "india");
    add(targets, "USA", "美国", "美国", 39.8283, -98.5795, false, "america", "united states", "程序员");
    add(targets, "FIN", "芬兰", "芬兰", 61.9241, 25.7482, true, "finland", "养老", "程序员", "教育");
    add(targets, "NOR", "挪威", "挪威", 60.472, 8.4689, true, "norway", "极光");
    add(targets, "CAN", "加拿大", "加拿大", 56.1304, -106.3468, false, "canada", "留学", "摄影");
    add(targets, "NZL", "新西兰", "新西兰", -40.9006, 174.886, true, "new zealand", "养老", "独自旅行");
    add(targets, "TUV", "图瓦卢", "图瓦卢", -7.1095, 177.6493, true, "tuvalu", "99%", "岛屿");
    add(targets, "BTN", "不丹", "不丹", 27.5142, 90.4336, true, "bhutan", "神秘");
    add(targets, "GEO", "格鲁吉亚", "格鲁吉亚", 42.3154, 43.3569, true, "georgia", "冷门", "独自旅行");
    add(targets, "MDG", "马达加斯加", "马达加斯加", -18.7669, 46.8691, true, "madagascar", "冷门", "自然");
    add(targets, "SGP", "新加坡", "新加坡", 1.3521, 103.8198, false, "singapore", "创业", "远程办公");
    add(targets, "EGY", "埃及", "埃及", 26.8206, 30.8025, false, "egypt", "古埃及", "金字塔");
    add(targets, "ITA", "意大利", "意大利", 41.8719, 12.5674, false, "italy", "古罗马", "罗马", "文艺复兴");
    add(targets, "MEX", "墨西哥", "墨西哥", 23.6345, -102.5528, false, "mexico", "玛雅");
    add(targets, "CHN", "中国", "中国", 35.8617, 104.1954, false, "china", "丝绸之路");
    add(targets, "MNG", "蒙古", "蒙古", 46.8625, 103.8467, true, "mongolia", "蒙古帝国");
    add(targets, "PER", "秘鲁", "秘鲁", -9.19, -75.0152, true, "peru", "印加");
    add(targets, "MAR", "摩洛哥", "摩洛哥", 31.7917, -7.0926, true, "morocco", "撒哈拉");
    add(targets, "OMN", "阿曼", "阿曼", 21.4735, 55.9754, true, "oman", "印度洋");
    add(targets, "BRA", "巴西", "巴西", -14.235, -51.9253, false, "brazil");
    add(targets, "FRA", "法国", "法国", 46.2276, 2.2137, false, "france");
    add(targets, "GBR", "英国", "英国", 55.3781, -3.436, false, "united kingdom", "uk");
    add(targets, "DEU", "德国", "德国", 51.1657, 10.4515, false, "germany");
    add(targets, "AUS", "澳大利亚", "澳大利亚", -25.2744, 133.7751, false, "australia");
    return List.copyOf(targets.values());
  }

  private static void add(Map<String, TargetLocation> map, String code, String name, String country, double lat, double lng, boolean blindbox, String... aliases) {
    List<String> names = new ArrayList<>();
    names.add(code.toLowerCase(Locale.ROOT));
    names.add(name.toLowerCase(Locale.ROOT));
    names.add(country.toLowerCase(Locale.ROOT));
    for (String alias : aliases) names.add(alias.toLowerCase(Locale.ROOT));
    map.put(code, new TargetLocation(name, country, code, lat, lng, blindbox, names));
  }

  private record TargetLocation(String name, String country, String countryCode, double lat, double lng, boolean blindbox, List<String> aliases) {
    int score(String text) {
      int score = 0;
      for (String alias : aliases) {
        if (!alias.isBlank() && text.contains(alias)) score = Math.max(score, alias.length() * 10);
      }
      return score;
    }
  }
}
