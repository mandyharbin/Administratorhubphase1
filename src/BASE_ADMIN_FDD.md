# BASE Admin Hub - Functional Design Document (FDD)
## Phase 1: AI Receptionist Administration

**Version:** 1.0.0  
**Date:** November 17, 2025  
**Target Audience:** Engineering, Product, QA

---

## 1. Executive Summary

The BASE Admin Hub is a web-based administrative interface for configuring and managing the AI Receptionist system used in healthcare practices. This system enables healthcare administrators to manage organizational settings, configure AI auto-reply behaviors, maintain knowledge sources, manage disclaimers and consent, configure patient notices, control registration workflows, and monitor system activity through audit logs.

**Key Design Principles:**
- Base font-size: 14px
- Date format: "Jun 10" (abbreviated month + day)
- Maximum 4 items in bottom toolbar
- Chips must come in sets of 3 or more
- No dropdowns for 2 or fewer options
- Mobile-responsive design throughout

---

## 2. System Architecture

### 2.1 Technology Stack
- **Frontend:** React with TypeScript
- **Styling:** Tailwind CSS v4.0
- **UI Components:** shadcn/ui component library
- **State Management:** React hooks (useState, useEffect, useCallback)
- **Icons:** lucide-react
- **Date Handling:** Native JavaScript Date API
- **Backend:** Supabase (Edge Functions, Database, Auth, Storage)

### 2.2 Application Structure
```
/
├── App.tsx (Main application router)
├── components/
│   ├── Sidebar.tsx
│   ├── OrganizationAccess.tsx
│   ├── DisclaimersConsent.tsx
│   ├── AIResponses.tsx
│   ├── KnowledgeSources.tsx
│   ├── PatientNotices.tsx
│   ├── RegistrationManagement.tsx
│   ├── AuditLogs.tsx
│   └── ui/ (shadcn components)
├── styles/
│   └── globals.css
└── utils/
    └── supabase/
```

### 2.3 Navigation Sections
1. **Organization** - Organization & Access Management
2. **AI Assistant** - Disclaimers & Consent, AI Auto Replies, Knowledge Sources
3. **System** - Patient Notices, Registration Management, Audit Logs

---

## 3. Functional Requirements

---

## 3.1 Organization & Access Management

### 3.1.1 Overview
Manage organizational hierarchy (tenants/locations), users, roles, and permissions with SSO integration support.

### 3.1.2 User Stories

**US-ORG-001: View Organizations**
- **As an** administrator
- **I want to** view all organizations (tenants/locations) in the system
- **So that** I can understand the organizational structure

**US-ORG-002: Add New Organization**
- **As an** administrator
- **I want to** add a new organization with name, type, and location details
- **So that** I can expand the practice network

**US-ORG-003: Edit Organization**
- **As an** administrator
- **I want to** edit existing organization details
- **So that** I can keep information current

**US-ORG-004: Manage Users**
- **As an** administrator
- **I want to** create, edit, and deactivate user accounts
- **So that** I can control access to the system

**US-ORG-005: Assign Roles**
- **As an** administrator
- **I want to** assign roles to users (Admin, Billing, Scheduling, Clinical, Auditor)
- **So that** users have appropriate permissions

**US-ORG-006: Configure SSO**
- **As an** administrator
- **I want to** configure Single Sign-On settings
- **So that** users can authenticate via corporate identity providers

**US-ORG-007: Manage Permissions**
- **As an** administrator
- **I want to** define granular permissions for each role
- **So that** I can enforce least-privilege access control

### 3.1.3 Data Model

```typescript
interface Organization {
  id: string;
  name: string;
  type: 'tenant' | 'location';
  parentId?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  contactEmail: string;
  contactPhone: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  roleIds: string[];
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: Date;
  ssoEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Role {
  id: string;
  name: 'admin' | 'billing' | 'scheduling' | 'clinical' | 'auditor';
  displayName: string;
  permissions: Permission[];
  description: string;
}

interface Permission {
  id: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  scope: 'own' | 'organization' | 'all';
}

interface SSOConfig {
  id: string;
  organizationId: string;
  provider: 'google' | 'microsoft' | 'okta' | 'custom';
  enabled: boolean;
  clientId: string;
  issuerUrl: string;
  metadata?: Record<string, any>;
}
```

### 3.1.4 Functional Requirements

