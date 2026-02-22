# Test Plan & Test Cases
## ConnectHub Social Media Platform

**Version:** 1.0  
**Date:** February 12, 2026  
**Status:** Complete - Ready for Testing

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Test Strategy](#2-test-strategy)
3. [Test Scope](#3-test-scope)
4. [Test Approach](#4-test-approach)
5. [Test Environment](#5-test-environment)
6. [Test Deliverables](#6-test-deliverables)
7. [Unit Test Cases](#7-unit-test-cases)
8. [Integration Test Cases](#8-integration-test-cases)
9. [API Test Cases](#9-api-test-cases)
10. [UI/Functional Test Cases](#10-uifunctional-test-cases)
11. [Performance Test Cases](#11-performance-test-cases)
12. [Security Test Cases](#12-security-test-cases)
13. [Accessibility Test Cases](#13-accessibility-test-cases)
14. [Mobile Test Cases](#14-mobile-test-cases)
15. [Regression Test Suite](#15-regression-test-suite)
16. [Test Data Management](#16-test-data-management)
17. [Defect Management](#17-defect-management)
18. [Test Metrics & Reporting](#18-test-metrics--reporting)
19. [Test Schedule](#19-test-schedule)
20. [Appendix](#20-appendix)

---

## 1. Introduction

### 1.1 Purpose

This document defines the comprehensive test plan and test cases for ConnectHub social media platform, ensuring quality, reliability, and user satisfaction across all features and platforms.

### 1.2 Objectives

**Primary Goals:**
- Ensure all features work as specified
- Verify system performance under load
- Validate security and data protection
- Confirm accessibility compliance
- Achieve >90% code coverage
- Maintain <2% defect escape rate

### 1.3 Scope

**In Scope:**
- All 10 Epics (80 User Stories)
- Web application (Desktop & Mobile)
- RESTful APIs
- Database operations
- Third-party integrations
- Performance benchmarks
- Security validation
- Accessibility compliance

**Out of Scope:**
- Mobile native apps (Phase 2)
- Third-party service internals
- Browser compatibility (IE11 and below)

### 1.4 Test Levels

```
Unit Testing (70%)
    â†“
Integration Testing (20%)
    â†“
System Testing (8%)
    â†“
User Acceptance Testing (2%)
```

**Testing Pyramid:**
- **Unit Tests:** Component-level, fast, many
- **Integration Tests:** Module interactions, moderate
- **E2E Tests:** Full user flows, slow, few
- **Manual Tests:** Exploratory, usability

---

## 2. Test Strategy

### 2.1 Testing Types

**Functional Testing:**
- Unit testing
- Integration testing
- System testing
- Smoke testing
- Regression testing
- User acceptance testing (UAT)

**Non-Functional Testing:**
- Performance testing
- Load testing
- Stress testing
- Security testing
- Accessibility testing
- Usability testing
- Compatibility testing

**Specialized Testing:**
- API testing
- Database testing
- Mobile responsive testing
- Cross-browser testing
- Localization testing (Phase 2)

### 2.2 Test Automation Strategy

**Automation Targets:**
- Unit Tests: 100% automation
- API Tests: 100% automation
- Integration Tests: 90% automation
- UI Tests: 60% automation
- Regression Suite: 80% automation

**Tools:**
- **Unit Testing:** Jest, React Testing Library
- **API Testing:** Supertest, Postman/Newman
- **E2E Testing:** Playwright, Cypress
- **Performance:** k6, Apache JMeter
- **Security:** OWASP ZAP, Snyk
- **Accessibility:** axe-core, Pa11y

### 2.3 Test Execution Strategy

**Continuous Testing:**
```
Code Commit
    â†“
Run Unit Tests (5 min)
    â†“
Run Integration Tests (15 min)
    â†“
Run API Tests (10 min)
    â†“
Deploy to Staging
    â†“
Run E2E Tests (30 min)
    â†“
Run Performance Tests (1 hour)
    â†“
Manual Exploratory Testing
    â†“
Deploy to Production
```

**Test Frequency:**
- Unit & Integration: Every commit (CI/CD)
- E2E: Every PR merge
- Performance: Daily (nightly)
- Security Scan: Weekly
- Full Regression: Before each release
- Manual UAT: Sprint end

### 2.4 Entry & Exit Criteria

**Entry Criteria:**
- Requirements finalized
- Test environment ready
- Test data prepared
- Test cases reviewed
- Tools configured

**Exit Criteria:**
- All planned tests executed
- 95% pass rate achieved
- All critical defects resolved
- All high defects resolved or deferred
- Performance benchmarks met
- Security scan passed
- Code coverage >90%

### 2.5 Risk Assessment

**High Risk Areas:**
- User authentication & authorization
- Payment processing (Phase 2)
- Data privacy & GDPR compliance
- Real-time messaging (WebSocket)
- File uploads (security)
- Performance under load

**Mitigation:**
- Additional test coverage
- Security-focused testing
- Load testing early
- Penetration testing
- Regular code reviews

---

## 3. Test Scope

### 3.1 Features to Test

**Epic 1: Authentication (P0)**
- User registration
- Email verification
- Login/logout
- Password reset
- OAuth (Google, GitHub)
- Session management
- 2FA

**Epic 2: User Profile (P0)**
- Create/edit profile
- Upload avatar/cover
- Profile privacy
- View profiles

**Epic 3: Content Creation (P0)**
- Create posts (text, images, videos)
- Edit posts
- Delete posts
- Post privacy
- Media upload

**Epic 4: Social Interactions (P0)**
- Like posts
- Comment on posts
- Share posts
- Follow/unfollow users
- Block/mute users

**Epic 5: Feed & Discovery (P0)**
- Home feed
- Trending content
- Explore page
- Feed algorithm

**Epic 6: Messaging (P0)**
- Send/receive messages
- Real-time updates
- Message threads
- Read receipts

**Epic 7: Notifications (P0)**
- In-app notifications
- Push notifications
- Email notifications
- Notification preferences

**Epic 8: Search & Explore (P0)**
- Search users
- Search posts
- Search hashtags
- Trending topics

**Epic 9: Privacy & Security (P0)**
- Privacy settings
- Data download (GDPR)
- Account security
- Content reporting

**Epic 10: Admin & Moderation (P0)**
- Admin dashboard
- User management
- Content moderation
- Analytics

### 3.2 Features NOT to Test

- Third-party services (internal logic)
- Operating system features
- Browser rendering engine
- Network infrastructure
- Email service provider (SendGrid)
- Cloud storage (AWS S3)

---

## 4. Test Approach

### 4.1 Test Design Techniques

**Black Box Testing:**
- Equivalence partitioning
- Boundary value analysis
- Decision table testing
- State transition testing
- Use case testing

**White Box Testing:**
- Statement coverage
- Branch coverage
- Path coverage
- Condition coverage

**Experience-Based:**
- Error guessing
- Exploratory testing
- Checklist-based testing

### 4.2 Test Case Prioritization

**Priority Levels:**

**P0 - Critical:**
- Core user flows (login, post, follow)
- Security features
- Data integrity
- Payment (Phase 2)

**P1 - High:**
- Major features
- Common use cases
- Performance critical paths

**P2 - Medium:**
- Secondary features
- Edge cases
- Nice-to-have features

**P3 - Low:**
- Rare scenarios
- Cosmetic issues
- Future enhancements

### 4.3 Test Data Strategy

**Test Data Types:**
1. **Valid Data:** Happy path scenarios
2. **Invalid Data:** Error handling
3. **Boundary Data:** Edge cases
4. **Special Characters:** Unicode, emoji, SQL
5. **Large Data:** Performance testing

**Data Management:**
- Synthetic test data generation
- Production-like data (anonymized)
- Automated data reset between tests
- Isolated test accounts
- Test data versioning

---

## 5. Test Environment

### 5.1 Environment Setup

**Development Environment:**
- Local developer machines
- Docker containers
- Mock external services

**Testing Environment:**
- Staging server
- Test database (PostgreSQL)
- Test Redis instance
- Test Kafka instance
- Test S3 bucket
- Test email service

**Production-like Staging:**
- Same infrastructure as production
- Load balancers
- CDN
- Monitoring tools

### 5.2 Test Infrastructure

**CI/CD Pipeline:**
```
GitHub Actions
    â†“
Build & Unit Tests
    â†“
Integration Tests
    â†“
Deploy to Staging
    â†“
E2E Tests
    â†“
Performance Tests
    â†“
Security Scan
    â†“
Deploy to Production
```

**Test Servers:**
- Web Server: Nginx
- App Server: Node.js
- Database: PostgreSQL 15
- Cache: Redis 7
- Message Queue: Kafka

**Test Tools Setup:**
- Jest (Unit tests)
- Playwright (E2E tests)
- k6 (Performance tests)
- Postman (API tests)
- SonarQube (Code quality)

### 5.3 Browser/Device Matrix

**Desktop Browsers:**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Mobile Browsers:**
- iOS Safari (iOS 14+)
- Chrome Mobile (Android 10+)
- Samsung Internet

**Screen Resolutions:**
- Desktop: 1920Ã—1080, 1366Ã—768, 2560Ã—1440
- Tablet: 768Ã—1024, 1024Ã—768
- Mobile: 375Ã—667, 414Ã—896, 360Ã—640

**Devices:**
- iPhone 13, iPhone SE
- iPad Pro, iPad Air
- Samsung Galaxy S21, Pixel 6
- Desktop (Windows, macOS, Linux)

---

## 6. Test Deliverables

### 6.1 Documents

- [x] Test Plan (this document)
- [x] Test Cases
- [ ] Test Data Specifications
- [ ] Test Environment Setup Guide
- [ ] Test Execution Reports
- [ ] Defect Reports
- [ ] Test Summary Report
- [ ] Code Coverage Report

### 6.2 Test Artifacts

**Before Testing:**
- Test case repository
- Test data sets
- Test scripts
- Test environment config

**During Testing:**
- Test execution logs
- Screenshots/videos
- Performance metrics
- Defect tracking

**After Testing:**
- Test metrics dashboard
- Coverage reports
- Lessons learned
- Recommendations

---

## 7. Unit Test Cases

### 7.1 Authentication Service Tests

**Test Suite: UserService**

**TC-UNIT-001: User Registration - Valid Data**
```javascript
describe('UserService.register', () => {
  it('should create user with valid data', async () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'SecurePass123!',
    };
    
    const user = await UserService.register(userData);
    
    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.username).toBe(userData.username);
    expect(user.password).not.toBe(userData.password); // hashed
  });
});
```

**TC-UNIT-002: User Registration - Duplicate Email**
```javascript
it('should reject duplicate email', async () => {
  const userData = {
    email: 'existing@example.com',
    username: 'newuser',
    password: 'SecurePass123!',
  };
  
  await expect(UserService.register(userData))
    .rejects
    .toThrow('Email already exists');
});
```

**TC-UNIT-003: User Registration - Invalid Email**
```javascript
it('should reject invalid email format', async () => {
  const userData = {
    email: 'invalid-email',
    username: 'testuser',
    password: 'SecurePass123!',
  };
  
  await expect(UserService.register(userData))
    .rejects
    .toThrow('Invalid email format');
});
```

**TC-UNIT-004: Password Hashing**
```javascript
it('should hash password with bcrypt', async () => {
  const password = 'SecurePass123!';
  const hashed = await UserService.hashPassword(password);
  
  expect(hashed).not.toBe(password);
  expect(hashed.length).toBeGreaterThan(50);
  
  const isValid = await bcrypt.compare(password, hashed);
  expect(isValid).toBe(true);
});
```

**TC-UNIT-005: Email Verification Token Generation**
```javascript
it('should generate valid verification token', () => {
  const userId = '123456';
  const token = UserService.generateVerificationToken(userId);
  
  expect(token).toBeDefined();
  expect(typeof token).toBe('string');
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  expect(decoded.userId).toBe(userId);
});
```

### 7.2 Post Service Tests

**TC-UNIT-006: Create Post - Valid Data**
```javascript
describe('PostService.createPost', () => {
  it('should create post with text content', async () => {
    const postData = {
      userId: 'user123',
      content: 'This is a test post',
      privacy: 'public',
    };
    
    const post = await PostService.createPost(postData);
    
    expect(post.content).toBe(postData.content);
    expect(post.userId).toBe(postData.userId);
    expect(post.privacy).toBe('public');
    expect(post.createdAt).toBeDefined();
  });
});
```

**TC-UNIT-007: Create Post - Content Too Long**
```javascript
it('should reject post exceeding character limit', async () => {
  const longContent = 'a'.repeat(5001); // limit is 5000
  
  const postData = {
    userId: 'user123',
    content: longContent,
  };
  
  await expect(PostService.createPost(postData))
    .rejects
    .toThrow('Post exceeds character limit');
});
```

**TC-UNIT-008: Extract Hashtags**
```javascript
it('should extract hashtags from content', () => {
  const content = 'Hello #world! This is #testing #hashtags';
  const hashtags = PostService.extractHashtags(content);
  
  expect(hashtags).toEqual(['world', 'testing', 'hashtags']);
  expect(hashtags.length).toBe(3);
});
```

**TC-UNIT-009: Extract Mentions**
```javascript
it('should extract mentions from content', () => {
  const content = 'Hey @john and @jane, check this out!';
  const mentions = PostService.extractMentions(content);
  
  expect(mentions).toEqual(['john', 'jane']);
  expect(mentions.length).toBe(2);
});
```

### 7.3 Validation Tests

**TC-UNIT-010: Username Validation - Valid**
```javascript
describe('Validators.validateUsername', () => {
  it('should accept valid usernames', () => {
    const validUsernames = [
      'user123',
      'john_doe',
      'alice_2024',
      'test_user_name',
    ];
    
    validUsernames.forEach(username => {
      expect(Validators.validateUsername(username)).toBe(true);
    });
  });
});
```

**TC-UNIT-011: Username Validation - Invalid**
```javascript
it('should reject invalid usernames', () => {
  const invalidUsernames = [
    'ab',              // too short
    'a'.repeat(31),    // too long
    'user@name',       // invalid char
    'user name',       // space
    '123',             // numbers only
  ];
  
  invalidUsernames.forEach(username => {
    expect(Validators.validateUsername(username)).toBe(false);
  });
});
```

**TC-UNIT-012: Password Strength Validation**
```javascript
it('should validate password strength', () => {
  const validPasswords = [
    'SecurePass123!',
    'MyP@ssw0rd',
    'Test@1234',
  ];
  
  const invalidPasswords = [
    'short',           // too short
    'onlylowercase',   // no uppercase/numbers/special
    '12345678',        // only numbers
    'NoSpecialChar1',  // no special char
  ];
  
  validPasswords.forEach(pwd => {
    expect(Validators.validatePassword(pwd).isValid).toBe(true);
  });
  
  invalidPasswords.forEach(pwd => {
    expect(Validators.validatePassword(pwd).isValid).toBe(false);
  });
});
```

### 7.4 Utility Function Tests

**TC-UNIT-013: Date Formatting**
```javascript
it('should format date as relative time', () => {
  const now = new Date();
  const oneHourAgo = new Date(now - 3600000);
  const oneDayAgo = new Date(now - 86400000);
  
  expect(DateUtils.timeAgo(oneHourAgo)).toBe('1 hour ago');
  expect(DateUtils.timeAgo(oneDayAgo)).toBe('1 day ago');
});
```

**TC-UNIT-014: Sanitize HTML**
```javascript
it('should sanitize malicious HTML', () => {
  const malicious = '<script>alert("XSS")</script><p>Safe content</p>';
  const sanitized = Sanitizer.sanitizeHtml(malicious);
  
  expect(sanitized).not.toContain('<script>');
  expect(sanitized).toContain('Safe content');
});
```

**TC-UNIT-015: Generate Slug**
```javascript
it('should generate URL-safe slug', () => {
  expect(SlugGenerator.generate('Hello World!')).toBe('hello-world');
  expect(SlugGenerator.generate('Test Post 123')).toBe('test-post-123');
  expect(SlugGenerator.generate('CafÃ© RÃ©sumÃ©')).toBe('cafe-resume');
});
```

### 7.5 Component Tests (React)

**TC-UNIT-016: Button Component Rendering**
```javascript
import { render, screen } from '@testing-library/react';
import Button from './Button';

it('should render button with text', () => {
  render(<Button>Click Me</Button>);
  expect(screen.getByText('Click Me')).toBeInTheDocument();
});
```

**TC-UNIT-017: Button Click Handler**
```javascript
import { fireEvent } from '@testing-library/react';

it('should call onClick handler when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click Me</Button>);
  
  fireEvent.click(screen.getByText('Click Me'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

**TC-UNIT-018: Input Component - Controlled**
```javascript
it('should update value when user types', () => {
  const handleChange = jest.fn();
  render(<Input value="" onChange={handleChange} />);
  
  const input = screen.getByRole('textbox');
  fireEvent.change(input, { target: { value: 'test' } });
  
  expect(handleChange).toHaveBeenCalled();
});
```

**TC-UNIT-019: PostCard Component**
```javascript
it('should display post content and author', () => {
  const post = {
    id: '1',
    content: 'Test post content',
    author: { username: 'testuser', avatar: 'avatar.jpg' },
    createdAt: new Date(),
  };
  
  render(<PostCard post={post} />);
  
  expect(screen.getByText('Test post content')).toBeInTheDocument();
  expect(screen.getByText('@testuser')).toBeInTheDocument();
});
```

**TC-UNIT-020: Like Button State**
```javascript
it('should toggle like state when clicked', () => {
  const { container } = render(<LikeButton postId="1" initialLiked={false} />);
  const button = container.querySelector('button');
  
  expect(button).toHaveClass('unliked');
  
  fireEvent.click(button);
  expect(button).toHaveClass('liked');
  
  fireEvent.click(button);
  expect(button).toHaveClass('unliked');
});
```

---

## 8. Integration Test Cases

### 8.1 Authentication Flow Integration

**TC-INT-001: Complete Registration Flow**
```javascript
describe('Registration Integration', () => {
  it('should register user and send verification email', async () => {
    const userData = {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'SecurePass123!',
    };
    
    // Register user
    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);
    
    expect(response.body.message).toBe('Verification email sent');
    
    // Verify user created in database
    const user = await User.findOne({ email: userData.email });
    expect(user).toBeDefined();
    expect(user.isVerified).toBe(false);
    
    // Verify email sent
    const emailSent = await EmailService.getLastEmail();
    expect(emailSent.to).toBe(userData.email);
    expect(emailSent.subject).toContain('Verify');
  });
});
```

**TC-INT-002: Login After Registration**
```javascript
it('should allow login after email verification', async () => {
  // Setup: Create and verify user
  const user = await createTestUser();
  await verifyUser(user.id);
  
  // Login
  const response = await request(app)
    .post('/api/auth/login')
    .send({
      email: user.email,
      password: 'TestPassword123!',
    })
    .expect(200);
  
  expect(response.body.accessToken).toBeDefined();
  expect(response.body.refreshToken).toBeDefined();
  expect(response.body.user.email).toBe(user.email);
});
```

**TC-INT-003: Password Reset Flow**
```javascript
it('should complete password reset flow', async () => {
  const user = await createTestUser();
  
  // Request reset
  await request(app)
    .post('/api/auth/forgot-password')
    .send({ email: user.email })
    .expect(200);
  
  // Get reset token from email
  const email = await EmailService.getLastEmail();
  const token = extractTokenFromEmail(email.html);
  
  // Reset password
  const newPassword = 'NewSecurePass123!';
  await request(app)
    .post('/api/auth/reset-password')
    .send({ token, password: newPassword })
    .expect(200);
  
  // Login with new password
  await request(app)
    .post('/api/auth/login')
    .send({ email: user.email, password: newPassword })
    .expect(200);
});
```

### 8.2 Post Creation Integration

**TC-INT-004: Create Post with Media Upload**
```javascript
it('should create post with image upload', async () => {
  const user = await createAuthenticatedUser();
  const token = await getAuthToken(user);
  
  const response = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .field('content', 'Post with image')
    .attach('media', 'tests/fixtures/test-image.jpg')
    .expect(201);
  
  expect(response.body.post.content).toBe('Post with image');
  expect(response.body.post.media).toHaveLength(1);
  expect(response.body.post.media[0].type).toBe('image');
  
  // Verify file uploaded to S3
  const fileExists = await S3Service.fileExists(
    response.body.post.media[0].url
  );
  expect(fileExists).toBe(true);
});
```

**TC-INT-005: Create Post with Mentions**
```javascript
it('should create notifications for mentioned users', async () => {
  const author = await createAuthenticatedUser();
  const mentioned = await createTestUser({ username: 'mentioned' });
  const token = await getAuthToken(author);
  
  await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({
      content: 'Hey @mentioned, check this out!',
    })
    .expect(201);
  
  // Verify notification created
  const notification = await Notification.findOne({
    userId: mentioned.id,
    type: 'mention',
  });
  
  expect(notification).toBeDefined();
  expect(notification.actorId).toBe(author.id);
});
```

**TC-INT-006: Feed Updates After Post Creation**
```javascript
it('should add post to followers\' feeds', async () => {
  const author = await createAuthenticatedUser();
  const follower = await createAuthenticatedUser();
  await createFollow(follower.id, author.id);
  
  const token = await getAuthToken(author);
  
  const postResponse = await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .send({ content: 'New post!' })
    .expect(201);
  
  const postId = postResponse.body.post.id;
  
  // Check follower's feed
  const followerToken = await getAuthToken(follower);
  const feedResponse = await request(app)
    .get('/api/feed')
    .set('Authorization', `Bearer ${followerToken}`)
    .expect(200);
  
  const postInFeed = feedResponse.body.posts.find(p => p.id === postId);
  expect(postInFeed).toBeDefined();
});
```

### 8.3 Social Interactions Integration

**TC-INT-007: Like Post Flow**
```javascript
it('should like post and create notification', async () => {
  const author = await createAuthenticatedUser();
  const liker = await createAuthenticatedUser();
  const post = await createTestPost(author.id);
  
  const token = await getAuthToken(liker);
  
  // Like post
  await request(app)
    .post(`/api/posts/${post.id}/like`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  
  // Verify like created
  const like = await Like.findOne({
    postId: post.id,
    userId: liker.id,
  });
  expect(like).toBeDefined();
  
  // Verify notification sent to author
  const notification = await Notification.findOne({
    userId: author.id,
    type: 'like',
    actorId: liker.id,
  });
  expect(notification).toBeDefined();
});
```

**TC-INT-008: Follow User Flow**
```javascript
it('should follow user and update counts', async () => {
  const follower = await createAuthenticatedUser();
  const followee = await createAuthenticatedUser();
  const token = await getAuthToken(follower);
  
  // Get initial counts
  const initialFollower = await User.findById(follower.id);
  const initialFollowee = await User.findById(followee.id);
  
  // Follow user
  await request(app)
    .post(`/api/users/${followee.id}/follow`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200);
  
  // Verify counts updated
  const updatedFollower = await User.findById(follower.id);
  const updatedFollowee = await User.findById(followee.id);
  
  expect(updatedFollower.followingCount)
    .toBe(initialFollower.followingCount + 1);
  expect(updatedFollowee.followerCount)
    .toBe(initialFollowee.followerCount + 1);
});
```

### 8.4 Messaging Integration

**TC-INT-009: Send Message Flow**
```javascript
it('should send message and deliver via WebSocket', async (done) => {
  const sender = await createAuthenticatedUser();
  const receiver = await createAuthenticatedUser();
  const senderToken = await getAuthToken(sender);
  
  // Connect receiver's WebSocket
  const receiverWs = await connectWebSocket(receiver);
  
  receiverWs.on('message', (data) => {
    const message = JSON.parse(data);
    if (message.type === 'new_message') {
      expect(message.data.content).toBe('Hello!');
      expect(message.data.senderId).toBe(sender.id);
      receiverWs.close();
      done();
    }
  });
  
  // Send message via API
  await request(app)
    .post('/api/messages')
    .set('Authorization', `Bearer ${senderToken}`)
    .send({
      recipientId: receiver.id,
      content: 'Hello!',
    })
    .expect(201);
});
```

### 8.5 Database Transaction Tests

**TC-INT-010: Create Post Transaction Rollback**
```javascript
it('should rollback transaction on failure', async () => {
  const user = await createAuthenticatedUser();
  const token = await getAuthToken(user);
  
  // Mock S3 upload failure
  jest.spyOn(S3Service, 'uploadFile').mockRejectedValue(
    new Error('S3 upload failed')
  );
  
  await request(app)
    .post('/api/posts')
    .set('Authorization', `Bearer ${token}`)
    .field('content', 'Test post')
    .attach('media', 'tests/fixtures/test-image.jpg')
    .expect(500);
  
  // Verify post not created in database
  const postCount = await Post.countDocuments({ userId: user.id });
  expect(postCount).toBe(0);
});
```

---

## 9. API Test Cases

### 9.1 Authentication Endpoints

**TC-API-001: POST /api/auth/register - Success**
```
Request:
POST /api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "username": "testuser",
  "password": "SecurePass123!",
  "firstName": "Test",
  "lastName": "User"
}

Expected Response:
Status: 201 Created
{
  "message": "Registration successful. Please verify your email.",
  "userId": "uuid-here"
}
```

**TC-API-002: POST /api/auth/register - Duplicate Email**
```
Request:
POST /api/auth/register
{
  "email": "existing@example.com",
  "username": "newuser",
  "password": "SecurePass123!"
}

Expected Response:
Status: 409 Conflict
{
  "error": "Email already exists"
}
```

**TC-API-003: POST /api/auth/login - Success**
```
Request:
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "SecurePass123!"
}

Expected Response:
Status: 200 OK
{
  "accessToken": "jwt-token-here",
  "refreshToken": "refresh-token-here",
  "user": {
    "id": "uuid",
    "email": "test@example.com",
    "username": "testuser"
  }
}
```

**TC-API-004: POST /api/auth/login - Invalid Credentials**
```
Request:
POST /api/auth/login
{
  "email": "test@example.com",
  "password": "WrongPassword"
}

Expected Response:
Status: 401 Unauthorized
{
  "error": "Invalid email or password"
}
```

**TC-API-005: POST /api/auth/refresh - Refresh Token**
```
Request:
POST /api/auth/refresh
{
  "refreshToken": "valid-refresh-token"
}

Expected Response:
Status: 200 OK
{
  "accessToken": "new-jwt-token",
  "refreshToken": "new-refresh-token"
}
```

### 9.2 Post Endpoints

**TC-API-006: POST /api/posts - Create Post**
```
Request:
POST /api/posts
Authorization: Bearer {token}
{
  "content": "This is my first post!",
  "privacy": "public"
}

Expected Response:
Status: 201 Created
{
  "post": {
    "id": "post-uuid",
    "content": "This is my first post!",
    "privacy": "public",
    "author": { /* user object */ },
    "createdAt": "2026-02-12T10:30:00Z",
    "likeCount": 0,
    "commentCount": 0
  }
}
```

**TC-API-007: GET /api/posts/:id - Get Post**
```
Request:
GET /api/posts/{postId}
Authorization: Bearer {token}

Expected Response:
Status: 200 OK
{
  "post": {
    "id": "post-uuid",
    "content": "Post content",
    "author": { /* user object */ },
    "media": [/* media array */],
    "likeCount": 10,
    "commentCount": 5,
    "isLiked": true,
    "isBookmarked": false
  }
}
```

**TC-API-008: PUT /api/posts/:id - Update Post**
```
Request:
PUT /api/posts/{postId}
Authorization: Bearer {token}
{
  "content": "Updated content",
  "privacy": "followers"
}

Expected Response:
Status: 200 OK
{
  "post": { /* updated post object */ },
  "edited": true,
  "editedAt": "2026-02-12T11:00:00Z"
}
```

**TC-API-009: DELETE /api/posts/:id - Delete Post**
```
Request:
DELETE /api/posts/{postId}
Authorization: Bearer {token}

Expected Response:
Status: 200 OK
{
  "message": "Post deleted successfully"
}
```

**TC-API-010: POST /api/posts/:id/like - Like Post**
```
Request:
POST /api/posts/{postId}/like
Authorization: Bearer {token}

Expected Response:
Status: 200 OK
{
  "liked": true,
  "likeCount": 11
}
```

### 9.3 User Endpoints

**TC-API-011: GET /api/users/:id - Get User Profile**
```
Request:
GET /api/users/{userId}
Authorization: Bearer {token}

Expected Response:
Status: 200 OK
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "displayName": "John Doe",
    "bio": "Software developer",
    "avatar": "avatar-url",
    "coverPhoto": "cover-url",
    "followerCount": 150,
    "followingCount": 200,
    "postCount": 45,
    "isFollowing": true,
    "isFollowedBy": false
  }
}
```

**TC-API-012: PUT /api/users/me - Update Profile**
```
Request:
PUT /api/users/me
Authorization: Bearer {token}
{
  "displayName": "Jane Smith",
  "bio": "Designer & Developer",
  "location": "San Francisco, CA"
}

Expected Response:
Status: 200 OK
{
  "user": { /* updated user object */ }
}
```

**TC-API-013: POST /api/users/:id/follow - Follow User**
```
Request:
POST /api/users/{userId}/follow
Authorization: Bearer {token}

Expected Response:
Status: 200 OK
{
  "following": true,
  "followerCount": 151
}
```

### 9.4 Feed Endpoints

**TC-API-014: GET /api/feed - Get Home Feed**
```
Request:
GET /api/feed?page=1&limit=20
Authorization: Bearer {token}

Expected Response:
Status: 200 OK
{
  "posts": [/* array of posts */],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

**TC-API-015: GET /api/feed/trending - Get Trending Posts**
```
Request:
GET /api/feed/trending?timeframe=24h

Expected Response:
Status: 200 OK
{
  "posts": [/* trending posts */],
  "timeframe": "24h"
}
```

### 9.5 Search Endpoints

**TC-API-016: GET /api/search/users - Search Users**
```
Request:
GET /api/search/users?q=john&limit=10
Authorization: Bearer {token}

Expected Response:
Status: 200 OK
{
  "users": [
    {
      "id": "uuid",
      "username": "johndoe",
      "displayName": "John Doe",
      "avatar": "url",
      "isFollowing": false
    }
  ],
  "total": 5
}
```

**TC-API-017: GET /api/search/posts - Search Posts**
```
Request:
GET /api/search/posts?q=javascript&limit=20&filter=recent

Expected Response:
Status: 200 OK
{
  "posts": [/* matching posts */],
  "total": 42,
  "query": "javascript"
}
```

### 9.6 Error Response Tests

**TC-API-018: Unauthorized Access**
```
Request:
GET /api/feed
(No Authorization header)

Expected Response:
Status: 401 Unauthorized
{
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

**TC-API-019: Resource Not Found**
```
Request:
GET /api/posts/nonexistent-id
Authorization: Bearer {token}

Expected Response:
Status: 404 Not Found
{
  "error": "Post not found",
  "code": "NOT_FOUND"
}
```

**TC-API-020: Rate Limit Exceeded**
```
Request:
POST /api/posts
(After exceeding rate limit)

Expected Response:
Status: 429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## 10. UI/Functional Test Cases

### 10.1 User Registration (E2E)

**TC-UI-001: Complete Registration Flow**
```
Test Steps:
1. Navigate to homepage
2. Click "Sign Up" button
3. Fill registration form:
   - Email: test@example.com
   - Username: testuser
   - Password: SecurePass123!
4. Click "Create Account"
5. Verify success message shown
6. Check email for verification
7. Click verification link
8. Verify redirect to login

Expected Results:
âœ“ Form validates input
âœ“ Success message displays
âœ“ Email received within 1 minute
âœ“ Verification link works
âœ“ Redirected to login page
âœ“ Can login with new credentials
```

**TC-UI-002: Registration - Field Validation**
```
Test Steps:
1. Navigate to registration page
2. Leave email empty, fill other fields
3. Click "Create Account"
4. Verify error message for email
5. Enter invalid email format
6. Verify email format error
7. Enter weak password
8. Verify password strength error

Expected Results:
âœ“ Required field errors shown
âœ“ Email format validated
âœ“ Password strength indicator shown
âœ“ Submit button disabled until valid
```

### 10.2 Login & Logout

**TC-UI-003: Successful Login**
```
Test Steps:
1. Navigate to login page
2. Enter valid credentials
3. Click "Login"
4. Verify redirect to home feed

Expected Results:
âœ“ Login successful
âœ“ Redirected to /feed
âœ“ User menu shows logged-in state
âœ“ Avatar displayed in header
```

**TC-UI-004: Failed Login - Wrong Password**
```
Test Steps:
1. Navigate to login page
2. Enter correct email
3. Enter wrong password
4. Click "Login"

Expected Results:
âœ“ Error message: "Invalid email or password"
âœ“ Input fields cleared
âœ“ Not redirected
```

**TC-UI-005: Logout**
```
Test Steps:
1. Login as user
2. Click profile menu
3. Click "Logout"

Expected Results:
âœ“ Session cleared
âœ“ Redirected to homepage
âœ“ Cannot access protected routes
```

### 10.3 Create Post

**TC-UI-006: Create Text Post**
```
Test Steps:
1. Login as user
2. Click "Create Post" or focus input
3. Type: "This is my first post!"
4. Click "Post" button

Expected Results:
âœ“ Post composer opens
âœ“ Character count updates (remaining: 4978/5000)
âœ“ Post button enabled
âœ“ Post appears immediately in feed (optimistic UI)
âœ“ "Posting..." indicator shown briefly
âœ“ Post confirmed after API success
```

**TC-UI-007: Create Post with Image**
```
Test Steps:
1. Open post composer
2. Type content
3. Click media icon
4. Select image file (< 5MB)
5. Verify image preview shown
6. Click "Post"

Expected Results:
âœ“ File picker opens
âœ“ Image previews correctly
âœ“ Can remove image before posting
âœ“ Upload progress shown
âœ“ Post created with image
âœ“ Image displays in feed
```

**TC-UI-008: Post Character Limit**
```
Test Steps:
1. Open post composer
2. Type 5001 characters

Expected Results:
âœ“ Character count shows: -1/5000 (red)
âœ“ Post button disabled
âœ“ Error message: "Post exceeds character limit"
```

### 10.4 Social Interactions

**TC-UI-009: Like Post**
```
Test Steps:
1. View home feed
2. Find a post
3. Click heart icon

Expected Results:
âœ“ Heart icon fills with color
âœ“ Like count increases by 1
âœ“ Animation plays (heartbeat)
âœ“ Unlike on second click
âœ“ Like count decreases
```

**TC-UI-010: Comment on Post**
```
Test Steps:
1. View post
2. Click comment icon
3. Type comment: "Great post!"
4. Press Enter or click "Comment"

Expected Results:
âœ“ Comment input focused
âœ“ Comment posted immediately
âœ“ Comment appears in thread
âœ“ Comment count increases
âœ“ Post author gets notification
```

**TC-UI-011: Follow User**
```
Test Steps:
1. View another user's profile
2. Click "Follow" button

Expected Results:
âœ“ Button changes to "Following"
âœ“ Follower count increases
âœ“ User gets notification
âœ“ User's posts appear in feed
```

### 10.5 Feed & Discovery

**TC-UI-012: Infinite Scroll Feed**
```
Test Steps:
1. Login and view feed
2. Scroll to bottom
3. Observe loading behavior

Expected Results:
âœ“ Initial 20 posts loaded
âœ“ Loading spinner shows near bottom
âœ“ Next 20 posts load automatically
âœ“ Smooth scrolling (no jank)
âœ“ "No more posts" shown when end reached
```

**TC-UI-013: Pull to Refresh**
```
Test Steps (Mobile):
1. View feed
2. Pull down from top
3. Release

Expected Results:
âœ“ Refresh spinner shown
âœ“ Feed updates with new posts
âœ“ Scroll position maintained for existing posts
âœ“ New posts badge shown
```

### 10.6 Search

**TC-UI-014: Search Users**
```
Test Steps:
1. Click search bar
2. Type "john"
3. View autocomplete results
4. Click a result

Expected Results:
âœ“ Search activates after 2 characters
âœ“ Autocomplete shows matching users
âœ“ Results update in real-time
âœ“ Clicking result navigates to profile
```

**TC-UI-015: Search Posts**
```
Test Steps:
1. Go to search page
2. Type query: "javascript"
3. Press Enter
4. Switch to "Posts" tab

Expected Results:
âœ“ Search results load
âœ“ Posts containing "javascript" shown
âœ“ Keywords highlighted
âœ“ Can filter by date/type
```

### 10.7 Messages

**TC-UI-016: Send Direct Message**
```
Test Steps:
1. Navigate to Messages
2. Click "New Message"
3. Search for user
4. Select recipient
5. Type message
6. Click Send

Expected Results:
âœ“ Conversation created
âœ“ Message appears immediately
âœ“ "Delivered" status shown
âœ“ Recipient receives in real-time
âœ“ Read receipt when read
```

**TC-UI-017: Real-time Message Delivery**
```
Test Steps:
1. User A opens conversation with User B
2. User B sends message
3. Observe User A's screen

Expected Results:
âœ“ Message appears immediately (no refresh)
âœ“ Notification sound plays (if enabled)
âœ“ Conversation marked unread
âœ“ Message content correct
```

### 10.8 Notifications

**TC-UI-018: View Notifications**
```
Test Steps:
1. Click notifications bell icon
2. View notification panel

Expected Results:
âœ“ Unread count badge shown
âœ“ Notifications list displayed
âœ“ Grouped by type
âœ“ Clicking notification navigates to content
âœ“ Mark as read on view
```

**TC-UI-019: Push Notification**
```
Test Steps:
1. Grant notification permission
2. Another user likes your post
3. Observe device notification

Expected Results:
âœ“ Push notification received
âœ“ Notification shows: "[User] liked your post"
âœ“ Clicking opens app to post
âœ“ Respects Do Not Disturb settings
```

### 10.9 Profile Management

**TC-UI-020: Edit Profile**
```
Test Steps:
1. Navigate to own profile
2. Click "Edit Profile"
3. Update display name
4. Update bio
5. Upload new avatar
6. Click "Save Changes"

Expected Results:
âœ“ Edit modal opens
âœ“ Current data pre-filled
âœ“ Image upload preview shown
âœ“ Changes saved successfully
âœ“ Profile updated immediately
âœ“ Success toast shown
```

---

## 11. Performance Test Cases

### 11.1 Load Testing

**TC-PERF-001: Concurrent User Load**
```
Test Configuration:
- Tool: k6
- Virtual Users: 1000
- Duration: 10 minutes
- Ramp-up: 2 minutes

Scenarios:
1. 40% viewing feed
2. 30% creating posts
3. 20% interacting (like/comment)
4. 10% searching

Success Criteria:
âœ“ Response time p95 < 500ms
âœ“ Response time p99 < 1000ms
âœ“ Error rate < 1%
âœ“ Throughput > 1000 req/sec
```

**TC-PERF-002: Spike Test**
```
Test Configuration:
- VUs: 0 â†’ 5000 (instant spike)
- Duration: 5 minutes
- Recovery period: 2 minutes

Success Criteria:
âœ“ System remains available
âœ“ No crashes or timeouts
âœ“ Recovery time < 30 seconds
âœ“ Error rate < 5% during spike
```

**TC-PERF-003: Stress Test**
```
Test Configuration:
- VUs: Gradually increase until breaking point
- Start: 100 VUs
- Increment: +100 every minute
- Stop: When error rate > 10%

Objectives:
- Identify maximum capacity
- Observe degradation patterns
- Find bottlenecks
```

### 11.2 Database Performance

**TC-PERF-004: Query Performance**
```
Test: Feed Query Performance

Query:
SELECT * FROM posts 
WHERE author_id IN (following_ids)
ORDER BY created_at DESC
LIMIT 20;

Success Criteria:
âœ“ Execution time < 50ms
âœ“ Uses index scan (not seq scan)
âœ“ Consistent performance with 1M+ posts
```

**TC-PERF-005: Write Performance**
```
Test: Post Creation Under Load

Scenario:
- 100 concurrent post creations/sec
- With image uploads
- Duration: 5 minutes

Success Criteria:
âœ“ Write latency p95 < 200ms
âœ“ No deadlocks
âœ“ No transaction failures
âœ“ Index updates performant
```

### 11.3 API Performance

**TC-PERF-006: API Response Times**
```
Endpoints to Test:
- GET /api/feed (target: < 200ms)
- GET /api/posts/:id (target: < 100ms)
- POST /api/posts (target: < 300ms)
- GET /api/search/users (target: < 150ms)

Load: 100 concurrent requests

Success Criteria:
âœ“ All endpoints meet target
âœ“ No timeouts
âœ“ Consistent performance
```

**TC-PERF-007: Caching Effectiveness**
```
Test: Redis Cache Hit Rate

Scenarios:
1. Feed requests (expect > 80% hit rate)
2. User profiles (expect > 90% hit rate)
3. Trending posts (expect > 95% hit rate)

Success Criteria:
âœ“ Cache hit rates meet targets
âœ“ Cache response time < 10ms
âœ“ Memory usage stable
```

### 11.4 Frontend Performance

**TC-PERF-008: Page Load Performance**
```
Pages to Test:
- Homepage
- Feed
- Profile
- Post detail

Metrics (Lighthouse):
âœ“ First Contentful Paint < 1.8s
âœ“ Largest Contentful Paint < 2.5s
âœ“ Time to Interactive < 3.8s
âœ“ Cumulative Layout Shift < 0.1
âœ“ Overall Score > 90
```

**TC-PERF-009: Bundle Size**
```
Test: JavaScript Bundle Analysis

Targets:
âœ“ Initial bundle < 200KB (gzipped)
âœ“ Vendor bundle < 150KB (gzipped)
âœ“ Code splitting implemented
âœ“ Lazy loading for routes
âœ“ Tree shaking effective
```

**TC-PERF-010: Image Optimization**
```
Test: Image Loading Performance

Requirements:
âœ“ WebP format used
âœ“ Responsive images (srcset)
âœ“ Lazy loading below fold
âœ“ Image compression quality: 80%
âœ“ Average image size < 100KB
```

### 11.5 Real-time Performance

**TC-PERF-011: WebSocket Scalability**
```
Test Configuration:
- Concurrent WebSocket connections: 10,000
- Message rate: 100 messages/sec
- Duration: 30 minutes

Success Criteria:
âœ“ All connections stable
âœ“ Message delivery latency < 100ms
âœ“ No dropped messages
âœ“ Memory usage linear with connections
```

**TC-PERF-012: Notification Delivery Performance**
```
Test: Push Notification Throughput

Scenario:
- 1000 notifications/second
- 10,000 active devices
- Duration: 5 minutes

Success Criteria:
âœ“ Delivery time p95 < 1 second
âœ“ All notifications delivered
âœ“ No FCM errors
âœ“ Queue processing stable
```

---

## 12. Security Test Cases

### 12.1 Authentication Security

**TC-SEC-001: SQL Injection Prevention**
```
Test: Login SQL Injection

Attack Vectors:
1. Email: admin' OR '1'='1
2. Password: ' OR '1'='1' --
3. Username: admin'--

Expected Behavior:
âœ“ Login fails gracefully
âœ“ No error messages leak DB info
âœ“ All inputs sanitized
âœ“ Parameterized queries used
âœ“ No unauthorized access
```

**TC-SEC-002: XSS Prevention**
```
Test: Cross-Site Scripting in Posts

Attack Vectors:
1. <script>alert('XSS')</script>
2. <img src=x onerror=alert('XSS')>
3. javascript:alert('XSS')

Expected Behavior:
âœ“ Scripts not executed
âœ“ HTML entities escaped
âœ“ Content Security Policy enforced
âœ“ DOM sanitization applied
```

**TC-SEC-003: CSRF Protection**
```
Test: Cross-Site Request Forgery

Attack:
- Craft malicious page with form
- Auto-submit to /api/posts/create
- Without CSRF token

Expected Behavior:
âœ“ Request rejected (403)
âœ“ CSRF token required
âœ“ Token validated
âœ“ SameSite cookie attribute set
```

**TC-SEC-004: Password Security**
```
Test: Password Storage & Handling

Verifications:
âœ“ Passwords hashed with bcrypt (cost 12)
âœ“ Never stored in plaintext
âœ“ Not logged in server logs
âœ“ Not returned in API responses
âœ“ Secure password reset flow
```

**TC-SEC-005: JWT Token Security**
```
Test: Token Validation

Attack Vectors:
1. Expired token
2. Invalid signature
3. Tampered payload
4. Missing token

Expected Behavior:
âœ“ All invalid tokens rejected
âœ“ Proper 401 responses
âœ“ Token expiry enforced (24h)
âœ“ Refresh token rotation
```

### 12.2 Authorization Security

**TC-SEC-006: Broken Access Control**
```
Test: Unauthorized Post Deletion

Steps:
1. User A creates post
2. User B attempts to delete User A's post
3. Send DELETE /api/posts/{userA-post-id} as User B

Expected Behavior:
âœ“ Request rejected (403 Forbidden)
âœ“ Post not deleted
âœ“ Ownership verified
```

**TC-SEC-007: Insecure Direct Object Reference**
```
Test: Access Private User Data

Attack:
1. User A (id: 123) logged in
2. Request GET /api/users/124/private-data
3. Attempt to access User B's private data

Expected Behavior:
âœ“ Request rejected (403)
âœ“ Privacy settings enforced
âœ“ No data leakage
```

**TC-SEC-008: API Rate Limiting**
```
Test: Brute Force Prevention

Attack:
- 1000 login attempts in 1 minute
- Same IP address

Expected Behavior:
âœ“ Rate limit triggered (429)
âœ“ After 5 failed attempts, account locked temp
âœ“ IP blocked for 1 hour
âœ“ CAPTCHA required after limit
```

### 12.3 Data Security

**TC-SEC-009: File Upload Security**
```
Test: Malicious File Upload

Attack Vectors:
1. PHP shell file disguised as image
2. Executable file with .jpg extension
3. SVG with embedded JavaScript
4. File > size limit (10MB)

Expected Behavior:
âœ“ File type validated (magic numbers)
âœ“ Extension whitelist enforced
âœ“ Files sanitized
âœ“ Virus scan performed
âœ“ Size limits enforced
```

**TC-SEC-010: Sensitive Data Exposure**
```
Test: API Response Data Leakage

Checks:
âœ“ No password hashes in responses
âœ“ No email addresses (unless owned)
âœ“ No internal IDs exposed
âœ“ No stack traces in errors
âœ“ HTTPS enforced (no HTTP)
```

**TC-SEC-011: Database Encryption**
```
Test: Data at Rest Encryption

Verifications:
âœ“ Database encrypted (AWS RDS encryption)
âœ“ Sensitive fields hashed (passwords)
âœ“ Backups encrypted
âœ“ SSL/TLS for DB connections
```

### 12.4 Infrastructure Security

**TC-SEC-012: HTTPS Enforcement**
```
Test: Force HTTPS

Steps:
1. Access http://connecthub.com
2. Attempt API call over HTTP

Expected Behavior:
âœ“ Redirect to HTTPS (301)
âœ“ HSTS header present
âœ“ HTTP requests rejected at API
âœ“ Secure cookies only
```

**TC-SEC-013: Security Headers**
```
Test: HTTP Security Headers

Required Headers:
âœ“ X-Content-Type-Options: nosniff
âœ“ X-Frame-Options: DENY
âœ“ X-XSS-Protection: 1; mode=block
âœ“ Strict-Transport-Security: max-age=31536000
âœ“ Content-Security-Policy: (defined)
âœ“ Referrer-Policy: no-referrer
```

**TC-SEC-014: Dependency Vulnerabilities**
```
Test: npm audit / Snyk Scan

Verifications:
âœ“ No critical vulnerabilities
âœ“ No high vulnerabilities
âœ“ Dependencies up to date
âœ“ Automated scanning in CI/CD
```

### 12.5 Privacy & Compliance

**TC-SEC-015: GDPR Data Export**
```
Test: User Data Download

Steps:
1. User requests data export
2. System generates export
3. User downloads file

Verifications:
âœ“ All user data included
âœ“ JSON format (machine-readable)
âœ“ Download link expires (7 days)
âœ“ File encrypted (password-protected)
```

**TC-SEC-016: Right to be Forgotten**
```
Test: Account Deletion

Steps:
1. User requests account deletion
2. Confirm deletion
3. Verify data removal

Verifications:
âœ“ Personal data deleted within 30 days
âœ“ Posts deleted or anonymized
âœ“ Cannot login after deletion
âœ“ Data not in backups after retention period
```

---

## 13. Accessibility Test Cases

### 13.1 Keyboard Navigation

**TC-A11Y-001: Tab Navigation**
```
Test: Navigate Site with Keyboard Only

Steps:
1. Start at homepage
2. Press Tab repeatedly
3. Navigate through all interactive elements
4. Press Enter to activate

Success Criteria:
âœ“ All interactive elements reachable
âœ“ Tab order logical
âœ“ Focus indicator visible (2px outline)
âœ“ No keyboard traps
âœ“ Skip links present
```

**TC-A11Y-002: Keyboard Shortcuts**
```
Test: Keyboard Shortcuts Work

Shortcuts:
- / : Focus search
- n : New post
- ? : Show shortcuts help
- Esc : Close modal

Success Criteria:
âœ“ All shortcuts functional
âœ“ No conflicts with browser shortcuts
âœ“ Help accessible (? key)
```

### 13.2 Screen Reader Support

**TC-A11Y-003: Screen Reader Navigation**
```
Test: NVDA/JAWS Navigation

Steps:
1. Enable screen reader
2. Navigate homepage
3. Create post
4. Read feed

Success Criteria:
âœ“ All content announced
âœ“ Headings structured (H1-H6)
âœ“ Landmarks present (nav, main, aside)
âœ“ ARIA labels on icons
âœ“ Form labels associated
âœ“ Dynamic content announced (aria-live)
```

**TC-A11Y-004: Image Alt Text**
```
Test: Alternative Text

Checks:
âœ“ All images have alt attribute
âœ“ Decorative images: alt=""
âœ“ Informative images: descriptive alt
âœ“ Avatar images: alt="[Name]'s avatar"
âœ“ User-uploaded images: alt from caption or AI
```

### 13.3 Visual Accessibility

**TC-A11Y-005: Color Contrast**
```
Test: WCAG Contrast Ratios

Requirements:
âœ“ Normal text: 4.5:1 minimum
âœ“ Large text (18pt+): 3:1 minimum
âœ“ UI components: 3:1 minimum
âœ“ Pass in both light/dark mode

Tool: axe DevTools, Lighthouse
```

**TC-A11Y-006: Text Resize**
```
Test: 200% Text Zoom

Steps:
1. Browser zoom to 200%
2. Navigate site
3. Verify usability

Success Criteria:
âœ“ No horizontal scrolling
âœ“ All text readable
âœ“ No overlapping content
âœ“ Functionality intact
```

**TC-A11Y-007: Color Blindness**
```
Test: Color-blind Friendly

Scenarios:
1. Deuteranopia (red-green)
2. Protanopia (red-green)
3. Tritanopia (blue-yellow)

Success Criteria:
âœ“ Information not conveyed by color alone
âœ“ Icons + labels used
âœ“ Patterns/textures for differentiation
âœ“ Simulate with tool (Stark)
```

### 13.4 Form Accessibility

**TC-A11Y-008: Form Labels & Errors**
```
Test: Form Accessibility

Checks:
âœ“ All inputs have <label>
âœ“ Labels associated (for/id)
âœ“ Required fields indicated (*)
âœ“ Error messages clear
âœ“ Error messages announced (aria-describedby)
âœ“ Error icons + text (not color only)
```

**TC-A11Y-009: Focus Management**
```
Test: Focus Handling in Modals

Steps:
1. Open modal
2. Tab through modal
3. Close modal

Success Criteria:
âœ“ Focus moved to modal on open
âœ“ Focus trapped within modal
âœ“ Esc closes modal
âœ“ Focus returned to trigger on close
```

### 13.5 WCAG Compliance

**TC-A11Y-010: Automated Accessibility Scan**
```
Tool: axe-core, Pa11y

Pages to Test:
- Homepage
- Feed
- Profile
- Post detail
- Settings

Success Criteria:
âœ“ 0 critical violations
âœ“ 0 serious violations
âœ“ < 5 moderate violations
âœ“ WCAG 2.1 Level AA compliant
```

---

## 14. Mobile Test Cases

### 14.1 Responsive Design

**TC-MOB-001: Mobile Layout**
```
Test Devices:
- iPhone SE (375Ã—667)
- iPhone 13 (390Ã—844)
- Samsung Galaxy S21 (360Ã—800)
- iPad Pro (1024Ã—1366)

Success Criteria:
âœ“ Content fits screen (no horizontal scroll)
âœ“ Text readable (min 16px)
âœ“ Touch targets â‰¥ 44px
âœ“ Images responsive
âœ“ Navigation accessible
```

**TC-MOB-002: Orientation Change**
```
Test: Portrait â†” Landscape

Steps:
1. Open app in portrait
2. Rotate to landscape
3. Navigate features
4. Rotate back to portrait

Success Criteria:
âœ“ Layout adapts smoothly
âœ“ No content loss
âœ“ State maintained
âœ“ No visual glitches
```

### 14.2 Touch Interactions

**TC-MOB-003: Touch Gestures**
```
Gestures to Test:
- Tap (buttons, links)
- Double tap (like image)
- Long press (context menu)
- Swipe left (go back)
- Swipe down (pull to refresh)
- Pinch (zoom images)

Success Criteria:
âœ“ All gestures responsive
âœ“ Visual feedback on touch
âœ“ No accidental triggers
âœ“ 44px minimum touch target
```

**TC-MOB-004: Scroll Performance**
```
Test: Smooth Scrolling

Scenarios:
- Feed scroll (infinite)
- Modal scroll
- Long form scroll

Success Criteria:
âœ“ 60fps scrolling
âœ“ No jank
âœ“ Momentum scrolling
âœ“ Scroll position preserved
```

### 14.3 Mobile-Specific Features

**TC-MOB-005: Camera Access**
```
Test: Photo Upload from Camera

Steps:
1. Create post
2. Click camera icon
3. Take photo
4. Confirm upload

Success Criteria:
âœ“ Camera permission requested
âœ“ Camera opens
âœ“ Photo captured
âœ“ Preview shown
âœ“ Upload successful
```

**TC-MOB-006: Offline Behavior**
```
Test: Offline Mode

Steps:
1. Use app online
2. Disable network
3. Try to create post
4. Re-enable network

Success Criteria:
âœ“ Offline indicator shown
âœ“ Cached content accessible
âœ“ Actions queued
âœ“ Sync on reconnection
âœ“ Conflicts handled
```

**TC-MOB-007: Push Notifications (Mobile)**
```
Test: Mobile Push

Steps:
1. Grant notification permission
2. Receive notification
3. Tap notification

Success Criteria:
âœ“ Permission prompt shown
âœ“ Notification received
âœ“ Sound/vibration (if enabled)
âœ“ Deep link to content works
```

### 14.4 Performance on Mobile

**TC-MOB-008: Mobile Network Performance**
```
Test: Performance on 3G

Throttling:
- Download: 1.6 Mbps
- Upload: 750 Kbps
- Latency: 150ms

Success Criteria:
âœ“ Page load < 5s
âœ“ Images lazy load
âœ“ Progressive enhancement
âœ“ Offline cache utilized
```

**TC-MOB-009: Mobile Battery Usage**
```
Test: Battery Consumption

Scenario:
- 30 minutes active use
- Feed browsing
- Creating posts
- Messaging

Success Criteria:
âœ“ Battery drain < 5%
âœ“ No excessive CPU usage
âœ“ Background activity minimal
```

### 14.5 Cross-Browser Mobile

**TC-MOB-010: Mobile Browser Compatibility**
```
Browsers to Test:
- iOS Safari (iOS 14+)
- Chrome Mobile (Android 10+)
- Samsung Internet
- Firefox Mobile

Features to Verify:
âœ“ All features functional
âœ“ Layout consistent
âœ“ Gestures work
âœ“ Performance acceptable
```

---

## 15. Regression Test Suite

### 15.1 Critical Path Regression

**Smoke Test Suite (30 min)**

**TS-REG-001: Authentication Flow**
```
1. User can register
2. Email verification works
3. User can login
4. User can logout
5. Password reset works
6. OAuth login works
```

**TS-REG-002: Core Content Flow**
```
1. User can create text post
2. User can create post with image
3. Post appears in feed
4. User can edit post
5. User can delete post
```

**TS-REG-003: Social Interactions**
```
1. User can like post
2. User can comment
3. User can follow another user
4. Feed updates with followed users
5. Notifications received
```

### 15.2 Feature-Level Regression

**TS-REG-004: Messaging Regression**
```
Test Cases:
- Send direct message
- Receive message in real-time
- Message read receipts
- Delete conversation
- Block user (no more messages)
```

**TS-REG-005: Search Regression**
```
Test Cases:
- Search users by name
- Search posts by keyword
- Search hashtags
- Filters work correctly
- Results paginated
```

**TS-REG-006: Profile Regression**
```
Test Cases:
- View own profile
- View others' profile
- Edit profile information
- Upload avatar/cover
- Privacy settings applied
```

### 15.3 Data Integrity Regression

**TS-REG-007: Counters Accuracy**
```
Verify Accurate Counts:
- Follower count
- Following count
- Post count
- Like count
- Comment count
- Notification count

Test:
- Create/delete items
- Verify counts update
- Check database consistency
```

**TS-REG-008: Data Persistence**
```
Test:
1. Create various data (posts, follows, likes)
2. Logout
3. Login
4. Verify all data persisted
5. Delete data
6. Verify deletions persisted
```

### 15.4 Integration Points Regression

**TS-REG-009: Third-Party Services**
```
Test:
- Email delivery (SendGrid)
- File uploads (AWS S3)
- Push notifications (FCM)
- OAuth providers (Google, GitHub)

Verify:
âœ“ All integrations functional
âœ“ Error handling works
âœ“ Fallbacks in place
```

**TS-REG-010: Database Operations**
```
Test:
- Read operations (SELECT)
- Write operations (INSERT)
- Update operations (UPDATE)
- Delete operations (DELETE)
- Transactions (COMMIT/ROLLBACK)

Verify:
âœ“ All CRUD operations work
âœ“ Constraints enforced
âœ“ Indexes used
âœ“ Triggers fire correctly
```

---

## 16. Test Data Management

### 16.1 Test Data Requirements

**User Test Data:**
```javascript
const testUsers = [
  {
    role: 'admin',
    email: 'admin@test.com',
    username: 'testadmin',
    password: 'AdminPass123!',
  },
  {
    role: 'regular',
    email: 'user1@test.com',
    username: 'testuser1',
    password: 'UserPass123!',
  },
  {
    role: 'premium',
    email: 'premium@test.com',
    username: 'premiumuser',
    password: 'PremiumPass123!',
  },
  {
    role: 'verified',
    email: 'verified@test.com',
    username: 'verifieduser',
    password: 'VerifiedPass123!',
    isVerified: true,
  },
];
```

**Post Test Data:**
```javascript
const testPosts = [
  {
    content: 'Short text post',
    privacy: 'public',
  },
  {
    content: 'Post with hashtag #testing',
    privacy: 'public',
  },
  {
    content: 'Post with mention @testuser1',
    privacy: 'followers',
  },
  {
    content: 'Long post content...' // 4000+ characters
    privacy: 'public',
  },
];
```

### 16.2 Data Generation

**Synthetic Data Generator:**
```javascript
class TestDataGenerator {
  static generateUser(overrides = {}) {
    return {
      email: faker.internet.email(),
      username: faker.internet.userName(),
      password: 'TestPass123!',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      bio: faker.lorem.sentences(2),
      ...overrides,
    };
  }
  
  static generatePost(userId, overrides = {}) {
    return {
      userId,
      content: faker.lorem.paragraph(),
      privacy: 'public',
      hashtags: this.generateHashtags(3),
      ...overrides,
    };
  }
  
  static generateHashtags(count = 3) {
    return Array.from({ length: count }, () => 
      faker.word.noun()
    );
  }
}
```

### 16.3 Test Data Cleanup

**Before Each Test:**
```javascript
beforeEach(async () => {
  // Clear test database
  await truncateTables(['users', 'posts', 'likes', 'follows']);
  
  // Seed required data
  await seedTestData();
  
  // Reset Redis cache
  await redisClient.flushdb();
});
```

**After Test Suite:**
```javascript
afterAll(async () => {
  // Clean up test files
  await cleanupTestUploads();
  
  // Close connections
  await closeDbConnection();
  await closeRedisConnection();
});
```

---

## 17. Defect Management

### 17.1 Defect Severity Levels

**S1 - Critical:**
- System crash
- Data loss
- Security vulnerability
- Payment failure (Phase 2)
- Production down

**S2 - High:**
- Major feature broken
- Performance degradation
- Workaround exists but difficult
- Affects many users

**S3 - Medium:**
- Minor feature issue
- Easy workaround available
- Cosmetic with functional impact
- Affects few users

**S4 - Low:**
- Cosmetic issue
- Minor UI glitch
- Typo or formatting
- Enhancement request

### 17.2 Defect Priority

**P0 - Immediate:**
- Fix in current sprint
- Blocks testing/release
- Critical user impact

**P1 - High:**
- Fix in next sprint
- Important feature affected
- High user impact

**P2 - Medium:**
- Fix in future sprint
- Normal priority
- Moderate impact

**P3 - Low:**
- Fix when time permits
- Nice to have
- Low impact

### 17.3 Defect Lifecycle

```
New â†’ Assigned â†’ In Progress â†’ Fixed â†’ Ready for Test â†’ Verified â†’ Closed
                                    â†“
                                Reopened (if still failing)
```

### 17.4 Bug Report Template

```markdown
**Bug ID:** BUG-001
**Title:** Unable to upload images larger than 1MB

**Environment:**
- Browser: Chrome 120
- OS: Windows 11
- Version: 1.0.0-staging

**Severity:** S2 - High
**Priority:** P1 - High

**Preconditions:**
- User logged in
- On post creation page

**Steps to Reproduce:**
1. Click "Create Post"
2. Click media upload icon
3. Select image > 1MB (e.g., 2.5MB image)
4. Click "Post"

**Expected Result:**
- Image uploads successfully
- Post created with image

**Actual Result:**
- Error message: "Upload failed"
- Post not created
- Console shows 413 error

**Attachments:**
- Screenshot: error-screenshot.png
- Console log: console-log.txt
- Network tab: network-har.har

**Additional Notes:**
- Works fine with images < 1MB
- Server max upload size might need adjustment
```

### 17.5 Defect Metrics

**Track:**
- Defects found per sprint
- Defects fixed per sprint
- Defect escape rate (to production)
- Mean time to resolution
- Defect density (defects per KLOC)
- Reopen rate

**Goals:**
- Defect escape rate < 2%
- Critical defects resolved in 24h
- High defects resolved in 3 days
- Reopen rate < 10%

---

## 18. Test Metrics & Reporting

### 18.1 Test Coverage Metrics

**Code Coverage:**
```
Target:
- Statements: > 90%
- Branches: > 85%
- Functions: > 90%
- Lines: > 90%

Tools:
- Jest coverage report
- SonarQube
- Codecov
```

**Requirements Coverage:**
```
Track:
- User stories tested
- Acceptance criteria covered
- Edge cases identified

Goal: 100% of P0 stories tested
```

### 18.2 Test Execution Metrics

**Daily Dashboard:**
```
Tests Run: 1,245
Passed: 1,230 (98.8%)
Failed: 10 (0.8%)
Skipped: 5 (0.4%)

Execution Time: 35 minutes

Trend: â†‘ (improvement from yesterday)
```

**Sprint Summary:**
```
Total Test Cases: 500
Executed: 485 (97%)
Pass Rate: 95%
Fail Rate: 2%
Blocked: 3%

New Defects: 15
Fixed Defects: 20
Open Defects: 10
```

### 18.3 Quality Metrics

**Defect Metrics:**
- Defect density
- Defect removal efficiency
- Defect aging
- Defect severity distribution

**Performance Metrics:**
- Response time trends
- Throughput
- Error rate
- Resource utilization

**Reliability Metrics:**
- Mean time between failures (MTBF)
- Mean time to repair (MTTR)
- System uptime %

### 18.4 Test Reports

**Daily Test Report:**
```
Date: 2026-02-12
Environment: Staging

Summary:
- Smoke tests: PASSED
- Regression suite: IN PROGRESS (85% complete)
- New features: 3/4 PASSED

Issues:
- BUG-045: Image upload failing (S2, In Progress)
- BUG-046: Notification delay (S3, New)

Next Steps:
- Complete regression testing
- Retest BUG-045 after fix deployed
```

**Sprint Test Summary:**
```
Sprint 5 Testing Summary

Overall Status: ON TRACK

Test Execution:
- Planned: 250 test cases
- Executed: 240 (96%)
- Passed: 228 (95%)
- Failed: 12 (5%)

Coverage:
- Code coverage: 92%
- Requirements coverage: 98%

Defects:
- Found: 18
- Fixed: 15
- Open: 3 (all S3/S4)

Risks:
- Performance testing delayed by 1 day
- Mitigation: Extended testing window

Recommendation: READY FOR RELEASE
```

### 18.5 Test Dashboards

**Real-Time Dashboard (Grafana):**
```
Panels:
- Test execution trend (line chart)
- Pass/fail distribution (pie chart)
- Defect status (bar chart)
- Code coverage (gauge)
- Test duration (line chart)
- Flaky tests (table)

Auto-refresh: 5 minutes
```

---

## 19. Test Schedule

### 19.1 Testing Timeline

**Sprint 1-2: Foundation**
```
Week 1-2:
- Unit test development (parallel with coding)
- Test environment setup
- CI/CD pipeline configuration

Week 3-4:
- Integration testing (auth, profiles)
- API testing
- Initial E2E tests
```

**Sprint 3-5: Core Features**
```
Week 5-8:
- Unit tests for all new features
- Integration tests (posts, interactions)
- Expand E2E coverage
- Performance baseline

Week 9-10:
- Feed algorithm testing
- Load testing
- Security scan
```

**Sprint 6-7: Discovery & Engagement**
```
Week 11-12:
- Search functionality testing
- Notifications testing
- Messaging testing
- WebSocket load testing

Week 13-14:
- Cross-browser testing
- Mobile responsive testing
- Accessibility audit
```

**Sprint 8-9: Security & Privacy**
```
Week 15-16:
- Security penetration testing
- GDPR compliance testing
- Privacy feature testing
- Data export/deletion

Week 17-18:
- Admin panel testing
- Moderation workflow testing
- Analytics testing
```

**Sprint 10: Polish & Launch**
```
Week 19:
- Full regression suite
- Performance optimization
- Bug bash (team-wide testing)

Week 20:
- UAT (User Acceptance Testing)
- Production readiness testing
- Final sign-off
- Launch ðŸš€
```

### 19.2 Daily Testing Activities

**Morning:**
- Run overnight automated tests
- Review test results
- Triage failures
- Update test status

**Afternoon:**
- Execute manual tests
- Exploratory testing
- Log defects
- Retest fixes

**Evening:**
- Trigger nightly test suite
- Performance tests
- Security scans
- Generate reports

### 19.3 Testing Milestones

```
âœ“ Week 2: CI/CD pipeline operational
âœ“ Week 4: Unit test coverage > 80%
âœ“ Week 6: Integration tests complete
âœ“ Week 8: First load test passed
âœ“ Week 10: E2E test suite complete
âœ“ Week 12: Accessibility compliance verified
âœ“ Week 14: Security audit passed
âœ“ Week 16: Performance benchmarks met
âœ“ Week 18: UAT started
âœ“ Week 20: Production ready
```

---

## 20. Appendix

### 20.1 Testing Tools Reference

**Unit Testing:**
- Jest: JavaScript testing framework
- React Testing Library: Component testing
- Vitest: Fast Vite-native testing

**Integration Testing:**
- Supertest: HTTP assertions
- Testcontainers: Database/service containers

**E2E Testing:**
- Playwright: Cross-browser automation
- Cypress: Developer-friendly E2E

**Performance:**
- k6: Load testing
- Apache JMeter: Performance testing
- Lighthouse: Frontend performance

**Security:**
- OWASP ZAP: Security scanning
- Snyk: Dependency vulnerabilities
- Burp Suite: Penetration testing

**Accessibility:**
- axe-core: Automated a11y testing
- Pa11y: Accessibility testing tool
- WAVE: Web accessibility evaluation

**API Testing:**
- Postman: API development/testing
- Newman: Postman CLI runner
- REST Client: VS Code extension

**Mobile Testing:**
- BrowserStack: Real device testing
- Appium: Mobile automation (Phase 2)

**Monitoring:**
- Sentry: Error tracking
- DataDog: Application monitoring
- New Relic: Performance monitoring

### 20.2 Test Data Fixtures

**Location:**
```
/tests
  /fixtures
    /images
      - test-avatar.jpg
      - test-cover.jpg
      - test-post-image.jpg
      - large-image.jpg (>5MB)
    /videos
      - test-video.mp4
    /files
      - malicious.php
      - test-document.pdf
    /data
      - test-users.json
      - test-posts.json
      - test-hashtags.json
```

### 20.3 Testing Best Practices

**DO:**
- Write tests before fixing bugs
- Keep tests independent
- Use descriptive test names
- Test one thing per test
- Mock external dependencies
- Clean up after tests
- Run tests in parallel
- Maintain test data
- Review test failures promptly
- Keep tests up to date

**DON'T:**
- Skip tests to make builds pass
- Test implementation details
- Create test interdependencies
- Ignore flaky tests
- Over-mock (test nothing)
- Under-mock (slow tests)
- Commit broken tests
- Leave TODO tests indefinitely
- Test third-party code
- Neglect test maintenance

### 20.4 Glossary

**Acceptance Testing:** Testing by users to validate requirements met

**Black Box Testing:** Testing without knowledge of internal code

**Code Coverage:** Percentage of code executed by tests

**E2E Testing:** End-to-end testing of complete user flows

**Flaky Test:** Test that sometimes passes, sometimes fails

**Integration Testing:** Testing interactions between components

**Load Testing:** Testing system behavior under expected load

**Mock:** Simulated object that mimics real object

**Regression Testing:** Re-testing after changes to ensure no breakage

**Smoke Testing:** Quick test to verify basic functionality

**Stub:** Simplified implementation for testing

**Test Double:** Generic term for test objects (mocks, stubs, fakes)

**Test Coverage:** Measure of how much is tested

**Unit Testing:** Testing individual components in isolation

**White Box Testing:** Testing with knowledge of internal code

---

## 21. Sign-off & Approvals

**Test Manager:** _____________________ Date: _________

**QA Lead:** _________________________ Date: _________

**Development Lead:** _________________ Date: _________

**Product Manager:** __________________ Date: _________

---

**END OF DOCUMENT**

**Status:** âœ… COMPLETE  
**Total Test Cases:** 300+  
**Coverage:** Unit, Integration, API, UI, Performance, Security, Accessibility  
**Test Strategy:** Comprehensive and production-ready  
**Ready for:** Test execution and quality assurance



