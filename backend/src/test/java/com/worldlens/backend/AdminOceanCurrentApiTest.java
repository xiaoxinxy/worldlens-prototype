package com.worldlens.backend;

import static org.hamcrest.Matchers.hasItem;
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
class AdminOceanCurrentApiTest {
  @Autowired
  private MockMvc mockMvc;

  @Test
  void registrationCanCreateAdminUserAndExposeAdminFlag() throws Exception {
    mockMvc.perform(post("/api/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {
            "username": "admin_flag_user",
            "password": "secret123",
            "nickname": "Admin Flag",
            "isAdmin": true,
            "adminKey": "test-admin-key"
          }
          """))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.user.username").value("admin_flag_user"))
      .andExpect(jsonPath("$.data.user.isAdmin").value(true));
  }

  @Test
  void onlyAdminsCanManageOceanCurrents() throws Exception {
    String userToken = register("ordinary_editor", false);
    String adminToken = register("ocean_admin", true);

    mockMvc.perform(post("/api/admin/ocean/currents")
        .header("Authorization", "Bearer " + userToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content(newCurrentJson("forbidden-current", "被拒绝洋流", "Forbidden Current")))
      .andExpect(status().isForbidden())
      .andExpect(jsonPath("$.success").value(false));

    mockMvc.perform(post("/api/admin/ocean/currents")
        .header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content(newCurrentJson("test-admin-current", "测试暖流", "Test Admin Current")))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.id").value("test-admin-current"))
      .andExpect(jsonPath("$.data.name").value("测试暖流"))
      .andExpect(jsonPath("$.data.enabled").value(true))
      .andExpect(jsonPath("$.data.sortOrder").value(90));

    mockMvc.perform(put("/api/admin/ocean/currents/test-admin-current")
        .header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content(newCurrentJson("ignored-id", "测试寒流", "Updated Test Current")))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.id").value("test-admin-current"))
      .andExpect(jsonPath("$.data.name").value("测试寒流"))
      .andExpect(jsonPath("$.data.name_en").value("Updated Test Current"));

    mockMvc.perform(patch("/api/admin/ocean/currents/test-admin-current/status")
        .header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"enabled\":false}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.enabled").value(false));

    mockMvc.perform(get("/api/ocean/currents"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data[*].id", not(hasItem("test-admin-current"))));

    mockMvc.perform(get("/api/admin/ocean/currents")
        .header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data[*].id", hasItem("test-admin-current")));

    mockMvc.perform(delete("/api/admin/ocean/currents/test-admin-current")
        .header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk());

    mockMvc.perform(get("/api/admin/ocean/currents")
        .header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data[*].id", not(hasItem("test-admin-current"))));
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
      .andExpect(jsonPath("$.data.user.isAdmin").value(admin))
      .andReturn();
    return JsonTestSupport.read(result, "$.data.token");
  }

  private String newCurrentJson(String id, String name, String nameEn) {
    return String.format("""
      {
        "id": "%s",
        "name": "%s",
        "name_en": "%s",
        "kind": "warm",
        "basin": "测试大洋",
        "system": "测试环流",
        "direction": "沿测试海岸流动",
        "source": "测试暖水",
        "effect": "用于验证管理员可以维护洋流内容。",
        "impactTags": ["测试", "暖流"],
        "textbookNote": "管理员维护测试。",
        "influence": { "center": [12, 34], "radius": 0.12, "role": "warm-moist" },
        "path": [[10, 30], [12, 34], [15, 38]],
        "enabled": true,
        "sortOrder": 90
      }
      """, id, name, nameEn);
  }
}