**FR-ORG-001:** System shall display a table of all organizations with columns: Name, Type, Location, Status, Actions
**FR-ORG-002:** System shall support hierarchical organization structure (tenant > location)
**FR-ORG-003:** System shall validate organization name uniqueness within parent scope
**FR-ORG-004:** System shall provide inline editing for organization details
**FR-ORG-005:** System shall display user list with search and filter capabilities
**FR-ORG-006:** System shall support role-based access control with 5 predefined roles
**FR-ORG-007:** System shall allow multi-role assignment to users
**FR-ORG-008:** System shall integrate with SSO providers via OAuth 2.0/OIDC
**FR-ORG-009:** System shall enforce email verification for new users
**FR-ORG-010:** System shall log all user management actions for audit

### 3.1.5 UI Components

- Organization table with pagination
- Add/Edit organization modal
- User management table with filters
- Role assignment multi-select
- Permission matrix (role × resource grid)
- SSO configuration form
- Status badges (active/inactive)

### 3.1.6 API Endpoints

```
GET    /api/organizations
POST   /api/organizations
PUT    /api/organizations/:id
DELETE /api/organizations/:id

GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

GET    /api/roles
POST   /api/roles
PUT    /api/roles/:id

GET    /api/sso-config/:orgId
PUT    /api/sso-config/:orgId
```

---

## 3.2 Disclaimers & Consent Management

### 3.2.1 Overview
Manage versioned, multi-language disclaimer and consent content displayed to patients before using the AI Assistant.

### 3.2.2 User Stories

**US-DIS-001: View Disclaimers**
- **As an** administrator
- **I want to** view all disclaimer versions
- **So that** I can track historical changes

**US-DIS-002: Create Disclaimer**
- **As an** administrator
- **I want to** create a new disclaimer version
- **So that** I can update patient-facing legal content

**US-DIS-003: Multi-Language Support**
- **As an** administrator
- **I want to** add translations for disclaimers
- **So that** patients can read content in their preferred language

**US-DIS-004: Version Management**
- **As an** administrator
- **I want to** track disclaimer versions
- **So that** I can maintain compliance and audit trail

**US-DIS-005: Publish Disclaimer**
- **As an** administrator
- **I want to** publish a disclaimer to make it active
- **So that** patients see the latest approved content

**US-DIS-006: Preview Disclaimer**
- **As an** administrator
- **I want to** preview disclaimer content before publishing
- **So that** I can verify formatting and accuracy

### 3.2.3 Data Model

```typescript
interface Disclaimer {
  id: string;
  version: string;
  type: 'pre-chat' | 'consent' | 'privacy' | 'terms';
  status: 'draft' | 'published' | 'archived';
  effectiveDate: Date;
  expirationDate?: Date;
  createdBy: string;
  createdAt: Date;
  publishedAt?: Date;
  publishedBy?: string;
}

interface DisclaimerContent {
  id: string;
  disclaimerId: string;
  language: 'en' | 'es' | 'fr' | 'zh' | string;
  title: string;
  content: string;
  acceptanceText: string; // e.g., "I understand and agree"
  isDefault: boolean;
}

interface DisclaimerAcceptance {
  id: string;
  patientId: string;
  disclaimerId: string;
  disclaimerVersion: string;
  language: string;
  acceptedAt: Date;
  ipAddress: string;
  userAgent: string;
}
```

### 3.2.4 Functional Requirements

**FR-DIS-001:** System shall support versioning with semantic version numbers (e.g., 1.0.0)
**FR-DIS-002:** System shall support minimum 4 languages (English, Spanish, French, Chinese)
**FR-DIS-003:** System shall require approval workflow before publishing
**FR-DIS-004:** System shall display version history with diff capability
**FR-DIS-005:** System shall enforce one active version per disclaimer type
**FR-DIS-006:** System shall render rich text content (bold, italic, lists, links)
**FR-DIS-007:** System shall track patient acceptance with timestamp and metadata
**FR-DIS-008:** System shall support scheduled publishing (effective date)
**FR-DIS-009:** System shall automatically archive expired disclaimers
**FR-DIS-010:** System shall export disclaimer content to PDF

### 3.2.5 UI Components

- Disclaimer list with version badges
- Rich text editor for content creation
- Language selector tabs
- Version comparison view
- Preview modal
- Publish confirmation dialog
- Status indicators (draft/published/archived)

### 3.2.6 API Endpoints

```
GET    /api/disclaimers
POST   /api/disclaimers
PUT    /api/disclaimers/:id
DELETE /api/disclaimers/:id
POST   /api/disclaimers/:id/publish
GET    /api/disclaimers/:id/versions
GET    /api/disclaimers/:id/content/:language

GET    /api/disclaimer-acceptances
POST   /api/disclaimer-acceptances
```

---

## 3.3 AI Auto Replies

