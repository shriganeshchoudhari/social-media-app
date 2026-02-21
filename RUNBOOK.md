# Runbook — Setup & Troubleshooting

## Setup (short)
1. Java 21 installed (`java -version`)
2. From repo root:
   - Backend: `cd backend` then `./mvnw.cmd clean install`
   - Frontend: `cd frontend` then `npm install`

## Run
- Dev backend: `./mvnw.cmd spring-boot:run` (uses H2 by default)
- Run packaged JAR on custom port:
  `java -jar target/social-media-backend-1.0.0.jar --server.port=8081`
- Frontend dev: `npm run dev`

## Ports
- Frontend: 5173
- Backend: 8080 (change with `--server.port`)

## Troubleshooting
- Port in use (Windows):
  ```powershell
  netstat -ano | findstr :8080
  taskkill /PID <PID> /F
  ```
- View backend logs (when run with Maven): use the terminal that started it or run JAR in foreground.

## Notes
- Use `spring.profiles.active=h2` for in-memory DB during development.
- JWT secret and DB credentials should be set via environment variables in production.
