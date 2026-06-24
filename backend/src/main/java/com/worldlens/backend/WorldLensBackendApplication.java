package com.worldlens.backend;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan("com.worldlens.backend.mapper")
@SpringBootApplication
public class WorldLensBackendApplication {
  public static void main(String[] args) {
    SpringApplication.run(WorldLensBackendApplication.class, args);
  }
}
