# Coding rules (repo-specific conventions)

## Backend
- Keep the standard layering: Controller -> Service -> Repository -> Entity.
- Put feature code in its feature package (avoid cross-feature grab-bags).
- Use DTOs for requests/responses; keep entities as persistence concerns.
- Add Bean Validation on request DTOs and use `@Valid` in controllers.
- When changing schema, add a new Flyway migration and keep it safe to re-run (idempotent where reasonable).
- If you add or change an endpoint, update `docs/openapi.yaml` in the same change.

## Frontend
- Route-level pages: `frontend/src/pages/`
- Shared components: `frontend/src/components/`
- API wrappers: `frontend/src/api/` (use `client.js`)
- Redux slices: `frontend/src/store/`
- Realtime: use the shared hook `frontend/src/hooks/useWebSocket.js`

## Docs
- Prefer updating `README.md`, `SETUP_GUIDE.md`, and `docs/openapi.yaml` over legacy narrative docs when behavior changes.

