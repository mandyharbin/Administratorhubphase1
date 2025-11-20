# Patient Notices - Engineering & Architecture Requirements

## Document Information
- **System**: BASE Administrator Hub - Patient Notices Module
- **Version**: 1.0
- **Last Updated**: November 18, 2024
- **Status**: Draft

---

## 1. Executive Summary

The Patient Notices system enables healthcare practices to send HIPAA-compliant notifications to patients across multiple channels (in-app, email, SMS). The system must support versioning, multi-language content, role-based targeting, delivery tracking, and comprehensive audit logging.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Web Interface                      │
│  (React/TypeScript - Notice Creation & Management)           │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Gateway / Load Balancer                │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  Notice Management Service                   │
│  - Notice CRUD Operations                                    │
│  - Version Control                                           │
│  - Template Management                                       │
│  - Scheduling Logic                                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Patient    │ │  Delivery    │ │   Audit &    │
│   Targeting  │ │   Queue      │ │   Logging    │
│   Service    │ │   Service    │ │   Service    │
└──────┬───────┘ └──────┬───────┘ └──────────────┘
       │                │
       │                ├─────────┬─────────┬─────────┐
       │                │         │         │         │
       ▼                ▼         ▼         ▼         ▼
┌──────────────┐ ┌─────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│   Patient    │ │  Email  │ │  SMS   │ │ In-App │ │  Push  │
│   Database   │ │ Gateway │ │Gateway │ │ Queue  │ │Gateway │
└──────────────┘ └─────────┘ └────────┘ └────────┘ └────────┘
```

### 2.2 Technology Stack Recommendations

**Backend Services**
- **API Layer**: Node.js with Express/Fastify or Python with FastAPI
- **Message Queue**: Redis, RabbitMQ, or AWS SQS
- **Database**: PostgreSQL (primary), Redis (caching)
- **Search**: Elasticsearch (optional, for notice search/analytics)

**Notification Delivery**
- **Email**: SendGrid, AWS SES, or Postmark
- **SMS**: Twilio, AWS SNS, or Vonage
- **Push Notifications**: Firebase Cloud Messaging (FCM), APNs
- **In-App**: WebSocket server or Server-Sent Events (SSE)

**Infrastructure**
- **Cloud Provider**: AWS, Azure, or GCP
- **Container Orchestration**: Kubernetes or AWS ECS
- **CDN**: CloudFront or Cloudflare (for assets)
- **Storage**: S3 or Azure Blob (for notice attachments)

---

## 3. Data Model

### 3.1 Database Schema

#### Table: `patient_notices`
```sql
CREATE TABLE patient_notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    location_id UUID REFERENCES locations(id),
    
    -- Notice Content
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    notice_type VARCHAR(100) NOT NULL, -- 'disclaimer', 'hipaa_update', 'announcement', etc.
    priority VARCHAR(50) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    -- Versioning
    version INTEGER NOT NULL DEFAULT 1,
    parent_notice_id UUID REFERENCES patient_notices(id),
    is_current_version BOOLEAN DEFAULT true,
    
    -- Multi-language Support
    language_code VARCHAR(10) DEFAULT 'en',
    translations JSONB, -- {language_code: {title, content}}
    
    -- Delivery Configuration
    delivery_channels JSONB NOT NULL, -- ['email', 'sms', 'in_app', 'push']
    delivery_schedule JSONB, -- {send_at: timestamp, timezone: string}
    
    -- Targeting
    target_criteria JSONB, -- {roles: [], locations: [], patient_ids: [], age_range: {}, etc.}
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'cancelled'
    
    -- Metadata
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    total_recipients INTEGER DEFAULT 0,
    delivered_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    pending_count INTEGER DEFAULT 0,
    
    -- Compliance
    requires_acknowledgment BOOLEAN DEFAULT false,
    acknowledgment_deadline TIMESTAMP WITH TIME ZONE,
    
    -- Soft Delete
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT valid_status CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'cancelled')),
    CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
);

