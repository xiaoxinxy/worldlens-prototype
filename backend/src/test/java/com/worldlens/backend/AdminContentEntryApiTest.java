package com.worldlens.backend;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItem;
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
class AdminContentEntryApiTest {
  @Autowired
  private MockMvc mockMvc;

  @Test
  void publicContentModulesExposeSeededDynamicAndClimateEntries() throws Exception {
    mockMvc.perform(get("/api/content/dynamics"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data[*].entryId", hasItem("plates")))
      .andExpect(jsonPath("$.data[*].entryId", hasItem("pacific-plate")));

    mockMvc.perform(get("/api/content/climate"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data[*].entryId", hasItem("tropical-rainforest")));
  }

  @Test
  void onlyAdminsCanManageGenericContentEntries() throws Exception {
    String userToken = register("content_user", false);
    String adminToken = register("content_admin", true);

    mockMvc.perform(post("/api/admin/content/dynamics")
        .header("Authorization", "Bearer " + userToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content(newContentJson("test-plate-admin", "测试板块")))
      .andExpect(status().isForbidden());

    mockMvc.perform(get("/api/admin/content/dynamics/page")
        .header("Authorization", "Bearer " + adminToken)
        .param("page", "1")
        .param("pageSize", "5"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.items", hasSize(5)))
      .andExpect(jsonPath("$.data.total", greaterThanOrEqualTo(5)))
      .andExpect(jsonPath("$.data.page").value(1))
      .andExpect(jsonPath("$.data.pageSize").value(5));

    mockMvc.perform(post("/api/admin/content/dynamics")
        .header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content(newContentJson("test-plate-admin", "测试板块")))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.module").value("dynamics"))
      .andExpect(jsonPath("$.data.entryId").value("test-plate-admin"))
      .andExpect(jsonPath("$.data.payload.kind").value("plate"));

    mockMvc.perform(put("/api/admin/content/dynamics/test-plate-admin")
        .header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content(newContentJson("ignored-id", "测试板块已更新")))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.entryId").value("test-plate-admin"))
      .andExpect(jsonPath("$.data.title").value("测试板块已更新"));

    mockMvc.perform(patch("/api/admin/content/dynamics/test-plate-admin/status")
        .header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"enabled\":false}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.enabled").value(false));

    mockMvc.perform(get("/api/content/dynamics"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data[*].entryId", not(hasItem("test-plate-admin"))));

    mockMvc.perform(delete("/api/admin/content/dynamics/test-plate-admin")
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

  private String newContentJson(String entryId, String title) {
    return String.format("""
      {
        "entryId": "%s",
        "title": "%s",
        "subtitle": "板块管理测试",
        "summary": "用于验证地球动态等通用模块可以进入后端内容管理。",
        "payload": { "kind": "plate", "lat": 1.2, "lng": 3.4 },
        "enabled": true,
        "sortOrder": 990
      }
      """, entryId, title);
  }
}
