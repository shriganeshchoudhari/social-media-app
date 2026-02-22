# Technical Design Document (TDD)
## Social Media Clone Application

**Version:** 1.0 | **Date:** February 07, 2026 | **Status:** Active

---

## 1. SYSTEM ARCHITECTURE

### 1.1 Architecture Overview
**Pattern:** Microservices Architecture with Event-Driven Communication

**Core Components:**
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                  Client Layer                         â”‚
â”‚  Web App (React) â”‚ Mobile Apps â”‚ Third-Party Clients â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                     â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚            API Gateway (Port 8080)                    â”‚
â”‚  Authentication â”‚ Rate Limiting â”‚ Load Balancing     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                     â”‚
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚  Service Discovery      â”‚
        â”‚  (Eureka - Port 8761)   â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                     â”‚
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚        Microservices Layer         â”‚
    â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
    â”‚ Auth(8081) â”‚ User(8082) â”‚ Post(8083)â”‚
    â”‚ Feed(8084) â”‚ Message(8085) â”‚ etc   â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                     â”‚
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚         Data Layer                  â”‚
    â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
    â”‚ PostgreSQL â”‚ Redis â”‚ Elasticsearch â”‚
    â”‚ Kafka â”‚ S3/Cloud Storage            â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 1.2 Microservices

| Service | Port | Database | Responsibility |
|---------|------|----------|----------------|
| **Auth Service** | 8081 | PostgreSQL | Authentication, JWT, OAuth2 |
| **User Service** | 8082 | PostgreSQL + Redis | Profiles, follows, settings |
| **Post Service** | 8083 | PostgreSQL + Redis | Posts, media, hashtags |
| **Feed Service** | 8084 | Redis + Kafka | News feed, trending |
| **Interaction Service** | 8085 | PostgreSQL | Likes, comments, shares |
| **Messaging Service** | 8086 | PostgreSQL + WebSocket | Chat, DMs |
| **Notification Service** | 8087 | PostgreSQL + Firebase | Notifications |
| **Search Service** | 8088 | Elasticsearch | Search, discovery |
| **Media Service** | 8089 | S3 + PostgreSQL | Upload, processing |
| **Admin Service** | 8090 | PostgreSQL | Moderation, analytics |

---

## 2. DATABASE DESIGN

### 2.1 PostgreSQL Schema

#### Core Tables:

**users**
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    bio TEXT,
    profile_picture_url VARCHAR(500),
    cover_photo_url VARCHAR(500),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
