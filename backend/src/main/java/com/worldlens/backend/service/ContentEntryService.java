package com.worldlens.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.worldlens.backend.common.AppException;
import com.worldlens.backend.dto.ContentEntryDto;
import com.worldlens.backend.dto.ContentEntryRequest;
import com.worldlens.backend.dto.PageDto;
import com.worldlens.backend.entity.ContentEntryEntity;
import com.worldlens.backend.mapper.ContentEntryMapper;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ContentEntryService {
  private static final Pattern MODULE_ID = Pattern.compile("[a-z0-9-]{2,80}");
  private static final Pattern ENTRY_ID = Pattern.compile("[a-z0-9-]{2,120}");
  private static final Set<String> MODULES = Set.of("climate", "dynamics", "seasonal", "cosmos", "routes");

  private final ContentEntryMapper contentEntryMapper;
  private final ObjectMapper objectMapper;

  public ContentEntryService(ContentEntryMapper contentEntryMapper, ObjectMapper objectMapper) {
    this.contentEntryMapper = contentEntryMapper;
    this.objectMapper = objectMapper;
  }

  @EventListener(ApplicationReadyEvent.class)
  public void seedDefaultEntries() {
    defaultEntries().forEach(this::insertSeed);
  }

  public List<ContentEntryDto> listPublic(String module, String keyword) {
    return contentEntryMapper.findByModule(normalizeModule(module), cleanOrNull(keyword), false).stream()
      .map(this::toDto)
      .toList();
  }

  public List<ContentEntryDto> listAdmin(String module, String keyword) {
    return contentEntryMapper.findByModule(normalizeModule(module), cleanOrNull(keyword), true).stream()
      .map(this::toDto)
      .toList();
  }

  public PageDto<ContentEntryDto> listAdminPage(String module, String keyword, Integer page, Integer pageSize) {
    String contentModule = normalizeModule(module);
    int safePageSize = safePageSize(pageSize);
    int safePage = Math.max(1, page == null ? 1 : page);
    String cleanKeyword = cleanOrNull(keyword);
    long total = contentEntryMapper.countByModuleFiltered(contentModule, cleanKeyword, true);
    int totalPages = Math.max(1, (int) Math.ceil(total / (double) safePageSize));
    safePage = Math.min(safePage, totalPages);
    int offset = (safePage - 1) * safePageSize;
    List<ContentEntryDto> items = contentEntryMapper.findByModulePage(contentModule, cleanKeyword, true, safePageSize, offset).stream()
      .map(this::toDto)
      .toList();
    return PageDto.of(items, total, safePage, safePageSize);
  }

  public ContentEntryDto create(ContentEntryRequest request) {
    String module = normalizeModule(request.module());
    String entryId = normalizeEntryId(request.entryId());
    if (contentEntryMapper.findByModuleAndEntryId(module, entryId) != null) {
      throw new AppException(HttpStatus.CONFLICT, "内容条目 ID 已存在");
    }
    ContentEntryEntity entry = toEntity(request, module, entryId);
    contentEntryMapper.insert(entry);
    return toDto(contentEntryMapper.findByModuleAndEntryId(module, entryId));
  }

  public ContentEntryDto update(String module, String entryId, ContentEntryRequest request) {
    String contentModule = normalizeModule(module);
    String contentEntryId = requireExisting(contentModule, entryId);
    ContentEntryEntity entry = toEntity(request, contentModule, contentEntryId);
    contentEntryMapper.update(entry);
    return toDto(contentEntryMapper.findByModuleAndEntryId(contentModule, contentEntryId));
  }

  public ContentEntryDto setEnabled(String module, String entryId, boolean enabled) {
    String contentModule = normalizeModule(module);
    String contentEntryId = requireExisting(contentModule, entryId);
    contentEntryMapper.updateEnabled(contentModule, contentEntryId, enabled);
    return toDto(contentEntryMapper.findByModuleAndEntryId(contentModule, contentEntryId));
  }

  public void delete(String module, String entryId) {
    String contentModule = normalizeModule(module);
    String contentEntryId = requireExisting(contentModule, entryId);
    contentEntryMapper.delete(contentModule, contentEntryId);
  }

  private void insertSeed(SeedEntry seed) {
    if (contentEntryMapper.findByModuleAndEntryId(seed.module(), seed.entryId()) == null) {
      ContentEntryEntity entry = new ContentEntryEntity();
      entry.setContentModule(seed.module());
      entry.setEntryId(seed.entryId());
      entry.setTitle(seed.title());
      entry.setSubtitle(seed.subtitle());
      entry.setSummary(seed.summary());
      entry.setPayloadJson(writeJson(seed.payload()));
      entry.setEnabled(true);
      entry.setSortOrder(seed.sortOrder());
      contentEntryMapper.insert(entry);
    }
  }

  private ContentEntryDto toDto(ContentEntryEntity entry) {
    return new ContentEntryDto(
      entry.getId(),
      entry.getContentModule(),
      entry.getEntryId(),
      entry.getTitle(),
      entry.getSubtitle(),
      entry.getSummary(),
      readPayload(entry.getPayloadJson()),
      entry.getEnabled(),
      entry.getSortOrder()
    );
  }

  private ContentEntryEntity toEntity(ContentEntryRequest request, String module, String entryId) {
    ContentEntryEntity entry = new ContentEntryEntity();
    entry.setContentModule(module);
    entry.setEntryId(entryId);
    entry.setTitle(requiredText(request.title(), "标题"));
    entry.setSubtitle(defaultText(request.subtitle(), ""));
    entry.setSummary(defaultText(request.summary(), ""));
    entry.setPayloadJson(writeJson(request.payload() == null || request.payload().isNull() ? objectMapper.createObjectNode() : request.payload()));
    entry.setEnabled(request.enabled() == null || request.enabled());
    entry.setSortOrder(request.sortOrder() == null ? 100 : Math.max(0, request.sortOrder()));
    return entry;
  }

  private String requireExisting(String module, String entryId) {
    String id = normalizeEntryId(entryId);
    if (contentEntryMapper.findByModuleAndEntryId(module, id) == null) {
      throw new AppException(HttpStatus.NOT_FOUND, "未找到内容条目");
    }
    return id;
  }

  private String normalizeModule(String value) {
    String module = clean(value);
    if (!MODULE_ID.matcher(module).matches() || !MODULES.contains(module)) {
      throw new AppException(HttpStatus.BAD_REQUEST, "内容模块无效");
    }
    return module;
  }

  private String normalizeEntryId(String value) {
    String id = clean(value);
    if (!ENTRY_ID.matcher(id).matches()) {
      throw new AppException(HttpStatus.BAD_REQUEST, "条目 ID 只能使用小写字母、数字和短横线");
    }
    return id;
  }

  private JsonNode readPayload(String json) {
    if (json == null || json.isBlank()) return objectMapper.createObjectNode();
    try {
      return objectMapper.readTree(json);
    } catch (JsonProcessingException exception) {
      return objectMapper.createObjectNode();
    }
  }

  private String writeJson(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JsonProcessingException exception) {
      throw new IllegalStateException("Content entry payload could not be serialized", exception);
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

  private static int safePageSize(Integer pageSize) {
    int value = pageSize == null ? 10 : pageSize;
    return Math.min(80, Math.max(5, value));
  }

  private ObjectNode payload(Object... pairs) {
    ObjectNode node = objectMapper.createObjectNode();
    for (int index = 0; index + 1 < pairs.length; index += 2) {
      Object value = pairs[index + 1];
      if (value instanceof Number number) node.put(String.valueOf(pairs[index]), number.doubleValue());
      else if (value instanceof Boolean bool) node.put(String.valueOf(pairs[index]), bool);
      else node.put(String.valueOf(pairs[index]), String.valueOf(value));
    }
    return node;
  }

  private record SeedEntry(String module, String entryId, String title, String subtitle, String summary, JsonNode payload, int sortOrder) {
  }

  private List<SeedEntry> defaultEntries() {
    return List.of(
      new SeedEntry("climate", "tropical-rainforest", "热带雨林", "气候探索", "赤道附近全年高温多雨、对流旺盛的森林气候。", payload("group", "tropical", "color", "#0f8f5f"), 10),
      new SeedEntry("climate", "tropical-monsoon", "热带季风", "气候探索", "受海陆热力差异和季风环流控制，干湿季分明。", payload("group", "monsoon", "color", "#16a878"), 20),
      new SeedEntry("climate", "hot-desert", "热带沙漠", "气候探索", "副热带高压、寒流或大陆内部位置造成高温少雨。", payload("group", "arid", "color", "#e0b545"), 30),
      new SeedEntry("climate", "oceanic", "海洋性气候", "气候探索", "西风和海洋调节使冬夏温差小、降水均匀。", payload("group", "oceanic", "color", "#4aa7c7"), 40),
      new SeedEntry("climate", "polar", "极地气候", "气候探索", "太阳高度低、冰雪反照率高，全年寒冷且生态脆弱。", payload("group", "cold", "color", "#e8f3f7"), 50),
      new SeedEntry("dynamics", "plates", "板块运动", "地球动态", "观察主要板块的边界、移动方向以及碰撞、俯冲和张裂。", payload("layer", "plates"), 10),
      new SeedEntry("dynamics", "earthquakes", "地震", "地球动态", "观察板块边界附近释放能量的位置和震级窗口。", payload("layer", "earthquakes"), 20),
      new SeedEntry("dynamics", "volcanoes", "火山", "地球动态", "观察活火山、休眠火山与超级火山如何沿板块边界分布。", payload("layer", "volcanoes"), 30),
      new SeedEntry("dynamics", "pacific-plate", "太平洋板块", "板块档案", "最大海洋板块，沿环太平洋边缘俯冲，塑造海沟、岛弧和火山带。", payload("kind", "plate", "lat", 2, "lng", -165), 40),
      new SeedEntry("dynamics", "eurasian-plate", "欧亚板块", "板块档案", "承载欧洲与亚洲大部分陆地，南缘与印度、阿拉伯和非洲板块碰撞。", payload("kind", "plate", "lat", 50, "lng", 70), 50),
      new SeedEntry("dynamics", "african-plate", "非洲板块", "板块档案", "东非裂谷显示大陆正在拉张，北缘与欧亚板块作用形成地中海地震火山带。", payload("kind", "plate", "lat", 5, "lng", 22), 60),
      new SeedEntry("seasonal", "january", "1月季节系统", "季节时间轴", "北半球冬季、南半球夏季，东亚冬季风和澳北雨季活跃。", payload("month", 1), 10),
      new SeedEntry("seasonal", "april", "4月季节系统", "季节时间轴", "北半球春季推进，华南前汛期和西非沿海初雨开始显现。", payload("month", 4), 20),
      new SeedEntry("seasonal", "july", "7月季节系统", "季节时间轴", "北半球夏季风最活跃，南亚、东亚和西非雨带北推。", payload("month", 7), 30),
      new SeedEntry("seasonal", "october", "10月季节系统", "季节时间轴", "北半球秋季转换，雨带南撤，冬季风逐步建立。", payload("month", 10), 40),
      new SeedEntry("cosmos", "day-night", "昼夜与晨昏线", "地球与宇宙", "太阳照射方向决定昼夜半球和晨昏线位置。", payload("layer", "illumination"), 10),
      new SeedEntry("cosmos", "seasons", "地轴倾角与四季", "地球与宇宙", "地轴倾角让太阳直射点南北移动，形成季节差异。", payload("layer", "season"), 20),
      new SeedEntry("cosmos", "moon-phase", "月相", "地球与宇宙", "月球相对太阳和地球的位置决定可见月面形态。", payload("layer", "moon"), 30),
      new SeedEntry("routes", "silk-road", "丝绸之路", "文明路线", "从长安穿越中亚绿洲与安纳托利亚，把商品、宗教和城市制度连接成欧亚网络。", payload("period", "约公元前2世纪至15世纪"), 10),
      new SeedEntry("routes", "buddhist-spread", "佛教传播路线", "文明路线", "佛教从恒河平原出发，经中亚、丝路和海上网络传入东亚与东南亚。", payload("period", "约公元前5世纪至公元8世纪"), 20),
      new SeedEntry("routes", "age-of-sail", "大航海时代", "文明路线", "远洋航线把大西洋、印度洋和太平洋连为一体，重塑贸易、殖民与知识地图。", payload("period", "15世纪至17世纪"), 30),
      new SeedEntry("routes", "spice-route", "香料贸易路线", "文明路线", "丁香、肉豆蔻、胡椒和肉桂沿印度洋与东南亚海域流动，塑造多语言港口共同体。", payload("period", "古典时代至17世纪"), 40),
      new SeedEntry("routes", "mediterranean-circle", "地中海文明圈", "文明路线", "地中海把希腊城邦、罗马帝国、埃及、腓尼基与拜占庭连接成内海文明网络。", payload("period", "古典时代至中世纪早期"), 50),
      new SeedEntry("routes", "indian-ocean-trade", "印度洋季风贸易", "文明路线", "借助季风转换，阿拉伯、印度、东南亚与东非港口形成跨海商业和宗教传播网络。", payload("period", "公元1世纪至18世纪"), 60),
      new SeedEntry("routes", "trans-saharan-trade", "跨撒哈拉贸易", "文明路线", "骆驼商队沿绿洲、水井和沙漠边缘移动，连接北非、萨赫勒和西非王国。", payload("period", "8世纪至16世纪"), 70),
      new SeedEntry("routes", "tea-horse-road", "茶马古道", "文明路线", "从云南、四川茶区翻越横断山脉进入青藏高原，茶叶、马匹和宗教文化沿山地驿道交换。", payload("period", "唐宋至20世纪"), 80)
    );
  }
}
