# BASE Healthcare Platform - Demo Documentation

**Version:** Phase 1 MVP  
**Last Updated:** November 23, 2025  
**Purpose:** Complete reference guide for all interactive demonstrations

---

## Table of Contents

1. [System Overview](#system-overview)
2. [User Roles](#user-roles)
3. [Demo Catalog](#demo-catalog)
4. [Integration Map](#integration-map)
5. [Data Flow Diagrams](#data-flow-diagrams)
6. [API Reference](#api-reference)

---

## System Overview

The BASE Healthcare Platform is an **Omnichannel Messaging and AI Receptionist** system with the following architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    PATIENT MOBILE APP                        │
│  - AI Chat Assistant                                         │
│  - FHIR Health Records                                       │
│  - Appointment Views                                         │
│  - Wearable Integration                                      │
│  - Phone OTP Registration                                    │
│  - Billing & Payments                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Secure Messaging API
                     │ FHIR R4 API
                     │ Greenway APIs
                     │
┌────────────────────▼────────────────────────────────────────┐
│              UNIFIED STAFF PORTAL (EHR)                      │
│  - Messages Inbox (AI Summaries)                            │
│  - Patient Queue                                             │
│  - Appointments                                              │
│  - Tasks & Pre-Visit Forms                                  │
│  - Wearable Data Views                                       │
└──────────────────────────────────────────────────────────────┘
```

### Core Technologies

- **Frontend:** React + Tailwind CSS
- **Mobile:** iOS (HealthKit) + Android (Google Fit)
- **FHIR:** R4 specification with Greenway Health staging endpoint
- **Auth:** Supabase Auth + Phone OTP (Greenway API)
- **AI:** OpenAI GPT-4 for chat + summarization
- **Wearables:** HealthKit, Google Fit, Fitbit OAuth

---

## User Roles

### 1. **Patient** 👤

**Access:** Mobile app (iOS/Android) + Web portal  
**Capabilities:**

- Chat with AI assistant
- View health records (FHIR)
- See appointments
- Connect wearable devices
- Send secure messages to staff
- Register via phone OTP
- Manage billing & payments

### 2. **Staff/Clinician** 🏥

**Access:** Unified Staff Portal (EHR desktop view)  
**Roles:** Admin, Billing, Scheduling, Clinical, Auditor  
**Capabilities:**

- View patient messages with AI summaries
- Manage patient queue
- Schedule appointments
- Review tasks and pre-visit forms
- View patient wearable data
- Reply to secure messages

### 3. **Administrator** ⚙️

**Access:** Admin Hub (settings & configuration)  
**Capabilities:**

- Manage practice settings
- Configure disclaimers & consent
- Manage users & roles
- Review OTP analytics
- Configure knowledge sources
- Monitor wearable integrations

---

## Demo Catalog

### 1. AI Assistant Demo 🤖

**File:** `PatientAppDemo.tsx` (when `initialScreen="disclaimer"`)  
**Purpose:** Patient-facing AI chatbot with knowledge base integration and escalation to staff

#### Users Involved

- **Primary:** Patient
- **Secondary:** Staff (receives escalated messages)

#### Key Features

1. **Pre-Chat Disclaimer** - HIPAA/consent before starting
2. **AI-Powered Chat** - GPT-4 with medical knowledge base
3. **Smart Routing:**
   - Answers general questions (office hours, services)
   - Uses FHIR data for appointment questions
   - Routes billing/complex issues to staff
4. **Message History** - Persistent conversation storage
5. **Escalation Flow** - "Speak to staff" triggers message in Staff Portal

#### Integration Points

✅ **Integrates with:**

- **Unified Staff Portal** → Escalated messages appear in Messages tab
- **FHIR Mobile Chat Demo** → Shares FHIR appointment data
- **AI Summarization Demo** → Conversations get auto-summarized for staff

#### API Endpoints

```
POST /api/chat - Send message to AI
GET /api/chat/history - Retrieve conversation
POST /api/chat/escalate - Route to staff
```

#### Demo PIN/Access

- No special credentials needed
- Try asking: "When is my next appointment?" (uses FHIR data)
- Try asking: "I need to speak to staff" (triggers escalation)

---

### 2. Patient App Demo 📱

**File:** `PatientAppDemo.tsx`  
**Purpose:** Complete patient mobile onboarding and registration flow

#### Users Involved

- **Primary:** New Patient
- **Secondary:** Admin (QR code generation, patient matching)

#### Key Features

1. **App Download Flow** - iOS/Android store links
2. **QR Code Scanning** - Scan practice-provided QR code
3. **Patient Matching** - Find existing record (Name, DOB, Last 4 SSN)
4. **MFA Setup** - SMS/Email verification
5. **Account Creation** - Username, password, profile photo
6. **Settings Management** - Update profile, change password, manage devices

#### Integration Points

✅ **Integrates with:**

- **OTP Migration Demo** → Phone verification flow
- **FHIR Demo** → Patient matching uses FHIR search
- **Unified Staff Portal** → New patient appears in patient queue

#### API Endpoints

```
POST /api/patients/match - Match existing patient record
POST /api/patients/register - Create new patient account
POST /api/mfa/send - Send MFA code
POST /api/mfa/verify - Verify MFA code
```

#### Demo Flow

1. Start → "I don't have the app"
2. Select platform → Download
3. Scan QR code → Patient matching
4. Enter: Name, DOB, Last 4 of SSN
5. Setup MFA → Create account

---

### 3. Unified Staff Portal 🏥

**File:** `UnifiedStaffPortal.tsx`  
**Purpose:** Complete EHR view for clinical staff with 4 main tabs

#### Users Involved

- **Primary:** Staff (all roles: admin, clinical, scheduling, billing, auditor)
- **Secondary:** Patients (data source)

#### Key Features

##### **Tab 1: Messages** 💬

- **Inbox View** - All patient messages
- **AI Summaries** - Auto-generated conversation summaries
- **Priority Sorting** - High/Medium/Low
- **Quick Actions** - Reply, Assign, Archive
- **Filter by:** Unread, Priority, Patient

**Integration:**

- ✅ Receives escalated messages from **AI Assistant Demo**
- ✅ Uses **AI Summarization Demo** for summaries

##### **Tab 2: Patients** 👥

- **Patient Queue** - All active patients
- **Demographics** - Name, age, MRN, last visit
- **Quick Actions** - View chart, Send message, Schedule
- **Search & Filter** - By name, MRN, status

**Integration:**

- ✅ Pulls from **FHIR Demo** for patient data
- ✅ Shows patients from **Patient App Demo** registrations
- ✅ Displays **Wearable Integration** data when available

##### **Tab 3: Appointments** 📅

- **Today's Schedule** - Chronological view
- **Appointment Cards** - Time, patient, reason, status
- **Actions** - Check-in, Reschedule, Cancel
- **Status Tracking** - Scheduled, Checked-in, In-progress, Complete

**Integration:**

- ✅ Uses **FHIR Demo** for appointment data
- ✅ Powers **Appointment Reminder Demo** notifications

##### **Tab 4: Tasks** ✅

- **Pre-Visit Forms** - Patient intake forms
- **Form Status** - Pending, In-progress, Complete
- **Actions** - Review, Approve, Request changes
- **Filters** - By patient, form type, due date

**Integration:**

- ✅ Linked to **Appointment Reminder Demo** (pre-visit workflow)

#### API Endpoints

```
GET /api/staff/messages - Fetch messages with summaries
POST /api/staff/messages/reply - Send staff reply
GET /api/staff/patients - Fetch patient queue
GET /api/staff/appointments - Today's appointments
GET /api/staff/tasks - Pre-visit forms & tasks
```

#### Demo Access

- Full-screen demo (no mobile frame)
- Navigate tabs at bottom: Messages, Patients, Appointments, Tasks
- Click cards to see details

---

### 4. FHIR Integration Demo 📊

**File:** `FHIRDemo.tsx`  
**Purpose:** Live FHIR R4 data from Greenway Health staging endpoint (AWS HealthLake)

#### Users Involved

- **Primary:** Developer/Admin (testing FHIR connectivity)
- **Secondary:** Staff (clinical data review)

#### Key Features

1. **9 FHIR Resource Types:**
   - Patient
   - Observation (vitals, labs)
   - Condition (diagnoses)
   - MedicationRequest (prescriptions)
   - Encounter (visits)
   - AllergyIntolerance
   - Immunization
   - DiagnosticReport
   - Procedure

2. **Patient Search** - Find patient by ID
3. **Tabbed Interface** - Browse resources by type
4. **Real Data** - Connected to Greenway staging endpoint
5. **JSON Viewer** - Raw FHIR data display

#### Integration Points

✅ **Integrates with:**

- **FHIR Mobile Chat Demo** → Shares FHIR endpoint
- **Unified Staff Portal** → Provides patient/appointment data
- **AI Assistant Demo** → Appointment data for AI responses

#### API Configuration

```javascript
// Greenway Health FHIR R4 Staging Endpoint
const FHIR_BASE_URL = 'https://fhir.cloud.greenway.com/greenway-development/uscdi/r4';

// Patient ID for demo
const PATIENT_ID = '0efed85b-e8a2-417b-a1f4-6a30fd74e7c2';
```

#### Demo Flow

1. Select resource type tab
2. Click "Load [Resource]" button
3. View FHIR data in cards
4. Inspect raw JSON

---

### 5. FHIR Mobile Chat Demo 💬📱

**File:** `FHIRMobileChatDemo.tsx`  
**Purpose:** EHR-style mobile chat with AI + medical record queries

#### Users Involved

- **Primary:** Patient (mobile app)
- **Secondary:** AI (responds with FHIR data)

#### Key Features

1. **AI Medical Queries** - Ask about conditions, meds, vitals
2. **FHIR Data Cards** - Visual display of:
   - Conditions (diagnoses)
   - Medications (with dosage)
   - Vitals (latest readings)
   - Appointments
   - Immunizations
3. **Image Uploads** - Attach photos to messages
4. **Chat Summaries** - AI-generated conversation summaries
5. **Insurance Viewing** - View coverage details

#### Integration Points

✅ **Integrates with:**

- **FHIR Demo** → Uses same Greenway endpoint
- **AI Summarization Demo** → Generates chat summaries
- **Unified Staff Portal** → Summaries appear in Messages tab

#### Demo Queries to Try

- "What are my current conditions?"
- "Show my medications"
- "What were my last vitals?"
- "When is my next appointment?"

#### API Endpoints

```
POST /api/chat/fhir - AI query with FHIR context
GET /api/fhir/patient/{id}/conditions
GET /api/fhir/patient/{id}/medications
GET /api/fhir/patient/{id}/observations
```

---

### 6. Appointment Reminder Demo 📅💊

**File:** `AppointmentReminderDemo.tsx`  
**Purpose:** Automated appointment reminders with pre-visit medication review

#### Users Involved

- **Primary:** Patient (receives reminder)
- **Secondary:** Staff (reviews completed forms)

#### Key Features

1. **7-Step Wizard Flow:**
   - Step 1: Appointment confirmation
   - Step 2: Medication review (13 FHIR resources)
   - Step 3: Add/update medications
   - Step 4: Health status update
   - Step 5: Pre-visit questions
   - Step 6: Insurance confirmation
   - Step 7: Completion summary

2. **FHIR Integration** - Pulls 13 medication resources
3. **Medication Management** - Add, edit, mark as stopped
4. **Health Updates** - New symptoms, conditions
5. **Task Creation** - Creates pre-visit form in Staff Portal

#### Integration Points

✅ **Integrates with:**

- **FHIR Demo** → Loads 13 medication resources
- **Unified Staff Portal** → Completed form appears in Tasks tab
- **AI Assistant** → Patient can ask about appointment

#### Demo Flow

1. View appointment reminder card
2. Confirm appointment
3. Review medications (from FHIR)
4. Update health status
5. Complete pre-visit questions
6. Submit → Task appears in Staff Portal

---

### 7. AI Summarization Demo ✨

**File:** `SummarizationDemo.tsx`  
**Purpose:** Greenway AIRE Agent for AI-powered chat summarization

#### Users Involved

- **Primary:** Staff (views summaries)
- **Secondary:** AI (generates summaries)

#### Key Features

1. **Chat Summarization** - Convert long conversations to key points
2. **Conversation Analysis** - Extract:
   - Chief complaint
   - Symptoms mentioned
   - Questions asked
   - Action items
3. **Auto-Generated Summaries** - Real-time as chat happens
4. **Summary Formats:**
   - Brief (2-3 sentences)
   - Detailed (bullet points)
   - Clinical (medical terminology)

#### Integration Points

✅ **Integrates with:**

- **AI Assistant Demo** → Summarizes patient AI chats
- **FHIR Mobile Chat Demo** → Summarizes medical queries
- **Unified Staff Portal** → Displays summaries in Messages tab

#### API Endpoints

```
POST /api/chat/summarize - Generate summary from conversation
GET /api/chat/summaries/{conversationId} - Retrieve summary
```

#### Demo Example

**Input:** Long patient chat about headaches, fever, scheduling
**Output Summary:**

- Chief Complaint: Headaches for 3 days, fever 101°F
- Duration: Started Monday evening
- Action Requested: Schedule appointment with Dr. Smith
- Urgency: Moderate

---

### 8. OTP Migration Demo 🔐📱

**File:** `OTPMigrationDemo.tsx`  
**Purpose:** Complete phone verification and OTP flow with Greenway API integration

#### Users Involved

- **Primary:** Patient (registering new account)
- **Secondary:** Admin (monitors OTP analytics)

#### Key Features

##### **12 Screens Across 4 Platforms:**

1. **Invite Landing** - Deep link entry
2. **Phone Entry** - Country selector, TCPA consent
3. **Confirm Channel** - SMS vs Email choice
4. **OTP Sent** - Masked phone, countdown timer
5. **OTP Input** - 6-digit code entry (PIN: `123456`)
6. **Resend Flow** - Cooldown management
7. **Expired Code** - Error handling
8. **Lockout Screen** - Too many attempts
9. **Delivery Failure** - SMS failed, try email
10. **Success** - Phone verified
11. **App Not Installed** - Web fallback
12. **Settings/Profile** - Manage phone numbers

##### **Platforms:**

- iOS (390×844) - iPhone 14 Pro
- Android (360×800)
- Mobile Web (412×915)
- Desktop Web (1440×1024)

#### Integration Points

✅ **Integrates with:**

- **Patient App Demo** → Phone verification step in registration
- **Greenway Phone OTP API** → Real API specification

#### API Endpoints (Greenway Spec)

```
POST /v1/phone/otp/request
Body: { phone, purpose, channel, correlationId }
Returns: { requestId, ttlSeconds, resendCooldownSeconds }

POST /v1/phone/otp/verify
Body: { phone, requestId, code }
Returns: { verified: true/false, remainingAttempts, lockoutExpires }
```

#### Error Codes

- **429** → Too many requests. Try again in Xs
- **410** → Code expired. Resend to get new one
- **423** → Account locked. Wait until {time}
- **403** → Opted out of SMS; try Email

#### Demo PIN

**Use PIN: `123456`** to successfully verify  
Any other code will show error

---

### 9. Wearable Integration Demo ⌚

**File:** `WearableIntegrationDemo.tsx`  
**Purpose:** Connect wearable devices with patient consent and clinician EHR views

#### Users Involved

- **Primary:** Patient (connects devices)
- **Secondary:** Staff (views health data trends)

#### Key Features

##### **Patient Mobile Flows:**

1. **Connect Starter** - Value proposition, benefits
2. **Permission & Consent** - Toggle data types:
   - Heart Rate (irregularity detection)
   - Steps & Activity (daily activity)
   - Sleep Data (quality monitoring)
3. **System Permission** - iOS HealthKit / Android permission dialog
4. **Vendor OAuth** - Fitbit/Garmin connection
5. **Device List** - All connected wearables with:
   - Status (Connected, Syncing, Queued, Error, Reauth needed)
   - Last sync time
   - Battery level
   - Sync queue count
6. **Device Detail** - 7-day trends:
   - Heart rate chart (avg/low/high)
   - Steps chart (daily average)
   - Recent measurements
   - Device info

##### **Clinician Dashboard:**

- Compact trend sparklines
- Key metrics (avg heart rate, daily steps)
- Last sync timestamp
- Link to full wearable history

#### Integration Points

✅ **Integrates with:**

- **Unified Staff Portal** → Wearable data appears in Patients tab
- **iOS HealthKit** → Native iOS Health app
- **Google Fit** → Android health data
- **Fitbit OAuth** → Third-party wearable

#### API Endpoints

```
POST /v1/patients/{id}/wearables/connect
Body: { vendor, consent_types[], device_id }

POST /v1/patients/{id}/wearables/sync
Body: { measurement_type, value, unit, timestamp }

GET /v1/patients/{id}/wearables/devices
Returns: Array of connected devices

DELETE /v1/patients/{id}/wearables/{device_id}
Revoke device connection
```

#### Canonical Data Types

- `heart_rate` - BPM
- `steps` - Count
- `sleep_summary` - Duration + quality
- `blood_oxygen` - SpO2 %
- `blood_pressure` - Systolic/Diastolic
- `calories_burned` - kcal

#### Demo Flow

1. Connect Starter → Benefits overview
2. Permission Consent → Select data types
3. System Permission → Allow Health access
4. Device List → See connected Apple Watch
5. Device Detail → View 7-day heart rate & steps trends

---

### 10. Billing Integration Demo 💳

**File:** `BillingIntegrationDemo.tsx`  
**Purpose:** Patient billing portal with FHIR-based billing data integration

#### Users Involved
- **Primary:** Patient (views bills, makes payments)
- **Secondary:** Billing Staff (processes payments, manages accounts)

#### Key Features

##### **5 Mobile Billing Views:**

1. **Billing Summary** - Account balance overview
   - Current balance display ($350.00)
   - Total charges, insurance paid, patient paid
   - Adjustments & discounts
   - Last payment info with confirmation number
   - Quick actions (Make Payment, View Statements, Payment History)
   - Primary insurance display

2. **Statements List** - All billing statements/invoices
   - 3 sample invoices (Nov 2025, Oct 2025, Sep 2025)
   - Status badges (Paid, Due, Balanced)
   - Amount due for each statement
   - Line item counts
   - Click to view detailed breakdown

3. **Statement Detail** - Line-item breakdown
   - CPT codes with descriptions (99215, 80053, 82947)
   - Insurance adjudication breakdown:
     - Charged amount
     - Insurance adjustment
     - Insurance payment
     - Patient responsibility
   - Payment history on statement
   - Service date vs statement date
   - Provider information
   - Download PDF option
   - Pay balance button

4. **EOBs (Explanation of Benefits)** - Insurance claims
   - 4 sample EOBs (Nov-Aug 2025)
   - Insurance claim adjudication
   - Submitted vs benefit amounts
   - Copay, deductible breakdown
   - Patient responsibility calculation
   - Insurer and provider information
   - Processing status with dates

5. **Payment History** - Patient & payer payments
   - 6 payments (3 patient, 3 insurance)
   - Complete payment timeline
   - Patient payments (credit card ending in 4532, debit card ending in 7821)
   - Insurance payments (EFT, ERA 835 remittance)
   - Confirmation numbers for all transactions
   - Payment method details

6. **Make Payment** - Secure online payment processing
   - Amount selection (Full Balance, Minimum Payment, Custom Amount)
   - Payment method selection (Credit Card, Debit Card, Bank Account/ACH)
   - Card entry form with validation
   - Payment summary with total calculation
   - Secure payment processing
   - Real-time balance updates

7. **Payment Success** - Confirmation screen
   - Payment confirmation number
   - Receipt details (amount, method, date)
   - Updated account balance display  
   - Download/email receipt options
   - Navigation to payment history

##### **FHIR Resources Used:**
- `Account` - Billing summary with balance totals
- `Invoice` - Individual statements with line items
- `Claim` - Insurance claims submitted
- `ExplanationOfBenefit` - EOB adjudication details
- `PaymentReconciliation` - Payment tracking

##### **Architecture:**
```
Patient App → Backend API (REST facade) → AWS HealthLake FHIR APIs
```

#### Integration Points
✅ **Integrates with:**
- **FHIR Demo** → Uses same Greenway FHIR R4 endpoint
- **Patient App Demo** → Billing accessible from patient portal
- **AI Assistant** → Patient can ask billing questions, escalate to billing staff

#### API Endpoints (Greenway Billing API)
```
GET /fhir/billing/summary
  Returns: Account resource with balance summary

GET /fhir/billing/statements
  Returns: Bundle of Invoice resources

GET /fhir/billing/statements/{id}
  Returns: Detailed Invoice with line items

GET /fhir/billing/eobs
  Returns: Bundle of ExplanationOfBenefit resources

GET /fhir/billing/payments
  Returns: Bundle of PaymentReconciliation resources

POST /fhir/billing/payment
  Body: { amount, method, invoiceId }
  Returns: PaymentReconciliation confirmation
```

#### Demo Data

**Billing Summary:**
- Current Balance: $350.00
- Total Charges: $2,845.50
- Insurance Paid: $1,920.00
- Patient Paid: $450.00
- Adjustments: -$125.50
- Last Payment: $150.00 (Nov 15, 2025 via Visa ending in 4532)

**Sample Statements:**
1. **INV-2025-11-001** - November 2025
   - Total: $485.00 | Due: $150.00 | Status: Paid
   - Office Visit Level 4 (99214)

2. **INV-2025-10-001** - October 2025
   - Total: $1,250.00 | Due: $200.00 | Status: Paid
   - Colonoscopy, Diagnostic (45378)

3. **INV-2025-09-001** - September 2025
   - Total: $110.50 | Due: $0.00 | Status: Balanced
   - Complete Blood Count (85025)

**Detailed Statement (INV-123):**
```
Annual Physical Examination (99215)
  Charged Amount:        $350.00
  Insurance Adjustment:  -$100.00
  Insurance Payment:     -$200.00
  Your Responsibility:    $50.00

Lab Work - Metabolic Panel (80053)
  Charged Amount:        $200.00
  Insurance Adjustment:   -$50.00
  Insurance Payment:     -$120.00
  Your Responsibility:    $30.00

Lab Work - Glucose Test (82947)
  Charged Amount:        $100.00
  Insurance Adjustment:   -$25.00
  Insurance Payment:      -$60.00
  Your Responsibility:    $15.00

Total Balance: $0.00 (Paid in Full)
```

**Payments Received:**
- Aug 20, 2025: $380.00 (Blue Cross Blue Shield - EFT)
- Sep 10, 2025: $95.00 (Patient - Visa ending in 4532)

#### Demo Flow
1. Open Billing Integration Demo from Demo Hub
2. Select "Billing Summary" → See $350 current balance
3. Click "View Statements" → See 3 invoices
4. Click on "INV-123" → See detailed line-item breakdown
5. Review insurance adjustments and payments
6. See "Paid in Full" status with payment confirmation

#### API Configuration
**Base URL:** `https://api.greenwayhealth.com/fhir`

**Patient ID:** `0efed85b-e8a2-417b-a1f4-6a30fd74e7c2` (same as other FHIR demos)

**Insurance:** Blue Cross Blue Shield - PPO (Primary)

#### Key Benefits
1. **Transparency** - Clear breakdown of charges, insurance, and patient responsibility
2. **Self-Service** - Patients can view statements and pay online 24/7
3. **FHIR Compliance** - Uses standard FHIR R4 resources for interoperability
4. **Integration** - Works with existing EHR billing systems via FHIR APIs
5. **Mobile-First** - Optimized for patient mobile app experience

---

## Integration Map

### Cross-Demo Data Flows

```
┌─────────────────────────────────────────────────────────────────┐
│                        PATIENT SIDE                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [AI Assistant] ──escalate──> [Staff Portal Messages]           │
│        │                                                         │
│        └──FHIR appt data──> [FHIR Mobile Chat]                  │
│                                                                  │
│  [Patient App Demo] ──registration──> [Staff Portal Patients]   │
│        │                                                         │
│        └──phone verify──> [OTP Migration]                       │
│                                                                  │
│  [Appointment Reminder] ──pre-visit form──> [Staff Portal Tasks]│
│        │                                                         │
│        └──FHIR meds (13)──> [FHIR Demo]                         │
│                                                                  │
│  [Wearable Integration] ──health data──> [Staff Portal Patients]│
│        │                                                         │
│        └──HealthKit/Fitbit──> Device APIs                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         STAFF SIDE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Unified Staff Portal]                                          │
│    ├─ Messages Tab ←── [AI Assistant] escalations              │
│    │                 ←── [AI Summarization] summaries           │
│    │                                                             │
│    ├─ Patients Tab ←── [Patient App Demo] registrations        │
│    │                 ←── [FHIR Demo] patient data               │
│    │                 ←── [Wearable Integration] health trends   │
│    │                                                             │
│    ├─ Appointments Tab ←── [FHIR Demo] appointments             │
│    │                                                             │
│    └─ Tasks Tab ←────── [Appointment Reminder] pre-visit forms  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      DATA SOURCES                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [FHIR Demo] ←──────────── Greenway Health FHIR R4 API         │
│    │                        (AWS HealthLake)                     │
│    ├──> [AI Assistant] (appointment data)                       │
│    ├──> [FHIR Mobile Chat] (all resources)                      │
│    ├──> [Appointment Reminder] (medications)                    │
│    └──> [Staff Portal] (patients, appointments)                 │
│                                                                  │
│  [OTP Migration] ←──────── Greenway Phone OTP API               │
│    └──> [Patient App Demo] (phone verification)                 │
│                                                                  │
│  [AI Summarization] ←──── OpenAI GPT-4 API                      │
│    ├──> [AI Assistant] (chat summaries)                         │
│    ├──> [FHIR Mobile Chat] (conversation summaries)             │
│    └──> [Staff Portal] (message summaries)                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Patient Message Escalation Flow

```
Patient opens AI Assistant
         │
         ▼
Patient asks question
         │
         ├──> AI can answer? ──> AI responds directly
         │
         └──> AI cannot answer ──> "Would you like to speak to staff?"
                    │
                    ▼ Patient confirms
              POST /api/chat/escalate
                    │
                    ▼
          Message appears in Staff Portal Messages Tab
                    │
                    ▼
          AI Summarization generates summary
                    │
                    ▼
          Staff sees: Patient Name, Summary, Priority
                    │
                    ▼
          Staff replies via Messages tab
                    │
                    ▼
          Patient receives reply in AI Assistant
```

### 2. Appointment Pre-Visit Flow

```
7 days before appointment
         │
         ▼
System triggers Appointment Reminder
         │
         ▼
Patient receives notification (email/SMS)
         │
         ▼
Patient opens Appointment Reminder Demo
         │
         ├─> Step 1: Confirm appointment
         ├─> Step 2: Review medications (FHIR loads 13 meds)
         ├─> Step 3: Update medications
         ├─> Step 4: Health status update
         ├─> Step 5: Pre-visit questions
         ├─> Step 6: Insurance confirmation
         └─> Step 7: Submit
                │
                ▼
         POST /api/tasks/pre-visit
                │
                ▼
   Task appears in Staff Portal Tasks Tab
                │
                ▼
   Staff reviews completed form before appointment
```

### 3. Wearable Data Sync Flow

```
Patient connects Apple Watch (Device List)
         │
         ▼
iOS HealthKit permission granted (System Permission)
         │
         ▼
Patient consents to: Heart Rate, Steps, Sleep
         │
         ▼
Device syncs every 15 minutes
         │
         ▼
POST /v1/patients/{id}/wearables/sync
  { measurement_type: "heart_rate", value: 72, unit: "bpm" }
         │
         ▼
Data stored in patient wearable history
         │
         ▼
Staff opens Unified Staff Portal → Patients Tab
         │
         ▼
Clicks patient card → See wearable data section
         │
         ▼
Views 7-day trends: Heart Rate, Steps, Sleep
         │
         ▼
Can drill into Device Detail for full history
```

### 4. FHIR Data Query Flow

```
Patient asks AI: "What are my medications?"
         │
         ▼
AI Assistant sends to GPT-4 with FHIR context
         │
         ▼
GET https://fhir.cloud.greenway.com/greenway-development/uscdi/r4/
    MedicationRequest?patient=0efed85b-e8a2-417b-a1f4-6a30fd74e7c2
         │
         ▼
Returns 13 FHIR MedicationRequest resources
         │
         ▼
AI formats as readable list:
  - Lisinopril 10mg daily
  - Metformin 500mg twice daily
  - Atorvastatin 20mg at bedtime
         │
         ▼
AI responds to patient with formatted list
         │
         ▼
Patient sees medications in AI chat
```

---

## API Reference

### Greenway Health APIs (External)

#### 1. FHIR R4 API

**Base URL:** `https://fhir.cloud.greenway.com/greenway-development/uscdi/r4`

**Endpoints:**

```
GET /Patient/{id}
GET /Patient/{id}/Observation
GET /Patient/{id}/Condition
GET /Patient/{id}/MedicationRequest
GET /Patient/{id}/Encounter
GET /Patient/{id}/AllergyIntolerance
GET /Patient/{id}/Immunization
GET /Patient/{id}/DiagnosticReport
GET /Patient/{id}/Procedure
GET /Patient/{id}/Appointment
```

**Demo Patient ID:** `0efed85b-e8a2-417b-a1f4-6a30fd74e7c2`

#### 2. Phone OTP API

**Base URL:** `https://api.greenway.com/v1/phone`

**Endpoints:**

```
POST /otp/request
  Body: { phone, purpose, channel, correlationId }
  Returns: { requestId, ttlSeconds, resendCooldownSeconds }

POST /otp/verify
  Body: { phone, requestId, code }
  Returns: { verified, remainingAttempts, lockoutExpires }
```

### Internal BASE APIs

#### 1. Chat & Messaging

```
POST /api/chat - AI chat message
GET /api/chat/history - Conversation history
POST /api/chat/escalate - Escalate to staff
POST /api/chat/summarize - Generate summary
```

#### 2. Staff Portal

```
GET /api/staff/messages - Messages with summaries
POST /api/staff/messages/reply - Send reply
GET /api/staff/patients - Patient queue
GET /api/staff/appointments - Today's schedule
GET /api/staff/tasks - Pre-visit forms
```

#### 3. Patient Management

```
POST /api/patients/match - Find existing patient
POST /api/patients/register - Create account
GET /api/patients/{id} - Patient details
PUT /api/patients/{id} - Update profile
```

#### 4. Wearables

```
POST /v1/patients/{id}/wearables/connect - Connect device
POST /v1/patients/{id}/wearables/sync - Sync data
GET /v1/patients/{id}/wearables/devices - List devices
DELETE /v1/patients/{id}/wearables/{deviceId} - Disconnect
```

#### 5. MFA & Auth

```
POST /api/mfa/send - Send MFA code
POST /api/mfa/verify - Verify code
POST /api/auth/login - User login
POST /api/auth/logout - User logout
GET /api/auth/session - Check session
```

---

## Quick Reference Tables

### Demo-to-User Mapping

| Demo                 | Patient    | Staff                   | Admin            |
| -------------------- | ---------- | ----------------------- | ---------------- |
| AI Assistant         | ✅ Primary | ✅ Receives escalations | ❌               |
| Patient App Demo     | ✅ Primary | ❌                      | ✅ QR generation |
| Unified Staff Portal | ❌         | ✅ Primary              | ✅ Configuration |
| FHIR Demo            | ❌         | ✅ Reviews data         | ✅ Testing       |
| FHIR Mobile Chat     | ✅ Primary | ❌                      | ❌               |
| Appointment Reminder | ✅ Primary | ✅ Reviews forms        | ❌               |
| AI Summarization     | ❌         | ✅ Primary              | ❌               |
| OTP Migration        | ✅ Primary | ❌                      | ✅ Analytics     |
| Wearable Integration | ✅ Primary | ✅ Views data           | ✅ Configuration |
| Billing Integration  | ✅ Primary | ✅ Processes payments   | ✅ Configuration |

### Demo-to-Demo Integration Matrix

|                   | AI Asst          | Patient App      | Staff Portal      | FHIR             | Mobile Chat      | Appt Reminder  | Summarize    | OTP             | Wearable       | Billing        |
| ----------------- | ---------------- | ---------------- | ----------------- | ---------------- | ---------------- | -------------- | ------------ | --------------- | -------------- | -------------- |
| **AI Assistant**  | -                | ❌               | ✅ Escalations    | ✅ Appt data     | ✅ Shares FHIR   | ❌             | ✅ Summaries | ❌              | ❌             | ❌             |
| **Patient App**   | ❌               | -                | ✅ New patients   | ✅ Matching      | ❌               | ❌             | ❌           | ✅ Phone verify | ❌             | ✅ Registration|
| **Staff Portal**  | ✅ Receives msgs | ✅ Patient queue | -                 | ✅ Data source   | ✅ Summaries     | ✅ Tasks       | ✅ Uses      | ❌              | ✅ Health data | ✅ Processes   |
| **FHIR Demo**     | ✅ Provides data | ✅ Matching      | ✅ Patients/Appts | -                | ✅ All resources | ✅ Medications | ❌           | ❌              | ❌             | ✅ Reviews     |
| **Mobile Chat**   | ✅ Shares FHIR   | ❌               | ✅ Summaries      | ✅ All resources | -                | ❌             | ✅ Summaries | ❌              | ❌             | ❌             |
| **Appt Reminder** | ❌               | ❌               | ✅ Pre-visit      | ✅ Medications   | ❌               | -              | ❌           | ❌              | ❌             | ✅ Pre-visit   |
| **Summarization** | ✅ Summarizes    | ❌               | ✅ Displays       | ❌               | ✅ Summarizes    | ❌             | -            | ❌              | ❌             | ❌             |
| **OTP Migration** | ❌               | ✅ Registration  | ❌                | ❌               | ❌               | ❌             | ❌           | -               | ❌             | ❌             |
| **Wearable**      | ❌               | ❌               | ✅ Health data    | ❌               | ❌               | ❌             | ❌           | ❌              | -              | ❌             |
| **Billing**       | ✅ Billing Q&A   | ✅ Billing Portal  | ✅ Billing Tasks  | ✅ Billing Data  | ❌               | ❌             | ❌           | ❌              | ❌             | -              |

**Legend:** ✅ Integrates | ❌ No integration

---

## Common Use Cases

### Use Case 1: New Patient Onboarding

**Demos involved:** Patient App Demo → OTP Migration → FHIR Demo → Staff Portal

**Flow:**

1. Patient receives QR code from practice
2. Opens Patient App Demo → Scans QR
3. Patient matching finds existing FHIR record
4. OTP Migration verifies phone with code `123456`
5. Account created
6. Patient appears in Staff Portal → Patients tab

### Use Case 2: Pre-Appointment Workflow

**Demos involved:** Appointment Reminder → FHIR Demo → Staff Portal

**Flow:**

1. 7 days before appointment, patient gets reminder
2. Opens Appointment Reminder Demo
3. Reviews 13 medications from FHIR
4. Updates health statusbill
5. Completes pre-visit form
6. Staff sees completed task in Staff Portal → Tasks tab
7. Staff reviews before appointment

### Use Case 3: Patient Question Escalation

**Demos involved:** AI Assistant → AI Summarization → Staff Portal

**Flow:**

1. Patient asks AI: "Can I get a refund for my bill?"
2. AI cannot answer billing question
3. Escalates to staff
4. AI Summarization generates summary: "Patient asking about billing refund"
5. Message appears in Staff Portal → Messages tab with summary
6. Staff replies with billing department contact
7. Patient receives reply

### Use Case 4: Wearable Health Monitoring

**Demos involved:** Wearable Integration → Staff Portal

**Flow:**

1. Patient connects Apple Watch via Wearable Integration
2. Grants HealthKit permission for heart rate, steps, sleep
3. Device syncs every 15 minutes
4. 7 days of data accumulated
5. Staff opens patient chart in Staff Portal → Patients tab
6. Sees wearable data card with heart rate trend showing elevated BPM
7. Staff follows up with patient about irregularity

---

## Demo Testing Checklist

### Before Demo Session

- [ ] All demos load without errors
- [ ] FHIR connection to Greenway staging endpoint is active
- [ ] OTP demo PIN `123456` works for verification
- [ ] Staff Portal shows sample data in all 4 tabs
- [ ] AI chat responses are working (OpenAI API key valid)
- [ ] Mobile frames display correctly (iOS, Android sizes)

### During Demo

- [ ] Show patient journey: App → Registration → OTP → Chat
- [ ] Demonstrate AI escalation: Patient question → Staff inbox
- [ ] Display FHIR data: Medications, conditions, appointments
- [ ] Show staff workflow: Messages → Patient chart → Task review
- [ ] Demonstrate wearable: Connect device → View trends in EHR

### Key Demo Points

1. **Patient Experience:**
   - "This is what patients see on their phone"
   - Show AI answering appointment question using FHIR data
   - Demonstrate escalation to staff

2. **Staff Efficiency:**
   - "AI summaries save 70% reading time"
   - Show 4-tab navigation (Messages, Patients, Appts, Tasks)
   - Demonstrate replying to patient message

3. **Data Integration:**
   - "Real FHIR data from Greenway staging"
   - Show live medications, conditions from HealthLake
   - Demonstrate wearable data flowing into EHR

4. **Security & Compliance:**
   - HIPAA-compliant messaging
   - Phone OTP with TCPA consent
   - HealthKit permission & data consent

---

## Troubleshooting

### Common Issues

**Issue:** FHIR Demo returns no data  
**Solution:** Check Greenway staging endpoint is accessible. Patient ID must be `0efed85b-e8a2-417b-a1f4-6a30fd74e7c2`

**Issue:** OTP verification fails  
**Solution:** Use PIN `123456`. Any other code will show error (by design)

**Issue:** AI chat doesn't respond  
**Solution:** Verify OpenAI API key is valid in environment variables

**Issue:** Staff Portal shows empty tabs  
**Solution:** Mock data should auto-populate. Check console for errors.

**Issue:** Mobile frame doesn't display  
**Solution:** Check screen resolution. Minimum width 390px for iOS frame.

**Issue:** Wearable Integration shows hook error  
**Solution:** Ensure `permissionGranted` state is at component top level (already fixed)

---

## Design Guidelines (Reminder)

- **Base font size:** 14px
- **Date format:** "Month Day, Year" (e.g., "Nov 15, 2025")
- **Bottom toolbar:** Maximum 4 items
- **Chips:** Always in sets of 3 or more
- **Dropdowns:** Don't use if 2 or fewer options
- **No floating action buttons** with bottom toolbar

---

## Next Steps / Roadmap

### Phase 2 Features (Future)

- [ ] Admin Dashboard for OTP analytics
- [ ] Vendor OAuth screens (Fitbit, Garmin)
- [ ] Clinician wearable dashboard (full trends)
- [ ] Revoke/disconnect wearable flow
- [ ] Sync status & offline queue UI
- [ ] App-not-installed web fallback for OTP
- [ ] Multi-language support for disclaimers
- [ ] SSO integration for staff portal
- [ ] Granular role-based permissions

---

## Contact & Support

**For questions about demos:**

- Check integration matrix above
- Review API endpoints section
- Test with provided demo credentials

**Demo Credentials:**

- OTP PIN: `123456`
- FHIR Patient ID: `0efed85b-e8a2-417b-a1f4-6a30fd74e7c2`
- All other features use mock data

---

**End of Documentation**  
_Last updated: November 23, 2025_