package com.socialmedia.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration.
 * CORS is handled at the Spring Security level via SecurityConfig.corsConfigurationSource().
 * This class is kept for any additional MVC configuration needed.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS handled in SecurityConfig to ensure it applies before Spring Security filter chain
}