### 3.3.1 Overview
Configure automated AI responses based on patient intent detection and routing rules.

### 3.3.2 User Stories

**US-AIR-001: View Response Templates**
- **As an** administrator
- **I want to** view all AI response templates by category
- **So that** I can understand how the AI responds to patients

**US-AIR-002: Edit Response Template**
- **As an** administrator
- **I want to** edit AI response templates
- **So that** I can customize messaging for my practice

**US-AIR-003: Configure Intent Detection**
- **As an** administrator
- **I want to** define keywords and phrases for intent detection
- **So that** the AI accurately identifies patient requests

**US-AIR-004: Set Response Priority**
- **As an** administrator
- **I want to** prioritize response templates
- **So that** the most relevant response is selected

**US-AIR-005: Configure Routing Rules**
- **As an** administrator
- **I want to** define when to route messages to staff
- **So that** patients get human help when needed

**US-AIR-006: Test Responses**
- **As an** administrator
- **I want to** test AI responses with sample inputs
- **So that** I can validate configuration before deployment

### 3.3.3 Data Model

```typescript
interface ResponseTemplate {
  id: string;
  category: 'appointment' | 'prescription' | 'billing' | 'general' | 'emergency';
  intent: string;
  priority: number;
  enabled: boolean;
  content: string;
  includeButtons: boolean;
  buttonOptions?: ButtonOption[];
  followUpPrompts?: string[];
  routeToStaff: boolean;
  routingRoles?: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ButtonOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
  nextTemplateId?: string;
}

interface IntentPattern {
  id: string;
  intent: string;
  keywords: string[];
  phrases: string[];
  regex?: string;
  confidence: number; // 0-1
  language: string;
}

interface RoutingRule {
  id: string;
  name: string;
  conditions: RuleCondition[];
  action: 'route_to_staff' | 'escalate' | 'auto_respond';
  targetRoles?: string[];
  priority: number;
  enabled: boolean;
}

interface RuleCondition {
  field: 'intent' | 'keyword' | 'sentiment' | 'time' | 'attempt_count';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number;
}
```

### 3.3.4 Functional Requirements

**FR-AIR-001:** System shall support template-based responses for 5+ categories
**FR-AIR-002:** System shall allow variable substitution (e.g., {{practice_name}}, {{patient_name}})
**FR-AIR-003:** System shall support multi-turn conversations with context retention
**FR-AIR-004:** System shall match intents using keyword, phrase, and regex patterns
**FR-AIR-005:** System shall apply routing rules in priority order
**FR-AIR-006:** System shall route to staff when confidence score < 0.7
**FR-AIR-007:** System shall support interactive buttons (max 3 per message)
**FR-AIR-008:** System shall track response effectiveness metrics
**FR-AIR-009:** System shall prevent infinite loops in conversation flows
**FR-AIR-010:** System shall support A/B testing of response variants
**FR-AIR-011:** System shall restrict medical advice responses (liability protection)
**FR-AIR-012:** System shall detect emergency keywords and escalate immediately

### 3.3.5 UI Components

- Response template grid/cards by category
- Template editor with variable picker
- Intent pattern builder
- Keyword/phrase tag input
- Routing rule builder (visual flow)
- Response preview with conversation simulator
- Confidence threshold slider
- Enable/disable toggles

### 3.3.6 API Endpoints

```
GET    /api/response-templates
POST   /api/response-templates
PUT    /api/response-templates/:id
DELETE /api/response-templates/:id

GET    /api/intent-patterns
POST   /api/intent-patterns
PUT    /api/intent-patterns/:id
DELETE /api/intent-patterns/:id

GET    /api/routing-rules
POST   /api/routing-rules
PUT    /api/routing-rules/:id
DELETE /api/routing-rules/:id

POST   /api/test-response (for testing AI responses)
```

---

## 3.4 Knowledge Sources

### 3.4.1 Overview
Manage knowledge base content used by the AI Assistant, organized by role and accessibility.

### 3.4.2 User Stories

**US-KNO-001: View Knowledge Articles**
- **As an** administrator
- **I want to** view all knowledge base articles
- **So that** I can review what information the AI can access

**US-KNO-002: Create Knowledge Article**
- **As an** administrator
- **I want to** create knowledge articles with rich content
- **So that** the AI can provide accurate information to patients

**US-KNO-003: Categorize Content**
- **As an** administrator
- **I want to** organize articles by category and tags
- **So that** relevant information is easily discoverable

**US-KNO-004: Set Access Permissions**
- **As an** administrator
- **I want to** restrict articles by role
- **So that** sensitive information is only shared appropriately

