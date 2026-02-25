# ─────────────────────────────────────────────────────────────────────────────
# ConnectHub Backend — Dockerfile
#
# Multi-stage build:
#   Stage 1 (builder): Maven + JDK 21 — compiles the project and packages the jar
#   Stage 2 (runtime): JRE 21 Alpine — lean final image (~200 MB vs ~600 MB)
#
# Build locally:
#   docker build -t connecthub-backend ./backend
#
# Run locally (without Compose):
#   docker run -p 9090:9090 \
#     -e DB_HOST=host.docker.internal \
#     -e OLLAMA_BASE_URL=http://host.docker.internal:11434 \
#     connecthub-backend
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /build

# Copy dependency descriptors first for better layer caching
COPY pom.xml .
COPY .mvn/ .mvn/
COPY mvnw .

# Pre-download dependencies (cached unless pom.xml changes)
RUN ./mvnw dependency:go-offline -q

# Copy source and build
COPY src/ src/
RUN ./mvnw clean package -DskipTests -q

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

WORKDIR /app

# Create a non-root user for security
RUN addgroup -S connecthub && adduser -S connecthub -G connecthub

# Copy the fat jar from the builder stage
COPY --from=builder /build/target/*.jar app.jar

# Create upload directory with correct ownership
RUN mkdir -p uploads && chown -R connecthub:connecthub /app

USER connecthub

EXPOSE 9090

HEALTHCHECK --interval=20s --timeout=10s --retries=5 --start-period=40s \
  CMD wget -qO- http://localhost:9090/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
