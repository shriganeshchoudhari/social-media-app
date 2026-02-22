---

## Appendix A — Flyway Migration Runbook

### How Flyway Works in This Project

Flyway runs automatically when the backend starts. It scans `classpath:db/migration/` for versioned SQL scripts and applies any that have not yet been executed. The `flyway_schema_history` table in Postgres tracks applied versions.

Hibernate `ddl-auto` is set to `validate` — Hibernate checks the schema matches the entities but never modifies it. Flyway is the single source of truth.

### Adding a New Migration

```
# Create a new file — version must be strictly greater than the last applied version
backend/src/main/resources/db/migration/V2__add_cover_photo.sql
```

Naming convention: `V{version}__{description}.sql` (double underscore, snake_case description).

### Applying Migrations Manually

```bash
cd backend
mvn flyway:migrate -Dflyway.url=jdbc:postgresql://localhost:5432/socialmedia \
                   -Dflyway.user=socialmedia \
                   -Dflyway.password=secret
```

### Checking Migration Status

```bash
mvn flyway:info
```

### Rolling Back (Flyway Community)

Flyway Community does not support automatic rollback. To undo a migration:
1. Write a compensating `V{next}__rollback_description.sql` script
2. Apply it via `mvn flyway:migrate`

### Dev Seed Data

Seed data is managed by `DataSeeder.java` (not Flyway) so it uses the real `PasswordEncoder` and avoids hardcoded bcrypt hashes.

Activate with:
```bash
DB_PASSWORD=secret mvn spring-boot:run -Dspring-boot.run.profiles=postgres,dev
```

Demo users (password `Password1!` for all):

| Username | Email           |
|----------|-----------------|
| alice    | alice@demo.com  |
| bob      | bob@demo.com    |
| carol    | carol@demo.com  |
| dave     | dave@demo.com   |
| eve      | eve@demo.com    |

The seeder is idempotent — re-starting the app with `dev` profile skips seeding if data already exists.

### Test Database

Tests use H2 in-memory database. Flyway is disabled (`spring.flyway.enabled=false` in `application-test.properties`). H2 uses `create-drop` so the schema is recreated from JPA entities for every test run. All integration tests inherit from `BaseIntegrationTest` which wraps each test in a `@Transactional` rollback.