**US-KNO-005: Import External Sources**
- **As an** administrator
- **I want to** import content from URLs or documents
- **So that** I can populate the knowledge base efficiently

**US-KNO-006: Track Usage Analytics**
- **As an** administrator
- **I want to** see which articles are most referenced
- **So that** I can improve content quality

### 3.4.3 Data Model

```typescript
interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  allowedRoles: string[];
  status: 'draft' | 'published' | 'archived';
  language: string;
  lastReviewedAt?: Date;
  lastReviewedBy?: string;
  publishedAt?: Date;
  viewCount: number;
  referenceCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface KnowledgeCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  parentCategoryId?: string;
  displayOrder: number;
}

interface ExternalSource {
  id: string;
  type: 'url' | 'pdf' | 'doc' | 'api';
  source: string;
  syncEnabled: boolean;
  lastSyncAt?: Date;
  syncFrequency?: 'daily' | 'weekly' | 'monthly';
  articleIds: string[];
}

interface ArticleUsage {
  id: string;
  articleId: string;
  conversationId: string;
  patientId: string;
  timestamp: Date;
  relevanceScore: number;
  wasHelpful?: boolean;
}
```

### 3.4.4 Functional Requirements

**FR-KNO-001:** System shall support rich text content with images and links
**FR-KNO-002:** System shall support hierarchical category structure
**FR-KNO-003:** System shall enforce role-based content access
**FR-KNO-004:** System shall provide full-text search across all articles
**FR-KNO-005:** System shall support article versioning
**FR-KNO-006:** System shall allow bulk import via CSV or JSON
**FR-KNO-007:** System shall validate content for completeness before publishing
**FR-KNO-008:** System shall suggest related articles based on tags
**FR-KNO-009:** System shall track article effectiveness (helpful/not helpful feedback)
**FR-KNO-010:** System shall flag outdated content (not reviewed in 6 months)
**FR-KNO-011:** System shall support multiple languages per article
**FR-KNO-012:** System shall export knowledge base to PDF or HTML

### 3.4.5 UI Components

- Article list with search and filters
- Rich text editor with media upload
- Category tree view
- Tag input with autocomplete
- Role permission matrix
- Import wizard
- Analytics dashboard (top articles, usage trends)
- Review reminder badges

### 3.4.6 API Endpoints

```
GET    /api/knowledge/articles
POST   /api/knowledge/articles
PUT    /api/knowledge/articles/:id
DELETE /api/knowledge/articles/:id
GET    /api/knowledge/articles/search

GET    /api/knowledge/categories
POST   /api/knowledge/categories
PUT    /api/knowledge/categories/:id

GET    /api/knowledge/analytics
POST   /api/knowledge/import
GET    /api/knowledge/export
```

---

## 3.5 Patient Notices

### 3.5.1 Overview
Manage system-generated and manual patient notices with scheduling and delivery tracking.

### 3.5.2 User Stories

**US-NOT-001: Create Patient Notice**
- **As an** administrator
- **I want to** create patient notices
- **So that** I can communicate important information

**US-NOT-002: Schedule Notice Delivery**
- **As an** administrator
- **I want to** schedule notices for future delivery
- **So that** messages are sent at optimal times

**US-NOT-003: Target Specific Patients**
- **As an** administrator
- **I want to** send notices to filtered patient groups
- **So that** only relevant patients receive messages

**US-NOT-004: Track Delivery Status**
- **As an** administrator
- **I want to** view delivery and read status
- **So that** I can confirm communication effectiveness

**US-NOT-005: Configure Notice Templates**
- **As an** administrator
- **I want to** create reusable notice templates
- **So that** I can streamline common communications

**US-NOT-006: Multi-Channel Delivery**
- **As an** administrator
- **I want to** send notices via in-app, email, or SMS
- **So that** patients receive messages through preferred channels

### 3.5.3 Data Model

```typescript
interface PatientNotice {
  id: string;
  title: string;
  content: string;
  type: 'system' | 'practice' | 'emergency' | 'promotional';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('in-app' | 'email' | 'sms')[];
  targetAudience: 'all' | 'filtered';
  filters?: PatientFilter[];
  scheduledAt?: Date;
  expiresAt?: Date;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  sentAt?: Date;
}

interface PatientFilter {
  field: 'age' | 'location' | 'last_visit' | 'insurance' | 'tag';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: string | number;
}

interface NoticeDelivery {
  id: string;
  noticeId: string;
  patientId: string;
  channel: 'in-app' | 'email' | 'sms';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  error?: string;
}

interface NoticeTemplate {
  id: string;
  name: string;
  type: string;
  subject: string;
  content: string;
  defaultChannels: string[];
  variables: string[];
}
```

