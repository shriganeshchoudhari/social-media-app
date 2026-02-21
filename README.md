# Social Media Clone

A compact full-stack social media application (Spring Boot backend, React frontend).

## Quick Start

### Prerequisites
- Java 21+, Maven, Node.js 18+

### Backend (H2 default)
```powershell
cd backend
./mvnw.cmd clean install
./mvnw.cmd spring-boot:run
```
Runs on: http://localhost:8080

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on: http://localhost:5173

### Demo credentials
- Email: john@example.com
- Password: Password123!

## Helpful commands
- Build backend JAR: `mvnw.cmd clean package`
- Run JAR on custom port: `java -jar target/social-media-backend-1.0.0.jar --server.port=8081`

For more details see `RUNBOOK.md`.
