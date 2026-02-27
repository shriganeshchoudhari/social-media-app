# ConnectHub — Postman API Test Collections

105 API test cases across 6 collections covering the full ConnectHub platform.

## Files

| File | Description | Test Cases |
|------|-------------|-----------|
| `01_Auth.postman_collection.json` | Registration, login, token validation, SQL injection, XSS | 17 |
| `02_User_Management.postman_collection.json` | Profile CRUD, password change, follow lists | 13 |
| `03_Posts_and_Feed.postman_collection.json` | Post lifecycle, pagination, cursor feed, hashtags, mentions | 18 |
| `04_Social_Features.postman_collection.json` | Likes, bookmarks, comments, follow system | 20 |
| `05_Messaging_and_Notifications.postman_collection.json` | Conversations, messages, notifications | 17 |
| `06_Search_Media_Admin.postman_collection.json` | Search, media upload, admin panel | 20 |
| `run_all.sh` | Newman CLI runner — runs all 6 collections | — |

**Environment files** are in `../postman_environments/`:
- `ConnectHub.postman_environment.json` — primary environment (recommended)
- `local.postman_environment.json` — legacy environment

---

## Quick Start — Postman Desktop

1. Import environment: `postman_environments/ConnectHub.postman_environment.json`
2. Select **"ConnectHub - Local Dev"** in the environment dropdown
3. Import all 6 collection files from this folder
4. Run **collection 01 first** — it populates all tokens and user IDs
5. Run collections 02–06 in order

---

## Quick Start — Newman CLI

```bash
# Install Newman (one-time)
npm install -g newman newman-reporter-htmlextra

# Run all collections
chmod +x postman_collections/run_all.sh
./postman_collections/run_all.sh

# Run against staging
STAGING_URL=https://staging.example.com/api/v1 ./postman_collections/run_all.sh --env staging

# Run a single collection manually
newman run postman_collections/01_Auth.postman_collection.json \
  -e postman_environments/local.postman_environment.json \
  --reporters cli,htmlextra \
  --reporter-htmlextra-export report.html
```

---

## Run Order (Important)

Collections **share state** via environment variables. Always run in this order:

```
01 → 02 → 03 → 04 → 05 → 06
```

| Collection 01 sets | Used by |
|---|---|
| `ALICE_TOKEN`, `BOB_TOKEN`, `CHARLIE_TOKEN`, `ADMIN_TOKEN` | All collections |
| `ALICE_ID`, `BOB_ID`, `CHARLIE_ID`, `ADMIN_ID` | 04, 06 |
| Collection 03 sets `ALICE_POST_ID` | 04 (likes, comments, follows) |
| Collection 04 sets follow/notification state | 05 |

---

## Seed Data Required

The test accounts must exist in the database before running. The app's `DataSeeder` creates them automatically on startup:

| Username | Password | Role |
|----------|----------|------|
| alice | Test1234! | USER |
| bob | Test1234! | USER |
| charlie | Test1234! | USER |
| admin | Admin123! | ADMIN |

Bob follows Alice in seed data (required for TC-USER-011).

---

## CI/CD Integration

The GitHub Actions workflow `.github/workflows/postman-tests.yml` runs all 6 collections on every push/PR and uploads HTML + JUnit reports as artifacts.

Set `BASE_URL` in repository secrets for non-local environments.

---

## Coverage Summary

| Domain | ✅ Positive | ❌ Negative | Total |
|--------|------------|------------|-------|
| Authentication | 7 | 10 | 17 |
| User Management | 5 | 8 | 13 |
| Posts & Feed | 10 | 8 | 18 |
| Social Features | 11 | 9 | 20 |
| Messaging & Notifications | 9 | 8 | 17 |
| Search, Media & Admin | 12 | 8 | 20 |
| **Total** | **54** | **51** | **105** |