### 3.5.4 Functional Requirements

**FR-NOT-001:** System shall support scheduling notices up to 1 year in advance
**FR-NOT-002:** System shall allow filtering patients by demographics, visit history, tags
**FR-NOT-003:** System shall prevent duplicate notice delivery within 24 hours
**FR-NOT-004:** System shall support variable substitution in notice content
**FR-NOT-005:** System shall track delivery status per patient per channel
**FR-NOT-006:** System shall support notice preview before sending
**FR-NOT-007:** System shall allow cancellation of scheduled notices
**FR-NOT-008:** System shall enforce character limits (SMS: 160 chars)
**FR-NOT-009:** System shall support urgent notices with immediate delivery
**FR-NOT-010:** System shall log all notice activity for audit
**FR-NOT-011:** System shall support notice expiration (remove from in-app after date)
**FR-NOT-012:** System shall provide delivery analytics (sent, delivered, read rates)

### 3.5.5 UI Components

- Notice composer with channel selector
- Patient filter builder
- Schedule picker (date/time)
- Template library
- Delivery status table
- Preview panel
- Analytics charts (delivery rates)

### 3.5.6 API Endpoints

```
GET    /api/notices
POST   /api/notices
PUT    /api/notices/:id
DELETE /api/notices/:id
POST   /api/notices/:id/send
POST   /api/notices/:id/cancel

GET    /api/notice-templates
POST   /api/notice-templates
PUT    /api/notice-templates/:id

GET    /api/notices/:id/deliveries
GET    /api/notices/:id/analytics
```

---

## 3.6 Registration Management

### 3.6.1 Overview
Configure patient registration workflows including required fields, validation rules, and approval processes.

### 3.6.2 User Stories

**US-REG-001: Configure Registration Fields**
- **As an** administrator
- **I want to** define required and optional registration fields
- **So that** I collect necessary patient information

**US-REG-002: Set Validation Rules**
- **As an** administrator
- **I want to** configure field validation rules
- **So that** data quality is maintained

**US-REG-003: Manage Approval Workflow**
- **As an** administrator
- **I want to** configure registration approval process
- **So that** new patients are properly vetted

**US-REG-004: Review Pending Registrations**
- **As an** administrator
- **I want to** view and approve pending registrations
- **So that** patients can access the system

**US-REG-005: Configure Insurance Validation**
- **As an** administrator
- **I want to** enable insurance verification
- **So that** billing information is accurate

**US-REG-006: Customize Registration Flow**
- **As an** administrator
- **I want to** define multi-step registration flow
- **So that** the process is user-friendly

### 3.6.3 Data Model

```typescript
interface RegistrationConfig {
  id: string;
  organizationId: string;
  requireApproval: boolean;
  autoApproveWithInsurance: boolean;
  enableEmailVerification: boolean;
  enablePhoneVerification: boolean;
  requiredFields: string[];
  optionalFields: string[];
  steps: RegistrationStep[];
  updatedAt: Date;
  updatedBy: string;
}

interface RegistrationStep {
  id: string;
  order: number;
  title: string;
  description: string;
  fields: FieldConfig[];
}

interface FieldConfig {
  name: string;
  type: 'text' | 'email' | 'phone' | 'date' | 'select' | 'file';
  label: string;
  required: boolean;
  validation?: ValidationRule;
  options?: string[];
  helpText?: string;
}

interface ValidationRule {
  type: 'regex' | 'min_length' | 'max_length' | 'date_range' | 'custom';
  value: string | number;
  errorMessage: string;
}

interface PatientRegistration {
  id: string;
  patientId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'incomplete';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
  data: Record<string, any>;
  documents: RegistrationDocument[];
}

interface RegistrationDocument {
  id: string;
  type: 'id_card' | 'insurance_card' | 'consent_form';
  filename: string;
  url: string;
  uploadedAt: Date;
  verified: boolean;
}
```

### 3.6.4 Functional Requirements

**FR-REG-001:** System shall support drag-and-drop field ordering
**FR-REG-002:** System shall validate field configuration before saving
**FR-REG-003:** System shall support conditional field display (show field X if Y=value)
**FR-REG-004:** System shall allow custom regex validation
**FR-REG-005:** System shall support document upload with file type restrictions
**FR-REG-006:** System shall verify email addresses via confirmation link
**FR-REG-007:** System shall verify phone numbers via SMS code
**FR-REG-008:** System shall support insurance card OCR for auto-fill
**FR-REG-009:** System shall queue registrations for review when approval enabled
**FR-REG-010:** System shall send notification to patient upon approval/rejection
**FR-REG-011:** System shall support multi-step progress indicator
**FR-REG-012:** System shall save partial progress (allow resume later)
**FR-REG-013:** System shall enforce HIPAA compliance for document storage

