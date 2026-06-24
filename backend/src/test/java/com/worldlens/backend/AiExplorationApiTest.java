package com.worldlens.backend;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.worldlens.backend.service.DeepSeekClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AiExplorationApiTest {
  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private DeepSeekClient deepSeekClient;

  @Test
  void publicAiIntentEndpointResolvesTargetWithoutLogin() throws Exception {
    when(deepSeekClient.completeJson(anyString(), anyString())).thenReturn("""
      {
        "intent": "parallel_life",
        "target": "冰岛",
        "targetType": "country"
      }
      """);

    mockMvc.perform(post("/api/ai/intent")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {
            "message": "如果我出生在冰岛"
          }
          """))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.intent").value("parallel_life"))
      .andExpect(jsonPath("$.data.countryCode").value("ISL"))
      .andExpect(jsonPath("$.data.coordinates[0]").value(64.9631))
      .andExpect(jsonPath("$.data.coordinates[1]").value(-19.0208));
  }

  @Test
  void publicAiRouteEndpointReturnsPlayableDynamicStops() throws Exception {
    when(deepSeekClient.completeJson(anyString(), anyString())).thenReturn("""
      {
        "title": "欧洲国家旅行航线",
        "theme": "城市文化与经典景点",
        "summary": "一条由 AI 临时规划的欧洲旅行路线。",
        "stops": [
          {
            "name": "巴黎",
            "country": "法国",
            "countryCode": "FRA",
            "coordinates": [48.8566, 2.3522],
            "intro": "巴黎适合作为欧洲文化旅行的起点。",
            "culture": "咖啡馆、博物馆和街区漫步构成这里的日常气质。",
            "highlights": ["卢浮宫", "塞纳河"]
          },
          {
            "name": "罗马",
            "country": "意大利",
            "countryCode": "ITA",
            "coordinates": [41.9028, 12.4964],
            "intro": "罗马连接古典文明与现代城市生活。",
            "culture": "广场、遗迹和街区共同组成城市记忆。",
            "highlights": ["斗兽场", "万神殿"]
          }
        ]
      }
      """);

    mockMvc.perform(post("/api/ai/route")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {
            "message": "给我一条欧洲国家旅行路线"
          }
          """))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.title").value("欧洲国家旅行航线"))
      .andExpect(jsonPath("$.data.stops[0].name").value("巴黎"))
      .andExpect(jsonPath("$.data.stops[0].countryCode").value("FRA"))
      .andExpect(jsonPath("$.data.stops[0].coordinates[0]").value(48.8566));
  }
}
