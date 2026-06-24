package com.worldlens.backend.service;

import com.worldlens.backend.common.AppException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class DeepSeekCredentialProvider {
  private static final String PROPERTY_NAME = "deepseek.api-key";
  private static final String ENVIRONMENT_NAME = "DEEPSEEK_API_KEY";

  private final Environment environment;
  private final List<Path> localConfigurationFiles;

  @Autowired
  public DeepSeekCredentialProvider(Environment environment) {
    this(environment, List.of(
      Path.of(".env.local"),
      Path.of("..", ".env.local"),
      Path.of("backend", ".env.local")
    ));
  }

  DeepSeekCredentialProvider(Environment environment, List<Path> localConfigurationFiles) {
    this.environment = environment;
    this.localConfigurationFiles = localConfigurationFiles;
  }

  public String requireApiKey() {
    return configuredValue()
      .or(this::readLocalConfiguration)
      .orElseThrow(() -> new AppException(
        HttpStatus.SERVICE_UNAVAILABLE,
        "DeepSeek Key 未配置，请在项目根目录的 .env.local 中设置 DEEPSEEK_API_KEY"
      ));
  }

  private Optional<String> configuredValue() {
    return firstNonBlank(
      environment.getProperty(PROPERTY_NAME),
      environment.getProperty(ENVIRONMENT_NAME)
    );
  }

  private Optional<String> readLocalConfiguration() {
    for (Path path : localConfigurationFiles) {
      if (!Files.isRegularFile(path)) {
        continue;
      }
      try {
        for (String line : Files.readAllLines(path)) {
          Optional<String> value = parseEnvironmentLine(line);
          if (value.isPresent()) {
            return value;
          }
        }
      } catch (IOException exception) {
        throw new AppException(
          HttpStatus.SERVICE_UNAVAILABLE,
          "无法读取 DeepSeek 私有配置文件：" + path.toAbsolutePath()
        );
      }
    }
    return Optional.empty();
  }

  private static Optional<String> parseEnvironmentLine(String line) {
    String text = line == null ? "" : line.trim();
    if (text.isEmpty() || text.startsWith("#")) {
      return Optional.empty();
    }
    if (text.startsWith("export ")) {
      text = text.substring("export ".length()).trim();
    }
    int separator = text.indexOf('=');
    if (separator < 1 || !ENVIRONMENT_NAME.equals(text.substring(0, separator).trim())) {
      return Optional.empty();
    }
    return normalize(text.substring(separator + 1));
  }

  private static Optional<String> firstNonBlank(String... values) {
    for (String value : values) {
      Optional<String> normalized = normalize(value);
      if (normalized.isPresent()) {
        return normalized;
      }
    }
    return Optional.empty();
  }

  private static Optional<String> normalize(String value) {
    if (value == null) {
      return Optional.empty();
    }
    String normalized = value.trim();
    if (normalized.length() >= 2) {
      char first = normalized.charAt(0);
      char last = normalized.charAt(normalized.length() - 1);
      if ((first == '"' && last == '"') || (first == '\'' && last == '\'')) {
        normalized = normalized.substring(1, normalized.length() - 1).trim();
      }
    }
    return normalized.isEmpty() ? Optional.empty() : Optional.of(normalized);
  }
}
