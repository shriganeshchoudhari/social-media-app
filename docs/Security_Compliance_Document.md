# Security & Compliance Document
## ConnectHub Social Media Platform

**Version:** 1.0  
**Date:** February 12, 2026  
**Status:** Complete - Production Ready  
**Classification:** Confidential

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Security Framework](#2-security-framework)
3. [Threat Model](#3-threat-model)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [Data Security](#5-data-security)
6. [Network Security](#6-network-security)
7. [Application Security](#7-application-security)
8. [Infrastructure Security](#8-infrastructure-security)
9. [API Security](#9-api-security)
10. [Privacy & Data Protection](#10-privacy--data-protection)
11. [GDPR Compliance](#11-gdpr-compliance)
12. [Security Monitoring](#12-security-monitoring)
13. [Incident Response](#13-incident-response)
14. [Vulnerability Management](#14-vulnerability-management)
15. [Security Testing](#15-security-testing)
16. [Third-Party Security](#16-third-party-security)
17. [Security Policies](#17-security-policies)
18. [Compliance Requirements](#18-compliance-requirements)
19. [Audit & Reporting](#19-audit--reporting)
20. [Appendix](#20-appendix)

---

## 1. Introduction

### 1.1 Purpose

This document defines the comprehensive security and compliance framework for ConnectHub, ensuring protection of user data, system integrity, and regulatory compliance.

### 1.2 Scope

**Covers:**
- Security architecture and controls
- Data protection measures
- Privacy compliance (GDPR, CCPA)
- Security monitoring and incident response
- Vulnerability management
- Third-party security
- Security policies and procedures

**Applies to:**
- All ConnectHub systems and services
- User data and content
- Employee and contractor access
- Third-party integrations
- Cloud infrastructure

### 1.3 Security Objectives

**Confidentiality:**
- Protect user data from unauthorized access
- Encrypt sensitive data at rest and in transit
- Implement strong access controls

**Integrity:**
- Prevent unauthorized data modification
- Maintain data accuracy and completeness
- Ensure system reliability

**Availability:**
- Maintain 99.9% uptime
- Protect against DDoS attacks
- Implement disaster recovery

**Privacy:**
- Comply with GDPR and privacy regulations
- Give users control over their data
- Transparent data practices

### 1.4 Security Principles

**Defense in Depth:**
- Multiple layers of security controls
- No single point of failure
- Redundant protection mechanisms

**Least Privilege:**
- Minimum necessary access
- Role-based access control
- Regular access reviews

**Secure by Default:**
- Security built into design
- Secure default configurations
- No security through obscurity

**Zero Trust:**
- Never trust, always verify
- Authenticate and authorize every request
- Micro-segmentation

---

## 2. Security Framework

### 2.1 Security Architecture

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚            User Access Layer                    â”‚
â”‚  - HTTPS/TLS 1.3                               â”‚
â”‚  - WAF (Web Application Firewall)              â”‚
â”‚  - DDoS Protection (CloudFront + Shield)       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚        Authentication & Authorization           â”‚
â”‚  - JWT tokens                                   â”‚
â”‚  - OAuth 2.0                                    â”‚
â”‚  - Multi-factor authentication                 â”‚
â”‚  - Session management                           â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚           Application Layer                     â”‚
â”‚  - Input validation                             â”‚
â”‚  - Output encoding                              â”‚
â”‚  - CSRF protection                              â”‚
â”‚  - Security headers                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚              Data Layer                         â”‚
â”‚  - Encryption at rest (AES-256)                â”‚
â”‚  - Encryption in transit (TLS 1.3)             â”‚
â”‚  - Database access control                      â”‚
â”‚  - Data classification                          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   â”‚
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚         Infrastructure Layer                    â”‚
â”‚  - Network segmentation (VPC)                   â”‚
â”‚  - Security groups                              â”‚
â”‚  - IAM roles and policies                       â”‚
â”‚  - Logging and monitoring                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### 2.2 Security Controls Matrix

| Control Area | Preventive | Detective | Corrective |
|--------------|------------|-----------|------------|
| **Access Control** | IAM, MFA | Login monitoring | Account lockout |
| **Data Protection** | Encryption | DLP scanning | Data recovery |
| **Network** | Firewall, WAF | IDS/IPS | IP blocking |
| **Application** | Input validation | SAST/DAST | Patch deployment |
| **Infrastructure** | Security groups | CloudTrail | Auto-remediation |
| **Monitoring** | N/A | SIEM, alerts | Incident response |

### 2.3 Security Responsibilities

**Security Team:**
- Define security policies
- Conduct security reviews
- Manage incidents
- Perform audits

**Development Team:**
- Secure coding practices
- Code reviews
- Security testing
- Vulnerability remediation

**DevOps Team:**
- Infrastructure security
- Access management
- Security monitoring
- Patch management

**All Employees:**
- Security awareness
- Report incidents
- Follow policies
- Protect credentials

### 2.4 Security Standards & Frameworks

**Compliance with:**
- OWASP Top 10 (Web Security)
- SANS Top 25 (Software Errors)
- CIS Benchmarks (Infrastructure)
- NIST Cybersecurity Framework
- ISO 27001 (Information Security)
- SOC 2 Type II (planned)

---

## 3. Threat Model

### 3.1 Assets

**Critical Assets:**
1. User personal data (PII)
2. Authentication credentials
3. User-generated content
4. API keys and secrets
5. Database (user data, posts, messages)
6. Source code
7. Infrastructure credentials

**Asset Classification:**
```
Public:      No sensitivity (e.g., public posts)
Internal:    ConnectHub employees only
Confidential: Sensitive user data
Restricted:  Authentication credentials, secrets
```

### 3.2 Threat Actors

**External Attackers:**
- Skill Level: Low to Advanced
- Motivation: Financial gain, data theft
- Methods: Automated attacks, SQL injection, XSS

**Malicious Users:**
- Skill Level: Low to Medium
- Motivation: Harassment, spam, abuse
- Methods: Account abuse, content violations

**Insider Threats:**
- Skill Level: High (privileged access)
- Motivation: Negligence or malicious intent
- Methods: Data exfiltration, sabotage

**Nation-State Actors:**
- Skill Level: Advanced Persistent Threat (APT)
- Motivation: Espionage, disruption
- Methods: Zero-day exploits, social engineering

### 3.3 Attack Vectors

**Web Application:**
- SQL Injection
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Remote Code Execution
- Authentication bypass
- Session hijacking

**API:**
- API abuse
- Rate limit bypass
- Authentication token theft
- Parameter tampering
- Mass assignment

**Infrastructure:**
- DDoS attacks
- Server compromise
- Cloud misconfigurations
- Credential theft
- Man-in-the-middle attacks

**Social Engineering:**
- Phishing
- Spear phishing
- Pretexting
- Baiting

### 3.4 Risk Assessment

| Threat | Likelihood | Impact | Risk Level | Mitigation |
|--------|------------|--------|------------|------------|
| SQL Injection | Medium | High | **HIGH** | Parameterized queries, WAF |
| XSS | High | Medium | **HIGH** | Output encoding, CSP |
| CSRF | Medium | Medium | **MEDIUM** | CSRF tokens, SameSite cookies |
| DDoS | High | High | **HIGH** | CloudFront, Rate limiting |
| Data Breach | Low | Critical | **HIGH** | Encryption, access control |
| Account Takeover | Medium | High | **HIGH** | MFA, anomaly detection |
| Insider Threat | Low | High | **MEDIUM** | Least privilege, monitoring |
| Phishing | High | Medium | **MEDIUM** | Security training, MFA |

**Risk Matrix:**
```
                 Impact
              Low  Med  High Critical
Likelihood  
Critical      M    H    H    C
High          L    M    H    H
Medium        L    L    M    H
Low           L    L    L    M

L = Low Risk
M = Medium Risk
H = High Risk
C = Critical Risk
```

---

## 4. Authentication & Authorization

### 4.1 Authentication Mechanisms

**Primary Authentication:**
```javascript
// Email + Password
- Minimum 8 characters
- Complexity requirements:
  * At least 1 uppercase letter
  * At least 1 lowercase letter
  * At least 1 number
  * At least 1 special character
- Password hashing: bcrypt (cost factor 12)
- Password history: Last 5 passwords
- Password expiry: 90 days (optional)
```

**OAuth 2.0 Integration:**
```
Supported Providers:
- Google OAuth 2.0
- GitHub OAuth
- Future: Facebook, Twitter, Apple

Flow: Authorization Code with PKCE
Scopes: email, profile
Token Storage: Encrypted in database
```

**Multi-Factor Authentication (MFA):**
```
Methods:
1. TOTP (Time-based One-Time Password)
   - Google Authenticator
   - Authy
   - Microsoft Authenticator

2. SMS (fallback, less secure)
   - Rate limited
   - Country restrictions

3. Email codes (verification only)

Enforcement:
- Optional for regular users
- Mandatory for admin accounts
- Mandatory after suspicious activity
```

### 4.2 Session Management

**JWT Tokens:**
```javascript
// Access Token
{
  "typ": "JWT",
  "alg": "HS256"
}
{
  "userId": "uuid",
  "email": "user@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234654290  // 24 hours
}

// Refresh Token
{
  "userId": "uuid",
  "tokenId": "unique-id",
  "iat": 1234567890,
  "exp": 1237259290  // 30 days
}

Security Measures:
- Secret key: 256-bit random
- Rotation: Every 90 days
- Storage: HttpOnly, Secure, SameSite cookies
- Invalidation: On logout, password change
```

**Session Security:**
```
Session Timeout:
- Idle timeout: 30 minutes
- Absolute timeout: 24 hours
- Remember me: 30 days (with refresh token)

Session Storage:
- Redis (distributed sessions)
- Session ID: 128-bit random
- Encrypted session data

Session Validation:
- Verify signature on every request
- Check expiration
- Validate user agent (optional)
- Check IP (suspicious if changed)
```

### 4.3 Authorization

**Role-Based Access Control (RBAC):**
```
Roles:
1. User (default)
   - Create posts
   - Comment, like, share
   - Message other users
   - Manage own profile

2. Verified User
   - All user permissions
   - Verified badge
   - Higher rate limits

3. Moderator
   - All user permissions
   - Review reported content
   - Hide posts
   - Warn users

4. Admin
   - All permissions
   - User management
   - System configuration
   - Access logs and metrics

5. Super Admin
   - All admin permissions
   - Role assignment
   - Audit logs
   - System-level access
```

**Permission Checks:**
```javascript
// Middleware for authorization
async function authorize(requiredPermission) {
  return async (req, res, next) => {
    const user = req.user;
    
    // Check if user has permission
    const hasPermission = await checkPermission(
      user.role,
      requiredPermission
    );
    
    if (!hasPermission) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission for this action'
      });
    }
    
    next();
  };
}

// Usage
router.delete('/posts/:id', 
  authenticate,
  authorize('delete:post'),
  deletePost
);
```

**Attribute-Based Access Control (ABAC):**
```javascript
// Resource ownership check
function canEditPost(user, post) {
  // Owner can edit
  if (post.authorId === user.id) return true;
  
  // Admin can edit
  if (user.role === 'admin') return true;
  
  // Within edit window (15 minutes)
  const editWindow = 15 * 60 * 1000;
  const postAge = Date.now() - post.createdAt;
  if (postAge < editWindow && post.authorId === user.id) {
    return true;
  }
  
  return false;
}
```

### 4.4 Password Security

**Password Policy:**
```
Requirements:
- Minimum length: 8 characters
- Maximum length: 128 characters
- Complexity: Mix of upper, lower, numbers, symbols
- No common passwords (check against list)
- No user info (username, email, name)

Prohibited:
- "password", "123456", "qwerty"
- Previously breached passwords (HaveIBeenPwned API)
- Sequential characters: "abcd", "1234"
```

**Password Storage:**
```javascript
import bcrypt from 'bcrypt';

// Hash password
const saltRounds = 12;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verify password
const isValid = await bcrypt.compare(password, hashedPassword);

// Never log or display passwords
logger.info('User login', { 
  userId: user.id,
  // password: NEVER LOG THIS
});
```

**Password Reset:**
```
Flow:
1. User requests reset
2. Generate secure token (32 bytes random)
3. Send email with reset link
4. Token expires in 1 hour
5. User sets new password
6. Invalidate all sessions
7. Send confirmation email

Security:
- Rate limit: 3 requests per hour per email
- Token single-use
- Verify email ownership
- Log all password changes
```

### 4.5 Account Security

**Account Lockout:**
```
Failed Login Attempts:
- Threshold: 5 failed attempts
- Lockout duration: 15 minutes
- Escalation: 30 min, 1 hour, 24 hours
- Unlock: Automatic after duration or password reset

CAPTCHA:
- After 2 failed attempts
- Prevents automated attacks
- Google reCAPTCHA v3
```

**Suspicious Activity Detection:**
```
Triggers:
- Login from new device/location
- Multiple failed login attempts
- Password change
- Email change
- 2FA disabled
- Large data export request

Actions:
- Email notification
- Require re-authentication
- Mandatory MFA challenge
- Temporary account lock
- Security team alert (if severe)
```

**Account Recovery:**
```
Methods:
1. Email verification
2. Security questions (optional)
3. Support ticket (manual verification)

Verification Required:
- Email ownership
- Last login details
- Recent activity
- Payment information (if applicable)
```

---

## 5. Data Security

### 5.1 Data Classification

**Data Categories:**

**Public:**
- Public posts and comments
- Public profiles
- Verified badge status
- Public media (images, videos)

**Internal:**
- Analytics data (aggregated)
- System logs (anonymized)
- Performance metrics

**Confidential:**
- Email addresses
- Private posts and messages
- User preferences
- Login history
- IP addresses

**Restricted:**
- Passwords (hashed)
- Authentication tokens
- API keys
- Payment information (Phase 2)
- Government IDs (verification)

### 5.2 Encryption

**Encryption at Rest:**
```
Database (PostgreSQL):
- AWS RDS Encryption
- AES-256 encryption
- Encrypted snapshots and backups
- Encrypted read replicas

File Storage (S3):
- Server-Side Encryption (SSE-S3)
- AES-256 encryption
- Encrypted bucket policy enforced
- Encryption in flight (TLS)

Secrets:
- AWS Secrets Manager
- AES-256 encryption
- Automatic rotation
- Access logging

Application Secrets:
- Environment variables (encrypted)
- Encrypted config files
- No hardcoded secrets in code
```

**Encryption in Transit:**
```
Web Traffic:
- TLS 1.3 (preferred)
- TLS 1.2 (minimum)
- Strong cipher suites only
- HSTS enabled (max-age=31536000)
- Certificate pinning (mobile apps)

Database Connections:
- SSL/TLS required
- Certificate verification
- Encrypted replication

API Communication:
- HTTPS only
- No HTTP endpoints
- Redirect HTTP to HTTPS

Internal Services:
- VPC peering (encrypted)
- TLS for service-to-service
- mTLS for sensitive services
```

**Key Management:**
```
AWS KMS (Key Management Service):
- Customer Managed Keys (CMK)
- Automatic key rotation (yearly)
- Audit trail (CloudTrail)
- Least privilege access

Key Hierarchy:
- Master Key (KMS)
  â””â”€ Data Encryption Keys (DEK)
      â””â”€ Encrypted data

Key Access:
- Role-based access
- MFA for key operations
- Logged and monitored
```

### 5.3 Data Retention

**Retention Policies:**

```
Active User Data:
- Retained while account is active
- No automatic deletion

Deleted User Data:
- Soft delete: 30 days
- Hard delete: After 30 days
- Backups: 90 days (then permanently deleted)

Logs:
- Application logs: 90 days
- Security logs: 1 year
- Audit logs: 7 years (compliance)

Analytics:
- Aggregated data: Indefinite
- Individual user data: 2 years

Inactive Accounts:
- Email notification: 18 months of inactivity
- Account deletion: 24 months of inactivity
- User can reactivate before deletion
```

**Data Deletion:**
```javascript
// Soft delete user account
async function deleteUserAccount(userId) {
  await db.transaction(async (trx) => {
    // Mark user as deleted
    await trx('users')
      .where({ id: userId })
      .update({
        deleted_at: new Date(),
        email: `deleted_${userId}@deleted.local`,
        status: 'deleted'
      });
    
    // Anonymize posts (keep content, remove author)
    await trx('posts')
      .where({ author_id: userId })
      .update({ author_id: null, author_name: 'Deleted User' });
    
    // Delete private data
    await trx('messages').where({ user_id: userId }).del();
    await trx('notifications').where({ user_id: userId }).del();
    
    // Schedule permanent deletion (30 days)
    await scheduleJob('permanent-delete-user', userId, { delay: '30 days' });
  });
  
  // Delete from cache
  await redis.del(`user:${userId}`);
  
  // Delete media files (async)
  await queueMediaDeletion(userId);
  
  // Audit log
  await auditLog.log('user_deleted', { userId });
}
```

### 5.4 Data Backup

**Backup Strategy:**
```
Daily Backups:
- Database snapshots (automated)
- S3 versioning (media files)
- Configuration backups

Weekly Backups:
- Full database dump
- Archived to Glacier

Point-in-Time Recovery:
- Database: 35 days
- S3: Version history indefinite

Backup Encryption:
- All backups encrypted (AES-256)
- Encrypted in transit and at rest
- Keys managed by KMS

Backup Testing:
- Monthly restore test
- Verify data integrity
- Document recovery time
```

### 5.5 Data Sanitization

**Input Sanitization:**
```javascript
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';

// Sanitize HTML input
function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
    ALLOWED_ATTR: ['href'],
    ALLOW_DATA_ATTR: false,
  });
}

// Sanitize text input
function sanitizeText(text) {
  // Remove null bytes
  text = text.replace(/\0/g, '');
  
  // Trim whitespace
  text = validator.trim(text);
  
  // Escape HTML entities
  text = validator.escape(text);
  
  return text;
}

// Validate and sanitize email
function sanitizeEmail(email) {
  email = validator.normalizeEmail(email);
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email format');
  }
  return email;
}
```

**Output Encoding:**
```javascript
// HTML encoding
function encodeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

// JavaScript encoding
function encodeJS(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
}

// URL encoding
function encodeURL(str) {
  return encodeURIComponent(str);
}
```

---

## 6. Network Security

### 6.1 Network Architecture

**VPC Configuration:**
```
Production VPC: 10.0.0.0/16

Public Subnets (Internet-facing):
- Load Balancers
- NAT Gateways
- Bastion hosts

Private Subnets (Application):
- ECS tasks
- Lambda functions
- Internal services

Database Subnets (Isolated):
- RDS instances
- ElastiCache
- Elasticsearch

No direct internet access to private/database subnets
All outbound traffic via NAT Gateway
```

**Network Segmentation:**
```
DMZ (Public Subnet)
    â†“
Application Tier (Private Subnet)
    â†“
Data Tier (Database Subnet)

Each tier in separate subnets
Security groups control traffic between tiers
Network ACLs provide subnet-level filtering
```

### 6.2 Firewall Rules

**Security Groups:**

**ALB Security Group:**
```
Inbound:
- Port 80 (HTTP): 0.0.0.0/0 â†’ Redirect to HTTPS
- Port 443 (HTTPS): 0.0.0.0/0 â†’ Accept

Outbound:
- All traffic to ECS security group
```

**ECS Security Group:**
```
Inbound:
- Port 8080: From ALB security group only
- Port 9090 (metrics): From monitoring SG only

Outbound:
- Port 5432: To RDS security group
- Port 6379: To Redis security group
- Port 9200: To Elasticsearch SG
- Port 443: To internet (via NAT)
```

**RDS Security Group:**
```
Inbound:
- Port 5432: From ECS security group only

Outbound:
- None (database doesn't initiate connections)
```

**Network ACLs:**
```
Public Subnet:
- Allow inbound 80, 443 from internet
- Allow outbound to internet
- Deny known malicious IPs

Private Subnet:
- Allow inbound from public subnet only
- Allow outbound to internet (via NAT)
- Deny direct internet access

Database Subnet:
- Allow inbound from private subnet only
- Deny all outbound internet
- Deny all other inbound traffic
```

### 6.3 DDoS Protection

**AWS Shield Standard:**
- Automatic DDoS protection
- Protection against common attacks
- No additional cost

**AWS Shield Advanced (optional):**
- Advanced DDoS protection
- 24/7 DDoS Response Team (DRT)
- Cost protection
- Real-time attack notifications

**CloudFront (CDN):**
```
DDoS Mitigation:
- Edge location distribution
- Traffic absorption
- Automatic scaling
- Geographic restrictions (if needed)

Rate Limiting:
- Request rate limiting
- WAF integration
- Custom rate rules per endpoint
```

**Application-Level Protection:**
```javascript
// Rate limiting middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter limits for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

app.use('/api/auth/login', authLimiter);
```

### 6.4 Web Application Firewall (WAF)

**AWS WAF Rules:**

**Managed Rule Groups:**
```
1. AWS Managed Rules - Core Rule Set
   - Common web exploits
   - SQL injection
   - XSS
   - Local file inclusion

2. AWS Managed Rules - Known Bad Inputs
   - Known malicious patterns
   - Bot patterns
   - Scanner signatures

3. AWS Managed Rules - IP Reputation
   - Known malicious IPs
   - Tor exit nodes
   - Proxies and VPNs (optional)
```

**Custom Rules:**
```json
{
  "Name": "RateLimitRule",
  "Priority": 1,
  "Statement": {
    "RateBasedStatement": {
      "Limit": 2000,
      "AggregateKeyType": "IP"
    }
  },
  "Action": {
    "Block": {}
  }
}

{
  "Name": "GeoBlockRule",
  "Priority": 2,
  "Statement": {
    "GeoMatchStatement": {
      "CountryCodes": ["CN", "RU", "KP"]
    }
  },
  "Action": {
    "Block": {}
  }
}

{
  "Name": "SQLInjectionRule",
  "Priority": 3,
  "Statement": {
    "SqliMatchStatement": {
      "FieldToMatch": {
        "AllQueryArguments": {}
      },
      "TextTransformations": [{
        "Priority": 0,
        "Type": "URL_DECODE"
      }]
    }
  },
  "Action": {
    "Block": {}
  }
}
```

**WAF Monitoring:**
```
Metrics:
- Blocked requests
- Allowed requests
- Rule matches
- False positives

Alerts:
- Spike in blocked requests
- New attack patterns
- Rule effectiveness

Logging:
- All WAF decisions logged
- Sent to S3 for analysis
- Integrated with SIEM
```

### 6.5 VPN & Remote Access

**Bastion Host:**
```
Purpose: Secure SSH access to private resources

Configuration:
- Minimal software installed
- Hardened OS (Amazon Linux 2)
- SSH key authentication only
- No password authentication
- MFA required for access

Access Control:
- Whitelisted IP addresses only
- Time-based access (business hours)
- Session recording
- Automatic logout after 30 min idle

Monitoring:
- All SSH sessions logged
- CloudWatch alarms on access
- Alerts on suspicious activity
```

**AWS Systems Manager Session Manager:**
```
Preferred Access Method:
- No open ports required
- No bastion host needed
- IAM-based access control
- Session logging to S3
- Audit trail in CloudTrail

Usage:
aws ssm start-session --target i-instance-id
```

---

## 7. Application Security

### 7.1 Secure Coding Practices

**Input Validation:**
```javascript
import { body, param, query, validationResult } from 'express-validator';

// Validation middleware
const validatePostCreation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be 1-5000 characters'),
  
  body('privacy')
    .isIn(['public', 'followers', 'private'])
    .withMessage('Invalid privacy setting'),
  
  body('media')
    .optional()
    .isArray({ max: 4 })
    .withMessage('Maximum 4 media files'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

router.post('/posts', authenticate, validatePostCreation, createPost);
```

**SQL Injection Prevention:**
```javascript
// ALWAYS use parameterized queries
// GOOD - Parameterized query
const user = await db.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// BAD - String concatenation (NEVER DO THIS)
const user = await db.query(
  `SELECT * FROM users WHERE email = '${email}'`
);

// ORM usage (safe)
const user = await User.findOne({ where: { email } });
```

**XSS Prevention:**
```javascript
// Content Security Policy
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.connecthub.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' https://media.connecthub.com data:; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "connect-src 'self' https://api.connecthub.com; " +
    "frame-ancestors 'none';"
  );
  next();
});

// Output encoding (React does this automatically)
function UserPost({ content }) {
  // React escapes by default
  return <div>{content}</div>;
  
  // For dangerouslySetInnerHTML, sanitize first
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: DOMPurify.sanitize(content) 
      }} 
    />
  );
}
```

**CSRF Protection:**
```javascript
import csrf from 'csurf';

// CSRF middleware
const csrfProtection = csrf({ 
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  }
});

app.use(csrfProtection);

// Send token to client
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Client includes token in requests
// Header: X-CSRF-Token: <token>
// or form field: _csrf: <token>

// SameSite cookies (additional protection)
res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
});
```

### 7.2 Security Headers

**HTTP Security Headers:**
```javascript
import helmet from 'helmet';

app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https://api.connecthub.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  
  // HSTS
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  
  // X-Frame-Options
  frameguard: {
    action: 'deny',
  },
  
  // X-Content-Type-Options
  noSniff: true,
  
  // X-XSS-Protection
  xssFilter: true,
  
  // Referrer-Policy
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin',
  },
  
  // Permissions-Policy
  permissionsPolicy: {
    features: {
      geolocation: ["'self'"],
      camera: ["'self'"],
      microphone: ["'self'"],
      payment: ["'none'"],
    },
  },
}));
```

**Custom Security Headers:**
```javascript
app.use((req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add custom headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});
```

### 7.3 File Upload Security

**File Upload Validation:**
```javascript
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4'];
  
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type'), false);
  }
  
  // Check file extension (defense in depth)
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4'];
  
  if (!allowedExts.includes(ext)) {
    return cb(new Error('Invalid file extension'), false);
  }
  
  cb(null, true);
};

// Multer configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
    files: 4, // Max 4 files
  },
  fileFilter,
});

// Upload endpoint
router.post('/upload', authenticate, upload.array('files', 4), async (req, res) => {
  const files = req.files;
  
  // Additional validation
  for (const file of files) {
    // Verify file signature (magic bytes)
    const signature = file.buffer.slice(0, 4).toString('hex');
    
    // JPEG: ffd8ffe0 or ffd8ffe1
    // PNG: 89504e47
    // GIF: 47494638
    const validSignatures = {
      'ffd8ffe0': 'image/jpeg',
      'ffd8ffe1': 'image/jpeg',
      '89504e47': 'image/png',
      '47494638': 'image/gif',
    };
    
    if (!validSignatures[signature]) {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    // Sanitize filename
    const sanitizedName = crypto.randomBytes(16).toString('hex') + 
                         path.extname(file.originalname);
    
    // Scan for malware (optional, using ClamAV or similar)
    const isSafe = await scanFile(file.buffer);
    if (!isSafe) {
      return res.status(400).json({ error: 'File contains malware' });
    }
    
    // Upload to S3
    await uploadToS3(file.buffer, sanitizedName, file.mimetype);
  }
  
  res.json({ success: true });
});
```

**Image Processing:**
```javascript
import sharp from 'sharp';

async function processImage(buffer) {
  // Strip metadata (EXIF data may contain PII)
  const processed = await sharp(buffer)
    .rotate() // Auto-rotate based on EXIF
    .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, progressive: true })
    .withMetadata(false) // Remove EXIF
    .toBuffer();
  
  return processed;
}
```

### 7.4 Dependency Management

**Package Security:**
```bash
# Regular security audits
npm audit

# Fix vulnerabilities
npm audit fix

# Snyk scanning
snyk test
snyk monitor

# Dependency updates
npm outdated
npm update

# Lock file integrity
npm ci  # Use in CI/CD (respects package-lock.json exactly)
```

**Dependency Policies:**
```json
// package.json
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix",
    "snyk": "snyk test"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=9.0.0"
  }
}
```

**Automated Scanning:**
```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: NPM Audit
        run: npm audit --audit-level=high
      
      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
```

---

## 8. Infrastructure Security

### 8.1 AWS Security Best Practices

**IAM Policies:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::connecthub-media/*",
      "Condition": {
        "StringEquals": {
          "s3:x-amz-server-side-encryption": "AES256"
        }
      }
    }
  ]
}
```

**IAM Best Practices:**
```
1. Principle of Least Privilege
   - Grant minimum necessary permissions
   - Use IAM roles, not root account
   - Regular access reviews

2. Enable MFA
   - Mandatory for all users
   - Especially for privileged accounts
   - Virtual MFA devices

3. Rotate Credentials
   - Access keys: Every 90 days
   - Passwords: Every 90 days
   - Remove unused credentials

4. Use IAM Roles
   - For EC2, ECS, Lambda
   - No hardcoded credentials
   - Temporary credentials

5. Monitor IAM Activity
   - CloudTrail logging
   - Access Advisor
   - Credential reports
```

### 8.2 Container Security

**Docker Image Security:**
```dockerfile
# Use official base images
FROM node:20-alpine

# Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy dependency files
COPY --chown=nodejs:nodejs package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application code
COPY --chown=nodejs:nodejs . .

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node healthcheck.js

# Start application
CMD ["node", "dist/server.js"]
```

**Image Scanning:**
```bash
# Scan with Snyk
snyk container test node:20-alpine

# Scan with Trivy
trivy image connecthub/api:latest

# ECR image scanning (automated)
aws ecr start-image-scan \
  --repository-name connecthub-api \
  --image-id imageTag=latest
```

**Container Runtime Security:**
```json
// ECS Task Definition Security
{
  "containerDefinitions": [{
    "readonlyRootFilesystem": true,
    "privileged": false,
    "user": "nodejs",
    "linuxParameters": {
      "capabilities": {
        "drop": ["ALL"]
      }
    }
  }]
}
```

### 8.3 Secrets Management

**AWS Secrets Manager:**
```javascript
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManagerClient({ region: 'us-east-1' });

async function getSecret(secretName) {
  try {
    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretName })
    );
    return JSON.parse(response.SecretString);
  } catch (error) {
    console.error('Error retrieving secret:', error);
    throw error;
  }
}

// Usage
const dbCreds = await getSecret('connecthub/prod/database');
const dbUrl = `postgresql://${dbCreds.username}:${dbCreds.password}@${dbCreds.host}:${dbCreds.port}/${dbCreds.database}`;
```

**Secret Rotation:**
```javascript
// Automatic rotation Lambda
exports.handler = async (event) => {
  const { SecretId, Step, Token } = event;
  
  switch (Step) {
    case 'createSecret':
      // Generate new secret
      const newPassword = generateSecurePassword();
      await setSecret(SecretId, Token, newPassword, 'AWSPENDING');
      break;
      
    case 'setSecret':
      // Update the resource with new secret
      await updateDatabasePassword(newPassword);
      break;
      
    case 'testSecret':
      // Test the new secret
      await testDatabaseConnection(newPassword);
      break;
      
    case 'finishSecret':
      // Mark the secret as current
      await finishSecret(SecretId, Token);
      break;
  }
};
```

### 8.4 Logging & Auditing

**CloudTrail:**
```
Configuration:
- Multi-region trail
- Log file validation enabled
- S3 bucket encryption
- CloudWatch Logs integration
- Log retention: 7 years

Events Logged:
- All AWS API calls
- Management events
- Data events (S3, Lambda)
- Insights events
```

**Application Logging:**
```javascript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'connecthub-api',
    environment: process.env.NODE_ENV,
  },
  transports: [
    new winston.transports.CloudWatch({
      logGroupName: '/ecs/connecthub-api',
      logStreamName: process.env.HOSTNAME,
    }),
  ],
});

// Security event logging
logger.info('User login', {
  event: 'user_login',
  userId: user.id,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  success: true,
});

logger.warn('Failed login attempt', {
  event: 'login_failed',
  email: req.body.email,
  ip: req.ip,
  attempts: failedAttempts,
});

logger.error('Unauthorized access attempt', {
  event: 'unauthorized_access',
  userId: req.user?.id,
  resource: req.path,
  ip: req.ip,
});
```

**Audit Log:**
```javascript
// Audit trail for sensitive operations
async function auditLog(action, details) {
  await db.audit_logs.insert({
    action,
    user_id: details.userId,
    ip_address: details.ip,
    user_agent: details.userAgent,
    resource_type: details.resourceType,
    resource_id: details.resourceId,
    changes: details.changes,
    timestamp: new Date(),
  });
}

// Usage
await auditLog('user_deleted', {
  userId: currentUser.id,
  ip: req.ip,
  userAgent: req.headers['user-agent'],
  resourceType: 'user',
  resourceId: deletedUserId,
  changes: { status: 'deleted' },
});
```

---

## 9. API Security

### 9.1 API Authentication

**JWT Token Security:**
```javascript
import jwt from 'jsonwebtoken';

// Generate access token
function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
      issuer: 'connecthub-api',
      audience: 'connecthub-app',
    }
  );
}

// Verify token
function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'connecthub-api',
      audience: 'connecthub-app',
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
}

// Authentication middleware
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = verifyToken(token);
    req.user = await getUserById(decoded.userId);
    next();
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}
```

### 9.2 API Rate Limiting

**Rate Limit Implementation:**
```javascript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Global rate limit
const globalLimiter = rateLimit({
  store: new RedisStore({
    client: redis,
    prefix: 'rl:global:',
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// Endpoint-specific limits
const authLimiter = rateLimit({
  store: new RedisStore({ client: redis, prefix: 'rl:auth:' }),
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
});

const postLimiter = rateLimit({
  store: new RedisStore({ client: redis, prefix: 'rl:post:' }),
  windowMs: 60 * 1000, // 1 minute
  max: 10,
});

// User-specific rate limiting
const userLimiter = rateLimit({
  store: new RedisStore({ client: redis, prefix: 'rl:user:' }),
  windowMs: 15 * 60 * 1000,
  max: async (req) => {
    // Different limits based on user tier
    if (req.user?.role === 'premium') return 5000;
    if (req.user?.role === 'verified') return 2000;
    return 1000;
  },
  keyGenerator: (req) => req.user?.id || req.ip,
});

// Apply rate limiters
app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/posts', authenticate, postLimiter);
```

### 9.3 API Input Validation

**Request Validation:**
```javascript
import Joi from 'joi';

// Validation schemas
const schemas = {
  createPost: Joi.object({
    content: Joi.string().min(1).max(5000).required(),
    privacy: Joi.string().valid('public', 'followers', 'private').required(),
    media: Joi.array().items(Joi.string().uri()).max(4),
    hashtags: Joi.array().items(Joi.string().pattern(/^[a-zA-Z0-9_]+$/)).max(10),
  }),
  
  updateProfile: Joi.object({
    displayName: Joi.string().min(1).max(50),
    bio: Joi.string().max(160),
    location: Joi.string().max(100),
    website: Joi.string().uri(),
  }),
  
  sendMessage: Joi.object({
    recipientId: Joi.string().uuid().required(),
    content: Joi.string().min(1).max(1000).required(),
  }),
};

// Validation middleware
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({ errors });
    }
    
    req.validatedBody = value;
    next();
  };
}

// Usage
router.post('/posts', 
  authenticate,
  validate(schemas.createPost),
  createPost
);
```

### 9.4 API Security Headers

**CORS Configuration:**
```javascript
import cors from 'cors';

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'https://connecthub.com',
      'https://www.connecthub.com',
      'https://staging.connecthub.com',
    ];
    
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000');
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
```

### 9.5 API Error Handling

**Secure Error Responses:**
```javascript
// Error handler middleware
app.use((err, req, res, next) => {
  // Log error with full details (server-side)
  logger.error('API Error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
  });
  
  // Generic error response (client-side)
  // Never expose sensitive error details
  const statusCode = err.statusCode || 500;
  
  const response = {
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
  };
  
  // Only include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
});

// Custom error classes
class ValidationError extends Error {
  constructor(message, fields) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.code = 'VALIDATION_ERROR';
    this.fields = fields;
  }
}

class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    this.statusCode = 401;
    this.code = 'UNAUTHORIZED';
  }
}

class ForbiddenError extends Error {
  constructor(message = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
    this.code = 'FORBIDDEN';
  }
}
```

---

## 10. Privacy & Data Protection

### 10.1 Privacy by Design

**Principles:**

**Data Minimization:**
- Collect only necessary data
- Don't collect PII unless required
- Anonymize analytics data
- Regular data purging

**Purpose Limitation:**
- Use data only for stated purpose
- Don't repurpose without consent
- Clear privacy policy
- Transparent data practices

**Consent Management:**
```javascript
// User consent tracking
const consentTypes = {
  ESSENTIAL: 'essential',           // Required for service
  ANALYTICS: 'analytics',           // Usage analytics
  MARKETING: 'marketing',           // Marketing emails
  THIRD_PARTY: 'third_party_share', // Sharing with partners
};

// Store consent preferences
async function updateConsent(userId, consents) {
  await db.user_consents.upsert({
    user_id: userId,
    essential: true, // Always true
    analytics: consents.analytics || false,
    marketing: consents.marketing || false,
    third_party_share: consents.third_party || false,
    updated_at: new Date(),
  });
}

// Check consent before action
async function hasConsent(userId, type) {
  const consent = await db.user_consents.findOne({
    where: { user_id: userId }
  });
  return consent?.[type] || false;
}

// Example: Only send marketing email if consented
if (await hasConsent(user.id, consentTypes.MARKETING)) {
  await sendMarketingEmail(user.email);
}
```

### 10.2 User Privacy Controls

**Privacy Settings:**
```javascript
// User privacy options
const privacySettings = {
  // Profile visibility
  profileVisibility: {
    type: 'enum',
    values: ['public', 'followers', 'private'],
    default: 'public',
  },
  
  // Who can message
  allowMessages: {
    type: 'enum',
    values: ['everyone', 'followers', 'none'],
    default: 'followers',
  },
  
  // Who can see posts
  defaultPostPrivacy: {
    type: 'enum',
    values: ['public', 'followers', 'private'],
    default: 'public',
  },
  
  // Search visibility
  searchable: {
    type: 'boolean',
    default: true,
  },
  
  // Activity status
  showOnlineStatus: {
    type: 'boolean',
    default: true,
  },
  
  // Read receipts
  showReadReceipts: {
    type: 'boolean',
    default: true,
  },
};
```

**Data Access & Portability:**
```javascript
// Export user data (GDPR Article 20)
async function exportUserData(userId) {
  const data = {
    profile: await db.users.findById(userId),
    posts: await db.posts.findAll({ where: { author_id: userId } }),
    comments: await db.comments.findAll({ where: { user_id: userId } }),
    likes: await db.likes.findAll({ where: { user_id: userId } }),
    followers: await db.follows.findAll({ where: { followee_id: userId } }),
    following: await db.follows.findAll({ where: { follower_id: userId } }),
    messages: await db.messages.findAll({ where: { sender_id: userId } }),
    activity: await db.activity_logs.findAll({ where: { user_id: userId } }),
  };
  
  // Remove sensitive data
  delete data.profile.password;
  delete data.profile.email_verified_token;
  
  // Create JSON export
  const exportFile = JSON.stringify(data, null, 2);
  
  // Save to S3 (encrypted, temporary)
  const key = `exports/${userId}/${Date.now()}.json`;
  await s3.upload({
    Bucket: 'connecthub-exports',
    Key: key,
    Body: exportFile,
    ServerSideEncryption: 'AES256',
  });
  
  // Generate presigned URL (expires in 7 days)
  const url = s3.getSignedUrl('getObject', {
    Bucket: 'connecthub-exports',
    Key: key,
    Expires: 7 * 24 * 60 * 60,
  });
  
  // Email download link
  await sendEmail({
    to: user.email,
    subject: 'Your data export is ready',
    body: `Your data export is ready for download: ${url}`,
  });
  
  return url;
}
```

### 10.3 Right to be Forgotten

**Account Deletion:**
```javascript
// Complete account deletion (GDPR Article 17)
async function deleteUserAccount(userId) {
  await db.transaction(async (trx) => {
    // 1. Anonymize user record
    await trx('users').where({ id: userId }).update({
      email: `deleted_${userId}@deleted.local`,
      username: `deleted_user_${userId}`,
      first_name: null,
      last_name: null,
      bio: null,
      location: null,
      website: null,
      avatar: null,
      cover_photo: null,
      phone: null,
      date_of_birth: null,
      deleted_at: new Date(),
      status: 'deleted',
    });
    
    // 2. Handle user content
    // Option A: Delete all content
    await trx('posts').where({ author_id: userId }).del();
    
    // Option B: Anonymize posts (keep content, remove author)
    await trx('posts').where({ author_id: userId }).update({
      author_id: null,
      author_name: 'Deleted User',
    });
    
    // 3. Delete private data
    await trx('messages').where({ user_id: userId }).del();
    await trx('notifications').where({ user_id: userId }).del();
    await trx('sessions').where({ user_id: userId }).del();
    await trx('user_settings').where({ user_id: userId }).del();
    await trx('user_consents').where({ user_id: userId }).del();
    
    // 4. Delete activity logs (keep audit trail for compliance)
    // Anonymize instead of delete
    await trx('activity_logs').where({ user_id: userId }).update({
      user_id: null,
      anonymized: true,
    });
    
    // 5. Delete from search index
    await elasticsearch.delete({
      index: 'users',
      id: userId,
    });
    
    // 6. Delete from cache
    await redis.del(`user:${userId}`);
    
    // 7. Schedule media deletion
    await queueJob('delete-user-media', { userId });
    
    // 8. Audit log
    await trx('audit_logs').insert({
      action: 'user_deleted',
      user_id: userId,
      timestamp: new Date(),
      details: { type: 'gdpr_deletion' },
    });
  });
  
  // 9. Remove from mailing lists
  await emailService.unsubscribe(user.email);
  
  // 10. Notify third parties (if data was shared)
  await notifyThirdParties('user_deleted', { userId });
}
```

### 10.4 Privacy Policy

**Required Elements:**
```markdown
Privacy Policy Must Include:

1. Data Controller Information
   - Company name and contact
   - Data Protection Officer (DPO) contact
   
2. Data Collection
   - What data is collected
   - How data is collected
   - Why data is collected
   
3. Data Usage
   - How data is used
   - Legal basis for processing
   - Retention periods
   
4. Data Sharing
   - Third parties who receive data
   - Purpose of sharing
   - International transfers
   
5. User Rights
   - Right to access
   - Right to rectification
   - Right to erasure
   - Right to data portability
   - Right to object
   - Right to withdraw consent
   
6. Security Measures
   - How data is protected
   - Encryption
   - Access controls
   
7. Cookies
   - Types of cookies used
   - Purpose of cookies
   - How to manage cookies
   
8. Contact Information
   - How to exercise rights
   - How to file complaints
   - Supervisory authority contact
```

---

## 11. GDPR Compliance

### 11.1 GDPR Requirements

**Lawful Basis for Processing:**
```
1. Consent
   - Explicit opt-in
   - Granular consent
   - Easy to withdraw
   
2. Contract
   - Necessary for service delivery
   - Account creation, posts, messages
   
3. Legal Obligation
   - Compliance with law
   - Court orders, law enforcement requests
   
4. Legitimate Interest
   - Fraud prevention
   - Security measures
   - Analytics (anonymized)
```

**Data Subject Rights:**
```
1. Right to Access (Article 15)
   - User can request copy of their data
   - Provided free of charge
   - Within 30 days
   
2. Right to Rectification (Article 16)
   - User can correct inaccurate data
   - Via account settings
   
3. Right to Erasure (Article 17)
   - "Right to be forgotten"
   - Delete account functionality
   - 30-day deletion process
   
4. Right to Data Portability (Article 20)
   - Export data in machine-readable format
   - JSON export functionality
   
5. Right to Object (Article 21)
   - Object to data processing
   - Opt-out of marketing
   - Consent withdrawal
   
6. Right to Restrict Processing (Article 18)
   - Temporarily limit data use
   - Account suspension
```

### 11.2 Data Processing Records

**Article 30: Records of Processing Activities**
```javascript
// Maintain processing records
const processingActivities = [
  {
    name: 'User Registration',
    purpose: 'Account creation and management',
    legalBasis: 'Contract',
    dataCategories: ['Name', 'Email', 'Password (hashed)'],
    recipients: ['Database', 'Email Service (SendGrid)'],
    retention: 'Until account deletion + 30 days',
    securityMeasures: ['Encryption at rest', 'Access control', 'Audit logging'],
  },
  {
    name: 'Analytics',
    purpose: 'Service improvement and analytics',
    legalBasis: 'Legitimate Interest',
    dataCategories: ['Usage data (anonymized)', 'IP addresses (anonymized)'],
    recipients: ['DataDog', 'Internal analytics'],
    retention: '2 years',
    securityMeasures: ['Anonymization', 'Aggregation', 'Access control'],
  },
  {
    name: 'Email Communications',
    purpose: 'Transactional and marketing emails',
    legalBasis: 'Consent (marketing), Contract (transactional)',
    dataCategories: ['Email', 'Name', 'Preferences'],
    recipients: ['SendGrid'],
    retention: 'Until consent withdrawn',
    securityMeasures: ['Encryption in transit', 'Access control'],
  },
];
```

### 11.3 Data Protection Impact Assessment (DPIA)

**When Required:**
- High risk to data subject rights
- Large-scale processing of sensitive data
- Systematic monitoring
- New technologies

**DPIA Template:**
```markdown
# Data Protection Impact Assessment

## 1. Description of Processing
- Purpose: [e.g., User messaging feature]
- Data collected: [e.g., Message content, metadata]
- Processing operations: [e.g., Storage, encryption, transmission]

## 2. Necessity and Proportionality
- Why is this processing necessary?
- Are there less intrusive alternatives?
- Is the data adequate and relevant?

## 3. Risks to Data Subjects
| Risk | Impact | Likelihood | Severity |
|------|--------|------------|----------|
| Unauthorized access to messages | High | Low | High |
| Message interception | High | Low | High |
| Metadata exposure | Medium | Medium | Medium |

## 4. Measures to Address Risks
- End-to-end encryption (planned Phase 2)
- TLS 1.3 for transmission
- Access controls
- Encryption at rest
- Regular security audits

## 5. Consultation
- DPO consulted: Yes
- Data subjects consulted: Via privacy policy
- Supervisory authority: Not required

## 6. Approval
- DPO approval: [Date]
- Executive approval: [Date]
```

### 11.4 Data Breach Notification

**Breach Response Plan:**
```
1. Detection (0-1 hour)
   - Identify breach
   - Assess scope
   - Contain breach

2. Investigation (1-24 hours)
   - Determine cause
   - Identify affected data
   - Count affected users
   - Assess risk to rights/freedoms

3. Notification (24-72 hours)
   - Notify supervisory authority (if high risk)
   - Notify affected users (if high risk)
   - Document breach

4. Remediation
   - Fix vulnerability
   - Prevent recurrence
   - Update security measures
```

**Breach Notification Template:**
```markdown
# Data Breach Notification

## To: [Supervisory Authority / Data Subjects]
## Date: [Date of notification]
## Incident Date: [Date of breach]

### 1. Nature of Breach
- Type of breach: [e.g., Unauthorized access, data leak]
- Data affected: [e.g., Usernames, email addresses]
- Number of affected individuals: [Number]

### 2. Likely Consequences
- Risk level: [Low/Medium/High]
- Potential harm: [Description]

### 3. Measures Taken
- Immediate actions: [e.g., Revoked access, notified users]
- Preventive measures: [e.g., Security enhancements]

### 4. Contact Point
- DPO Name: [Name]
- Email: dpo@connecthub.com
- Phone: [Phone number]

### 5. Recommendations for Data Subjects
- [e.g., Change password, monitor accounts]
```

### 11.5 International Data Transfers

**Mechanisms:**
```
EU to US Transfers:
- EU-US Data Privacy Framework
- Standard Contractual Clauses (SCCs)
- Adequacy decisions

Requirements:
- Document transfer mechanisms
- Ensure adequate protection
- Inform data subjects
- Assess third country laws
```

**Transfer Safeguards:**
```javascript
// AWS Regions
const regions = {
  EU: 'eu-west-1', // Ireland
  US: 'us-east-1', // Virginia
};

// Store EU user data in EU region
if (user.region === 'EU') {
  // Use EU region for storage
  await storeData(user.data, regions.EU);
  
  // Document transfer if data moves to US
  if (needsUSProcessing) {
    await documentTransfer({
      userId: user.id,
      fromRegion: regions.EU,
      toRegion: regions.US,
      mechanism: 'Standard Contractual Clauses',
      purpose: 'Analytics processing',
      safeguards: ['Encryption', 'Access controls', 'Audit logging'],
    });
  }
}
```

---

## 12. Security Monitoring

### 12.1 Security Information and Event Management (SIEM)

**Log Aggregation:**
```
Sources:
- Application logs
- Web server logs
- Database logs
- AWS CloudTrail
- VPC Flow Logs
- WAF logs
- Load balancer logs

Destination:
- CloudWatch Logs
- ELK Stack (Elasticsearch, Logstash, Kibana)
- SIEM (Splunk/DataDog)
```

**Security Events to Monitor:**
```
Authentication Events:
- Failed login attempts
- Account lockouts
- Password changes
- MFA setup/changes
- Unusual login locations
- Concurrent sessions

Authorization Events:
- Privilege escalation attempts
- Unauthorized resource access
- Role changes
- Permission denials

Data Access Events:
- Bulk data exports
- Sensitive data access
- Database queries from unusual sources

System Events:
- Configuration changes
- New user accounts
- Security group changes
- IAM policy updates
- Service disruptions
```

### 12.2 Intrusion Detection

**AWS GuardDuty:**
```
Threat Detection:
- Unusual API calls
- Potentially compromised instances
- Reconnaissance activities
- Cryptocurrency mining
- Unauthorized infrastructure deployments

Alerts:
- High/Medium/Low severity
- Findings sent to Security Hub
- Automated response via Lambda
- Notifications to security team
```

**Custom IDS Rules:**
```javascript
// Detect suspicious patterns
async function detectAnomalies(event) {
  const patterns = {
    // Multiple failed logins from same IP
    bruteForce: {
      threshold: 10,
      window: '5m',
      action: 'block_ip',
    },
    
    // Unusual data access volume
    dataExfiltration: {
      threshold: 1000, // requests
      window: '1h',
      action: 'alert_security_team',
    },
    
    // SQL injection attempts
    sqlInjection: {
      pattern: /(\bUNION\b|\bSELECT\b.*\bFROM\b|\bDROP\b|\bINSERT\b)/i,
      action: 'block_request',
    },
    
    // XSS attempts
    xss: {
      pattern: /<script|javascript:|onerror=/i,
      action: 'block_request',
    },
  };
  
  // Check patterns
  for (const [name, config] of Object.entries(patterns)) {
    if (matchesPattern(event, config)) {
      await triggerAction(name, config.action, event);
    }
  }
}
```

### 12.3 Security Metrics

**Key Security Indicators (KSIs):**
```
Authentication Metrics:
- Failed login rate
- Account lockout rate
- MFA adoption rate
- Password reset requests

Vulnerability Metrics:
- Open vulnerabilities by severity
- Mean time to patch
- Vulnerability scan frequency
- Dependency vulnerabilities

Incident Metrics:
- Security incidents per month
- Mean time to detect (MTTD)
- Mean time to respond (MTTR)
- Incident severity distribution

Compliance Metrics:
- Compliance score
- Policy violations
- Audit findings
- Training completion rate
```

**Dashboard:**
```javascript
// Security dashboard metrics
const securityMetrics = {
  failedLogins: {
    query: 'SELECT COUNT(*) FROM auth_logs WHERE success = false AND timestamp > NOW() - INTERVAL \'24 hours\'',
    threshold: 100,
    severity: 'warning',
  },
  
  openVulnerabilities: {
    query: 'SELECT COUNT(*) FROM vulnerabilities WHERE status = \'open\' AND severity IN (\'high\', \'critical\')',
    threshold: 0,
    severity: 'critical',
  },
  
  securityIncidents: {
    query: 'SELECT COUNT(*) FROM incidents WHERE status = \'open\'',
    threshold: 5,
    severity: 'high',
  },
  
  mfaAdoption: {
    query: 'SELECT (COUNT(*) FILTER (WHERE mfa_enabled = true)::float / COUNT(*)) * 100 FROM users',
    threshold: 80, // 80% adoption target
    severity: 'info',
  },
};
```

### 12.4 Automated Response

**Security Automation:**
```javascript
// Automated response to security events
async function handleSecurityEvent(event) {
  switch (event.type) {
    case 'brute_force_detected':
      // Block IP address
      await waf.blockIP(event.sourceIP, '24h');
      await notify.securityTeam('IP blocked: Brute force detected', event);
      break;
      
    case 'data_breach_suspected':
      // Immediate lockdown
      await user.suspendAccount(event.userId);
      await notify.urgentAlert('Possible data breach', event);
      await incident.create('high', 'data_breach', event);
      break;
      
    case 'malware_detected':
      // Quarantine file
      await s3.quarantineFile(event.fileKey);
      await notify.securityTeam('Malware quarantined', event);
      break;
      
    case 'sql_injection_attempt':
      // Block request and IP
      await waf.blockIP(event.sourceIP, '1h');
      await logger.security('SQL injection blocked', event);
      break;
      
    case 'unauthorized_admin_access':
      // Immediate alert
      await notify.urgentAlert('Unauthorized admin access attempt', event);
      await mfa.requireReauth(event.userId);
      break;
  }
}
```

---

## 13. Incident Response

### 13.1 Incident Response Plan

**IR Team:**
```
Incident Commander: Security Lead
Technical Lead: Senior Engineer
Communications: Product Manager
Legal: General Counsel (for breaches)
External: Forensics firm (if needed)
```

**Incident Phases:**
```
1. Preparation
   - IR plan documented
   - Team trained
   - Tools ready
   - Contacts updated

2. Detection & Analysis
   - Identify incident
   - Assess severity
   - Determine scope
   - Collect evidence

3. Containment
   - Short-term: Isolate affected systems
   - Long-term: Implement fixes
   - Preserve evidence

4. Eradication
   - Remove threat
   - Patch vulnerabilities
   - Update security controls

5. Recovery
   - Restore systems
   - Verify security
   - Monitor for recurrence

6. Post-Incident
   - Document lessons learned
   - Update IR plan
   - Implement improvements
```

### 13.2 Incident Classification

**Severity Levels:**

**SEV-0 (Critical):**
- Active data breach
- Ransomware
- Complete system compromise
- Response: Immediate, all hands

**SEV-1 (High):**
- Suspected breach
- Malware infection
- Successful unauthorized access
- Response: < 1 hour

**SEV-2 (Medium):**
- Failed attack attempt (logged)
- Vulnerability discovered
- Policy violation
- Response: < 4 hours

**SEV-3 (Low):**
- Suspicious activity (unconfirmed)
- Minor security issue
- False positive
- Response: Next business day

### 13.3 Communication Plan

**Internal Communication:**
```
Notification Matrix:

SEV-0:
- CEO, CTO, Security Team (immediate)
- All engineering (within 15 min)
- Legal team (within 30 min)

SEV-1:
- Security Team (immediate)
- Engineering leads (within 30 min)
- Management (within 1 hour)

SEV-2:
- Security Team (within 1 hour)
- Relevant team leads (within 4 hours)

Channels:
- PagerDuty (alerts)
- Slack #security-incidents
- Email (updates)
- Zoom (war room for SEV-0/1)
```

**External Communication:**
```
Stakeholders:
- Users (if affected)
- Supervisory authority (GDPR)
- Law enforcement (if criminal)
- Partners (if impacts them)
- Press (if public)

Templates:
- User notification
- Authority notification
- Press statement
- Status page update
```

### 13.4 Evidence Collection

**Forensics Process:**
```bash
# 1. Identify affected systems
aws ec2 describe-instances --filters "Name=tag:Environment,Values=production"

# 2. Create snapshots (preserve evidence)
aws ec2 create-snapshot \
  --volume-id vol-xxxxxxxxx \
  --description "Forensic snapshot - Incident INC-2026-001"

# 3. Collect logs
aws logs create-export-task \
  --log-group-name /ecs/connecthub-api \
  --from $(date -d '24 hours ago' +%s)000 \
  --to $(date +%s)000 \
  --destination connecthub-forensics

# 4. Collect network data
aws ec2 describe-flow-logs \
  --filter "Name=resource-id,Values=vpc-xxxxxxxx"

# 5. Document timeline
cat > incident-timeline.md << EOF
# Incident Timeline - INC-2026-001

## Detection
- 2026-02-12 10:30 UTC: Unusual login detected
- 2026-02-12 10:32 UTC: Alert triggered

## Analysis
- 2026-02-12 10:35 UTC: Logs reviewed
- 2026-02-12 10:40 UTC: Scope determined

## Containment
- 2026-02-12 10:45 UTC: Account suspended
- 2026-02-12 10:50 UTC: IP blocked
EOF

# 6. Chain of custody
# Document who handled evidence, when, and why
```

### 13.5 Post-Incident Review

**Incident Report Template:**
```markdown
# Incident Report: INC-2026-001

## Summary
- Date: 2026-02-12
- Duration: 2 hours
- Severity: SEV-1 (High)
- Status: Resolved

## Impact
- Affected users: 150
- Data exposed: Email addresses
- Downtime: 30 minutes
- Financial impact: $XXX

## Timeline
- 10:30 UTC: Detection
- 10:35 UTC: Analysis began
- 10:45 UTC: Containment
- 11:00 UTC: Eradication
- 11:30 UTC: Recovery
- 12:30 UTC: Verified resolved

## Root Cause
[Detailed explanation of what caused the incident]

## Resolution
[Steps taken to resolve]

## Lessons Learned
### What Went Well
- Detection was quick (5 min)
- Team responded promptly
- Communication was clear

### What Could Be Improved
- Earlier detection would have reduced impact
- Need better automated response
- Documentation was incomplete

## Action Items
- [ ] Implement additional monitoring
- [ ] Update runbook
- [ ] Train team on new procedures
- [ ] Review and update security controls

## Follow-up
- 1 week: Verify action items completed
- 1 month: Review effectiveness of changes
- 3 months: Update IR plan based on learnings
```

---

## 14. Vulnerability Management

### 14.1 Vulnerability Scanning

**Automated Scanning:**
```yaml
# .github/workflows/security-scan.yml
name: Security Scan

on:
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday
  push:
    branches: [main]

jobs:
  dependency-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: NPM Audit
        run: npm audit --audit-level=moderate
      
      - name: Snyk Test
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      
      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'ConnectHub'
          path: '.'
          format: 'JSON'
  
  container-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Build image
        run: docker build -t connecthub/api:${{ github.sha }} .
      
      - name: Scan with Trivy
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: connecthub/api:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
      
      - name: Upload to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
  
  sast-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

**Manual Scanning:**
```bash
# OWASP ZAP scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://staging.connecthub.com \
  -r zap-report.html

# Nmap scan
nmap -sV -sC -oA nmap-scan staging.connecthub.com

# SSL/TLS scan
sslscan staging.connecthub.com
testssl.sh staging.connecthub.com
```

### 14.2 Vulnerability Prioritization

**Scoring Matrix:**
```
Priority = (Severity Ã— Exploitability Ã— Impact) / Remediation Cost

Severity:
- Critical: 10
- High: 7
- Medium: 4
- Low: 1

Exploitability:
- Remote, no auth: 10
- Remote, auth required: 7
- Local, no auth: 4
- Local, auth required: 1

Impact:
- Complete system compromise: 10
- Partial system compromise: 7
- Confidentiality breach: 4
- Information disclosure: 1

Remediation Cost:
- Simple config change: 1
- Patch available: 2
- Code changes needed: 5
- Architecture change: 10
```

**SLA for Remediation:**
```
Critical: 24 hours
High: 7 days
Medium: 30 days
Low: 90 days
```

### 14.3 Patch Management

**Patch Process:**
```
1. Identification
   - Security advisories
   - Vendor notifications
   - Vulnerability scans

2. Assessment
   - Severity evaluation
   - Impact analysis
   - Compatibility testing

3. Testing
   - Test in staging
   - Verify functionality
   - Performance testing

4. Deployment
   - Schedule maintenance window
   - Deploy to production
   - Verify patch applied

5. Verification
   - Scan for vulnerability
   - Confirm remediated
   - Document completion
```

**Automated Patching:**
```javascript
// Automated dependency updates
// Dependabot configuration
{
  "version": 2,
  "updates": [
    {
      "package-ecosystem": "npm",
      "directory": "/",
      "schedule": {
        "interval": "weekly",
        "day": "monday"
      },
      "open-pull-requests-limit": 10,
      "reviewers": ["security-team"],
      "labels": ["dependencies", "security"],
      "versioning-strategy": "increase-if-necessary"
    }
  ]
}

// Renovate configuration
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchUpdateTypes": ["patch", "pin", "digest"],
      "automerge": true
    },
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    },
    {
      "matchPackagePatterns": ["*"],
      "matchUpdateTypes": ["minor", "major"],
      "schedule": ["before 3am on monday"]
    }
  ]
}
```

### 14.4 Disclosure Policy

**Responsible Disclosure:**
```markdown
# Security Vulnerability Disclosure Policy

## Reporting a Vulnerability

We appreciate security researchers and the community helping
us keep ConnectHub secure.

### How to Report
- Email: security@connecthub.com
- PGP Key: [Key fingerprint]
- Bug Bounty: https://bugcrowd.com/connecthub

### What to Include
- Description of vulnerability
- Steps to reproduce
- Proof of concept (if applicable)
- Potential impact
- Suggested fix (optional)

### What to Expect
- Acknowledgment within 24 hours
- Initial assessment within 3 business days
- Regular updates on progress
- Credit in security advisories (if desired)

### Our Commitment
- We will not pursue legal action for good faith research
- We will acknowledge your contribution
- We will keep you informed of our progress

### Out of Scope
- Social engineering
- Denial of service
- Spam/phishing
- Physical security

### Disclosure Timeline
- 90 days from report to public disclosure
- May be extended with mutual agreement
- Coordinated disclosure preferred
```

**Bug Bounty Program:**
```
Rewards:

Critical: $5,000 - $10,000
- Remote code execution
- Authentication bypass
- SQL injection leading to data breach

High: $1,000 - $5,000
- XSS (stored)
- CSRF on sensitive actions
- Account takeover

Medium: $500 - $1,000
- XSS (reflected)
- Information disclosure
- CSRF on non-sensitive actions

Low: $100 - $500
- Security misconfiguration
- Best practice violations
- Informational issues
```

---

## 15. Security Testing

### 15.1 Static Application Security Testing (SAST)

**Tools:**
- SonarQube
- ESLint security plugins
- Semgrep
- CodeQL

**Configuration:**
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:security/recommended',
  ],
  plugins: ['security'],
  rules: {
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'warn',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-possible-timing-attacks': 'warn',
  },
};
```

### 15.2 Dynamic Application Security Testing (DAST)

**OWASP ZAP Configuration:**
```yaml
# zap-scan.yaml
---
env:
  contexts:
    - name: "ConnectHub"
      urls:
        - "https://staging.connecthub.com"
      includePaths:
        - "https://staging.connecthub.com/.*"
      excludePaths:
        - "https://staging.connecthub.com/logout"
      authentication:
        method: "formBased"
        parameters:
          loginUrl: "https://staging.connecthub.com/api/auth/login"
          loginRequestData: "email={%username%}&password={%password%}"
        verification:
          method: "response"
          pollUrl: "https://staging.connecthub.com/api/auth/me"
      users:
        - name: "test-user"
          credentials:
            username: "test@example.com"
            password: "TestPassword123!"

  rules:
    - id: 10020 # Anti-CSRF Tokens
      threshold: "HIGH"
    - id: 10023 # Path Traversal
      threshold: "HIGH"
    - id: 40012 # SQL Injection
      threshold: "HIGH"
    - id: 40014 # XSS
      threshold: "HIGH"
```

### 15.3 Penetration Testing

**Penetration Test Scope:**
```markdown
# Penetration Test Scope

## In Scope
- Web application (connecthub.com)
- API (api.connecthub.com)
- Mobile web (m.connecthub.com)
- Staging environment

## Testing Types
- Network penetration testing
- Web application penetration testing
- API security testing
- Authentication/authorization testing
- Session management testing
- Input validation testing

## Rules of Engagement
- Test during business hours
- No social engineering
- No DoS attacks
- Staging environment preferred
- Notify before testing production

## Timeline
- Duration: 2 weeks
- Reporting: 1 week after completion
- Remediation: 30 days

## Deliverables
- Executive summary
- Technical findings
- Proof of concepts
- Remediation recommendations
- Retest report
```

**Penetration Test Checklist:**
```
Authentication:
[ ] Brute force protection
[ ] Password policy enforcement
[ ] Session timeout
[ ] Logout functionality
[ ] Password reset security
[ ] OAuth implementation

Authorization:
[ ] Privilege escalation
[ ] Insecure direct object references
[ ] Missing function level access control
[ ] CSRF protection
[ ] Horizontal privilege escalation

Input Validation:
[ ] SQL injection
[ ] XSS (stored, reflected, DOM)
[ ] Command injection
[ ] Path traversal
[ ] XML injection
[ ] LDAP injection

Session Management:
[ ] Session fixation
[ ] Session hijacking
[ ] Insecure cookie attributes
[ ] Token security

Data Exposure:
[ ] Sensitive data in URLs
[ ] Information disclosure in errors
[ ] Unencrypted data transmission
[ ] Insecure storage

Configuration:
[ ] Default credentials
[ ] Unnecessary services
[ ] Security headers
[ ] CORS misconfiguration
```

### 15.4 Security Code Review

**Code Review Checklist:**
```javascript
// Security code review guidelines

// 1. Input Validation
// âœ… GOOD
const username = validator.escape(req.body.username);
const email = validator.normalizeEmail(req.body.email);

// âŒ BAD
const username = req.body.username; // No validation

// 2. SQL Queries
// âœ… GOOD
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// âŒ BAD
const user = await db.query(`SELECT * FROM users WHERE id = ${userId}`);

// 3. Authentication
// âœ… GOOD
const hashedPassword = await bcrypt.hash(password, 12);

// âŒ BAD
const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

// 4. Authorization
// âœ… GOOD
if (post.authorId !== req.user.id && req.user.role !== 'admin') {
  return res.status(403).json({ error: 'Forbidden' });
}

// âŒ BAD
if (req.headers['x-admin'] === 'true') {
  // Trusting client-provided header
}

// 5. Secrets
// âœ… GOOD
const apiKey = process.env.API_KEY;

// âŒ BAD
const apiKey = 'hardcoded-api-key-12345';

// 6. Error Handling
// âœ… GOOD
catch (error) {
  logger.error('Database error', { error: error.message });
  return res.status(500).json({ error: 'Internal server error' });
}

// âŒ BAD
catch (error) {
  return res.status(500).json({ error: error.stack }); // Exposing stack trace
}
```

### 15.5 Security Regression Testing

**Automated Security Tests:**
```javascript
// security.test.js
describe('Security Tests', () => {
  describe('SQL Injection Protection', () => {
    it('should prevent SQL injection in login', async () => {
      const maliciousInput = "admin' OR '1'='1";
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: maliciousInput, password: 'anything' });
      
      expect(response.status).toBe(400); // Should reject, not 200
    });
  });
  
  describe('XSS Protection', () => {
    it('should sanitize HTML in posts', async () => {
      const maliciousContent = '<script>alert("XSS")</script>';
      const response = await createPost({ content: maliciousContent });
      
      expect(response.body.post.content).not.toContain('<script>');
    });
  });
  
  describe('CSRF Protection', () => {
    it('should reject requests without CSRF token', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Cookie', 'session=valid-session')
        .send({ content: 'Test post' });
      
      expect(response.status).toBe(403);
    });
  });
  
  describe('Authentication', () => {
    it('should require authentication for protected routes', async () => {
      const response = await request(app)
        .get('/api/feed');
      
      expect(response.status).toBe(401);
    });
  });
});
```

---

## 16. Third-Party Security

### 16.1 Vendor Security Assessment

**Vendor Evaluation Checklist:**
```
Security Questionnaire:

1. Data Security
   [ ] How is data encrypted (at rest/in transit)?
   [ ] Where is data stored (geographic location)?
   [ ] Who has access to our data?
   [ ] How is data backed up?
   [ ] Data retention and deletion policies?

2. Compliance
   [ ] GDPR compliant?
   [ ] SOC 2 Type II certified?
   [ ] ISO 27001 certified?
   [ ] HIPAA compliant (if applicable)?
   [ ] Privacy Shield certified?

3. Access Control
   [ ] How is access managed?
   [ ] MFA required?
   [ ] Access logs maintained?
   [ ] Principle of least privilege?

4. Incident Response
   [ ] Incident response plan?
   [ ] Breach notification process?
   [ ] SLA for notification?
   [ ] History of breaches?

5. Security Testing
   [ ] Penetration testing frequency?
   [ ] Vulnerability scanning?
   [ ] Security audit results?
   [ ] Bug bounty program?

6. Business Continuity
   [ ] Disaster recovery plan?
   [ ] RTO/RPO objectives?
   [ ] Backup procedures?
   [ ] Redundancy/failover?
```

### 16.2 Third-Party Services

**Current Third-Party Services:**
```
1. SendGrid (Email)
   - Purpose: Transactional and marketing emails
   - Data Shared: Email addresses, names
   - Security: SOC 2 Type II, GDPR compliant
   - Contract: DPA signed
   - Review: Annual

2. AWS (Infrastructure)
   - Purpose: Hosting, storage, databases
   - Data Shared: All application data
   - Security: SOC 2, ISO 27001, GDPR compliant
   - Contract: BAA signed
   - Review: Quarterly

3. Sentry (Error Tracking)
   - Purpose: Application monitoring
   - Data Shared: Error logs, user IDs (anonymized)
   - Security: SOC 2 Type II
   - Contract: DPA signed
   - Review: Annual

4. DataDog (Monitoring)
   - Purpose: Infrastructure monitoring
   - Data Shared: Metrics, logs
   - Security: SOC 2 Type II
   - Contract: DPA signed
   - Review: Annual

5. Google OAuth (Authentication)
   - Purpose: Social login
   - Data Shared: Email, profile info
   - Security: Google's security standards
   - Contract: Google OAuth ToS
   - Review: Annual

6. GitHub (Code Repository)
   - Purpose: Source code management
   - Data Shared: Source code
   - Security: SOC 2 Type II
   - Contract: Enterprise agreement
   - Review: Annual
```

### 16.3 API Security (Third-Party)

**API Key Management:**
```javascript
// Securely store third-party API keys
const secrets = {
  sendgrid: await getSecret('connecthub/prod/sendgrid'),
  stripe: await getSecret('connecthub/prod/stripe'),
  google: await getSecret('connecthub/prod/google-oauth'),
};

// Rotate keys regularly
async function rotateAPIKey(service) {
  // 1. Generate new key in service
  const newKey = await service.generateNewKey();
  
  // 2. Store new key
  await storeSecret(`connecthub/prod/${service.name}`, newKey);
  
  // 3. Update application config
  await updateConfig(service.name, newKey);
  
  // 4. Verify new key works
  await testService(service, newKey);
  
  // 5. Revoke old key
  await service.revokeOldKey();
  
  // 6. Audit log
  await auditLog('api_key_rotated', { service: service.name });
}
```

### 16.4 Supply Chain Security

**Dependency Security:**
```bash
# Lock file integrity
npm ci # Uses exact versions from lock file

# Verify package integrity
npm audit signatures

# Subresource Integrity (SRI)
# In HTML for CDN resources
<script 
  src="https://cdn.example.com/library.js"
  integrity="sha384-ABC123..."
  crossorigin="anonymous">
</script>
```

**Package Verification:**
```json
// package.json
{
  "scripts": {
    "preinstall": "npx npm-force-resolutions",
    "verify": "npm audit && snyk test"
  },
  "resolutions": {
    "lodash": "^4.17.21", // Force safe version
    "axios": "^1.6.0"
  }
}
```

---

## 17. Security Policies

### 17.1 Acceptable Use Policy

```markdown
# Acceptable Use Policy

## Purpose
Define acceptable use of ConnectHub systems and data.

## Scope
Applies to all employees, contractors, and third parties.

## Acceptable Use
- Use systems for business purposes
- Protect confidential information
- Report security incidents
- Follow security procedures

## Prohibited Activities
- Unauthorized access to systems or data
- Sharing credentials
- Installing unauthorized software
- Bypassing security controls
- Data exfiltration
- Malware distribution

## Consequences
Violations may result in:
- Account suspension
- Employment termination
- Legal action
- Criminal prosecution

## Reporting
Report violations to security@connecthub.com
```

### 17.2 Password Policy

```markdown
# Password Policy

## Requirements
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers, symbols
- No common passwords (e.g., "password", "123456")
- No personal information (name, birthday)
- Different from last 5 passwords

## Password Management
- Change every 90 days
- Don't share passwords
- Don't write down passwords
- Use password manager
- Enable MFA where available

## Account Lockout
- 5 failed attempts = 15-minute lockout
- Progressive lockout for repeated failures

## Password Reset
- Self-service via email
- Verify identity for manual reset
- New password must meet requirements
```

### 17.3 Access Control Policy

```markdown
# Access Control Policy

## Principles
- Least privilege (minimum necessary access)
- Separation of duties
- Need-to-know basis

## Access Request Process
1. Submit request via ticketing system
2. Manager approval required
3. Security team reviews
4. Access granted for specific period
5. Quarterly access review

## Access Types
- Read-only: View data
- Write: Create/update data
- Admin: Full control
- Root: System-level access (restricted)

## Access Revocation
- Immediate upon:
  - Termination
  - Role change
  - Contract end
  - Security incident

## Privileged Access
- MFA required
- Access logged and monitored
- Session recording
- Regular audits
```

### 17.4 Data Classification Policy

```markdown
# Data Classification Policy

## Classification Levels

### Public
- No restrictions
- Examples: Marketing materials, public posts

### Internal
- ConnectHub employees only
- Examples: Internal documentation, metrics

### Confidential
- Need-to-know basis
- Examples: User data, financial data
- Requires: Encryption, access controls

### Restricted
- Highest security
- Examples: Authentication credentials, secrets
- Requires: Encryption, MFA, audit logging

## Handling Requirements

| Level | Encryption | Access Control | Retention | Disposal |
|-------|-----------|----------------|-----------|----------|
| Public | Optional | None | Indefinite | None required |
| Internal | Recommended | Authentication | As needed | Secure delete |
| Confidential | Required | Authorization | Per policy | Secure wipe |
| Restricted | Required | MFA + Authorization | Minimal | Cryptographic erasure |

## Data Labeling
- Mark documents with classification
- Include in email subject lines
- Tag database columns
```

### 17.5 Incident Response Policy

```markdown
# Incident Response Policy

## Scope
Security incidents including:
- Data breaches
- Malware infections
- Unauthorized access
- DoS attacks
- Physical security incidents

## Reporting
- Report immediately to security@connecthub.com
- Call emergency hotline for critical incidents
- Do NOT discuss publicly

## Response Team
- Incident Commander: Security Lead
- Technical: Engineering team
- Communications: Product/Marketing
- Legal: General Counsel
- Management: CTO/CEO

## Severity Levels
- SEV-0: Critical (active breach)
- SEV-1: High (suspected breach)
- SEV-2: Medium (contained incident)
- SEV-3: Low (minor issue)

## Response Procedures
1. Detect and report
2. Triage and assess severity
3. Contain the incident
4. Investigate and eradicate
5. Recover systems
6. Post-incident review

## Communication
- Internal: Incident channel
- External: As required by law/contract
- Users: If data impacted
- Authority: Within 72 hours (GDPR)
```

---

## 18. Compliance Requirements

### 18.1 Regulatory Compliance

**GDPR (General Data Protection Regulation):**
```
Requirements:
- Legal basis for processing
- Consent management
- Data subject rights
- Privacy by design
- Data protection officer (DPO)
- Breach notification (72 hours)
- Data processing agreements
- International transfer safeguards

Status: âœ… Compliant
Last Audit: 2026-01-15
Next Audit: 2026-07-15
```

**CCPA (California Consumer Privacy Act):**
```
Requirements:
- Privacy notice
- Right to know
- Right to delete
- Right to opt-out of sale
- Non-discrimination
- Data security

Status: âœ… Compliant
Last Review: 2026-01-15
Next Review: 2026-07-15
```

**PCI DSS (if payment processing):**
```
Requirements:
- Secure network
- Protect cardholder data
- Vulnerability management
- Access control
- Monitoring and testing
- Security policies

Status: Phase 2 (planned)
```

### 18.2 Industry Standards

**ISO 27001:**
```
Status: Certification in progress
Expected: Q3 2026

Controls Implemented:
- A.5: Information security policies
- A.6: Organization of information security
- A.7: Human resource security
- A.8: Asset management
- A.9: Access control
- A.10: Cryptography
- A.11: Physical security
- A.12: Operations security
- A.13: Communications security
- A.14: System development security
- A.15: Supplier relationships
- A.16: Incident management
- A.17: Business continuity
- A.18: Compliance
```

**SOC 2 Type II:**
```
Status: Audit scheduled Q2 2026

Trust Service Criteria:
- Security
- Availability
- Processing integrity
- Confidentiality
- Privacy

Audit Period: 6 months
Auditor: [Auditing Firm]
```

### 18.3 Compliance Monitoring

**Compliance Checks:**
```javascript
// Automated compliance checks
const complianceChecks = {
  gdpr: {
    // Check data retention policies
    dataRetention: async () => {
      const oldUsers = await db.users.findAll({
        where: {
          deleted_at: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      });
      return oldUsers.length === 0; // Should be 0 (deleted after 30 days)
    },
    
    // Check encryption
    encryption: async () => {
      const dbEncryption = await checkRDSEncryption();
      const s3Encryption = await checkS3Encryption();
      return dbEncryption && s3Encryption;
    },
    
    // Check user rights implementation
    userRights: async () => {
      const checks = [
        await testDataExport(),
        await testDataDeletion(),
        await testConsentManagement(),
      ];
      return checks.every(c => c === true);
    },
  },
  
  security: {
    // Check MFA enforcement
    mfaEnforcement: async () => {
      const admins = await db.users.findAll({ where: { role: 'admin' } });
      const withoutMFA = admins.filter(u => !u.mfa_enabled);
      return withoutMFA.length === 0; // All admins should have MFA
    },
    
    // Check password policy
    passwordPolicy: async () => {
      const weakPasswords = await db.users.findAll({
        where: { password_last_changed: { $lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) } }
      });
      return weakPasswords.length < admins.length * 0.1; // <10% with old passwords
    },
  },
};

// Run compliance checks daily
async function runComplianceChecks() {
  const results = {};
  
  for (const [category, checks] of Object.entries(complianceChecks)) {
    results[category] = {};
    for (const [check, fn] of Object.entries(checks)) {
      try {
        results[category][check] = await fn();
      } catch (error) {
        results[category][check] = false;
        logger.error(`Compliance check failed: ${category}.${check}`, error);
      }
    }
  }
  
  // Alert if any checks fail
  const failures = Object.entries(results)
    .flatMap(([cat, checks]) => 
      Object.entries(checks)
        .filter(([, result]) => !result)
        .map(([check]) => `${cat}.${check}`)
    );
  
  if (failures.length > 0) {
    await alert.complianceTeam('Compliance checks failed', { failures });
  }
  
  return results;
}
```

---

## 19. Audit & Reporting

### 19.1 Security Audits

**Audit Schedule:**
```
Internal Audits:
- Quarterly: Access reviews
- Quarterly: Security controls
- Bi-annually: Code security review
- Annually: Full security audit

External Audits:
- Annually: ISO 27001 (when certified)
- Annually: SOC 2 Type II
- Annually: Penetration testing
- As needed: Compliance audits (GDPR, CCPA)
```

**Audit Checklist:**
```
Access Control:
[ ] User access rights reviewed
[ ] Privileged access justified
[ ] Terminated users removed
[ ] Service accounts documented

Data Protection:
[ ] Encryption enabled (at rest/in transit)
[ ] Data classification correct
[ ] Retention policies followed
[ ] Backups tested

Vulnerability Management:
[ ] No critical/high vulnerabilities open > SLA
[ ] Patch management up to date
[ ] Dependency scanning running
[ ] Container images scanned

Incident Response:
[ ] IR plan updated
[ ] Team trained
[ ] Incidents documented
[ ] Lessons learned implemented

Compliance:
[ ] Privacy policy current
[ ] Cookie consent working
[ ] Data processing agreements signed
[ ] User rights functional
```

### 19.2 Security Metrics

**Monthly Security Report:**
```
Security Metrics - [Month Year]

Authentication:
- Failed login attempts: [Number]
- Account lockouts: [Number]
- MFA adoption rate: [X%]
- Password reset requests: [Number]

Vulnerabilities:
- New vulnerabilities: [Number]
- Resolved vulnerabilities: [Number]
- Open critical/high: [Number]
- Mean time to remediate: [Days]

Incidents:
- Security incidents: [Number]
- By severity: SEV-0:[X], SEV-1:[X], SEV-2:[X], SEV-3:[X]
- Mean time to detect: [Hours]
- Mean time to respond: [Hours]

Compliance:
- Compliance score: [X%]
- Policy violations: [Number]
- Audit findings: [Number]
- Training completion: [X%]

Trends:
- [Trend 1 description]
- [Trend 2 description]

Action Items:
- [ ] [Action item 1]
- [ ] [Action item 2]
```

### 19.3 Executive Reporting

**Quarterly Security Report to Board:**
```markdown
# Quarterly Security Report - Q1 2026

## Executive Summary
[High-level overview of security posture]

## Key Achievements
- âœ… ISO 27001 audit completed
- âœ… Zero critical vulnerabilities
- âœ… MFA adoption: 95%

## Security Incidents
- Total incidents: 3
- SEV-1: 1 (contained, no data loss)
- SEV-2: 2 (resolved)
- All incidents documented and remediated

## Risk Assessment
- Overall risk: LOW
- Critical risks: 0
- High risks: 2 (mitigation in progress)

## Compliance Status
- GDPR: âœ… Compliant
- CCPA: âœ… Compliant
- SOC 2: In progress (audit Q2)

## Metrics
- Vulnerabilities remediated: 45
- Security training completion: 98%
- Penetration test: Passed (minor findings)

## Investments Required
- [Budget request for security tools]
- [Headcount for security team]

## Looking Ahead
- Q2 objectives
- Strategic initiatives
- Budget requirements
```

---

## 20. Appendix

### 20.1 Security Tools Inventory

| Tool | Purpose | Vendor | Cost/Month |
|------|---------|--------|------------|
| AWS GuardDuty | Threat detection | AWS | $XXX |
| AWS WAF | Web firewall | AWS | $XXX |
| Snyk | Dependency scanning | Snyk | $XXX |
| SonarQube | Code quality/security | SonarSource | $XXX |
| Sentry | Error tracking | Sentry | $XXX |
| 1Password | Password management | 1Password | $XXX |
| OWASP ZAP | DAST | Open source | Free |
| GitHub Advanced Security | Code scanning | GitHub | Included |
| CloudTrail | Audit logging | AWS | $XXX |

### 20.2 Security Contacts

**Internal:**
- Security Team: security@connecthub.com
- DPO: dpo@connecthub.com
- Incident Hotline: +1-XXX-XXX-XXXX
- On-call: PagerDuty

**External:**
- Auditor: [Audit Firm]
- Legal Counsel: [Law Firm]
- Cyber Insurance: [Insurance Company]
- Forensics: [Forensics Firm]
- Regulatory: [Supervisory Authority]

### 20.3 Security Glossary

**Common Terms:**
- **APT:** Advanced Persistent Threat
- **DDoS:** Distributed Denial of Service
- **GDPR:** General Data Protection Regulation
- **IDS/IPS:** Intrusion Detection/Prevention System
- **MFA:** Multi-Factor Authentication
- **OWASP:** Open Web Application Security Project
- **PII:** Personally Identifiable Information
- **SAST:** Static Application Security Testing
- **DAST:** Dynamic Application Security Testing
- **SIEM:** Security Information and Event Management
- **TLS:** Transport Layer Security
- **WAF:** Web Application Firewall
- **Zero-day:** Previously unknown vulnerability

### 20.4 Regulatory Resources

**GDPR:**
- Official text: https://gdpr-info.eu/
- ICO guidance: https://ico.org.uk/
- EDPB guidelines: https://edpb.europa.eu/

**CCPA:**
- Official text: https://oag.ca.gov/privacy/ccpa
- CPPA guidance: https://cppa.ca.gov/

**Security Standards:**
- OWASP: https://owasp.org/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework
- CIS Benchmarks: https://www.cisecurity.org/

### 20.5 Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Feb 12, 2026 | Initial security & compliance document | Security Team |

---

## 21. Approval & Sign-off

**Chief Information Security Officer (CISO):** _____________________ Date: _________

**Data Protection Officer (DPO):** _____________________ Date: _________

**Chief Technology Officer (CTO):** _____________________ Date: _________

**General Counsel:** _____________________ Date: _________

---

**END OF DOCUMENT**

**Status:** âœ… COMPLETE  
**Classification:** Confidential  
**Pages:** 100+  
**Security Controls:** Comprehensive  
**Compliance:** GDPR, CCPA Ready  
**Ready for:** Production Security Implementation