### 3.6.5 UI Components

- Field configuration builder
- Drag-and-drop step organizer
- Validation rule editor
- Registration queue table
- Document viewer
- Approval/rejection modal
- Progress indicator
- Registration preview

### 3.6.6 API Endpoints

```
GET    /api/registration/config
PUT    /api/registration/config

GET    /api/registrations
GET    /api/registrations/:id
PUT    /api/registrations/:id/approve
PUT    /api/registrations/:id/reject
DELETE /api/registrations/:id

POST   /api/registrations/verify-email
POST   /api/registrations/verify-phone
```

---

## 3.7 Audit Logs

### 3.7.1 Overview
Comprehensive logging and monitoring of all system activities for compliance, security, and troubleshooting.

### 3.7.2 User Stories

**US-AUD-001: View Audit Logs**
- **As an** auditor
- **I want to** view all system activity logs
- **So that** I can monitor for compliance violations

**US-AUD-002: Filter Logs**
- **As an** auditor
- **I want to** filter logs by user, action, date range, and resource
- **So that** I can investigate specific events

**US-AUD-003: Export Logs**
- **As an** auditor
- **I want to** export audit logs to CSV or JSON
- **So that** I can perform external analysis

**US-AUD-004: Set Alerts**
- **As an** administrator
- **I want to** configure alerts for suspicious activity
- **So that** I can respond to security incidents quickly

**US-AUD-005: View Activity Timeline**
- **As an** auditor
- **I want to** see a chronological timeline of user actions
- **So that** I can reconstruct event sequences

**US-AUD-006: Secure Log Storage**
- **As a** compliance officer
- **I want** audit logs to be immutable and tamper-proof
- **So that** they are admissible for regulatory review

### 3.7.3 Data Model

```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  organizationId: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage?: string;
  changes?: AuditChange[];
  metadata?: Record<string, any>;
}

type AuditAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'approve'
  | 'reject'
  | 'publish'
  | 'export';

interface AuditChange {
  field: string;
  oldValue: any;
  newValue: any;
}

interface AuditAlert {
  id: string;
  name: string;
  conditions: AlertCondition[];
  notifyUsers: string[];
  notifyChannels: ('email' | 'sms' | 'in-app')[];
  enabled: boolean;
  lastTriggeredAt?: Date;
}

interface AlertCondition {
  field: 'action' | 'user' | 'resource' | 'time' | 'frequency';
  operator: 'equals' | 'contains' | 'greater_than' | 'pattern';
  value: string | number;
}
```

### 3.7.4 Functional Requirements

**FR-AUD-001:** System shall log all CRUD operations on all resources
**FR-AUD-002:** System shall log all authentication events (login, logout, failed attempts)
**FR-AUD-003:** System shall capture user identity, timestamp, IP address, user agent
**FR-AUD-004:** System shall record before/after values for update operations
**FR-AUD-005:** System shall retain logs for minimum 7 years (HIPAA requirement)
**FR-AUD-006:** System shall write logs to append-only storage (immutable)
**FR-AUD-007:** System shall support full-text search across all log fields
**FR-AUD-008:** System shall support date range filtering with timezone handling
**FR-AUD-009:** System shall export logs in CSV, JSON, and NDJSON formats
**FR-AUD-010:** System shall support alert rules with complex conditions
**FR-AUD-011:** System shall rate-limit alert notifications (max 1 per hour per rule)
**FR-AUD-012:** System shall display activity timeline with visual indicators
**FR-AUD-013:** System shall redact sensitive data (passwords, tokens) from logs
**FR-AUD-014:** System shall support log integrity verification (hash chain)

### 3.7.5 UI Components

- Log table with infinite scroll/pagination
- Advanced filter panel
- Date range picker with presets
- User activity timeline
- Export dialog
- Alert rule builder
- Search bar with autocomplete
- Details modal (expandable JSON)

### 3.7.6 API Endpoints

```
GET    /api/audit-logs
GET    /api/audit-logs/:id
GET    /api/audit-logs/search
GET    /api/audit-logs/export

GET    /api/audit-alerts
POST   /api/audit-alerts
PUT    /api/audit-alerts/:id
DELETE /api/audit-alerts/:id

GET    /api/audit-logs/timeline/:userId
GET    /api/audit-logs/verify (integrity check)
```