CREATE INDEX idx_patient_notices_org_id ON patient_notices(organization_id);
CREATE INDEX idx_patient_notices_status ON patient_notices(status);
CREATE INDEX idx_patient_notices_sent_at ON patient_notices(sent_at);
CREATE INDEX idx_patient_notices_current_version ON patient_notices(is_current_version) WHERE is_current_version = true;
```

#### Table: `notice_recipients`
```sql
CREATE TABLE notice_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id UUID NOT NULL REFERENCES patient_notices(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES patients(id),
    
    -- Delivery Status per Channel
    email_status VARCHAR(50), -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
    email_sent_at TIMESTAMP WITH TIME ZONE,
    email_delivered_at TIMESTAMP WITH TIME ZONE,
    email_error TEXT,
    
    sms_status VARCHAR(50),
    sms_sent_at TIMESTAMP WITH TIME ZONE,
    sms_delivered_at TIMESTAMP WITH TIME ZONE,
    sms_error TEXT,
    
    in_app_status VARCHAR(50),
    in_app_sent_at TIMESTAMP WITH TIME ZONE,
    in_app_read_at TIMESTAMP WITH TIME ZONE,
    
    push_status VARCHAR(50),
    push_sent_at TIMESTAMP WITH TIME ZONE,
    push_delivered_at TIMESTAMP WITH TIME ZONE,
    push_error TEXT,
    
    -- Overall Status
    overall_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    
    -- Acknowledgment
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    acknowledgment_ip_address INET,
    
    -- Retry Logic
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(notice_id, patient_id)
);

CREATE INDEX idx_notice_recipients_notice_id ON notice_recipients(notice_id);
CREATE INDEX idx_notice_recipients_patient_id ON notice_recipients(patient_id);
CREATE INDEX idx_notice_recipients_status ON notice_recipients(overall_status);
CREATE INDEX idx_notice_recipients_next_retry ON notice_recipients(next_retry_at) WHERE overall_status IN ('pending', 'failed');
```

#### Table: `notice_templates`
```sql
CREATE TABLE notice_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(100) NOT NULL,
    
    -- Template Content (supports variables)
    subject_template VARCHAR(500),
    content_template TEXT NOT NULL,
    sms_template VARCHAR(160), -- SMS character limit
    
    -- Variables supported in template
    supported_variables JSONB, -- ['patient_name', 'practice_name', 'date', etc.]
    
    -- Multi-language
    language_code VARCHAR(10) DEFAULT 'en',
    translations JSONB,
    
    is_active BOOLEAN DEFAULT true,
    
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(organization_id, name)
);
```

#### Table: `notice_delivery_log`
```sql
CREATE TABLE notice_delivery_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id UUID NOT NULL REFERENCES patient_notices(id),
    recipient_id UUID REFERENCES notice_recipients(id),
    
    channel VARCHAR(50) NOT NULL, -- 'email', 'sms', 'in_app', 'push'
    event_type VARCHAR(100) NOT NULL, -- 'queued', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked'
    
    -- Provider Response
    provider_name VARCHAR(100), -- 'sendgrid', 'twilio', etc.
    provider_message_id VARCHAR(255),
    provider_response JSONB,
    
    error_code VARCHAR(100),
    error_message TEXT,
    
    metadata JSONB, -- Additional contextual data
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notice_delivery_log_notice_id ON notice_delivery_log(notice_id);
CREATE INDEX idx_notice_delivery_log_recipient_id ON notice_delivery_log(recipient_id);
CREATE INDEX idx_notice_delivery_log_event_type ON notice_delivery_log(event_type);
CREATE INDEX idx_notice_delivery_log_created_at ON notice_delivery_log(created_at);
```

#### Table: `notice_acknowledgments`
```sql
CREATE TABLE notice_acknowledgments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notice_id UUID NOT NULL REFERENCES patient_notices(id),
    patient_id UUID NOT NULL REFERENCES patients(id),
    
    acknowledged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    acknowledgment_method VARCHAR(50), -- 'web', 'mobile', 'email_link'
    
    ip_address INET,
    user_agent TEXT,
    
    response_data JSONB, -- Any questionnaire responses if applicable
    
    UNIQUE(notice_id, patient_id)
);
```

### 3.2 Data Models (TypeScript Interfaces)

```typescript
interface PatientNotice {
  id: string;
  organizationId: string;
  locationId?: string;
  
  // Content
  title: string;
  content: string;
  noticeType: NoticeType;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // Versioning
  version: number;
  parentNoticeId?: string;
  isCurrentVersion: boolean;
  
