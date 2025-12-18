# Quick Start Guide: Seeing the Administrator Hub in Action

This guide will walk you through getting the Administrator Hub Phase 1 running and show you how to explore all the interactive demos.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation & Setup](#installation--setup)
3. [First Time Login](#first-time-login)
4. [Navigating the Application](#navigating-the-application)
5. [Exploring the Demos](#exploring-the-demos)
6. [Common Tasks](#common-tasks)
7. [Tips & Tricks](#tips--tricks)

---

## Prerequisites

Before you begin, make sure you have:
- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Internet connection (for FHIR and AI integrations)

---

## Installation & Setup

### Step 1: Install Dependencies

Open your terminal in the project directory and run:

```bash
npm i
```

This will install all required packages. It may take a few minutes.

### Step 2: Start the Development Server

Once installation is complete, start the server:

```bash
npm run dev
```

You should see output like:

```
  VITE v6.3.5  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 3: Open in Browser

Click the local URL or navigate to `http://localhost:5173` in your web browser.

---

## First Time Login

When you first access the application, you'll see the **Administrator Login** screen.

### Login Credentials

Since the app uses **mock authentication**, you can use any credentials:

- **Email**: `admin@example.com` (or any email)
- **Password**: `password` (or any password)
- **Organization ID**: `org-123` (or any ID)

Click **"Sign in"** and you'll be taken to the main dashboard.

> **Note**: In production, this would connect to a real authentication system (Supabase), but for demo purposes, any credentials work.

---

## Navigating the Application

### Main Dashboard

After logging in, you'll see:
- **Left Sidebar** - Navigation menu with all sections
- **Main Content Area** - Dashboard or selected section
- **Top Bar** - Your user info and sign-out button

### Sidebar Sections

The sidebar is organized into categories:

**Admin Configuration**
- Organization & Access
- Disclaimers & Consent
- AI Responses
- Knowledge Sources
- Staff Response Notifications

**Patient Management**
- Communications (Notice History)
- Registration Management
- Patient Onboarding

**AI & Routing**
- AI Assistant Replies
- Lexicons & Routing

**Forms & Templates**
- Form Templates
- FHIR Form Builder
- Patient To-Do Checklists

**Monitoring**
- Audit Logs

**Demos & Testing**
- **Demo Hub** ← Start here!
- Component Library
- FHIR Data Flow
- Chart Data Source

---

## Exploring the Demos

### Getting to the Demo Hub

1. Look at the left sidebar
2. Scroll down to the **"Demos & Testing"** section
3. Click on **"Demo Hub"**

You'll see a gallery of interactive demos with cards describing each one.

### Demo Categories

The demos are organized into tabs:

1. **Overview** - Introduction to all demos
2. **Individual Demo Tabs** - Each demo has its own tab when selected

### Available Demos

#### 1. **AI Assistant Demo** 🤖
**What it does**: Shows a patient-facing chatbot with AI responses

**How to use**:
- Click the "AI Assistant" card in the Demo Hub
- You'll see a mobile phone interface
- Try asking questions like:
  - "When is my next appointment?"
  - "What are your office hours?"
  - "I need to speak to staff"
- The AI will respond based on knowledge base and FHIR data

**Key Features**:
- Pre-chat disclaimer screen
- AI-powered responses
- Escalation to staff
- Message history

---

#### 2. **Patient App Demo** 📱
**What it does**: Complete mobile app onboarding experience

**How to use**:
- Click "Patient App Demo" in the Demo Hub
- Follow the step-by-step registration flow:
  1. "I don't have the app" → Download links
  2. QR code scanning simulation
  3. Patient matching (enter name, DOB, SSN)
  4. MFA setup
  5. Account creation
  6. Settings management

**Key Features**:
- App store download flow
- QR code scanner
- Patient matching via FHIR
- Multi-factor authentication
- Profile management

---

#### 3. **Unified Staff Portal** 🏥
**What it does**: Complete EHR view for clinical staff

**How to use**:
- Click "Unified Staff Portal" in the Demo Hub
- Navigate through 4 main tabs at the bottom:
  - **Messages** - Patient messages with AI summaries
  - **Patients** - Patient queue with demographics
  - **Appointments** - Today's schedule
  - **Tasks** - Pre-visit forms and to-dos
- Click on any card to see details
- Use filters and search to find specific items

**Key Features**:
- Message center with AI summaries
- Patient management queue
- Appointment scheduling
- Task management with pre-visit forms
- Priority sorting and filtering

---

#### 4. **FHIR Integration Demo** 📊
**What it does**: Shows live FHIR data from Greenway Health staging

**How to use**:
- Click "FHIR Integration Demo" in the Demo Hub
- Select a resource type tab at the top (Patient, Observation, Condition, etc.)
- Click "Load [Resource]" button
- View FHIR data cards
- Expand to see raw JSON data

**Available Resource Types**:
1. Patient demographics
2. Observations (vitals, labs)
3. Conditions (diagnoses)
4. Medications
5. Encounters (visits)
6. Allergies
7. Immunizations
8. Diagnostic Reports
9. Procedures

**Demo Patient ID**: `0efed85b-e8a2-417b-a1f4-6a30fd74e7c2`

---

#### 5. **FHIR Mobile Chat Demo** 💬
**What it does**: EHR-style mobile chat with medical record queries

**How to use**:
- Click "FHIR Mobile Chat Demo" in the Demo Hub
- Type medical-related questions:
  - "What are my current conditions?"
  - "Show my medications"
  - "What were my last vitals?"
  - "When is my next appointment?"
- The AI responds with FHIR data in visual cards
- Try uploading an image using the attachment button

**Key Features**:
- AI medical query responses
- FHIR data visualization cards
- Image upload capability
- Chat summaries
- Insurance information view

---

#### 6. **Appointment Reminder Demo** 📅
**What it does**: Pre-visit workflow with medication review

**How to use**:
- Click "Appointment Reminder Demo" in the Demo Hub
- Follow the 7-step wizard:
  1. Confirm appointment
  2. Review medications (13 FHIR resources loaded)
  3. Update/add medications
  4. Health status update
  5. Pre-visit questions
  6. Insurance confirmation
  7. Completion summary
- Click "Next" to progress through steps
- Try marking medications as stopped or adding new ones

**Key Features**:
- 7-step wizard flow
- FHIR medication integration (13 resources)
- Medication management
- Health updates
- Pre-visit form submission

---

#### 7. **Summarization Demo** ✨
**What it does**: AI-powered chat summarization

**How to use**:
- Click "Summarization Demo" in the Demo Hub
- View sample patient conversations
- See AI-generated summaries with:
  - Chief complaint
  - Symptoms mentioned
  - Questions asked
  - Action items
- Try different summary formats (Brief, Detailed, Clinical)

**Key Features**:
- Automatic conversation summarization
- Clinical terminology extraction
- Multiple summary formats
- Integration with Staff Portal

---

#### 8. **OTP Migration Demo** 🔐
**What it does**: Phone verification and OTP flow

**How to use**:
- Click "OTP Migration Demo" in the Demo Hub
- Select a platform (iOS, Android, Mobile Web, Desktop Web)
- Follow the phone verification flow:
  1. Enter phone number
  2. Confirm SMS/Email channel
  3. View OTP sent screen
  4. Enter verification code: **`123456`** ← Important!
  5. See success screen
- Try other flows like resend, expired code, lockout scenarios

**Demo PIN**: `123456` (any other code will show an error)

**Key Features**:
- 12 different screens
- 4 platform views
- Phone number verification
- SMS/Email channel selection
- Error handling (expired, locked, failed delivery)
- TCPA consent

---

#### 9. **Wearable Integration Demo** ⌚
**What it does**: Connect and view wearable device data

**How to use**:
- Click "Wearable Integration Demo" in the Demo Hub
- Follow the connection flow:
  1. Connect starter (benefits overview)
  2. Permission & consent (toggle data types)
  3. System permission (iOS HealthKit simulation)
  4. Device list (see connected devices)
  5. Device detail (7-day trends)
- View heart rate and steps charts
- See sync status and battery level

**Key Features**:
- Device connection flow
- Data type consent (Heart Rate, Steps, Sleep)
- iOS HealthKit / Android integration
- 7-day trend charts
- Sync status tracking
- Clinician dashboard view

---

#### 10. **Billing Integration Demo** 💳
**What it does**: Patient billing portal with FHIR data

**How to use**:
- Click "Billing Integration Demo" in the Demo Hub
- Explore billing views:
  1. **Billing Summary** - See current balance ($350.00)
  2. **Statements** - View 3 sample invoices
  3. **Statement Detail** - See line-item breakdown
  4. **EOBs** - Insurance explanation of benefits
  5. **Payment History** - Past payments
  6. **Make Payment** - Process online payment
  7. **Payment Success** - Confirmation screen
- Click through statements to see detailed breakdowns
- View insurance adjustments and payments

**Key Features**:
- FHIR-based billing (Account, Invoice, Claim, EOB resources)
- Line-item breakdowns with CPT codes
- Insurance adjudication display
- Payment processing flow
- Mobile-optimized interface

---

## Common Tasks

### Switching Between Demos

1. Click "Demo Hub" in the sidebar to return to the demo gallery
2. Click on a different demo card
3. Or use the browser back button

### Viewing Demo Documentation

- Each demo has detailed documentation in `src/DEMO_DOCUMENTATION.md`
- Integration maps show how demos connect to each other
- API references provide endpoint details

### Creating New Forms

1. Click "Form Templates" in the sidebar
2. Click "Create New Form" or "Create Checklist"
3. Use the drag-and-drop FHIR Form Builder
4. Save and preview your form

### Viewing Audit Logs

1. Click "Audit Logs" in the sidebar
2. View system activity and changes
3. Filter by date, user, or action type

### Signing Out

- Click "Sign out" in the top-right corner
- You'll be returned to the login screen

---

## Tips & Tricks

### For Best Demo Experience

1. **Use Chrome or Firefox** - Best compatibility with all features
2. **Use Full Screen** - Press F11 for immersive mobile demos
3. **Open Dev Tools** - Press F12 to see API calls and console logs
4. **Test on Mobile** - Use browser responsive mode (Ctrl+Shift+M in Chrome)

### Understanding Data Flow

- **FHIR Demo** provides data for **AI Assistant** and **Mobile Chat**
- **AI Assistant** escalations appear in **Staff Portal Messages**
- **Appointment Reminder** tasks appear in **Staff Portal Tasks**
- **Wearable Integration** data shows in **Staff Portal Patients**

### Testing Integrations

1. Start with **FHIR Demo** to see available data
2. Test **AI Assistant** to see how it uses FHIR data
3. Check **Staff Portal** to see escalated messages
4. Try **Appointment Reminder** to create tasks for staff

### Keyboard Shortcuts

- **Ctrl+/** - Open command palette (if available)
- **Esc** - Close modals/dialogs
- **Tab** - Navigate between form fields
- **Enter** - Submit forms or confirm actions

### Demo Credentials Reference Card

Keep these handy:
```
OTP PIN: 123456
FHIR Patient ID: 0efed85b-e8a2-417b-a1f4-6a30fd74e7c2
Login: Any email/password works
```

### Troubleshooting Quick Fixes

**Problem**: Demo won't load
- **Fix**: Refresh the page (Ctrl+R or Cmd+R)

**Problem**: Sidebar disappeared
- **Fix**: Widen your browser window

**Problem**: Can't find a demo
- **Fix**: Click "Demo Hub" in the sidebar

**Problem**: Data not showing
- **Fix**: Check your internet connection (FHIR requires external API)

---

## Next Steps

After exploring the demos:

1. **Read Full Documentation** - Check `src/DEMO_DOCUMENTATION.md` for complete details
2. **Review Integration Maps** - See how demos connect in the documentation
3. **Explore API References** - Learn about external integrations (Greenway, OpenAI)
4. **Test Form Builder** - Create custom FHIR-based forms
5. **Check Components** - View the Component Library for UI patterns

---

## Need Help?

- Check the main [README.md](README.md) for installation issues
- Review [DEMO_DOCUMENTATION.md](src/DEMO_DOCUMENTATION.md) for detailed demo info
- Review [FHIR_INTEGRATION.md](src/FHIR_INTEGRATION.md) for FHIR implementation details
- Review [PAYMENT_INTEGRATION_GUIDE.md](src/PAYMENT_INTEGRATION_GUIDE.md) for billing integration

---

**Ready to explore? Start with the Demo Hub and try the AI Assistant first!**

Happy exploring! 🚀
