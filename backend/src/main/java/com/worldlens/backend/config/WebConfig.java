package com.worldlens.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class WebConfig implements WebMvcConfigurer {
  private final AuthInterceptor authInterceptor;
  private final Path uploadRoot;

  public WebConfig(AuthInterceptor authInterceptor, @Value("${worldlens.upload.root:./uploads}") String uploadRoot) {
    this.authInterceptor = authInterceptor;
    this.uploadRoot = Path.of(uploadRoot).toAbsolutePath().normalize();
  }

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(authInterceptor)
      .addPathPatterns("/api/**")
      .excludePathPatterns(
        "/api/health",
        "/api/ocean/**",
        "/api/terrain/**",
        "/api/countries/**",
        "/api/civilization/**",
        "/api/content/**",
        "/api/ai/**",
        "/api/local-ai/**",
        "/api/auth/register",
        "/api/auth/login",
        "/h2-console/**"
      );
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    String location = uploadRoot.toUri().toString();
    if (!location.endsWith("/")) {
      location += "/";
    }
    registry.addResourceHandler("/uploads/**").addResourceLocations(location);
  }

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
      .allowedOriginPatterns("*")
      .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
      .allowedHeaders("*")
      .exposedHeaders("Authorization");
  }
}
