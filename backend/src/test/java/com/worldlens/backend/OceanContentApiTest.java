package com.worldlens.backend;

import static org.hamcrest.Matchers.everyItem;
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
class OceanContentApiTest {
  @Autowired
  private MockMvc mockMvc;

  @Test
  void publicCurrentListReturnsSeededOceanCurrentData() throws Exception {
    mockMvc.perform(get("/api/ocean/currents"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.length()").value(greaterThanOrEqualTo(12)))
      .andExpect(jsonPath("$.data[*].id", hasItem("brazil-current")))
      .andExpect(jsonPath("$.data[*].name_en", hasItem("Brazil Current")))
      .andExpect(jsonPath("$.data[0].impactTags.length()").value(greaterThanOrEqualTo(1)))
      .andExpect(jsonPath("$.data[0].path.length()").value(greaterThanOrEqualTo(3)))
      .andExpect(jsonPath("$.data[0].influence.center.length()").value(2));
  }

  @Test
  void currentListCanFilterByKindAndKeyword() throws Exception {
    mockMvc.perform(get("/api/ocean/currents")
        .queryParam("kind", "cold")
        .queryParam("q", "Peru"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.length()").value(greaterThanOrEqualTo(1)))
      .andExpect(jsonPath("$.data[*].kind", everyItem(org.hamcrest.Matchers.is("cold"))))
      .andExpect(jsonPath("$.data[*].id", hasItem("humboldt")));
  }

  @Test
  void currentDetailReturnsOneCurrentOrNotFound() throws Exception {
    mockMvc.perform(get("/api/ocean/currents/brazil-current"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.data.id").value("brazil-current"))
      .andExpect(jsonPath("$.data.name_en").value("Brazil Current"))
      .andExpect(jsonPath("$.data.kind").value("warm"))
      .andExpect(jsonPath("$.data.influence.role").value("warm-moist"))
      .andExpect(jsonPath("$.data.path.length()").value(greaterThanOrEqualTo(3)));

    mockMvc.perform(get("/api/ocean/currents/not-a-current"))
      .andExpect(status().isNotFound())
      .andExpect(jsonPath("$.success").value(false));
  }
}