---

## 4. Non-Functional Requirements

### 4.1 Performance

**NFR-PERF-001:** Page load time shall be < 2 seconds on 3G connection  
**NFR-PERF-002:** API response time shall be < 500ms for 95th percentile  
**NFR-PERF-003:** System shall support 100 concurrent admin users  
**NFR-PERF-004:** Audit log queries shall return results within 3 seconds for 10k records  
**NFR-PERF-005:** System shall lazy-load large datasets (pagination/infinite scroll)  

### 4.2 Security

**NFR-SEC-001:** All API endpoints shall require authentication via JWT  
**NFR-SEC-002:** All data in transit shall be encrypted via TLS 1.3  
**NFR-SEC-003:** All data at rest shall be encrypted using AES-256  
**NFR-SEC-004:** System shall enforce password complexity (min 12 chars, mixed case, numbers, symbols)  
**NFR-SEC-005:** System shall implement rate limiting (100 requests/min per user)  
**NFR-SEC-006:** System shall auto-logout after 15 minutes of inactivity  
**NFR-SEC-007:** System shall support Multi-Factor Authentication (MFA)  
**NFR-SEC-008:** System shall follow OWASP Top 10 security guidelines  
**NFR-SEC-009:** System shall validate and sanitize all user inputs  
**NFR-SEC-010:** System shall implement Content Security Policy (CSP)  

### 4.3 Compliance

**NFR-COMP-001:** System shall be HIPAA compliant  
**NFR-COMP-002:** System shall maintain audit trail for all PHI access  
**NFR-COMP-003:** System shall support Business Associate Agreement (BAA) requirements  
**NFR-COMP-004:** System shall implement data retention policies (7 years)  
**NFR-COMP-005:** System shall support patient data export (right to access)  
**NFR-COMP-006:** System shall support patient data deletion (right to be forgotten)  
**NFR-COMP-007:** System shall comply with accessibility standards (WCAG 2.1 AA)  

### 4.4 Usability

**NFR-USE-001:** System shall be responsive on devices 320px - 2560px wide  
**NFR-USE-002:** System shall support modern browsers (Chrome, Firefox, Safari, Edge)  
**NFR-USE-003:** System shall provide inline help text for complex features  
**NFR-USE-004:** System shall show loading indicators for operations > 1 second  
**NFR-USE-005:** System shall provide clear error messages with remediation steps  
**NFR-USE-006:** System shall support keyboard navigation  
**NFR-USE-007:** System shall use consistent date format ("Jun 10") throughout  
**NFR-USE-008:** System shall use 14px base font size  

### 4.5 Reliability

**NFR-REL-001:** System shall have 99.9% uptime (excluding planned maintenance)  
**NFR-REL-002:** System shall gracefully handle API failures with retry logic  
**NFR-REL-003:** System shall provide offline detection and user notification  
**NFR-REL-004:** System shall implement database connection pooling  
**NFR-REL-005:** System shall log all errors to centralized monitoring  

### 4.6 Scalability

**NFR-SCALE-001:** System shall support 1000+ organizations  
**NFR-SCALE-002:** System shall support 10,000+ users  
**NFR-SCALE-003:** System shall handle 1M+ audit log records  
**NFR-SCALE-004:** Database queries shall use proper indexing  
**NFR-SCALE-005:** System shall implement caching for frequently accessed data  

---

## 5. Data Security & Privacy

### 5.1 PHI Handling

All personally identifiable information (PII) and protected health information (PHI) must be:
- Encrypted at rest using AES-256
- Encrypted in transit using TLS 1.3
- Logged when accessed (audit trail)
- Restricted by role-based access control
- Redacted in error messages and logs

### 5.2 Authentication & Authorization

- **Authentication:** JWT tokens with 1-hour expiration
- **Authorization:** Role-based access control (RBAC) with granular permissions
- **MFA:** Support for TOTP and SMS-based 2FA
- **SSO:** Support for SAML 2.0 and OAuth 2.0/OIDC

### 5.3 Session Management

- Session timeout: 15 minutes inactivity
- Concurrent session limit: 3 per user
- Session invalidation on password change
- Secure cookie flags: HttpOnly, Secure, SameSite=Strict

---

## 6. Error Handling

### 6.1 User-Facing Errors

- Display friendly error messages
- Avoid exposing technical details
- Provide actionable remediation steps
- Log full error details server-side

### 6.2 API Error Responses

