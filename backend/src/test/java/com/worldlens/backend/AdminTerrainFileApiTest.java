package com.worldlens.backend;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
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
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
class AdminTerrainFileApiTest {
  @Autowired
  private MockMvc mockMvc;

  @Test
  void onlyAdminsCanManageTerrainFeaturesAndPublicListHidesDisabledItems() throws Exception {
    String userToken = register("terrain_user", false);
    String adminToken = register("terrain_admin", true);

    mockMvc.perform(post("/api/admin/terrain")
        .header("Authorization", "Bearer " + userToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content(terrainJson("forbidden-terrain", "被拒绝地形", true)))
      .andExpect(status().isForbidden());

    mockMvc.perform(post("/api/admin/terrain")
        .header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content(terrainJson("test-rift-valley", "测试裂谷", true)))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.id").value("test-rift-valley"))
      .andExpect(jsonPath("$.data.name").value("测试裂谷"))
      .andExpect(jsonPath("$.data.enabled").value(true))
      .andExpect(jsonPath("$.data.tags[0]").value("板块张裂"));

    mockMvc.perform(put("/api/admin/terrain/test-rift-valley")
        .header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content(terrainJson("ignored-id", "更新后的裂谷", true)))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.id").value("test-rift-valley"))
      .andExpect(jsonPath("$.data.name").value("更新后的裂谷"));

    mockMvc.perform(get("/api/terrain").queryParam("q", "更新后的裂谷"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data[*].id", hasItem("test-rift-valley")));

    mockMvc.perform(patch("/api/admin/terrain/test-rift-valley/status")
        .header("Authorization", "Bearer " + adminToken)
        .contentType(MediaType.APPLICATION_JSON)
        .content("{\"enabled\":false}"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.enabled").value(false));

    mockMvc.perform(get("/api/terrain").queryParam("q", "更新后的裂谷"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data[*].id", not(hasItem("test-rift-valley"))));

    mockMvc.perform(get("/api/admin/terrain")
        .header("Authorization", "Bearer " + adminToken)
        .queryParam("q", "更新后的裂谷"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data[*].id", hasItem("test-rift-valley")));

    mockMvc.perform(delete("/api/admin/terrain/test-rift-valley")
        .header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk());
  }

  @Test
  void adminsCanUploadContentImagesAndUsersCanUploadAvatars() throws Exception {
    String userToken = register("upload_user", false);
    String adminToken = register("upload_admin", true);
    MockMultipartFile image = new MockMultipartFile(
      "file",
      "terrain-cover.png",
      "image/png",
      new byte[] { 1, 2, 3, 4 }
    );

    mockMvc.perform(multipart("/api/admin/files/content-image")
        .file(image)
        .header("Authorization", "Bearer " + userToken))
      .andExpect(status().isForbidden());

    mockMvc.perform(multipart("/api/admin/files/content-image")
        .file(image)
        .header("Authorization", "Bearer " + adminToken))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.url", startsWith("/uploads/content/")))
      .andExpect(jsonPath("$.data.originalName").value("terrain-cover.png"));

    MockMultipartFile avatar = new MockMultipartFile(
      "file",
      "avatar.jpg",
      "image/jpeg",
      new byte[] { 9, 8, 7, 6 }
    );

    mockMvc.perform(multipart("/api/files/avatar")
        .file(avatar)
        .header("Authorization", "Bearer " + userToken))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.url", startsWith("/uploads/avatar/")));
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

  private String terrainJson(String id, String name, boolean enabled) {
    return String.format("""
      {
        "id": "%s",
        "name": "%s",
        "name_en": "Test Rift Valley",
        "type": "rift",
        "type_label": "裂谷",
        "continent": "非洲",
        "region": "东非",
        "country_codes": ["ETH", "KEN", "TZA"],
        "latitude": 2.5,
        "longitude": 37.8,
        "summary": "用于验证管理员维护地形内容。",
        "formation_reason": "板块拉张导致地壳断裂下陷，形成裂谷和湖泊链。",
        "highest_point": "约 2,000 m",
        "length": "约 6,000 km",
        "area": "东非裂谷带",
        "tags": ["板块张裂", "湖泊链", "火山活动"],
        "cover_image": "/images/wiki/terrain/test-rift.jpg",
        "enabled": %s,
        "sortOrder": 88
      }
      """, id, name, enabled);
  }
}
