# Product Requirements Document (PRD)
## Social Media Clone Application

---

## 1. Executive Summary

### 1.1 Product Overview
A modern, full-featured social media platform built with Spring Boot that enables users to connect, share content, communicate, and build communities. The application will provide core social networking features similar to popular platforms like Twitter, Instagram, and Facebook.

### 1.2 Product Vision
To create a scalable, secure, and user-friendly social media platform that fosters meaningful connections and content sharing with real-time interactions and AI-powered personalization.

### 1.3 Business Objectives
- Launch MVP within 6 months
- Achieve 10,000 active users in the first year
- Maintain 99.9% uptime
- Enable monetization through advertisements and premium features
- Build a scalable platform supporting 100,000+ concurrent users

### 1.4 Success Metrics
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Average session duration (target: 20+ minutes)
- User retention rate (target: 40% after 30 days)
- Posts per user per day (target: 3+)
- User engagement rate (likes, comments, shares)

---

## 2. Target Audience

### 2.1 Primary Users
- **Age Range:** 18-45 years
- **Demographics:** Global audience with internet access
- **Tech Proficiency:** Basic to advanced
- **Use Cases:** Social networking, content sharing, community building

### 2.2 User Personas

**Persona 1: Content Creator (Sarah, 28)**
- Wants to share photos, videos, and thoughts
- Needs analytics to track engagement
- Values creative tools and filters
- Posts daily, high engagement

**Persona 2: Casual User (Mike, 35)**
- Browses feed occasionally
- Engages with friends' content
- Values simplicity and ease of use
- Posts weekly, moderate engagement

**Persona 3: Community Builder (Alex, 42)**
- Creates and manages groups
- Organizes events
- Needs moderation tools
- High activity, focuses on connections

---

## 3. Product Scope

### 3.1 In Scope (MVP - Phase 1)
✅ User authentication and authorization
✅ User profile management
✅ Post creation (text, images)
✅ Post editing (inline editor, author-only; *(edited)* badge on UI)
✅ News feed with basic algorithm
✅ Social interactions (like, comment, share)
✅ Follow/unfollow system
✅ Bookmarks / saved posts (toggle + personal saved-posts page)
✅ Direct messaging (text, real-time via WebSocket/STOMP)
✅ Real-time notifications (WebSocket push + polling fallback)
✅ AI Assistant (Spark) — powered by Ollama, local LLM, no API key required
✅ Search functionality
✅ Hashtags
✅ Privacy settings

### 3.2 Future Phases

**Phase 2 (3-6 months post-MVP):**
- Video uploads and streaming
- Stories (24-hour content)
- Groups and communities
- Advanced search filters
- Mobile applications
- Live streaming

**Phase 3 (6-12 months post-MVP):**
- AI-powered feed recommendations (algorithmic ranking)
- Analytics dashboard
- Monetization features
- AR filters
- E-commerce integration
- Advanced moderation tools

### 3.3 Out of Scope
❌ Native mobile apps (Phase 1)
❌ Blockchain integration
❌ Cryptocurrency payments
❌ VR/AR experiences (Phase 1)

---

## 4. Functional Requirements

### 4.1 User Authentication & Authorization

**FR-1.1: User Registration**
- Users can register using email and password
- Password must meet security requirements (min 8 chars, uppercase, lowercase, number, special char)
- Email verification required before account activation
- Optional: Social login (Google, Facebook, GitHub)

**FR-1.2: User Login**
- Login with email/username and password
- "Remember me" functionality
- Session timeout after 30 days of inactivity
- Multi-device login support

**FR-1.3: Password Management**
- Password reset via email
- Password change from settings
- Two-factor authentication (2FA) optional

**FR-1.4: Authorization**
- Role-based access control (User, Admin, Moderator)
- JWT token-based authentication
- Token refresh mechanism
- OAuth2 integration

### 4.2 User Profile Management

**FR-2.1: Profile Creation & Editing**
- Profile picture upload (max 5MB, jpg/png)
- Cover photo upload (max 10MB)
- Bio/description (max 500 characters)
- Display name and username
- Location, website, birthday
- Privacy settings (public/private profile)

**FR-2.2: Profile Viewing**
- View own profile
- View other users' profiles
- Display posts count, followers, following
- Profile verification badge for verified users