```typescript
interface APIError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

### 6.3 Common Error Codes

- `AUTH_001`: Invalid credentials
- `AUTH_002`: Session expired
- `PERM_001`: Insufficient permissions
- `VAL_001`: Validation error
- `NOT_FOUND_001`: Resource not found
- `CONFLICT_001`: Resource conflict
- `RATE_LIMIT_001`: Rate limit exceeded
- `SERVER_001`: Internal server error

---

## 7. Testing Requirements

### 7.1 Unit Testing

- Target: 80% code coverage
- Framework: Jest + React Testing Library
- Test all business logic functions
- Test all custom hooks

### 7.2 Integration Testing

- Test API endpoint interactions
- Test authentication flows
- Test database operations
- Test external service integrations (SSO, email)

### 7.3 E2E Testing

- Test critical user workflows
- Test cross-browser compatibility
- Test responsive design breakpoints
- Framework: Playwright or Cypress

### 7.4 Security Testing

- Penetration testing (annual)
- Vulnerability scanning (monthly)
- Dependency audits (weekly)
- OWASP ZAP automated scans

### 7.5 Accessibility Testing

- WCAG 2.1 AA compliance
- Screen reader testing (NVDA, JAWS)
- Keyboard navigation testing
- Color contrast validation

---

## 8. Deployment & DevOps

### 8.1 Environments

- **Development:** Local development environment
- **Staging:** Pre-production testing environment
- **Production:** Live production environment

### 8.2 CI/CD Pipeline

1. Code commit → Git repository
2. Automated tests (unit, integration)
3. Code quality checks (ESLint, TypeScript)
4. Security scans (dependency audit)
5. Build application
6. Deploy to staging
7. Automated E2E tests
8. Manual QA approval
9. Deploy to production
10. Smoke tests

### 8.3 Monitoring

- Application performance monitoring (APM)
- Error tracking (Sentry or similar)
- Log aggregation (CloudWatch, Datadog)
- Uptime monitoring
- Database performance monitoring

### 8.4 Backup & Recovery

- Database backups: Daily with 30-day retention
- Disaster recovery plan with RTO < 4 hours
- Regular backup restoration testing (quarterly)

---

## 9. Dependencies & Integrations

### 9.1 External Services

- **Supabase:** Database, Auth, Storage, Edge Functions
- **Email Service:** SendGrid, AWS SES, or Postmark
- **SMS Service:** Twilio or AWS SNS
- **Push Notifications:** Firebase Cloud Messaging or OneSignal

### 9.2 SSO Providers

- Google Workspace
- Microsoft Azure AD
- Okta
- Custom SAML 2.0 providers

### 9.3 Third-Party Libraries

See Technology Stack (Section 2.1) for complete list

---

## 10. Future Enhancements (Out of Scope for Phase 1)

- Multi-tenant data isolation with tenant-specific databases
- Advanced analytics dashboard with custom reports
- Webhook support for external integrations
- API rate limit customization per organization
- Advanced AI training interface
- Patient portal integration
- EHR/EMR integration (HL7 FHIR)
- Telemedicine integration
- Billing system integration
- Advanced reporting and business intelligence

---

## 11. Acceptance Criteria

Each feature shall be considered complete when:

1. All functional requirements are implemented
2. Unit tests achieve 80% coverage
3. Integration tests pass
4. E2E tests pass for critical workflows
5. Security review is completed
6. Accessibility audit passes
7. Code review is approved
8. Documentation is updated
9. QA sign-off is received
10. Product owner approval is obtained

---

## 12. Glossary

- **PHI:** Protected Health Information
- **HIPAA:** Health Insurance Portability and Accountability Act
- **SSO:** Single Sign-On
- **MFA:** Multi-Factor Authentication
- **RBAC:** Role-Based Access Control
- **JWT:** JSON Web Token
- **CRUD:** Create, Read, Update, Delete
- **API:** Application Programming Interface
- **OCR:** Optical Character Recognition
- **WCAG:** Web Content Accessibility Guidelines
- **RTO:** Recovery Time Objective

---

## 13. Change Log

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | Nov 17, 2025 | Engineering Team | Initial FDD |

---

## Appendix A: Database Schema

### Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('tenant', 'location')),
  parent_id UUID REFERENCES organizations(id),
  address JSONB NOT NULL,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  organization_id UUID REFERENCES organizations(id),
  status VARCHAR(20) DEFAULT 'active',
  sso_enabled BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id UUID,
  organization_id UUID REFERENCES organizations(id),
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  changes JSONB,
  metadata JSONB
);
```

(Additional tables follow similar patterns for other entities)

---

**END OF DOCUMENT**
