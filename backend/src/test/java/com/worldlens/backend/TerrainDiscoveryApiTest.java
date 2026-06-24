package com.worldlens.backend;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class TerrainDiscoveryApiTest {
  @Autowired
  private MockMvc mockMvc;

  @Test
  void publicTerrainLibraryIncludesBroaderSeedData() throws Exception {
    mockMvc.perform(get("/api/terrain"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.length()").value(greaterThanOrEqualTo(8)))
      .andExpect(jsonPath("$.data[*].id", hasItem("himalayas")))
      .andExpect(jsonPath("$.data[*].id", hasItem("andes")))
      .andExpect(jsonPath("$.data[*].id", hasItem("east-african-rift")))
      .andExpect(jsonPath("$.data[*].id", hasItem("great-barrier-reef")));
  }

  @Test
  void terrainDiscoveryEndpointsSupportTypesFeaturedAndRelated() throws Exception {
    mockMvc.perform(get("/api/terrain/types"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.length()").value(greaterThanOrEqualTo(6)))
      .andExpect(jsonPath("$.data[*].code", hasItem("mountain")))
      .andExpect(jsonPath("$.data[*].code", hasItem("trench")));

    mockMvc.perform(get("/api/terrain/featured"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.length()").value(greaterThanOrEqualTo(4)))
      .andExpect(jsonPath("$.data[*].id", hasItem("himalayas")));

    mockMvc.perform(get("/api/terrain/himalayas/related"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.length()").value(greaterThanOrEqualTo(2)));
  }
}
