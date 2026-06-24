package com.worldlens.backend;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class CivilizationCountryApiTest {
  @Autowired
  private MockMvc mockMvc;

  @Test
  void publicCountryAndCivilizationEndpointsExposeSeededData() throws Exception {
    mockMvc.perform(get("/api/countries").param("q", "中国"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data[*].code", hasItem("CHN")));

    mockMvc.perform(get("/api/countries"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data", hasSize(greaterThan(200))));

    mockMvc.perform(get("/api/countries/CHN"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.code").value("CHN"))
      .andExpect(jsonPath("$.data.name").value("中国"))
      .andExpect(jsonPath("$.data.capital").value("北京"))
      .andExpect(jsonPath("$.data.languages[0]").value("汉语"))
      .andExpect(jsonPath("$.data.civilizationTags[*]", hasItem("中华文明")));

    mockMvc.perform(get("/api/civilization/layers"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data[*].id", hasItem("population")))
      .andExpect(jsonPath("$.data[*].id", hasItem("language")));

    mockMvc.perform(get("/api/civilization/countries"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.CHN.id").value("CHN"))
      .andExpect(jsonPath("$.data.CHN.languageGroup").value("sinitic"))
      .andExpect(jsonPath("$.data.CHN.population").value(1408280000));
  }

  @Test
  void onlyAdminsCanManageCountries() throws Exception {
    String userToken = register("country_user", false);
    String adminToken = register("country_admin", true);

    mockMvc.perform(post("/api/admin/countries")
        .header("Authorization", "Bearer " + userToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content(newCountryJson("TST", "测试国", "Testland")))
      .andExpect(status().isForbidden())
      .andExpect(jsonPath("$.success").value(false));

    mockMvc.perform(get("/api/admin/countries/page")
        .header("Authorization", "Bearer " + adminToken)
        .param("page", "1")
        .param("pageSize", "12"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.items", hasSize(12)))
      .andExpect(jsonPath("$.data.total", greaterThan(200)))
      .andExpect(jsonPath("$.data.page").value(1))
      .andExpect(jsonPath("$.data.pageSize").value(12));

    mockMvc.perform(get("/api/admin/countries/page")
        .header("Authorization", "Bearer " + adminToken)
        .param("q", "CHN")
        .param("page", "1")
        .param("pageSize", "5"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.items[*].code", hasItem("CHN")));

    mockMvc.perform(post("/api/admin/countries")
        .header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content(newCountryJson("TST", "测试国", "Testland")))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.code").value("TST"))
      .andExpect(jsonPath("$.data.name").value("测试国"))
      .andExpect(jsonPath("$.data.enabled").value(true));

    mockMvc.perform(put("/api/admin/countries/TST")
        .header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content(newCountryJson("IGN", "测试联邦", "Updated Testland")))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.code").value("TST"))
      .andExpect(jsonPath("$.data.name").value("测试联邦"))
      .andExpect(jsonPath("$.data.name_en").value("Updated Testland"));

    mockMvc.perform(patch("/api/admin/countries/TST/status")
        .header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"enabled\":false}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.enabled").value(false));

    mockMvc.perform(get("/api/countries"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data[*].code", not(hasItem("TST"))));

    mockMvc.perform(get("/api/admin/countries")
        .header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data[*].code", hasItem("TST")));

    mockMvc.perform(delete("/api/admin/countries/TST")
        .header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk());
  }

  private String register(String username, boolean admin) throws Exception {
    MvcResult result = mockMvc.perform(post("/api/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(String.format("""
          {
            "username": "%s",
            "password": "secret123",
            "nickname": "%s",
            "isAdmin": %s,
            "adminKey": "test-admin-key"
          }
          """, username, username, admin)))
      .andExpect(status().isOk())
      .andReturn();
    return JsonTestSupport.read(result, "$.data.token");
  }

  private String newCountryJson(String code, String name, String nameEn) {
    return String.format("""
      {
        "code": "%s",
        "name": "%s",
        "name_en": "%s",
        "continent": "测试洲",
        "region": "测试区域",
        "capital": "测试首都",
        "latitude": 12.5,
        "longitude": 34.5,
        "population": 12345678,
        "areaKm2": 9988.6,
        "languages": ["测试语"],
        "languageGroup": "other",
        "languageGroupLabel": "多语 / 本地语",
        "languageColor": "#94a3b8",
        "toneGroup": "yellow",
        "toneGroupLabel": "黄色",
        "toneColor": "#ffd43b",
        "summary": "用于验证国家文明后端管理接口。",
        "cultureNote": "测试国家文化说明。",
        "civilizationTags": ["测试文明"],
        "coverImage": "/images/places/china-cover.jpg",
        "enabled": true,
        "sortOrder": 900
      }
      """, code, name, nameEn);
  }
}
