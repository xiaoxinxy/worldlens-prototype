package com.worldlens.backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldlens.backend.common.AppException;
import com.worldlens.backend.dto.AiExploreRequest;
import com.worldlens.backend.dto.AiIntentRequest;
import com.worldlens.backend.dto.AiRouteRequest;
import com.worldlens.backend.service.AiExplorationService;
import com.worldlens.backend.service.DeepSeekClient;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class AiExplorationServiceTest {
  private final ObjectMapper objectMapper = new ObjectMapper();

  @Test
  void intentResolutionAddsCountryCodeAndCoordinatesForGlobeFlight() {
    AiExplorationService service = new AiExplorationService(new StubDeepSeekClient("""
      {
        "intent": "parallel_life",
        "target": "冰岛",
        "targetType": "country"
      }
      """), objectMapper);

    var intent = service.detectIntent(new AiIntentRequest("如果我出生在冰岛"));

    assertEquals("parallel_life", intent.intent());
    assertEquals("冰岛", intent.target());
    assertEquals("country", intent.targetType());
    assertEquals("ISL", intent.countryCode());
    assertEquals(64.9631, intent.coordinates().get(0), 0.0001);
    assertEquals(-19.0208, intent.coordinates().get(1), 0.0001);
  }

  @Test
  void exploreNormalizesStructuredSectionsAndTargetCoordinates() {
    AiExplorationService service = new AiExplorationService(new StubDeepSeekClient("""
      {
        "title": "如果你出生在冰岛",
        "subtitle": "高纬社区与自然环境塑造的另一种日常",
        "country": "冰岛",
        "summary": "这是一条更接近海风、火山和小规模社会的生活线索。",
        "sections": [
          { "heading": "成长环境", "body": "通常会更早接触强烈季节变化、户外自然和紧密社区。" }
        ]
      }
      """), objectMapper);

    var result = service.explore(new AiExploreRequest("parallel_life", "冰岛", null));

    assertEquals("如果你出生在冰岛", result.title());
    assertEquals("冰岛", result.country());
    assertEquals("ISL", result.countryCode());
    assertEquals(64.9631, result.coordinates().get(0), 0.0001);
    assertFalse(result.sections().isEmpty());
    assertEquals("成长环境", result.sections().get(0).heading());
  }

  @Test
  void intentFallsBackToLocalRoutingWhenDeepSeekFails() {
    AiExplorationService service = new AiExplorationService(new FailingDeepSeekClient(), objectMapper);

    var intent = service.detectIntent(new AiIntentRequest("如果我出生在冰岛"));

    assertEquals("parallel_life", intent.intent());
    assertEquals("冰岛", intent.country());
    assertEquals("ISL", intent.countryCode());
    assertEquals(64.9631, intent.coordinates().get(0), 0.0001);
    assertEquals("local-fallback", intent.provider());
  }

  @Test
  void exploreReportsDeepSeekFailureInsteadOfReturningFakeGeneratedContent() {
    AiExplorationService service = new AiExplorationService(new FailingDeepSeekClient(), objectMapper);

    AppException exception = assertThrows(
      AppException.class,
      () -> service.explore(new AiExploreRequest("parallel_life", "冰岛", "如果我出生在冰岛"))
    );

    assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatus());
    assertEquals("DeepSeek API request failed", exception.getMessage());
  }

  @Test
  void exploreKeepsTheTargetAlreadyChosenByTheIntentStep() {
    AiExplorationService service = new AiExplorationService(new StubDeepSeekClient("""
      {
        "title": "冰岛探索",
        "subtitle": "火山、冰川与北大西洋共同塑造的岛屿",
        "country": "冰岛",
        "summary": "从自然环境进入冰岛。",
        "sections": [
          { "heading": "推荐地点", "body": "冰岛适合观察火山、冰川和高纬海洋气候。" }
        ]
      }
      """), objectMapper);

    var result = service.explore(new AiExploreRequest("ai_guide", "冰岛", "带我去一个冷门国家"));

    assertEquals("冰岛", result.country());
    assertEquals("ISL", result.countryCode());
    assertEquals(64.9631, result.coordinates().get(0), 0.0001);
  }

  @Test
  void genericSmallCountryRecommendationDoesNotFallBackToIceland() {
    AiExplorationService service = new AiExplorationService(new FailingDeepSeekClient(), objectMapper);

    var intent = service.detectIntent(new AiIntentRequest("给我推荐一个小国家"));

    assertEquals("ai_guide", intent.intent());
    assertNotEquals("ISL", intent.countryCode());
    assertFalse(intent.coordinates().isEmpty());
  }

  @Test
  void genericMysteriousCountryRecommendationUsesDiscoveryCandidates() {
    AiExplorationService service = new AiExplorationService(new FailingDeepSeekClient(), objectMapper);

    var intent = service.detectIntent(new AiIntentRequest("哪个国家比较神秘"));

    assertEquals("world_advisor", intent.intent());
    assertNotEquals("ISL", intent.countryCode());
    assertFalse(intent.coordinates().isEmpty());
  }

  @Test
  void routeGenerationNormalizesDynamicStopsForPlayback() {
    AiExplorationService service = new AiExplorationService(new StubDeepSeekClient("""
      {
        "title": "欧洲国家旅行航线",
        "theme": "城市文化、风土人情与经典景点",
        "summary": "这条路线从西欧艺术城市走向地中海文明。",
        "stops": [
          {
            "name": "巴黎",
            "country": "法国",
            "countryCode": "FRA",
            "coordinates": [48.8566, 2.3522],
            "intro": "巴黎适合作为欧洲文化旅行的起点。",
            "culture": "咖啡馆、博物馆和街区漫步构成这里的日常气质。",
            "highlights": ["卢浮宫", "塞纳河", "蒙马特"]
          },
          {
            "name": "罗马",
            "country": "意大利",
            "countryCode": "ITA",
            "coordinates": [41.9028, 12.4964],
            "intro": "罗马让古典遗迹与城市生活交叠在一起。",
            "culture": "广场、教堂和古罗马遗迹共同组成城市记忆。",
            "highlights": ["斗兽场", "万神殿"]
          }
        ]
      }
      """), objectMapper);

    var route = service.generateRoute(new AiRouteRequest("给我一条欧洲国家旅行路线"));

    assertEquals("欧洲国家旅行航线", route.title());
    assertEquals("城市文化、风土人情与经典景点", route.theme());
    assertEquals(2, route.stops().size());
    assertEquals("巴黎", route.stops().get(0).name());
    assertEquals("FRA", route.stops().get(0).countryCode());
    assertEquals(48.8566, route.stops().get(0).coordinates().get(0), 0.0001);
    assertFalse(route.stops().get(0).highlights().isEmpty());
  }

  @Test
  void europeanRouteRequestRejectsNonEuropeanModelRoute() {
    AiExplorationService service = new AiExplorationService(new StubDeepSeekClient("""
      {
        "title": "Silk Road Echoes",
        "theme": "Central Asian trade route",
        "summary": "A route that does not match the European request.",
        "stops": [
          {
            "name": "撒马尔罕",
            "country": "乌兹别克斯坦",
            "countryCode": "UZB",
            "coordinates": [39.6542, 66.9597],
            "intro": "中亚绿洲城市。",
            "culture": "丝路贸易气质。",
            "highlights": ["雷吉斯坦广场"]
          },
          {
            "name": "喀什",
            "country": "中国",
            "countryCode": "CHN",
            "coordinates": [39.4677, 75.9938],
            "intro": "塔里木盆地城市。",
            "culture": "绿洲街区。",
            "highlights": ["老城"]
          }
        ]
      }
      """), objectMapper);

    AppException exception = assertThrows(
      AppException.class,
      () -> service.generateRoute(new AiRouteRequest("给我一条欧洲国家旅行路线"))
    );

    assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatus());
    assertEquals("DeepSeek 没有生成符合要求的路线，请重试", exception.getMessage());
  }

  @Test
  void routeReportsDeepSeekFailureInsteadOfReturningAnUnrelatedDefaultRoute() {
    AiExplorationService service = new AiExplorationService(new FailingDeepSeekClient(), objectMapper);

    AppException exception = assertThrows(
      AppException.class,
      () -> service.generateRoute(new AiRouteRequest("给我一条适合摄影的路线"))
    );

    assertEquals(HttpStatus.BAD_GATEWAY, exception.getStatus());
    assertEquals("DeepSeek API request failed", exception.getMessage());
  }

  private static class StubDeepSeekClient implements DeepSeekClient {
    private final String json;

    private StubDeepSeekClient(String json) {
      this.json = json;
    }

    @Override
    public String completeJson(String systemPrompt, String userPrompt) {
      return json;
    }
  }

  private static class FailingDeepSeekClient implements DeepSeekClient {
    @Override
    public String completeJson(String systemPrompt, String userPrompt) {
      throw new AppException(HttpStatus.BAD_GATEWAY, "DeepSeek API request failed");
    }
  }
}
