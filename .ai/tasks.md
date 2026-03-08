# Repo tasks (maintenance and alignment)

This is a short, repo-local TODO list focused on keeping code, docs, and ops configs aligned.

## High priority (drift / correctness)
- Align health checks: `docker-compose.yml` uses `/actuator/health` but the backend does not include actuator (either add actuator or change the healthcheck).
- Align JPA schema strategy: docs claim `ddl-auto=validate` but `backend/src/main/resources/application.properties` currently uses `update`.
- Align AI model defaults: docs + Docker use `llama3.2:3b`, app default is `llama3.2:1b`.
- Fix demo credential mismatch in `docs/ONBOARDING.md` (source of truth is `DataSeeder`).
- Update or clearly mark legacy docs that describe a different stack (`docs/Deployment_Operations_Manual.md`, parts of `docs/Security_Compliance_Document.md`).

## Feature follow-ups
- Groups: decide whether to proceed (schema + entities exist) and add service/controller/OpenAPI/frontend support if yes.