  // Multi-language
  languageCode: string;
  translations?: Record<string, { title: string; content: string }>;
  
  // Delivery
  deliveryChannels: DeliveryChannel[];
  deliverySchedule?: {
    sendAt: Date;
    timezone: string;
  };
  
  // Targeting
  targetCriteria: TargetCriteria;
  
  // Status
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
  sentAt?: Date;
  
  // Tracking
  totalRecipients: number;
  deliveredCount: number;
  failedCount: number;
  pendingCount: number;
  
  // Compliance
  requiresAcknowledgment: boolean;
  acknowledgmentDeadline?: Date;
}

interface TargetCriteria {
  roles?: string[];
  locations?: string[];
  patientIds?: string[];
  ageRange?: { min?: number; max?: number };
  hasActiveAppointment?: boolean;
  hasPortalAccess?: boolean;
  customFilters?: Record<string, any>;
}

type DeliveryChannel = 'email' | 'sms' | 'in_app' | 'push';
type NoticeType = 
  | 'disclaimer'
  | 'hipaa_update'
  | 'privacy_policy'
  | 'terms_of_service'
  | 'announcement'
  | 'reminder'
  | 'health_alert'
  | 'feature_update'
  | 'billing_notice'
  | 'appointment_policy';

interface NoticeRecipient {
  id: string;
  noticeId: string;
  patientId: string;
  
  // Channel-specific status
  emailStatus?: DeliveryStatus;
  emailSentAt?: Date;
  emailDeliveredAt?: Date;
  emailError?: string;
  
  smsStatus?: DeliveryStatus;
  smsSentAt?: Date;
  smsDeliveredAt?: Date;
  smsError?: string;
  
  inAppStatus?: DeliveryStatus;
  inAppSentAt?: Date;
  inAppReadAt?: Date;
  
  pushStatus?: DeliveryStatus;
  pushSentAt?: Date;
  pushDeliveredAt?: Date;
  pushError?: string;
  
  // Overall
  overallStatus: DeliveryStatus;
  
  // Acknowledgment
  acknowledgedAt?: Date;
  acknowledgmentIpAddress?: string;
  
  // Retry
  retryCount: number;
  nextRetryAt?: Date;
}

type DeliveryStatus = 
  | 'pending'
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'failed'
  | 'bounced'
  | 'read';
