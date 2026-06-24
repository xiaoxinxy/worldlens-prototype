package com.worldlens.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldlens.backend.common.AppException;
import com.worldlens.backend.dto.CivilizationCountryMetricDto;
import com.worldlens.backend.dto.CivilizationLayerDto;
import com.worldlens.backend.dto.CountryProfileDto;
import com.worldlens.backend.dto.CountryProfileRequest;
import com.worldlens.backend.dto.PageDto;
import com.worldlens.backend.entity.CountryProfileEntity;
import com.worldlens.backend.mapper.CountryProfileMapper;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class CountryProfileService {
  private static final Pattern COUNTRY_CODE = Pattern.compile("[A-Z]{3}");
  private static final Pattern HEX_COLOR = Pattern.compile("#[0-9a-fA-F]{6}");
  private static final TypeReference<List<String>> STRING_LIST = new TypeReference<>() {};

  private static final List<CivilizationLayerDto> LAYERS = List.of(
    new CivilizationLayerDto(
      "routes",
      "文明路线",
      "路线",
      "文明脉络",
      "沿路线观察文明如何连接。",
      "贸易、迁徙、宗教和技术沿地理通道流动，塑造跨区域的文明网络。"
    ),
    new CivilizationLayerDto(
      "population",
      "人口分布",
      "人口",
      "人口密度感",
      "用色阶观察人口规模。",
      "颜色越暖，代表国家级人口规模越大；对数色阶保留中等国家的可读性。"
    ),
    new CivilizationLayerDto(
      "language",
      "语言分布",
      "语言",
      "语言板块",
      "观察主要语言圈的空间关系。",
      "按官方或主要语言归入粗粒度语系色组，用于快速观察语言地理格局。"
    ),
    new CivilizationLayerDto(
      "skin-tone",
      "肤色分布",
      "肤色",
      "三色分布",
      "观察白、黄、黑三类肤色分布。",
      "按白色、黄色、黑色三类粗略显示宏观分布，仅用于地球尺度可视化。"
    )
  );

  private static final List<ColorStop> POPULATION_STOPS = List.of(
    new ColorStop(0, "#1d4ed8"),
    new ColorStop(0.28, "#0891b2"),
    new ColorStop(0.52, "#16a34a"),
    new ColorStop(0.76, "#facc15"),
    new ColorStop(1, "#ef4444")
  );

  private final CountryProfileMapper countryProfileMapper;
  private final ObjectMapper objectMapper;

  public CountryProfileService(CountryProfileMapper countryProfileMapper, ObjectMapper objectMapper) {
    this.countryProfileMapper = countryProfileMapper;
    this.objectMapper = objectMapper;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void seedDefaultCountries() {
    DEFAULT_COUNTRIES.forEach(this::insertSeed);
    seedCountriesFromFrontendMetadata();
  }

  public List<CountryProfileDto> listPublic(String continent, String keyword) {
    return countryProfileMapper.findPublic(cleanOrNull(continent), cleanOrNull(keyword)).stream()
      .map(this::toDto)
      .toList();
  }

  public List<CountryProfileDto> featured() {
    return listPublic(null, null).stream().limit(10).toList();
  }

  public List<String> continents() {
    return countryProfileMapper.findContinents();
  }

  public CountryProfileDto getPublic(String code) {
    CountryProfileEntity country = countryProfileMapper.findPublicByCode(normalizeCode(code));
    if (country == null) throw new AppException(HttpStatus.NOT_FOUND, "未找到国家档案");
    return toDto(country);
  }

  public List<CountryProfileDto> related(String code) {
    CountryProfileDto target = getPublic(code);
    return listPublic(null, null).stream()
      .filter(country -> !country.code().equals(target.code()))
      .filter(country -> relatedScore(target, country) > 0)
      .sorted(
        Comparator.comparingInt((CountryProfileDto country) -> relatedScore(target, country))
          .reversed()
          .thenComparing(CountryProfileDto::sortOrder)
      )
      .limit(8)
      .toList();
  }

  public List<CountryProfileDto> listAdmin(String continent, String keyword) {
    return countryProfileMapper.findAdmin(cleanOrNull(continent), cleanOrNull(keyword)).stream()
      .map(this::toDto)
      .toList();
  }

  public PageDto<CountryProfileDto> listAdminPage(String continent, String keyword, Integer page, Integer pageSize) {
    int safePageSize = safePageSize(pageSize);
    int safePage = Math.max(1, page == null ? 1 : page);
    String cleanContinent = cleanOrNull(continent);
    String cleanKeyword = cleanOrNull(keyword);
    long total = countryProfileMapper.countAdmin(cleanContinent, cleanKeyword);
    int totalPages = Math.max(1, (int) Math.ceil(total / (double) safePageSize));
    safePage = Math.min(safePage, totalPages);
    int offset = (safePage - 1) * safePageSize;
    List<CountryProfileDto> items = countryProfileMapper.findAdminPage(cleanContinent, cleanKeyword, safePageSize, offset).stream()
      .map(this::toDto)
      .toList();
    return PageDto.of(items, total, safePage, safePageSize);
  }

  public CountryProfileDto create(CountryProfileRequest request) {
    String code = normalizeCode(request.code());
    if (countryProfileMapper.findByCode(code) != null) throw new AppException(HttpStatus.CONFLICT, "国家代码已存在");
    CountryProfileEntity country = toEntity(request, code);
    countryProfileMapper.insert(country);
    return toDto(countryProfileMapper.findByCode(code));
  }

  public CountryProfileDto update(String code, CountryProfileRequest request) {
    String countryCode = requireExistingCode(code);
    CountryProfileEntity country = toEntity(request, countryCode);
    countryProfileMapper.update(country);
    return toDto(countryProfileMapper.findByCode(countryCode));
  }

  public CountryProfileDto setEnabled(String code, boolean enabled) {
    String countryCode = requireExistingCode(code);
    countryProfileMapper.updateEnabled(countryCode, enabled);
    return toDto(countryProfileMapper.findByCode(countryCode));
  }

  public void delete(String code) {
    countryProfileMapper.delete(requireExistingCode(code));
  }

  public List<CivilizationLayerDto> layers() {
    return LAYERS;
  }

  public Map<String, CivilizationCountryMetricDto> civilizationCountryMetrics() {
    List<CountryProfileDto> countries = listPublic(null, null);
    long minPopulation = countries.stream()
      .map(CountryProfileDto::population)
      .filter(value -> value != null && value > 0)
      .min(Long::compareTo)
      .orElse(1000L);
    long maxPopulation = countries.stream()
      .map(CountryProfileDto::population)
      .filter(value -> value != null && value > 0)
      .max(Long::compareTo)
      .orElse(1000L);
    double minLog = Math.log10(Math.max(1000L, minPopulation));
    double maxLog = Math.log10(Math.max(1000L, maxPopulation));

    Map<String, CivilizationCountryMetricDto> metrics = new LinkedHashMap<>();
    for (CountryProfileDto country : countries) {
      double intensity = scalePopulation(country.population(), minLog, maxLog);
      String languageName = country.languages().isEmpty() ? country.languageGroupLabel() : country.languages().get(0);
      metrics.put(country.code(), new CivilizationCountryMetricDto(
        country.code(),
        country.name(),
        country.latitude(),
        country.longitude(),
        country.continent(),
        country.region(),
        country.population(),
        formatPopulation(country.population()),
        intensity,
        colorFromStops(POPULATION_STOPS, intensity),
        country.languageGroup(),
        languageName,
        country.languageGroup(),
        country.languageGroupLabel(),
        country.languageColor(),
        toneRank(country.toneGroup()) / 3.0,
        country.toneGroup(),
        country.toneGroupLabel(),
        country.toneGroupLabel(),
        country.toneColor()
      ));
    }
    return metrics;
  }

  private void insertSeed(SeedCountry country) {
    if (countryProfileMapper.findByCode(country.code()) == null) {
      countryProfileMapper.insert(toEntity(country));
    }
  }

  private void seedCountriesFromFrontendMetadata() {
    Path source = findCountryMetaPath();
    if (source == null) return;
    try {
      JsonNode root = objectMapper.readTree(source.toFile());
      if (!root.isArray()) return;
      int sortOrder = 1000;
      for (JsonNode meta : root) {
        SeedCountry country = toGeneratedCountry(meta, sortOrder++);
        if (country != null) insertSeed(country);
      }
    } catch (IOException exception) {
      // The backend can still run with curated seed countries if local frontend metadata is unavailable.
    }
  }

  private Path findCountryMetaPath() {
    List<Path> candidates = List.of(
      Path.of("public", "geo", "country-meta.json"),
      Path.of("..", "public", "geo", "country-meta.json")
    );
    return candidates.stream()
      .map(Path::toAbsolutePath)
      .map(Path::normalize)
      .filter(Files::isRegularFile)
      .findFirst()
      .orElse(null);
  }

  private SeedCountry toGeneratedCountry(JsonNode meta, int sortOrder) {
    String code = text(meta, "cca3").toUpperCase();
    if (!COUNTRY_CODE.matcher(code).matches()) return null;
    String name = countryName(meta);
    String nameEn = meta.path("name").path("common").asText(code);
    String region = text(meta, "region");
    String subregion = text(meta, "subregion");
    List<String> languages = languageNames(meta);
    Set<String> languageCodes = languageCodes(meta);
    LanguageGroup languageGroup = languageGroupForMeta(region, subregion, languageCodes);
    ToneGroup toneGroup = toneGroupForMeta(region, subregion);
    List<String> tags = generatedTags(region, subregion, languageGroup);
    String capital = firstText(meta.path("capital"));
    long population = Math.max(0, meta.path("population").asLong(0));
    double latitude = meta.path("latlng").isArray() && meta.path("latlng").size() > 0 ? meta.path("latlng").get(0).asDouble(0) : 0;
    double longitude = meta.path("latlng").isArray() && meta.path("latlng").size() > 1 ? meta.path("latlng").get(1).asDouble(0) : 0;
    String summary = "%s位于%s%s，首都%s，人口约%s。".formatted(
      name,
      region.isBlank() ? "世界" : region,
      subregion.isBlank() ? "" : " / " + subregion,
      capital.isBlank() ? "暂无资料" : capital,
      formatPopulation(population)
    );
    String cultureNote = "此条目由国家元数据自动生成，后续可在内容后台补充更详细的文明、历史、语言和地理说明。";
    String coverImage = meta.path("flags").path("png").asText("");
    return new SeedCountry(
      code,
      name,
      nameEn,
      region.isBlank() ? "未分类" : region,
      subregion,
      capital,
      latitude,
      longitude,
      population,
      meta.path("area").asDouble(0),
      languages,
      languageGroup,
      toneGroup,
      summary,
      cultureNote,
      tags,
      coverImage,
      sortOrder
    );
  }

  private int relatedScore(CountryProfileDto target, CountryProfileDto country) {
    int score = 0;
    if (sameText(target.continent(), country.continent())) score += 4;
    if (sameText(target.region(), country.region())) score += 3;
    if (sameText(target.languageGroup(), country.languageGroup())) score += 2;
    if (sameText(target.toneGroup(), country.toneGroup())) score += 1;
    if (sharesAny(target.civilizationTags(), country.civilizationTags())) score += 2;
    return score;
  }

  private String countryName(JsonNode meta) {
    String chinese = meta.path("name").path("nativeName").path("zho").path("common").asText("");
    if (!chinese.isBlank()) return chinese;
    return meta.path("name").path("common").asText(text(meta, "cca3"));
  }

  private List<String> languageNames(JsonNode meta) {
    JsonNode languagesNode = meta.path("languages");
    if (!languagesNode.isObject()) return List.of();
    List<String> languages = new ArrayList<>();
    Iterator<JsonNode> values = languagesNode.elements();
    while (values.hasNext()) {
      String value = values.next().asText("");
      if (!value.isBlank()) languages.add(languageName(value));
    }
    return languages;
  }

  private Set<String> languageCodes(JsonNode meta) {
    JsonNode languagesNode = meta.path("languages");
    if (!languagesNode.isObject()) return Set.of();
    java.util.LinkedHashSet<String> codes = new java.util.LinkedHashSet<>();
    Iterator<String> fieldNames = languagesNode.fieldNames();
    while (fieldNames.hasNext()) {
      codes.add(fieldNames.next().toLowerCase());
    }
    return codes;
  }

  private LanguageGroup languageGroupForMeta(String region, String subregion, Set<String> codes) {
    if ("Africa".equals(region) && !"Northern Africa".equals(subregion) && !codes.contains("ara")) return AFRICAN;
    if (hasAny(codes, "zho", "cmn", "yue")) return SINITIC;
    if (hasAny(codes, "jpn", "kor")) return JAPANESE_KOREAN;
    if (hasAny(codes, "hin", "urd", "ben", "nep", "fas", "pus", "prs", "snd", "sin", "div")) return INDO_IRANIAN;
    if (hasAny(codes, "ara")) return ARABIC;
    if (hasAny(codes, "spa", "por", "fra", "ita", "ron", "cat")) return ROMANCE;
    if (hasAny(codes, "eng", "deu", "nld", "swe", "dan", "nor", "isl", "afr")) return GERMANIC;
    if (hasAny(codes, "rus", "ukr", "pol", "ces", "slk", "slv", "hrv", "srp", "bul", "bel", "mkd", "bos")) return SLAVIC;
    if (hasAny(codes, "tur", "aze", "uzb", "kaz", "kir", "tuk")) return TURKIC;
    if (hasAny(codes, "ind", "msa", "tgl", "fil", "mri", "smo", "ton", "fij", "tet", "bis")) return AUSTRONESIAN;
    return OTHER;
  }

  private ToneGroup toneGroupForMeta(String region, String subregion) {
    if ("Africa".equals(region) && !"Northern Africa".equals(subregion)) return BLACK;
    if ("Melanesia".equals(subregion)) return BLACK;
    if (List.of("Eastern Asia", "South-Eastern Asia", "Southern Asia", "Central Asia", "Western Asia", "Northern Africa", "Caribbean").contains(subregion)) {
      return YELLOW;
    }
    return WHITE;
  }

  private List<String> generatedTags(String region, String subregion, LanguageGroup languageGroup) {
    List<String> tags = new ArrayList<>();
    if (!region.isBlank()) tags.add(region);
    if (!subregion.isBlank()) tags.add(subregion);
    tags.add(languageGroup.label());
    return tags;
  }

  private String languageName(String value) {
    return switch (value) {
      case "Chinese" -> "汉语";
      case "English" -> "英语";
      case "French" -> "法语";
      case "Spanish" -> "西班牙语";
      case "Portuguese" -> "葡萄牙语";
      case "Arabic" -> "阿拉伯语";
      case "Russian" -> "俄语";
      case "German" -> "德语";
      case "Japanese" -> "日语";
      case "Korean" -> "韩语";
      case "Hindi" -> "印地语";
      default -> value;
    };
  }

  private static boolean hasAny(Set<String> codes, String... candidates) {
    for (String candidate : candidates) {
      if (codes.contains(candidate)) return true;
    }
    return false;
  }

  private static String text(JsonNode node, String field) {
    return node.path(field).asText("").trim();
  }

  private static String firstText(JsonNode node) {
    if (node.isArray() && !node.isEmpty()) return node.get(0).asText("");
    return "";
  }

  private CountryProfileDto toDto(CountryProfileEntity country) {
    return new CountryProfileDto(
      country.getCode(),
      country.getName(),
      country.getNameEn(),
      country.getContinent(),
      country.getRegion(),
      country.getCapital(),
      country.getLatitude(),
      country.getLongitude(),
      country.getPopulation(),
      country.getAreaKm2(),
      readJson(country.getLanguagesJson()),
      country.getLanguageGroup(),
      country.getLanguageGroupLabel(),
      country.getLanguageColor(),
      country.getToneGroup(),
      country.getToneGroupLabel(),
      country.getToneColor(),
      country.getSummary(),
      country.getCultureNote(),
      readJson(country.getCivilizationTagsJson()),
      country.getCoverImage(),
      country.getEnabled(),
      country.getSortOrder()
    );
  }

  private CountryProfileEntity toEntity(CountryProfileRequest request, String code) {
    double lat = request.latitude() == null ? 0 : request.latitude();
    double lng = request.longitude() == null ? 0 : request.longitude();
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new AppException(HttpStatus.BAD_REQUEST, "国家坐标超出范围");
    }
    CountryProfileEntity country = new CountryProfileEntity();
    country.setCode(code);
    country.setName(requiredText(request.name(), "名称"));
    country.setNameEn(requiredText(request.nameEn(), "英文名"));
    country.setContinent(requiredText(request.continent(), "洲别"));
    country.setRegion(defaultText(request.region(), ""));
    country.setCapital(defaultText(request.capital(), ""));
    country.setLatitude(lat);
    country.setLongitude(lng);
    country.setPopulation(Math.max(0, request.population() == null ? 0 : request.population()));
    country.setAreaKm2(Math.max(0, request.areaKm2() == null ? 0 : request.areaKm2()));
    country.setLanguagesJson(writeJson(request.languages() == null ? List.of() : request.languages()));
    country.setLanguageGroup(requiredText(request.languageGroup(), "语言圈"));
    country.setLanguageGroupLabel(requiredText(request.languageGroupLabel(), "语言圈名称"));
    country.setLanguageColor(validColor(request.languageColor(), "#94a3b8"));
    country.setToneGroup(requiredText(request.toneGroup(), "肤色图层"));
    country.setToneGroupLabel(requiredText(request.toneGroupLabel(), "肤色图层名称"));
    country.setToneColor(validColor(request.toneColor(), "#ffd43b"));
    country.setSummary(requiredText(request.summary(), "简介"));
    country.setCultureNote(defaultText(request.cultureNote(), ""));
    country.setCivilizationTagsJson(writeJson(request.civilizationTags() == null ? List.of() : request.civilizationTags()));
    country.setCoverImage(defaultText(request.coverImage(), ""));
    country.setEnabled(request.enabled() == null || request.enabled());
    country.setSortOrder(request.sortOrder() == null ? 100 : Math.max(0, request.sortOrder()));
    return country;
  }

  private CountryProfileEntity toEntity(SeedCountry seed) {
    CountryProfileEntity country = new CountryProfileEntity();
    country.setCode(seed.code());
    country.setName(seed.name());
    country.setNameEn(seed.nameEn());
    country.setContinent(seed.continent());
    country.setRegion(seed.region());
    country.setCapital(seed.capital());
    country.setLatitude(seed.latitude());
    country.setLongitude(seed.longitude());
    country.setPopulation(seed.population());
    country.setAreaKm2(seed.areaKm2());
    country.setLanguagesJson(writeJson(seed.languages()));
    country.setLanguageGroup(seed.languageGroup().id());
    country.setLanguageGroupLabel(seed.languageGroup().label());
    country.setLanguageColor(seed.languageGroup().color());
    country.setToneGroup(seed.toneGroup().id());
    country.setToneGroupLabel(seed.toneGroup().label());
    country.setToneColor(seed.toneGroup().color());
    country.setSummary(seed.summary());
    country.setCultureNote(seed.cultureNote());
    country.setCivilizationTagsJson(writeJson(seed.civilizationTags()));
    country.setCoverImage(seed.coverImage());
    country.setEnabled(true);
    country.setSortOrder(seed.sortOrder());
    return country;
  }

  private String requireExistingCode(String code) {
    String countryCode = normalizeCode(code);
    if (countryProfileMapper.findByCode(countryCode) == null) throw new AppException(HttpStatus.NOT_FOUND, "未找到国家档案");
    return countryCode;
  }

  private String normalizeCode(String value) {
    String code = clean(value).toUpperCase();
    if (!COUNTRY_CODE.matcher(code).matches()) {
      throw new AppException(HttpStatus.BAD_REQUEST, "国家代码必须是 3 位大写字母 ISO3 代码");
    }
    return code;
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
      throw new IllegalStateException("Country profile data could not be serialized", exception);
    }
  }

  private static String formatPopulation(Long value) {
    long population = value == null ? 0 : value;
    if (population <= 0) return "暂无";
    if (population >= 100000000) {
      double amount = population / 100000000.0;
      return trimNumber(amount, population >= 1000000000 ? 1 : 2) + "亿";
    }
    if (population >= 10000) {
      double amount = population / 10000.0;
      return trimNumber(amount, population >= 10000000 ? 0 : 1) + "万";
    }
    return Long.toString(population);
  }

  private static double scalePopulation(Long value, double minLog, double maxLog) {
    long population = value == null ? 0 : value;
    if (population <= 0) return 0;
    return clamp((Math.log10(population) - minLog) / (maxLog - minLog == 0 ? 1 : maxLog - minLog), 0, 1);
  }

  private static String colorFromStops(List<ColorStop> stops, double value) {
    double normalized = clamp(value, 0, 1);
    for (int index = 0; index < stops.size(); index++) {
      if (stops.get(index).at() >= normalized) {
        if (index == 0) return stops.get(0).color();
        ColorStop lower = stops.get(index - 1);
        ColorStop upper = stops.get(index);
        double t = (normalized - lower.at()) / (upper.at() - lower.at());
        return mixHex(lower.color(), upper.color(), t);
      }
    }
    return stops.get(stops.size() - 1).color();
  }

  private static String mixHex(String from, String to, double t) {
    int[] a = parseHex(from);
    int[] b = parseHex(to);
    StringBuilder result = new StringBuilder("#");
    for (int index = 0; index < 3; index++) {
      int channel = (int) Math.round(a[index] + (b[index] - a[index]) * clamp(t, 0, 1));
      result.append(String.format("%02x", channel));
    }
    return result.toString();
  }

  private static int[] parseHex(String hex) {
    String value = hex.replace("#", "");
    return new int[] {
      Integer.parseInt(value.substring(0, 2), 16),
      Integer.parseInt(value.substring(2, 4), 16),
      Integer.parseInt(value.substring(4, 6), 16)
    };
  }

  private static int toneRank(String toneGroup) {
    return switch (clean(toneGroup)) {
      case "yellow" -> 2;
      case "black" -> 3;
      default -> 1;
    };
  }

  private static String validColor(String value, String fallback) {
    String color = clean(value);
    return HEX_COLOR.matcher(color).matches() ? color : fallback;
  }

  private static boolean sharesAny(List<String> left, List<String> right) {
    if (left == null || right == null || left.isEmpty() || right.isEmpty()) return false;
    return left.stream().anyMatch(right::contains);
  }

  private static boolean sameText(String left, String right) {
    return !clean(left).isEmpty() && clean(left).equals(clean(right));
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

  private static int safePageSize(Integer pageSize) {
    int value = pageSize == null ? 12 : pageSize;
    return Math.min(80, Math.max(5, value));
  }

  private static double clamp(double value, double min, double max) {
    return Math.min(max, Math.max(min, value));
  }

  private static String trimNumber(double value, int fixed) {
    String text = String.format(java.util.Locale.US, "%." + fixed + "f", value);
    return text.replaceAll("\\.0+$", "").replaceAll("(\\.\\d*?)0+$", "$1");
  }

  private record ColorStop(double at, String color) {
  }

  private record LanguageGroup(String id, String label, String color) {
  }

  private record ToneGroup(String id, String label, String color) {
  }

  private record SeedCountry(
      String code,
      String name,
      String nameEn,
      String continent,
      String region,
      String capital,
      double latitude,
      double longitude,
      long population,
      double areaKm2,
      List<String> languages,
      LanguageGroup languageGroup,
      ToneGroup toneGroup,
      String summary,
      String cultureNote,
      List<String> civilizationTags,
      String coverImage,
      int sortOrder
  ) {
  }

  private static final LanguageGroup SINITIC = new LanguageGroup("sinitic", "汉语圈", "#facc15");
  private static final LanguageGroup JAPANESE_KOREAN = new LanguageGroup("japanese-korean", "日语 / 韩语", "#38bdf8");
  private static final LanguageGroup INDO_IRANIAN = new LanguageGroup("indo-iranian", "印度-伊朗语支", "#22c55e");
  private static final LanguageGroup ARABIC = new LanguageGroup("arabic", "阿拉伯语圈", "#f59e0b");
  private static final LanguageGroup ROMANCE = new LanguageGroup("romance", "罗曼语族", "#fb7185");
  private static final LanguageGroup GERMANIC = new LanguageGroup("germanic", "日耳曼语族", "#60a5fa");
  private static final LanguageGroup SLAVIC = new LanguageGroup("slavic", "斯拉夫语族", "#a855f7");
  private static final LanguageGroup TURKIC = new LanguageGroup("turkic", "突厥语族", "#f97316");
  private static final LanguageGroup AUSTRONESIAN = new LanguageGroup("austronesian", "南岛语族", "#06b6d4");
  private static final LanguageGroup AFRICAN = new LanguageGroup("african", "非洲本地语群", "#84cc16");
  private static final LanguageGroup OTHER = new LanguageGroup("other", "多语 / 本地语", "#94a3b8");

  private static final ToneGroup WHITE = new ToneGroup("white", "白色", "#f8f4e8");
  private static final ToneGroup YELLOW = new ToneGroup("yellow", "黄色", "#ffd43b");
  private static final ToneGroup BLACK = new ToneGroup("black", "黑色", "#111111");

  private static final List<SeedCountry> DEFAULT_COUNTRIES = List.of(
    new SeedCountry("CHN", "中国", "China", "亚洲", "东亚", "北京", 35, 105, 1408280000L, 9600000, List.of("汉语"), SINITIC, YELLOW, "东亚人口与农业文明核心区，季风、河流、平原和山地共同塑造了多区域国家格局。", "黄河、长江流域支撑早期农业与城市发展，丝绸之路和海上贸易又把中国与欧亚世界相连。", List.of("中华文明", "季风农业", "丝绸之路"), "/images/places/china-cover.jpg", 10),
    new SeedCountry("IND", "印度", "India", "亚洲", "南亚", "新德里", 20, 77, 1417492000L, 3287263, List.of("印地语", "英语", "泰米尔语"), INDO_IRANIAN, YELLOW, "南亚次大陆人口核心，季风气候、恒河平原和多语言社会共同塑造国家空间。", "印度河、恒河平原孕育古代城市和农耕社会，宗教、贸易与殖民历史让文化层次十分复杂。", List.of("南亚文明", "恒河平原", "季风农业"), "/images/places/india-cover.jpg", 20),
    new SeedCountry("USA", "美国", "United States", "北美洲", "北美", "华盛顿", 38, -97, 335893238L, 9833517, List.of("英语"), GERMANIC, WHITE, "横跨北美大陆的工业、科技和移民国家，地形从大平原到两岸海港差异明显。", "大西洋港口、密西西比水系、铁路和移民网络共同推动城市化、工业化与内陆开发。", List.of("移民国家", "工业化", "大平原农业"), "/images/places/usa-cover.jpg", 30),
    new SeedCountry("IDN", "印度尼西亚", "Indonesia", "亚洲", "东南亚", "雅加达", -5, 120, 281190067L, 1904569, List.of("印度尼西亚语"), AUSTRONESIAN, YELLOW, "世界最大群岛国家之一，海峡、火山岛和季风航路让海洋联系非常重要。", "马六甲海峡、香料贸易、伊斯兰传播和殖民航线共同塑造了群岛文明网络。", List.of("海洋文明", "香料贸易", "群岛国家"), "/images/places/indonesia-cover.jpg", 40),
    new SeedCountry("PAK", "巴基斯坦", "Pakistan", "亚洲", "南亚", "伊斯兰堡", 30, 70, 241499431L, 881913, List.of("乌尔都语", "英语"), INDO_IRANIAN, YELLOW, "连接南亚平原、伊朗高原与中亚山地的重要国家，印度河系统影响人口分布。", "印度河流域是早期城市文明中心之一，山口和河谷长期承担迁徙、贸易与文化交流。", List.of("印度河文明", "山口通道", "灌溉农业"), "/images/places/india-cover.jpg", 50),
    new SeedCountry("BRA", "巴西", "Brazil", "南美洲", "南美东部", "巴西利亚", -10, -55, 203080756L, 8515767, List.of("葡萄牙语"), ROMANCE, YELLOW, "南美面积最大的国家，亚马孙雨林、东南沿海城市带和高原农业并存。", "葡萄牙殖民、跨大西洋贸易、咖啡经济和亚马孙开发共同影响现代区域差异。", List.of("拉丁美洲", "亚马孙流域", "葡语文化"), "/images/places/brazil-cover.jpg", 60),
    new SeedCountry("NGA", "尼日利亚", "Nigeria", "非洲", "西非", "阿布贾", 9, 8, 223804632L, 923768, List.of("英语", "豪萨语", "约鲁巴语", "伊博语"), AFRICAN, BLACK, "西非人口大国，尼日尔河、几内亚湾和多民族城市网络塑造其区域影响力。", "萨赫勒贸易、森林农业、沿海港口和石油经济让尼日利亚兼具内陆与海洋联系。", List.of("西非文明", "尼日尔河", "多民族社会"), "/images/places/south-africa-cover.jpg", 70),
    new SeedCountry("BGD", "孟加拉国", "Bangladesh", "亚洲", "南亚", "达卡", 24, 90, 169828911L, 147570, List.of("孟加拉语"), INDO_IRANIAN, YELLOW, "恒河、布拉马普特拉河三角洲上的高密度人口国家，水网和季风影响深刻。", "三角洲肥沃土地支持稻作农业和城市密集分布，也带来洪水、风暴潮和水管理挑战。", List.of("三角洲文明", "稻作农业", "季风水网"), "/images/places/india-cover.jpg", 80),
    new SeedCountry("RUS", "俄罗斯", "Russia", "欧洲", "欧亚北部", "莫斯科", 60, 90, 146150789L, 17098246, List.of("俄语"), SLAVIC, WHITE, "横跨欧亚大陆北部，森林、草原、寒冷气候和资源分布决定其空间格局。", "东欧平原、伏尔加水系、西伯利亚铁路和资源开发构成国家扩展与治理的重要线索。", List.of("斯拉夫文化", "西伯利亚", "大陆国家"), "/images/places/russia-cover.jpg", 90),
    new SeedCountry("MEX", "墨西哥", "Mexico", "北美洲", "中美洲 / 北美南部", "墨西哥城", 23, -102, 130575786L, 1964375, List.of("西班牙语"), ROMANCE, YELLOW, "连接北美与拉丁美洲的高原国家，古代文明遗址、殖民城市和现代制造业并存。", "玛雅、阿兹特克等文明与西班牙殖民体系叠加，高原盆地和太平洋、大西洋港口共同影响发展。", List.of("中美洲文明", "高原城市", "西语文化"), "/images/places/mexico-cover.jpg", 100),
    new SeedCountry("JPN", "日本", "Japan", "亚洲", "东亚岛弧", "东京", 36, 138, 123294513L, 377975, List.of("日语"), JAPANESE_KOREAN, YELLOW, "东亚岛弧国家，山地、海洋交通、火山与季风共同影响城市和文化分布。", "稻作、海上交流、幕府城市、近代工业和海洋贸易让日本形成高密度沿海城市带。", List.of("岛弧文明", "稻作农业", "海洋贸易"), "/images/places/japan-cover.jpg", 110),
    new SeedCountry("PHL", "菲律宾", "Philippines", "亚洲", "东南亚岛屿", "马尼拉", 13, 122, 114123600L, 300000, List.of("菲律宾语", "英语"), AUSTRONESIAN, YELLOW, "西太平洋群岛国家，海峡航线、季风台风和岛屿分散性塑造社会联系。", "南岛语族迁徙、西班牙殖民、美国影响和区域海上贸易叠加，形成多层文化结构。", List.of("南岛文化", "群岛社会", "海上航线"), "/images/places/indonesia-cover.jpg", 120),
    new SeedCountry("ETH", "埃塞俄比亚", "Ethiopia", "非洲", "东非高原", "亚的斯亚贝巴", 9, 40, 109499000L, 1104300, List.of("阿姆哈拉语"), AFRICAN, BLACK, "东非高原国家，高原、裂谷和尼罗河上游支流影响农业、聚落和历史交通。", "高原环境支撑古代王国、教会传统和梯田农业，也让东非内陆与红海贸易保持联系。", List.of("东非高原", "古代王国", "裂谷地带"), "/images/places/south-africa-cover.jpg", 130),
    new SeedCountry("EGY", "埃及", "Egypt", "非洲", "北非", "开罗", 27, 30, 112716598L, 1002450, List.of("阿拉伯语"), ARABIC, YELLOW, "尼罗河谷地国家，人口和城市高度沿河集中，是理解河流文明的代表区域。", "尼罗河定期泛滥、灌溉农业和地中海红海通道共同支撑古埃及和后来的区域交通。", List.of("尼罗河文明", "绿洲农业", "地中海联系"), "/images/places/egypt-cover.jpg", 140),
    new SeedCountry("VNM", "越南", "Vietnam", "亚洲", "东南亚", "河内", 16, 108, 100300000L, 331212, List.of("越南语"), OTHER, YELLOW, "位于中南半岛东侧，红河与湄公河三角洲、沿海平原和山地共同塑造发展格局。", "稻作农业、海上贸易、汉字文化圈影响和殖民历史使越南呈现明显的南北区域差异。", List.of("稻作农业", "三角洲", "东南亚文化"), "/images/places/indonesia-cover.jpg", 150),
    new SeedCountry("DEU", "德国", "Germany", "欧洲", "中欧", "柏林", 51, 10, 84482267L, 357114, List.of("德语"), GERMANIC, WHITE, "中欧工业国家，莱茵河、多瑙河、北海港口和内陆城市网络联系紧密。", "河流航运、煤铁资源、城市同盟和工业化推动了密集的制造业与交通体系。", List.of("中欧工业", "莱茵河", "日耳曼文化"), "/images/places/germany-cover.jpg", 160),
    new SeedCountry("TUR", "土耳其", "Turkey", "亚洲", "安纳托利亚 / 东地中海", "安卡拉", 39, 35, 85326000L, 783562, List.of("土耳其语"), TURKIC, YELLOW, "横跨亚欧连接处，海峡、安纳托利亚高原和地中海黑海航路使其具有通道属性。", "拜占庭、奥斯曼、丝路和海峡贸易共同塑造了横跨欧亚的文化与政治地位。", List.of("欧亚通道", "奥斯曼遗产", "海峡城市"), "/images/places/turkey-cover.jpg", 170),
    new SeedCountry("IRN", "伊朗", "Iran", "亚洲", "西亚高原", "德黑兰", 32, 53, 89172767L, 1648195, List.of("波斯语"), INDO_IRANIAN, YELLOW, "西亚高原国家，山地、荒漠、绿洲和波斯湾通道共同影响历史与经济。", "波斯文明、绿洲城市、丝路交通和能源资源让伊朗长期处在欧亚交流节点上。", List.of("波斯文明", "绿洲城市", "丝绸之路"), "/images/places/turkey-cover.jpg", 180),
    new SeedCountry("GBR", "英国", "United Kingdom", "欧洲", "西北欧", "伦敦", 54, -2, 69281437L, 242495, List.of("英语"), GERMANIC, WHITE, "北大西洋岛国，温带海洋性气候、港口和煤铁资源曾推动工业革命。", "海上贸易、殖民扩张、工业革命和金融城市网络让英国在近现代世界体系中影响巨大。", List.of("海洋国家", "工业革命", "英语世界"), "/images/places/uk-cover.jpg", 190),
    new SeedCountry("FRA", "法国", "France", "欧洲", "西欧", "巴黎", 46, 2, 68287487L, 551695, List.of("法语"), ROMANCE, WHITE, "西欧国家，平原、河流、山地边界和地中海大西洋双向联系明显。", "塞纳河、卢瓦尔河、地中海港口、农业平原和城市文化共同塑造法国区域格局。", List.of("西欧文明", "罗曼语族", "地中海联系"), "/images/places/france-cover.jpg", 200),
    new SeedCountry("ITA", "意大利", "Italy", "欧洲", "南欧半岛", "罗马", 42.8, 12.8, 58997201L, 301340, List.of("意大利语"), ROMANCE, WHITE, "地中海半岛国家，山地、海岸、城市国家传统和古罗马遗产影响深远。", "罗马文明、文艺复兴城市、地中海贸易和火山土壤共同构成意大利文化地理。", List.of("罗马文明", "文艺复兴", "地中海贸易"), "/images/places/italy-cover.jpg", 210),
    new SeedCountry("ZAF", "南非", "South Africa", "非洲", "南部非洲", "比勒陀利亚", -29, 24, 62027503L, 1221037, List.of("英语", "祖鲁语", "科萨语"), AFRICAN, BLACK, "非洲南端国家，海岬航线、矿产、高原和多民族社会共同塑造其发展。", "好望角航线、矿业开发、殖民历史和多语言社会让南非成为南部非洲的重要节点。", List.of("南部非洲", "矿业城市", "海岬航线"), "/images/places/south-africa-cover.jpg", 220),
    new SeedCountry("KOR", "韩国", "South Korea", "亚洲", "东亚半岛", "首尔", 37, 127.5, 51159889L, 100210, List.of("韩语"), JAPANESE_KOREAN, YELLOW, "朝鲜半岛南部国家，山地、沿海城市和东亚制造业网络联系紧密。", "半岛位置、儒家文化圈、港口工业和现代城市化共同塑造韩国的发展路径。", List.of("东亚文化圈", "半岛国家", "港口工业"), "/images/places/japan-cover.jpg", 230),
    new SeedCountry("ESP", "西班牙", "Spain", "欧洲", "伊比利亚半岛", "马德里", 40, -4, 48619695L, 505990, List.of("西班牙语"), ROMANCE, WHITE, "伊比利亚半岛国家，地中海、大西洋和内陆高原共同影响区域结构。", "伊斯兰时期遗产、大航海、殖民联系和地中海农业让西班牙文化具有跨洲影响。", List.of("伊比利亚", "大航海", "西语世界"), "/images/places/spain-cover.jpg", 240),
    new SeedCountry("ARG", "阿根廷", "Argentina", "南美洲", "南美南部", "布宜诺斯艾利斯", -34, -64, 46735004L, 2780400, List.of("西班牙语"), ROMANCE, WHITE, "南美南部国家，潘帕斯草原、安第斯山地和大西洋港口影响人口与经济。", "草原牧业、欧洲移民、铁路和港口出口经济塑造了布宜诺斯艾利斯及内陆农业区。", List.of("潘帕斯草原", "港口城市", "拉丁美洲"), "/images/places/brazil-cover.jpg", 250),
    new SeedCountry("CAN", "加拿大", "Canada", "北美洲", "北美北部", "渥太华", 56, -106, 40097761L, 9984670, List.of("英语", "法语"), GERMANIC, WHITE, "北美高纬国家，人口集中在南部边境，森林、湖泊、寒冷气候和资源分布突出。", "圣劳伦斯河、五大湖、铁路、移民和资源开发共同塑造加拿大国家空间。", List.of("高纬国家", "五大湖", "移民社会"), "/images/places/canada-cover.jpg", 260),
    new SeedCountry("SAU", "沙特阿拉伯", "Saudi Arabia", "亚洲", "阿拉伯半岛", "利雅得", 24, 45, 32175224L, 2149690, List.of("阿拉伯语"), ARABIC, YELLOW, "阿拉伯半岛核心国家，荒漠、绿洲、石油资源和朝圣路线共同影响国家功能。", "麦加和麦地那的宗教地位、绿洲商路和现代能源经济使其在西亚和全球联系中非常关键。", List.of("阿拉伯文明", "朝圣路线", "能源经济"), "/images/places/saudi-arabia-cover.jpg", 270),
    new SeedCountry("AUS", "澳大利亚", "Australia", "大洋洲", "澳洲大陆", "堪培拉", -25, 133, 26658948L, 7692024, List.of("英语"), GERMANIC, WHITE, "独占大陆的国家，干旱内陆、沿海城市带和独特生态共同影响空间格局。", "原住民文化景观、英国殖民、矿业、牧业和海岸城市化形成鲜明的大陆尺度差异。", List.of("大陆国家", "干旱内陆", "原住民文化"), "/images/places/australia-cover.jpg", 280),
    new SeedCountry("PER", "秘鲁", "Peru", "南美洲", "安第斯西侧", "利马", -10, -76, 34230000L, 1285216, List.of("西班牙语", "克丘亚语"), ROMANCE, YELLOW, "安第斯山地、沿海荒漠和亚马孙雨林在一个国家内并列，垂直差异明显。", "印加文明利用山地道路、梯田和多海拔资源交换，沿海港口和高原城市延续至今。", List.of("印加文明", "安第斯山地", "垂直农业"), "/images/places/brazil-cover.jpg", 290),
    new SeedCountry("MAR", "摩洛哥", "Morocco", "非洲", "西北非", "拉巴特", 32, -6, 36828330L, 446550, List.of("阿拉伯语", "柏柏尔语"), ARABIC, YELLOW, "位于非洲西北角，阿特拉斯山、撒哈拉边缘、地中海和大西洋共同塑造交通与文化。", "柏柏尔文化、阿拉伯文化、跨撒哈拉贸易和海港城市让摩洛哥连接非洲、欧洲与阿拉伯世界。", List.of("马格里布", "跨撒哈拉贸易", "海港城市"), "/images/places/egypt-cover.jpg", 300),
    new SeedCountry("NZL", "新西兰", "New Zealand", "大洋洲", "南太平洋", "惠灵顿", -41, 174, 5223100L, 268021, List.of("英语", "毛利语"), GERMANIC, WHITE, "南太平洋岛国，山地、海洋、温带气候和毛利文化共同塑造国家身份。", "波利尼西亚迁徙、毛利社会、英国殖民和现代海洋经济构成主要文化层次。", List.of("南太平洋", "毛利文化", "海洋国家"), "/images/places/australia-cover.jpg", 310)
  );
}
