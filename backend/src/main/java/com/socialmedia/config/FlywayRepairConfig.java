package com.socialmedia.config;

/**
 * Flyway repair is now handled via application.properties:
 *   spring.flyway.repair-on-migrate=true
 *
 * FlywayMigrationStrategy and FlywayConfigurationCustomizer were both
 * removed in Spring Boot 4. The property-based approach is the correct
 * replacement and works with Flyway 10+.
 *
 * This file is intentionally left as an empty placeholder so git history
 * shows why the class was removed.
 */
public class FlywayRepairConfig {
    // No beans needed — see application.properties
}