```

---

## 4. API Requirements

### 4.1 REST API Endpoints

#### Notice Management

```
POST   /api/v1/notices
GET    /api/v1/notices
GET    /api/v1/notices/:id
PUT    /api/v1/notices/:id
DELETE /api/v1/notices/:id
PATCH  /api/v1/notices/:id/publish
PATCH  /api/v1/notices/:id/schedule
PATCH  /api/v1/notices/:id/cancel
GET    /api/v1/notices/:id/versions
POST   /api/v1/notices/:id/duplicate
```

#### Notice Recipients & Delivery

```
GET    /api/v1/notices/:id/recipients
GET    /api/v1/notices/:id/delivery-stats
POST   /api/v1/notices/:id/send
POST   /api/v1/notices/:id/retry-failed
GET    /api/v1/notices/:id/delivery-log
```

#### Templates

```
POST   /api/v1/notice-templates
GET    /api/v1/notice-templates
GET    /api/v1/notice-templates/:id
PUT    /api/v1/notice-templates/:id
DELETE /api/v1/notice-templates/:id
```

#### Patient-Facing APIs

```
GET    /api/v1/patients/:patientId/notices
GET    /api/v1/patients/:patientId/notices/:noticeId
POST   /api/v1/patients/:patientId/notices/:noticeId/acknowledge
PATCH  /api/v1/patients/:patientId/notices/:noticeId/mark-read
```

#### Analytics & Reporting

```
GET    /api/v1/analytics/notices/delivery-rates
GET    /api/v1/analytics/notices/engagement
GET    /api/v1/analytics/notices/acknowledgment-rates
POST   /api/v1/analytics/notices/export
```

### 4.2 Example API Request/Response

#### POST /api/v1/notices - Create Notice

**Request:**
```json
{
  "title": "Updated Privacy Policy",
  "content": "We have updated our privacy policy effective December 1, 2024...",
  "noticeType": "privacy_policy",
  "priority": "high",
  "deliveryChannels": ["email", "in_app"],
  "deliverySchedule": {
    "sendAt": "2024-12-01T09:00:00Z",
    "timezone": "America/New_York"
  },
  "targetCriteria": {
    "hasPortalAccess": true
  },
  "requiresAcknowledgment": true,
  "acknowledgmentDeadline": "2024-12-15T23:59:59Z",
  "languageCode": "en",
  "translations": {
    "es": {
      "title": "Política de Privacidad Actualizada",
      "content": "Hemos actualizado nuestra política de privacidad..."
    }
  }
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "scheduled",
  "estimatedRecipients": 1247,
  "scheduledSendTime": "2024-12-01T09:00:00Z",
  "createdAt": "2024-11-18T14:30:00Z",
  "message": "Notice scheduled successfully"
}
```

#### GET /api/v1/notices/:id/delivery-stats

**Response:**
```json
{
  "noticeId": "550e8400-e29b-41d4-a716-446655440000",
  "totalRecipients": 1247,
  "deliveryStats": {
    "overall": {
      "pending": 37,
      "delivered": 1198,
      "failed": 12
    },
    "byChannel": {
      "email": {
        "sent": 1247,
        "delivered": 1210,
        "bounced": 8,
        "opened": 892,
        "clicked": 234
      },
      "in_app": {
        "sent": 1247,
        "read": 678,
        "unread": 569
      }
    }
  },
  "acknowledgmentStats": {
    "required": true,
    "acknowledged": 456,
    "pending": 791,
    "acknowledgmentRate": 36.5
  },
  "lastUpdated": "2024-11-18T14:35:00Z"
}
```

---

## 5. Business Logic Requirements

### 5.1 Notice Creation & Management

1. **Draft Creation**
   - Admins can create notices in draft status
   - Drafts can be edited freely without version control
   - Validation: title (max 255 chars), content (required), delivery channels (at least 1)

2. **Template Support**
   - Admins can use pre-defined templates
   - Variable substitution: `{{patient_name}}`, `{{practice_name}}`, `{{date}}`, etc.
   - Template preview before sending

3. **Versioning**
   - When a published notice is edited, create new version
   - Maintain parent-child relationship
   - Mark only latest as current version
   - Keep historical versions for audit

4. **Multi-language Support**
   - Default language: en (English)
   - Support ES (Spanish) at minimum
   - Auto-detect patient preferred language
   - Fallback to default if translation unavailable

### 5.2 Patient Targeting

1. **Targeting Rules**
   - By location (all patients or specific locations)
   - By role/category (all patients, billing contacts, etc.)
   - By demographics (age range, gender)
   - By patient list (upload CSV or manual selection)
   - By portal access status
   - By appointment status (has upcoming appointment, etc.)

2. **Qualification Logic**
   - Execute targeting query at schedule time, not creation time
   - Respect opt-out preferences per channel
   - Exclude patients who soft-deleted their accounts
   - Respect "Do Not Contact" flags

3. **Recipient Count Estimation**
   - Provide estimated recipient count during creation
   - Warning if count exceeds threshold (e.g., >10,000)
   - Require admin confirmation for large sends

### 5.3 Delivery Logic

1. **Scheduling**
   - Immediate send or scheduled send
   - Timezone-aware scheduling
   - Cancel scheduled notices before send time
   - Auto-cancel if notice deleted before send

2. **Multi-Channel Delivery**
   - Deliver to all selected channels in parallel
   - Independent retry logic per channel
   - Overall status based on best-effort delivery

3. **Rate Limiting**
   - Email: Max 100/second (configurable by provider)
   - SMS: Max 50/second
   - In-app: No limit (internal queue)
   - Push: Max 500/second

4. **Retry Logic**
   - Failed deliveries: Retry up to 3 times
   - Exponential backoff: 5min, 30min, 2hr
   - Mark as permanently failed after 3 attempts
   - Specific errors don't retry (invalid phone, invalid email)

5. **Delivery Prioritization**
   - Queue priority based on notice priority field
   - Urgent: Process immediately
   - High: Within 5 minutes
   - Normal: Within 30 minutes
   - Low: Best effort (within 24 hours)

### 5.4 Acknowledgment Requirements

1. **Acknowledgment Flow**
   - If `requiresAcknowledgment = true`, patient must acknowledge
   - Display acknowledgment UI in patient app
   - Send reminders if not acknowledged by deadline
   - Track acknowledgment timestamp and method

2. **Reminder Logic**
   - Send reminder 7 days before deadline
   - Send reminder 24 hours before deadline
   - Send final reminder on deadline day
   - Stop reminders once acknowledged

3. **Compliance Tracking**
   - Report on acknowledgment rates
   - Export unacknowledged patient list
   - Automated follow-up for non-compliance

---

## 6. Integration Requirements

### 6.1 External Service Integrations

#### Email Provider (SendGrid / AWS SES)

**Requirements:**
- Support transactional email with templates
- Webhook support for delivery events
- Track opens, clicks, bounces, spam reports
- DKIM/SPF/DMARC configuration
- Unsubscribe link handling

**Events to Track:**
- `processed`, `delivered`, `bounce`, `open`, `click`, `unsubscribe`, `spam_report`

**Implementation:**
```typescript
interface EmailProvider {
  sendEmail(params: {
    to: string;
    subject: string;
    htmlContent: string;
    textContent: string;
    fromName: string;
    fromEmail: string;
    replyTo?: string;
    metadata?: Record<string, any>;
  }): Promise<{ messageId: string }>;
  