```

**posts**
```sql
CREATE TABLE posts (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (LENGTH(content) <= 5000),
    privacy_level VARCHAR(20) DEFAULT 'public',
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

**follows**
```sql
CREATE TABLE follows (
    id BIGSERIAL PRIMARY KEY,
    follower_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    following_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'accepted',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

**likes, comments, messages** (see full schema in Database Document)

### 2.2 Redis Cache Strategy
```
Format: key â†’ value (TTL)

user:{id} â†’ UserDTO (5min)
post:{id} â†’ PostDTO (10min)
feed:{userId} â†’ List<PostDTO> (15min)
session:{sessionId} â†’ SessionData (30days)
trending:hashtags â†’ SortedSet (1hour)
ratelimit:{userId}:{endpoint} â†’ count (1min)
```

### 2.3 Elasticsearch Indexes
```json
{
  "users": {
    "id": "long",
    "username": "keyword",
    "display_name": "text",
    "bio": "text",
    "follower_count": "integer"
  },
  "posts": {
    "id": "long",
    "content": "text",
    "hashtags": "keyword[]",
    "engagement_score": "float",
    "created_at": "date"
  }
}
```

---

## 3. API DESIGN

### 3.1 RESTful API Standards

**Base URL**: `https://api.connecthub.com/api/v1`

**Authentication**: JWT Bearer Token
```
Authorization: Bearer <token>
```

**Response Format**:
```json
{
  "status": "success|error",
  "data": {},
  "message": "string",
  "timestamp": "ISO8601"
}
```

### 3.2 Key Endpoints

**Authentication** (`/auth`)
```
POST   /auth/register          - User registration
POST   /auth/login             - User login
POST   /auth/logout            - User logout
POST   /auth/refresh-token     - Refresh JWT
POST   /auth/forgot-password   - Password reset request
POST   /auth/reset-password    - Password reset
```

**Users** (`/users`)
```
GET    /users/{id}             - Get user profile
PUT    /users/{id}             - Update profile
GET    /users/{id}/followers   - Get followers
GET    /users/{id}/following   - Get following
POST   /users/{id}/follow      - Follow user
DELETE /users/{id}/unfollow    - Unfollow user
```

**Posts** (`/posts`)
```
GET    /posts                  - Get feed posts
POST   /posts                  - Create post
GET    /posts/{id}             - Get post
PUT    /posts/{id}             - Update post
DELETE /posts/{id}             - Delete post
POST   /posts/{id}/like        - Like post
DELETE /posts/{id}/unlike      - Unlike post
GET    /posts/{id}/comments    - Get comments
POST   /posts/{id}/comments    - Add comment
```

**Feed** (`/feed`)
```
GET    /feed                   - Personalized feed
GET    /feed/trending          - Trending posts
GET    /feed/explore           - Explore page
```

**Messages** (`/messages`)
```
GET    /conversations          - Get all conversations
POST   /conversations          - Create conversation
GET    /conversations/{id}/messages - Get messages
POST   /conversations/{id}/messages - Send message
```

**Search** (`/search`)
```
GET    /search/users?q=        - Search users
GET    /search/posts?q=        - Search posts
GET    /search/hashtags?q=     - Search hashtags
```

### 3.3 WebSocket Endpoints

**Base**: `wss://ws.connecthub.com`

```
/ws/connect                     - Connect
/topic/chat/{conversationId}    - Subscribe to chat
/app/send-message               - Send message
/app/typing                     - Typing indicator
```

### 3.4 Rate Limits
```
General Read:    200 req/min/user
General Write:    20 req/min/user
Search:           30 req/min/user
Anonymous:        10 req/min/IP
```

---

## 4. SECURITY ARCHITECTURE

### 4.1 Authentication Flow
```
1. User â†’ POST /auth/login {email, password}
2. Server â†’ Validate credentials
3. Server â†’ Generate JWT (access + refresh tokens)
4. Server â†’ Return tokens
5. Client â†’ Store tokens (httpOnly cookie)
6. Client â†’ Include in subsequent requests
```

**JWT Structure**:
```json
{
  "sub": "user_id",
  "username": "john_doe",
  "roles": ["USER"],
  "iat": 1706400000,
  "exp": 1706486400
}
```

### 4.2 Security Measures

**Data Protection**:
- HTTPS/TLS 1.3 only
- bcrypt password hashing (cost: 12)
- AES-256 encryption at rest
- End-to-end encryption for messages

**API Security**:
- JWT token validation
- Role-based access control (RBAC)
- Input validation & sanitization
- SQL injection prevention (PreparedStatements)
- XSS protection (Content Security Policy)
- CSRF tokens for state-changing operations

**Rate Limiting**:
- Token bucket algorithm
- Per-user and per-IP limits
- Distributed rate limiting (Redis)

### 4.3 OAuth2 Integration

**Supported Providers**: Google, GitHub, Facebook

**Flow**: Authorization Code with PKCE
```
1. Client â†’ Redirect to OAuth provider
2. User â†’ Authorize app
3. Provider â†’ Return auth code
4. Server â†’ Exchange code for tokens
5. Server â†’ Fetch user info
6. Server â†’ Create/link account
7. Server â†’ Return JWT
```

---

## 5. PERFORMANCE & SCALABILITY

### 5.1 Caching Strategy

**Layer 1 - Application Cache (Redis)**
- User profiles: 5 min TTL
- Feed data: 15 min TTL
- Post data: 10 min TTL
- Trending: 1 hour TTL

**Layer 2 - CDN Cache**
- Static assets: 1 year
- User media: 1 month
- Profile images: 1 week

**Cache Invalidation**:
```
- On update: Delete specific cache keys
- On post creation: Invalidate author's profile, followers' feeds
- On user update: Invalidate user cache
- Lazy invalidation for low-priority data
```

### 5.2 Database Optimization

**Indexing Strategy**:
```sql
-- Frequently queried columns
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);
CREATE INDEX idx_follows_composite ON follows(follower_id, following_id);

-- Full-text search
CREATE INDEX idx_posts_content_gin ON posts USING GIN(to_tsvector('english', content));
```

**Connection Pooling**:
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
```

**Query Optimization**:
- Use JPA projections for partial data
- Implement pagination (default: 20 items/page)
- Avoid N+1 queries (@EntityGraph)
- Use database views for complex queries

### 5.3 Horizontal Scaling

**Stateless Services**:
- All services are stateless
- Session data in Redis
- Load balancing via API Gateway

**Auto-Scaling**:
```yaml
Kubernetes HPA:
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80
```

**Database Scaling**:
- Read replicas for read-heavy operations
- Sharding strategy (by user_id % 4)
- Connection pooling

### 5.4 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time (P95) | < 200ms | Prometheus |
| Page Load Time | < 2s | Browser metrics |
| Feed Load Time | < 1s | Custom timing |
| Search Response | < 300ms | Elasticsearch |
| WebSocket Latency | < 100ms | Custom metrics |
| Database Query (P95) | < 50ms | Slow query log |

---

## 6. MESSAGE QUEUE (KAFKA)

### 6.1 Topics

| Topic | Partitions | Replication | Purpose |
|-------|------------|-------------|---------|
| user-events | 4 | 3 | User actions |
| post-events | 4 | 3 | Post actions |
| notification-events | 4 | 3 | Notifications |
| message-events | 4 | 3 | Chat messages |

### 6.2 Event Schema

**PostCreatedEvent**:
```json
{
  "eventId": "uuid",
  "eventType": "POST_CREATED",
  "timestamp": "ISO8601",
  "data": {
    "postId": 123,
    "userId": 456,
    "content": "Hello",
    "hashtags": ["tech"],
    "mentions": [789]
  }
}
```

**UserFollowedEvent**:
```json
{
  "eventId": "uuid",
  "eventType": "USER_FOLLOWED",
  "timestamp": "ISO8601",
  "data": {
    "followerId": 123,
    "followingId": 456
  }
}
```

### 6.3 Event Processing
```
Producer (Post Service) 
  â†’ Kafka Topic (post-events)
  â†’ Consumer 1 (Feed Service) - Update feeds
  â†’ Consumer 2 (Notification Service) - Send notifications
  â†’ Consumer 3 (Search Service) - Index post
```

---

## 7. DEPLOYMENT ARCHITECTURE

### 7.1 Container Strategy

**Docker Images**:
```dockerfile
# Base image for all services
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Docker Compose (Development)**:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: social_media
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
  
  auth-service:
    build: ./auth-service
    ports:
      - "8081:8081"
    depends_on:
      - postgres
      - redis
```

### 7.2 Kubernetes Deployment

**Service Deployment**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: connecthub/user-service:latest
        ports:
        - containerPort: 8082
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "prod"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

### 7.3 CI/CD Pipeline

```
1. Code Commit (GitHub)
   â†“
2. Trigger Pipeline (GitHub Actions)
   â†“
3. Build & Test
   - mvn clean test
   - Code coverage check (>80%)
   â†“
4. Build Docker Image
   - docker build -t service:version
   â†“
5. Push to Registry
   - docker push to DockerHub/ECR
   â†“
6. Deploy to Staging
   - kubectl apply -f staging/
   â†“
7. Integration Tests
   - Selenium, API tests
   â†“
8. Manual Approval
   â†“
9. Deploy to Production
   - kubectl apply -f prod/
   â†“
10. Health Checks & Monitoring
```

---

## 8. MONITORING & OBSERVABILITY

### 8.1 Metrics (Prometheus + Grafana)

**Application Metrics**:
```
- Request count by endpoint
- Response time (P50, P95, P99)
- Error rate by service
- Active connections
- Cache hit/miss ratio
- Database connection pool usage
```

**Business Metrics**:
```
- User registrations/hour
- Posts created/hour
- Messages sent/hour
- Active users (real-time)
```

**Infrastructure Metrics**:
```
- CPU usage per pod
- Memory usage per pod
- Network I/O
- Disk usage
```

### 8.2 Logging (ELK Stack)

**Log Format** (JSON):
```json
{
  "timestamp": "2026-02-07T10:30:00Z",
  "level": "INFO",
  "service": "user-service",
  "traceId": "abc123",
  "userId": "456",
  "message": "User profile updated",
  "duration": 45
}
```

**Log Levels**:
- ERROR: System failures, exceptions
- WARN: Degraded performance, retries
- INFO: Business events, API calls
- DEBUG: Detailed debugging (dev only)

### 8.3 Distributed Tracing (Jaeger)

**Trace Context**:
```
Request arrives â†’ Generate trace ID
  â†’ Pass to all downstream services
  â†’ Aggregate in Jaeger
  â†’ Visualize call graph
```

### 8.4 Alerting

**Critical Alerts** (PagerDuty):
- Service down > 2 minutes
- Error rate > 5%
- Response time > 1s (P95)
- Database connection failures

**Warning Alerts** (Slack):
- CPU > 80%
- Memory > 85%
- Disk > 90%
- Cache hit rate < 70%

---

## 9. TECHNOLOGY STACK DETAILS

### 9.1 Backend

**Framework**: Spring Boot 4.0.3.x
```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.2</version>
</parent>
```

**Key Dependencies**:
```xml
<!-- Web & REST -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.12.3</version>
</dependency>

<!-- Database -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>

<!-- Redis -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>

<!-- Kafka -->
<dependency>
    <groupId>org.springframework.kafka</groupId>
    <artifactId>spring-kafka</artifactId>
</dependency>

<!-- WebSocket -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

<!-- Cloud -->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-gateway</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

### 9.2 Frontend

**Framework**: React 18.x
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "redux": "^5.0.0",
    "@reduxjs/toolkit": "^2.0.1",
    "axios": "^1.6.2",
    "socket.io-client": "^4.6.0",
    "tailwindcss": "^3.4.0"
  }
}
```

### 9.3 DevOps Tools

- **Version Control**: Git, GitHub
- **CI/CD**: GitHub Actions, Jenkins
- **Containerization**: Docker, Docker Compose
- **Orchestration**: Kubernetes, Helm
- **Monitoring**: Prometheus, Grafana
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Tracing**: Jaeger
- **Cloud**: AWS / Google Cloud / Azure

---

## 10. APPENDICES

### 10.1 Design Patterns Used

- **Microservices**: Service decomposition
- **API Gateway**: Single entry point
- **Circuit Breaker**: Fault tolerance (Resilience4j)
- **CQRS**: Command Query Responsibility Segregation
- **Event Sourcing**: Event-driven architecture
- **Repository**: Data access abstraction
- **DTO**: Data transfer objects
- **Builder**: Object construction

### 10.2 Code Quality Standards

- **Code Coverage**: > 80% unit tests
- **Code Style**: Google Java Style Guide
- **Static Analysis**: SonarQube
- **Security Scanning**: OWASP Dependency Check
- **Code Review**: Required for all PRs

### 10.3 References

- Spring Boot Docs: https://spring.io/projects/spring-boot
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Redis Docs: https://redis.io/docs/
- Kubernetes Docs: https://kubernetes.io/docs/
- Docker Docs: https://docs.docker.com/

---

**Document Owner**: Technical Lead  
**Last Review**: February 07, 2026  
**Next Review**: March 07, 2026