**FR-2.3: Account Settings**
- Change email, password
- Privacy settings
- Notification preferences
- Account deletion
- Data export (GDPR compliance)

### 4.3 Content Creation & Management

**FR-3.1: Post Creation**
- Text posts (max 500 characters for MVP)
- Image uploads (max 4 images, 10MB each)
- Video uploads (Phase 2)
- Hashtag support (#topic)
- Mention support (@username)
- Location tagging
- Privacy settings (public, followers, private)

**FR-3.2: Post Actions**
- Edit posts — inline editor in PostCard; Ctrl+Enter to save, Esc to cancel; 2000-char limit; *(edited)* badge when `updatedAt` differs from `createdAt`
- Delete posts
- Pin posts to profile
- Save drafts
- Schedule posts (Phase 2)

**FR-3.3: Post Visibility**
- Feed posts
- Profile posts
- Hashtag pages
- Search results

### 4.4 Social Interactions

**FR-4.1: Like System**
- Like/unlike posts
- Display like count
- View list of users who liked

**FR-4.2: Comment System**
- Comment on posts
- Reply to comments (nested, max 3 levels)
- Edit/delete own comments
- Like comments
- Sort comments (newest, popular)

**FR-4.3: Share/Repost**
- Share posts to own feed
- Share with custom message
- Share to direct messages
- Share external links

**FR-4.4: Save/Bookmark**
✅ Toggle bookmark via `POST /api/v1/posts/{id}/bookmark` — single endpoint (inserts or removes)
✅ Personal bookmarks page at `/bookmarks` showing saved posts newest-first
✅ Bookmark icon in PostCard fills when saved; state managed in Redux `bookmarksSlice`
- Organize saved posts in named collections (future)

### 4.5 Follow System

**FR-5.1: Follow/Unfollow**
- Follow other users
- Unfollow users
- Display follower/following count
- View followers list
- View following list

**FR-5.2: Follow Requests**
- Send follow request to private accounts
- Accept/reject follow requests
- Pending requests list

**FR-5.3: Blocking & Muting**
- Block users (prevent all interactions)
- Mute users (hide from feed)
- View blocked/muted users list

### 4.6 News Feed

**FR-6.1: Feed Display**
- Personalized feed with followed users' posts
- Infinite scroll pagination
- Pull-to-refresh
- "New posts" indicator

**FR-6.2: Feed Algorithm**
- Chronological sorting (default)
- Algorithmic sorting based on engagement
- Toggle between views

**FR-6.3: Content Filtering**
- Hide posts
- Report inappropriate content
- "Not interested" option

### 4.7 Direct Messaging

**FR-7.1: Conversations**
- One-on-one messaging
- Group messaging (max 50 participants)
- Create new conversation
- Delete conversation

**FR-7.2: Message Features**
- Send text messages
- Send images (max 5 per message)
- Send emojis and GIFs
- Message reactions
- Delete messages (for all/for self)
- Forward messages

**FR-7.3: Real-time Messaging**
- WebSocket implementation
- Online/offline status
- Typing indicators
- Message read receipts
- Push notifications for new messages

### 4.8 Notifications

**FR-8.1: Notification Types**
- New follower
- Post liked
- Post commented
- Mentioned in post
- Message received
- Follow request

**FR-8.2: Notification Delivery**
- In-app notification center
- Push notifications (browser/mobile)
- Email notifications (configurable)

**FR-8.3: Notification Management**
- Mark as read/unread
- Delete notifications
- Notification preferences per type
- Notification grouping

### 4.9 Search & Discovery

**FR-9.1: Search**
- Search users by name/username
- Search posts by keywords
- Search hashtags
- Search filters (date, content type, user)
- Recent searches history

**FR-9.2: Discovery**
- Trending hashtags
- Suggested users to follow
- Popular posts
- "Explore" page

### 4.10 Hashtags

**FR-10.1: Hashtag Functionality**
- Clickable hashtags in posts
- Hashtag pages showing all posts
- Trending hashtags
- Follow hashtags (Phase 2)

### 4.11 Privacy & Security

**FR-11.1: Privacy Controls**
- Profile visibility (public/private)
- Post visibility settings
- Story viewing restrictions (Phase 2)
- Block follower list visibility
- Control who can message
- Control who can mention

**FR-11.2: Security**
- Account activity log
- Active sessions management
- Login alerts
- Suspicious activity detection

### 4.12 Admin Panel

**FR-12.1: User Management**
- View all users
- Search/filter users
- Suspend/ban users
- Verify users
- View user activity

**FR-12.2: Content Moderation**
- Review reported content
- Remove inappropriate content
- Issue warnings
- View moderation queue

**FR-12.3: Analytics**
- User growth metrics
- Engagement metrics
- Content metrics
- System health monitoring

---

## 5. Non-Functional Requirements

### 5.1 Performance

**NFR-1.1: Response Time**
- API response time: < 200ms for 95% of requests
- Page load time: < 2 seconds
- Image loading: Progressive/lazy loading
- Feed loading: < 1 second

**NFR-1.2: Scalability**
- Support 100,000 concurrent users
- Handle 1,000 requests per second
- Horizontal scaling capability
- Auto-scaling based on load

**NFR-1.3: Throughput**
- Process 10,000 posts per hour
- Handle 50,000 messages per minute
- Support 5,000 image uploads per hour

### 5.2 Security

**NFR-2.1: Data Protection**
- HTTPS only (TLS 1.3)
- Data encryption at rest (AES-256)
- Password hashing (bcrypt)
- SQL injection prevention
- XSS protection
- CSRF protection

**NFR-2.2: Authentication**
- JWT token expiration: 24 hours
- Refresh token rotation
- Rate limiting on login attempts (5 attempts/15 min)
- Brute force protection

**NFR-2.3: Compliance**
- GDPR compliance
- COPPA compliance (no users under 13)
- Data retention policies
- Right to be forgotten

### 5.3 Availability & Reliability

**NFR-3.1: Uptime**
- 99.9% uptime SLA
- Maximum planned downtime: 4 hours/month
- Zero-downtime deployments

**NFR-3.2: Backup & Recovery**
- Daily automated backups
- Recovery Time Objective (RTO): < 4 hours
- Recovery Point Objective (RPO): < 1 hour
- Disaster recovery plan

**NFR-3.3: Monitoring**
- Real-time system monitoring
- Error tracking and logging
- Performance monitoring
- Alert system for critical issues

### 5.4 Usability

**NFR-4.1: User Interface**
- Responsive design (mobile, tablet, desktop)
- Intuitive navigation
- Accessibility (WCAG 2.1 Level AA)
- Support for major browsers (Chrome, Firefox, Safari, Edge)

**NFR-4.2: User Experience**
- Onboarding tutorial for new users
- Clear error messages
- Loading indicators
- Smooth animations (< 60fps)

**NFR-4.3: Internationalization**
- Multi-language support (English, Spanish, French, German, Hindi)
- RTL language support
- Timezone handling
- Date/time localization

### 5.5 Maintainability

**NFR-5.1: Code Quality**
- Clean code principles
- Comprehensive documentation
- Unit test coverage: > 80%
- Integration test coverage: > 60%
- Code review process

**NFR-5.2: Architecture**
- Microservices architecture
- Modular design
- API versioning
- Backward compatibility

### 5.6 Compatibility

**NFR-6.1: Browser Support**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**NFR-6.2: Device Support**
- Desktop: Windows, macOS, Linux
- Mobile: iOS 14+, Android 10+
- Tablets: iPad, Android tablets

---

## 6. Technical Architecture

### 6.1 Technology Stack

**Backend:**
- Java 21+
- Spring Boot 4.0.3.x
- Spring Security (JWT + OAuth2)
- Spring Data JPA
- Spring Cloud (Microservices)
- Spring WebSocket (Real-time)
- Hibernate ORM

**Frontend:**
- React.js 18+
- Redux / Redux Toolkit
- React Router
- Axios
- Material-UI / Tailwind CSS
- Socket.io-client

**Database:**
- PostgreSQL 15+ (Primary database)
- Redis 7+ (Caching, sessions)
- Elasticsearch 8+ (Search)
- MongoDB (Optional, for unstructured data)

**Message Queue:**
- Apache Kafka / RabbitMQ

**Storage:**
- AWS S3 / Google Cloud Storage / Cloudinary

**DevOps:**
- Docker & Docker Compose
- Kubernetes
- Jenkins / GitHub Actions (CI/CD)
- Prometheus & Grafana (Monitoring)
- ELK Stack (Logging)

**API:**
- RESTful APIs
- GraphQL (Phase 2)
- WebSocket for real-time features

### 6.2 System Architecture

**Microservices:**
1. **Auth Service** - Authentication, authorization
2. **User Service** - User profiles, settings
3. **Post Service** - Post CRUD operations
4. **Feed Service** - News feed generation
5. **Interaction Service** - Likes, comments, shares
6. **Messaging Service** - Direct messages, chat
7. **Notification Service** - Push notifications, emails
8. **Search Service** - Search functionality
9. **Media Service** - File uploads, processing
10. **Admin Service** - Admin panel, moderation

**API Gateway:**
- Spring Cloud Gateway
- Request routing
- Load balancing
- Rate limiting

**Service Discovery:**
- Eureka / Consul

**Configuration:**
- Spring Cloud Config

### 6.3 Database Schema (Key Entities)

**Users Table:**
- id, username, email, password_hash
- first_name, last_name, bio
- profile_picture_url, cover_photo_url
- is_verified, is_active
- created_at, updated_at

**Posts Table:**
- id, user_id, content, media_urls
- privacy_level, location
- likes_count, comments_count, shares_count
- created_at, updated_at

**Comments Table:**
- id, post_id, user_id, parent_comment_id
- content, likes_count
- created_at, updated_at

**Follows Table:**
- id, follower_id, following_id
- status (pending, accepted)
- created_at

**Messages Table:**
- id, conversation_id, sender_id
- content, media_urls, message_type
- is_read, created_at

**Notifications Table:**
- id, user_id, type, content
- is_read, reference_id
- created_at

### 6.4 Security Implementation

**Authentication Flow:**
1. User submits credentials
2. Server validates credentials
3. Generate JWT access token (24h) + refresh token (30d)
4. Client stores tokens
5. Include access token in API requests
6. Refresh token when expired

**API Rate Limiting:**
- 100 requests/minute per user (general)
- 20 requests/minute for post creation
- 50 requests/minute for messaging
- 200 requests/minute for read operations

### 6.5 Caching Strategy

**Redis Caching:**
- User sessions
- Feed cache (15 minutes TTL)
- Trending hashtags (1 hour TTL)
- User profiles (5 minutes TTL)
- Post data (10 minutes TTL)

**CDN Caching:**
- Static assets (images, CSS, JS)
- User-uploaded media
- Cache invalidation on update

---

## 7. User Interface & Experience

### 7.1 Key Screens

1. **Landing/Login Page**
2. **Registration Page**
3. **Home Feed**
4. **User Profile**
5. **Post Detail**
6. **Messages/Chat**
7. **Notifications**
8. **Search & Explore**
9. **Settings**
10. **Admin Dashboard**

### 7.2 Design Principles

- **Simplicity:** Clean, uncluttered interface
- **Consistency:** Unified design language
- **Responsiveness:** Mobile-first approach
- **Accessibility:** Keyboard navigation, screen reader support
- **Performance:** Fast loading, smooth interactions

### 7.3 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

## 8. API Specifications

### 8.1 API Endpoints (Sample)

**Authentication:**
```
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh-token
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
```

**Users:**
```
GET /api/v1/users/{id}
PUT /api/v1/users/{id}
DELETE /api/v1/users/{id}
GET /api/v1/users/{id}/followers
GET /api/v1/users/{id}/following
POST /api/v1/users/{id}/follow
DELETE /api/v1/users/{id}/unfollow
```

**Posts:**
```
GET /api/v1/posts
POST /api/v1/posts
GET /api/v1/posts/{id}
PUT /api/v1/posts/{id}
DELETE /api/v1/posts/{id}
POST /api/v1/posts/{id}/like
DELETE /api/v1/posts/{id}/unlike
GET /api/v1/posts/{id}/comments
POST /api/v1/posts/{id}/comments
```

**Feed:**
```
GET /api/v1/feed
GET /api/v1/feed/trending
GET /api/v1/feed/explore
```

**Messages:**
```
GET /api/v1/messages/conversations
POST /api/v1/messages/conversations
GET /api/v1/messages/conversations/{id}
POST /api/v1/messages/conversations/{id}/messages
```

**Search:**
```
GET /api/v1/search/users?q={query}
GET /api/v1/search/posts?q={query}
GET /api/v1/search/hashtags?q={query}
```

### 8.2 API Response Format

**Success Response:**
```json
{
  "status": "success",
  "data": {...},
  "message": "Operation successful",
  "timestamp": "2025-02-07T10:30:00Z"
}
```

**Error Response:**
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [...]
  },
  "timestamp": "2025-02-07T10:30:00Z"
}
```

### 8.3 API Documentation

- Swagger/OpenAPI 3.0
- Interactive API explorer
- Code examples in multiple languages
- Postman collection

---

## 9. Testing Strategy

### 9.1 Testing Types

**Unit Testing:**
- JUnit 5
- Mockito
- Target: 80%+ code coverage
- Test all service layer methods

**Integration Testing:**
- Spring Boot Test
- TestContainers (for database)
- Test API endpoints
- Test database interactions

**End-to-End Testing:**
- Selenium / Cypress
- Test critical user flows
- Automated regression testing

**Performance Testing:**
- JMeter / Gatling
- Load testing (1000+ concurrent users)
- Stress testing
- Endurance testing

**Security Testing:**
- OWASP ZAP
- Penetration testing
- Vulnerability scanning
- SQL injection testing

### 9.2 Testing Environments

- **Development:** Local development
- **Testing:** Automated test execution
- **Staging:** Pre-production testing
- **Production:** Live environment

---

## 10. Deployment & DevOps

### 10.1 Deployment Strategy

**CI/CD Pipeline:**
1. Code commit to Git
2. Automated tests run
3. Build Docker images
4. Push to container registry
5. Deploy to staging
6. Manual approval
7. Deploy to production

**Deployment Tools:**
- Jenkins / GitHub Actions
- Docker & Docker Compose
- Kubernetes (Orchestration)
- Helm (Package management)

### 10.2 Infrastructure

**Cloud Provider:**
- AWS / Google Cloud / Azure

**Resources:**
- Application servers (EC2 / Compute Engine)
- Database (RDS / Cloud SQL)
- Cache (ElastiCache / Memorystore)
- Storage (S3 / Cloud Storage)
- Load Balancer (ALB / Cloud Load Balancing)

### 10.3 Monitoring & Logging

**Application Monitoring:**
- Prometheus + Grafana
- Application metrics
- Custom dashboards
- Alert rules

**Logging:**
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Centralized logging
- Log analysis
- Error tracking (Sentry)

**Performance Monitoring:**
- New Relic / Datadog
- APM (Application Performance Monitoring)
- Real user monitoring

---

## 11. Data Management

### 11.1 Data Retention

- Active user data: Indefinite
- Deleted posts: 30 days (soft delete)
- Inactive accounts: 2 years
- Logs: 90 days
- Backups: 30 days

### 11.2 Data Privacy

- User consent for data collection
- Data encryption (at rest and in transit)
- Anonymization for analytics
- Data export functionality
- Right to deletion (GDPR)

### 11.3 Backup Strategy

- Automated daily backups
- Incremental backups every 6 hours
- Geographic redundancy
- Backup verification
- Disaster recovery drills

---

## 12. Launch Plan

### 12.1 MVP Timeline (6 Months)

**Month 1-2: Foundation**
- Architecture design
- Database schema
- Authentication system
- User management
- Basic profile functionality

**Month 3-4: Core Features**
- Post creation and management
- Feed implementation
- Social interactions (like, comment)
- Follow system
- Basic notifications

**Month 5: Advanced Features**
- Direct messaging
- Search functionality
- Hashtags
- Privacy settings
- Admin panel

**Month 6: Testing & Launch**
- Comprehensive testing
- Bug fixes
- Performance optimization
- Beta testing
- Production deployment

### 12.2 Beta Testing

**Closed Beta:**
- 100 selected users
- 2 weeks duration
- Focused feedback collection
- Bug reporting

**Open Beta:**
- 1,000+ users
- 4 weeks duration
- Public sign-up
- Feature validation

### 12.3 Launch Checklist

- [ ] All MVP features implemented
- [ ] Security audit completed
- [ ] Performance testing passed
- [ ] Load testing completed
- [ ] Documentation finalized
- [ ] Support team trained
- [ ] Monitoring systems active
- [ ] Backup systems verified
- [ ] Legal compliance confirmed
- [ ] Marketing materials ready

---

## 13. Risk Management

### 13.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Scalability issues | High | Medium | Load testing, auto-scaling, microservices |
| Security breaches | Critical | Low | Security audits, penetration testing, encryption |
| Data loss | Critical | Low | Regular backups, redundancy, disaster recovery |
| Third-party API failures | Medium | Medium | Fallback mechanisms, caching, monitoring |
| Performance degradation | High | Medium | Caching, CDN, database optimization |

### 13.2 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low user adoption | High | Medium | Marketing, user research, MVP validation |
| Competitive pressure | Medium | High | Unique features, community building |
| Regulatory changes | Medium | Low | Legal compliance team, flexibility |
| Budget overrun | High | Medium | Phased approach, cost monitoring |

---

## 14. Success Criteria

### 14.1 MVP Success Metrics

**User Acquisition:**
- 5,000 registered users in first month
- 10,000 registered users in first 3 months

**Engagement:**
- 30% DAU/MAU ratio
- Average 5 posts per user per week
- 20+ minute average session duration

**Technical:**
- 99% uptime
- < 2 second page load time
- < 5% error rate

**Business:**
- User satisfaction score > 4/5
- < 10% churn rate
- Positive user feedback

### 14.2 Post-MVP Goals

**6 Months Post-Launch:**
- 50,000 registered users
- Video content support
- Mobile apps launched
- Revenue generation started

**12 Months Post-Launch:**
- 200,000 registered users
- Advanced AI features
- International expansion
- Profitability achieved

---

## 15. Budget & Resources

### 15.1 Team Structure

**Development Team:**
- 2 Backend Developers (Spring Boot)
- 2 Frontend Developers (React)
- 1 DevOps Engineer
- 1 UI/UX Designer
- 1 QA Engineer
- 1 Product Manager

**Support Team:**
- 1 Community Manager
- 1 Content Moderator

### 15.2 Infrastructure Costs (Monthly Estimates)

- Cloud hosting: $500-1,000
- Database: $200-500
- Storage (S3/CDN): $100-300
- Email service: $50-100
- Monitoring tools: $100-200
- Third-party APIs: $100-200
- **Total: ~$1,050-2,300/month**

### 15.3 Development Costs

- 6-month development: $150,000-250,000
- Design & UX: $20,000-40,000
- Testing & QA: $15,000-30,000
- Marketing & Launch: $30,000-50,000
- **Total Initial Investment: ~$215,000-370,000**

---

## 16. Appendix

### 16.1 Glossary

- **DAU:** Daily Active Users
- **MAU:** Monthly Active Users
- **MVP:** Minimum Viable Product
- **API:** Application Programming Interface
- **JWT:** JSON Web Token
- **CDN:** Content Delivery Network
- **GDPR:** General Data Protection Regulation
- **SLA:** Service Level Agreement

### 16.2 References

- Spring Boot Documentation: https://spring.io/projects/spring-boot
- React Documentation: https://react.dev
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- OWASP Security Guidelines: https://owasp.org
- WCAG Accessibility Standards: https://www.w3.org/WAI/WCAG21/quickref/

### 16.3 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-02-07 | Product Team | Initial PRD creation |
| 1.1 | 2026-02-21 | Engineering | Added AI Assistant (Spark/Ollama) — moved to Phase 1 implemented |
| 1.2 | 2026-02-24 | Engineering | Added post editing, bookmarks, real-time messaging & notifications |
| 1.3 | 2026-02-25 | Engineering | Updated scope table, FR-3.2, FR-4.4; moved AI from Phase 3 to Phase 1 |

---

## 17. Approval

**Prepared by:** Product Team  
**Review Date:** 2026-02-25  
**Next Review:** 2026-03-25

**Approvals Required:**
- [ ] Product Manager
- [ ] Technical Lead
- [ ] CTO/Engineering Director
- [ ] Business Stakeholders

---

*This document is confidential and proprietary. Distribution is limited to authorized personnel only.*

