package com.worldlens.backend;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.blankOrNullString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
class AuthFavoriteFlowTest {
  @Autowired
  private MockMvc mockMvc;

  @Test
  void publicRegistrationCannotGrantAdministratorPrivileges() throws Exception {
    mockMvc.perform(post("/api/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {
            "username": "public_admin_attempt",
            "password": "secret123",
            "nickname": "Public User",
            "isAdmin": true
          }
          """))
      .andExpect(status().isForbidden())
      .andExpect(jsonPath("$.success").value(false));
  }

  @Test
  void userCanRegisterUpdateProfileAndManageFavorites() throws Exception {
    MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {
            "username": "atlas_user",
            "password": "secret123",
            "nickname": "Atlas Pilot",
            "avatarUrl": "https://example.test/avatar.png"
          }
          """))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.token", not(blankOrNullString())))
      .andExpect(jsonPath("$.data.user.username").value("atlas_user"))
      .andExpect(jsonPath("$.data.user.nickname").value("Atlas Pilot"))
      .andExpect(jsonPath("$.data.user.avatarUrl").value("https://example.test/avatar.png"))
      .andReturn();

    String token = JsonTestSupport.read(registerResult, "$.data.token");

    mockMvc.perform(get("/api/auth/me")
        .header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.username").value("atlas_user"));

    mockMvc.perform(put("/api/auth/profile")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {
            "nickname": "Ocean Cartographer",
            "avatarUrl": "https://example.test/new-avatar.jpg"
          }
          """))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.nickname").value("Ocean Cartographer"))
      .andExpect(jsonPath("$.data.avatarUrl").value("https://example.test/new-avatar.jpg"));

    mockMvc.perform(post("/api/favorites")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {
            "itemId": "brazil-current",
            "itemType": "ocean-current",
            "title": "巴西暖流",
            "coverImage": "/images/ocean/brazil-current.jpg",
            "payload": "{\\"kind\\":\\"ocean-current\\"}"
          }
          """))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data", hasSize(1)))
      .andExpect(jsonPath("$.data[0].itemId").value("brazil-current"))
      .andExpect(jsonPath("$.data[0].title").value("巴西暖流"))
      .andExpect(jsonPath("$.data[0].payload").value("{\"kind\":\"ocean-current\"}"));

    mockMvc.perform(get("/api/favorites")
        .header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data", hasSize(1)));

    mockMvc.perform(delete("/api/favorites/brazil-current")
        .header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data", hasSize(0)));
  }

  @Test
  void userCanSyncHistoryAndReadAccountDashboard() throws Exception {
    MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {
            "username": "dashboard_user",
            "password": "secret123",
            "nickname": "Dashboard Pilot",
            "avatarUrl": "data:image/png;base64,avatar"
          }
          """))
      .andExpect(status().isOk())
      .andReturn();

    String token = JsonTestSupport.read(registerResult, "$.data.token");

    mockMvc.perform(post("/api/history")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {
            "itemId": "china",
            "itemType": "place",
            "title": "中国",
            "slug": "china",
            "coverImage": "/images/wiki/country/chn-cover.jpg"
          }
          """))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data", hasSize(1)))
      .andExpect(jsonPath("$.data[0].itemId").value("china"))
      .andExpect(jsonPath("$.data[0].visitedCount").value(1));

    mockMvc.perform(post("/api/history")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {
            "itemId": "kuroshio-current",
            "itemType": "ocean-current",
            "title": "黑潮",
            "slug": "kuroshio-current",
            "coverImage": "/images/ocean/kuroshio.jpg"
          }
          """))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data", hasSize(2)));

    mockMvc.perform(post("/api/favorites")
        .header("Authorization", "Bearer " + token)
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {
            "itemId": "china",
            "itemType": "place",
            "title": "中国",
            "coverImage": "/images/wiki/country/chn-cover.jpg"
          }
          """))
      .andExpect(status().isOk());

    mockMvc.perform(get("/api/account/dashboard")
        .header("Authorization", "Bearer " + token))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.favoriteCount").value(1))
      .andExpect(jsonPath("$.data.historyCount").value(2))
      .andExpect(jsonPath("$.data.recentFavorites", hasSize(1)))
      .andExpect(jsonPath("$.data.recentHistory", hasSize(2)))
      .andExpect(jsonPath("$.data.typeStats", hasSize(2)));
  }
}
