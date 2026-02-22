package com.socialmedia.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Enables Spring's @Async support used by NotificationService.
 * Uses the default SimpleAsyncTaskExecutor unless you configure a custom one.
 */
@Configuration
@EnableAsync
public class AsyncConfig {
}
