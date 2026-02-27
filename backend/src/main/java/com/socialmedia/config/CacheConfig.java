package com.socialmedia.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Redis-backed Spring Cache configuration.
 *
 * Cache names and TTLs:
 *   users         -- User profiles by username         10 minutes
 *   posts         -- Individual post by ID              5 minutes
 *   notif-count   -- Unread notification count/user    60 seconds
 *   trending-tags -- Top hashtags from search           5 minutes
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Value("${spring.cache.redis.time-to-live:600000}")
    private long defaultTtlMs;

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration defaults = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMillis(defaultTtlMs))
                .serializeKeysWith(
                    RedisSerializationContext.SerializationPair.fromSerializer(
                        new StringRedisSerializer()))
                .serializeValuesWith(
                    RedisSerializationContext.SerializationPair.fromSerializer(
                        new GenericJackson2JsonRedisSerializer()))
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        cacheConfigs.put("users",         defaults.entryTtl(Duration.ofMinutes(10)));
        cacheConfigs.put("posts",         defaults.entryTtl(Duration.ofMinutes(5)));
        cacheConfigs.put("notif-count",   defaults.entryTtl(Duration.ofSeconds(60)));
        cacheConfigs.put("trending-tags", defaults.entryTtl(Duration.ofMinutes(5)));

        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaults)
                .withInitialCacheConfigurations(cacheConfigs)
                .transactionAware()
                .build();
    }
}
