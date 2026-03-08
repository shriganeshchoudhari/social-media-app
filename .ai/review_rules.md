# Review rules (quick checklist)

## API and security
- Routes stay under `/api/v1/**` and are reflected in `docs/openapi.yaml`.
- Public routes are explicitly permitted; everything else requires auth.
- Admin endpoints are role-guarded (`@PreAuthorize`) and not reachable by regular users.
- Requests are validated (`@Valid`) and do not accept unexpected fields silently.

## Schema and data
- Any schema change is a new Flyway migration (no edits to old migrations).
- Migration is safe for dev re-runs (idempotent where practical).
- Entities/repositories are consistent with migrations.

## Realtime and streaming
- WebSocket destinations match the frontend subscriptions.
- NDJSON streams remain valid (1 JSON object per line; newline terminated).

## Perf and caching
- Cache keys include enough context (avoid cross-user cache leakage).
- Cache names match `CacheConfig`.

## Tests
- Changes to critical flows (auth, feed, messaging, AI) include test updates or at least a clear manual test note.

