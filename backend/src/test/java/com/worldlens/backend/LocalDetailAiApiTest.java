package com.worldlens.backend;

import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.worldlens.backend.service.OllamaClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class LocalDetailAiApiTest {
  @Autowired
  private MockMvc mockMvc;

  @MockitoBean
  private OllamaClient ollamaClient;

  @Test
  void detailChatUsesLocalQwenModelAndCurrentPageContextWithoutLogin() throws Exception {
    when(ollamaClient.chat(eq("qwen2:7b"), contains("喜马拉雅山脉"), contains("为什么还在升高")))
      .thenReturn("喜马拉雅山脉仍在升高，主要因为印度板块继续向欧亚板块挤压。");

    mockMvc.perform(post("/api/local-ai/detail-chat")
        .contentType(MediaType.APPLICATION_JSON)
        .content("""
          {
            "subjectType": "terrain",
            "subjectId": "himalayas",
            "subjectName": "喜马拉雅山脉",
            "context": {
              "region": "亚洲南部",
              "formationReason": "印度板块与欧亚板块碰撞形成"
            },
            "messages": [
              {
                "role": "assistant",
                "content": "你可以问我这处地形的形成、气候或人类活动。"
              },
              {
                "role": "user",
                "content": "为什么还在升高？"
              }
            ]
          }
          """))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.success").value(true))
      .andExpect(jsonPath("$.data.answer").value("喜马拉雅山脉仍在升高，主要因为印度板块继续向欧亚板块挤压。"))
      .andExpect(jsonPath("$.data.model").value("qwen2:7b"))
      .andExpect(jsonPath("$.data.provider").value("ollama"));

    verify(ollamaClient).chat(eq("qwen2:7b"), contains("印度板块与欧亚板块碰撞形成"), contains("为什么还在升高"));
  }
}
