package com.worldlens.backend;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
class AdminSummaryApiTest {
  @Autowired
  private MockMvc mockMvc;

  @Test
  void onlyAdminsCanReadBackendSummary() throws Exception {
    String userToken = register("summary_user", false);
    String adminToken = register("summary_admin", true);

    mockMvc.perform(get("/api/admin/summary")
        .header("Authorization", "Bearer " + userToken))
      .andExpect(status().isForbidden())
      .andExpect(jsonPath("$.success").value(false));

    mockMvc.perform(get("/api/admin/summary")
        .header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.totalUsers", greaterThanOrEqualTo(2)))
      .andExpect(jsonPath("$.data.adminUsers", greaterThanOrEqualTo(1)))
      .andExpect(jsonPath("$.data.countryCount", greaterThanOrEqualTo(200)))
      .andExpect(jsonPath("$.data.oceanCurrentCount", greaterThanOrEqualTo(10)))
      .andExpect(jsonPath("$.data.terrainFeatureCount", greaterThanOrEqualTo(10)))
      .andExpect(jsonPath("$.data.contentEntryCount", greaterThanOrEqualTo(10)))
      .andExpect(jsonPath("$.data.modules[*].id", hasItem("countries")))
      .andExpect(jsonPath("$.data.modules[*].id", hasItem("ocean")))
      .andExpect(jsonPath("$.data.modules[*].id", hasItem("terrain")))
      .andExpect(jsonPath("$.data.modules[*].id", hasItem("dynamics")))
      .andExpect(jsonPath("$.data.modules[*].id", hasItem("seasonal")));
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
}