  handleWebhook(event: any): Promise<void>;
}
```

#### SMS Provider (Twilio / AWS SNS)

**Requirements:**
- Support short code or toll-free number
- Delivery receipts (DLR)
- Opt-out/opt-in management
- Unicode support for multi-language
- MMS support (optional, for images)

**Events to Track:**
- `queued`, `sent`, `delivered`, `failed`, `undelivered`

**Implementation:**
```typescript
interface SMSProvider {
  sendSMS(params: {
    to: string; // E.164 format
    message: string;
    fromNumber: string;
    metadata?: Record<string, any>;
  }): Promise<{ messageId: string }>;
  
  handleDeliveryReceipt(receipt: any): Promise<void>;
  handleOptOut(phoneNumber: string): Promise<void>;
}
```

#### Push Notification Provider (FCM / APNs)

**Requirements:**
- Support iOS and Android
- Silent notifications for data sync
- Badge count management
- Deep linking support
- Rich notifications (images, actions)

**Implementation:**
```typescript
interface PushProvider {
  sendPushNotification(params: {
    deviceTokens: string[];
    title: string;
    body: string;
    data?: Record<string, any>;
    imageUrl?: string;
    actions?: Array<{ id: string; label: string }>;
  }): Promise<{ successCount: number; failureCount: number }>;
}
```

### 6.2 Internal System Integrations

#### Patient Database
- Query patient contact information
- Respect communication preferences
- Check patient status (active, inactive)
- Verify portal access

#### Audit System
- Log all notice creation, updates, deletions
- Log delivery attempts and results
- Log patient acknowledgments
- Maintain immutable audit trail

#### Analytics Platform
- Push delivery metrics
- Push engagement metrics
- Push acknowledgment metrics
- Real-time dashboards

---

## 7. Security & Compliance Requirements

### 7.1 HIPAA Compliance

1. **Data Encryption**
   - Encrypt all PHI at rest (AES-256)
   - Encrypt all PHI in transit (TLS 1.2+)
   - Encrypt database backups

2. **Access Controls**
   - Role-based access control (RBAC)
   - Audit all access to patient notices
   - Multi-factor authentication for admins
   - Session timeout (15 minutes idle)

3. **Data Retention**
   - Retain notice delivery logs for 6 years (HIPAA requirement)
   - Soft delete notices (never hard delete)
   - Automated archival of old records

4. **Business Associate Agreements (BAA)**
   - Ensure BAA with email provider
   - Ensure BAA with SMS provider
   - Ensure BAA with push notification provider
   - Annual BAA review

### 7.2 Authentication & Authorization

1. **Admin Authentication**
   - SSO integration (SAML 2.0 / OAuth 2.0)
   - MFA required for production access
   - API key authentication for service-to-service

2. **Patient Authentication**
   - JWT tokens for mobile/web app
   - Refresh token rotation
   - Device fingerprinting

3. **Authorization Matrix**

| Role | Create Notice | Edit Notice | Delete Notice | Send Notice | View Stats | Acknowledge (Patient) |
|------|--------------|-------------|---------------|-------------|-----------|---------------------|
| Admin | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Billing | ✓ (billing only) | ✓ (billing only) | ✗ | ✓ | ✓ | ✗ |
| Clinical | ✓ (clinical only) | ✓ (clinical only) | ✗ | ✓ | ✓ | ✗ |
| Auditor | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Patient | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

### 7.3 Data Privacy

1. **PII/PHI Handling**
   - Minimize PII in logs
   - Mask sensitive data in error messages
   - No PII in URLs or query parameters

2. **Opt-Out Management**
   - Honor patient communication preferences
   - Provide easy opt-out mechanism
   - Per-channel opt-out (email, SMS, push)
   - Compliance with CAN-SPAM Act, TCPA

3. **Data Subject Rights (GDPR/CCPA)**
   - Support data export (JSON/PDF)
   - Support data deletion
   - Support access requests
   - Response within 30 days

---

## 8. Performance Requirements

### 8.1 Response Time

- API endpoints: < 200ms (p95)
- Notice creation: < 500ms
- Delivery stats query: < 1s for up to 10,000 recipients
- Database queries: < 100ms (p95)

### 8.2 Throughput

- Support 1,000 concurrent admin users
- Support 100,000 concurrent patient app users
- Process 10,000 notices/day
- Deliver 1,000,000 messages/day across all channels

### 8.3 Scalability

- Horizontal scaling for API servers
- Queue-based architecture for delivery
- Database read replicas for analytics
- CDN for static content

### 8.4 Reliability

- 99.9% uptime SLA for notice delivery
- Auto-retry failed deliveries
- Circuit breaker for external services
- Graceful degradation (if email fails, still send in-app)

---

## 9. Monitoring & Observability

### 9.1 Metrics to Track

**Application Metrics:**
- Notice creation rate
- Delivery success rate (overall and per channel)
- Failed delivery rate and reasons
- Acknowledgment rate
- API response times
- Queue depth

**Infrastructure Metrics:**
- CPU, memory, disk usage
- Database connection pool
- Network I/O
- Cache hit rate

### 9.2 Logging Requirements

**Log Levels:**
- ERROR: Delivery failures, system errors
- WARN: Retry attempts, throttling
- INFO: Notice sent, acknowledgment received
- DEBUG: Detailed flow (dev/staging only)

**Structured Logging Format:**
```json
{
  "timestamp": "2024-11-18T14:30:00Z",
  "level": "INFO",
  "service": "notice-delivery",
  "traceId": "abc123",
  "noticeId": "550e8400-e29b-41d4-a716-446655440000",
  "patientId": "patient-123",
  "channel": "email",
  "event": "delivered",
  "metadata": {
    "provider": "sendgrid",
    "messageId": "msg-xyz"
  }
}
```

### 9.3 Alerting

**Critical Alerts:**
- Delivery failure rate > 5% (5-minute window)
- Queue depth > 100,000 messages
- API error rate > 1%
- Database connection pool exhausted

**Warning Alerts:**
- Delivery success rate < 95% (1-hour window)
- Acknowledgment rate < 50% (24 hours before deadline)
- High retry rate (> 10%)

### 9.4 Dashboards

1. **Operational Dashboard**
   - Real-time delivery metrics
   - Queue depth by priority
   - Error rate by channel
   - System health

2. **Business Dashboard**
   - Notices sent today/this week/this month
   - Engagement metrics (open rate, click rate)
   - Acknowledgment compliance
   - Top failure reasons

---

## 10. Testing Requirements

### 10.1 Unit Tests

- 80%+ code coverage
- Test all business logic functions
- Test data validation
- Test error handling

### 10.2 Integration Tests

- Test email provider integration
- Test SMS provider integration
- Test database transactions
- Test queue operations

### 10.3 End-to-End Tests

- Test full notice creation to delivery flow
- Test multi-channel delivery
- Test acknowledgment flow
- Test retry logic

### 10.4 Performance Tests

- Load test: 10,000 concurrent API requests
- Soak test: 24-hour sustained load
- Spike test: Sudden 10x traffic increase
- Delivery throughput test: 100,000 messages/hour

### 10.5 Security Tests

- Penetration testing (annual)
- OWASP Top 10 vulnerability scan
- Dependency vulnerability scan
- SQL injection testing
- XSS testing

---

## 11. Deployment & DevOps

### 11.1 CI/CD Pipeline

1. **Build Stage**
   - Compile TypeScript/JavaScript
   - Run linters (ESLint, Prettier)
   - Run unit tests
   - Build Docker image

2. **Test Stage**
   - Run integration tests
   - Run E2E tests
   - Security scan (Snyk, Trivy)

3. **Deploy Stage**
   - Deploy to staging
   - Run smoke tests
   - Manual approval gate
   - Deploy to production (blue-green)
   - Health check
   - Rollback on failure

### 11.2 Infrastructure as Code

- Use Terraform or AWS CloudFormation
- Version control all infrastructure
- Environment parity (dev, staging, prod)

### 11.3 Database Migrations

- Use migration tool (Flyway, Liquibase, or Prisma)
- Reversible migrations
- Test on staging first
- Zero-downtime migrations

### 11.4 Disaster Recovery

- Database backups: Daily (retention: 30 days)
- Point-in-time recovery: Last 7 days
- Cross-region replication (for critical data)
- RTO: 4 hours
- RPO: 1 hour

---

## 12. Future Considerations

### 12.1 Phase 2 Features

- **Rich Media Support**: Images, videos in notices
- **Interactive Notices**: Surveys, questionnaires
- **A/B Testing**: Test different notice versions
- **Personalization**: AI-driven content personalization
- **Scheduled Reminders**: Recurring notices
- **Patient Preferences**: Custom notification frequency
- **Advanced Analytics**: Predictive engagement modeling

### 12.2 Technical Enhancements

- **Event-Driven Architecture**: Move to Kafka/EventBridge
- **GraphQL API**: For more flexible data fetching
- **Real-time Delivery Status**: WebSocket updates
- **Machine Learning**: Optimal send time prediction
- **Multi-tenancy**: Better org isolation

---

## 13. Acceptance Criteria

### 13.1 Functional

- [ ] Admin can create, edit, delete notices
- [ ] Admin can schedule notices for future delivery
- [ ] Admin can target notices by location, role, demographics
- [ ] System delivers notices via email, SMS, in-app, push
- [ ] System retries failed deliveries automatically
- [ ] System tracks delivery status per recipient per channel
- [ ] Patient can view notices in app
- [ ] Patient can acknowledge notices (if required)
- [ ] System sends reminders for unacknowledged notices
- [ ] Admin can view delivery statistics and reports
- [ ] System supports multi-language content
- [ ] System maintains version history

### 13.2 Non-Functional

- [ ] API response time < 200ms (p95)
- [ ] Delivery success rate > 98%
- [ ] System uptime > 99.9%
- [ ] All PHI encrypted at rest and in transit
- [ ] HIPAA compliance verified by third-party audit
- [ ] 80%+ code coverage
- [ ] Zero critical security vulnerabilities
- [ ] Deployment time < 15 minutes
- [ ] Rollback time < 5 minutes

---

## 14. Appendices

### Appendix A: Glossary

- **PHI**: Protected Health Information
- **HIPAA**: Health Insurance Portability and Accountability Act
- **BAA**: Business Associate Agreement
- **DLR**: Delivery Receipt
- **FCM**: Firebase Cloud Messaging
- **APNs**: Apple Push Notification service
- **SLA**: Service Level Agreement
- **RTO**: Recovery Time Objective
- **RPO**: Recovery Point Objective

### Appendix B: References

- HIPAA Security Rule: https://www.hhs.gov/hipaa/for-professionals/security/
- CAN-SPAM Act: https://www.ftc.gov/tips-advice/business-center/guidance/can-spam-act-compliance-guide-business
- TCPA Guidelines: https://www.fcc.gov/general/telemarketing-and-robocalls
- SendGrid API Docs: https://docs.sendgrid.com/
- Twilio API Docs: https://www.twilio.com/docs/

### Appendix C: Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-11-18 | System Architect | Initial draft |

---

**Document End**
