package com.worldlens.backend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.env.MockEnvironment;

class DeepSeekCredentialProviderTest {
  @TempDir
  Path tempDirectory;

  @Test
  void readsDeepSeekKeyFromProjectLocalEnvironmentFile() throws Exception {
    Path localEnvironment = tempDirectory.resolve(".env.local");
    Files.writeString(localEnvironment, """
      # WorldLens private configuration
      DEEPSEEK_API_KEY="sk-test-from-local-file"
      """);

    DeepSeekCredentialProvider provider = new DeepSeekCredentialProvider(
      new MockEnvironment(),
      List.of(localEnvironment)
    );

    assertEquals("sk-test-from-local-file", provider.requireApiKey());
  }

  @Test
  void configuredSpringPropertyTakesPriorityOverLocalFile() throws Exception {
    Path localEnvironment = tempDirectory.resolve(".env.local");
    Files.writeString(localEnvironment, "DEEPSEEK_API_KEY=sk-file");
    MockEnvironment environment = new MockEnvironment()
      .withProperty("deepseek.api-key", "sk-spring");

    DeepSeekCredentialProvider provider = new DeepSeekCredentialProvider(
      environment,
      List.of(localEnvironment)
    );

    assertEquals("sk-spring", provider.requireApiKey());
  }
}
