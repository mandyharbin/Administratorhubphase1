
  # Administrator Hub Phase 1

  This is a code bundle for Administrator Hub Phase 1. The original project is available at https://www.figma.com/design/xgKozUdAAY7BvS5dtpti3E/Administrator-Hub-Phase-1.

  ## Quick Start: How to See This in Action

  ### 1. Installation

  ```bash
  npm i
  ```

  ### 2. Start the Development Server

  ```bash
  npm run dev
  ```

  The application will start and display a local URL (typically `http://localhost:5173`). Open this URL in your browser.

  ### 3. Login

  When you first access the application, you'll see a login screen. Use these credentials:

  - **Email**: Any email (e.g., `admin@example.com`)
  - **Password**: Any password (e.g., `password`)
  - **Organization ID**: Any ID (e.g., `org-123`)

  > **Note**: The app currently uses mock authentication, so any credentials will work.

  ### 4. Accessing the Demos

  After logging in, you'll see the main dashboard. Here's how to explore the demos:

  #### Option A: Demo Hub (Recommended)
  
  1. Click **"Demo Hub"** in the left sidebar
  2. You'll see a gallery of all available demos with descriptions
  3. Click on any demo card to launch it interactively

  **Available Demos:**
  - **AI Assistant** - Patient-facing chatbot with knowledge base integration
  - **Patient App Demo** - Complete mobile app experience with QR scanning and MFA
  - **Unified Staff Portal** - EHR view with messages, patients, appointments, and tasks
  - **FHIR Integration Demo** - Live FHIR data from Greenway Health staging endpoint
  - **FHIR Mobile Chat Demo** - EHR-style mobile chat with AI and medical records
  - **Appointment Reminder Demo** - Pre-visit workflow with medication review
  - **Summarization Demo** - AI-powered chat summarization
  - **OTP Migration Demo** - Phone verification flow (use PIN: `123456`)
  - **Wearable Integration Demo** - Connect and view wearable device data
  - **Billing Integration Demo** - Patient billing portal with FHIR integration

  #### Option B: Direct Navigation

  You can also access specific sections directly from the sidebar:
  - **Organization & Access** - Manage organization settings
  - **Disclaimers & Consent** - Configure patient disclaimers
  - **AI Responses** - Manage AI assistant behavior
  - **Knowledge Sources** - Configure knowledge base
  - **Forms & Templates** - Build FHIR-based forms and checklists
  - And more...

  ### 5. Demo Credentials & Test Data

  When testing specific demos, use these credentials:

  - **OTP Verification PIN**: `123456` (any other code will show an error)
  - **FHIR Patient ID**: `0efed85b-e8a2-417b-a1f4-6a30fd74e7c2`
  - **Greenway FHIR Endpoint**: `https://fhir.cloud.greenway.com/greenway-development/uscdi/r4`

  ### 6. What to Try

  **For Patient Experience:**
  1. Open the **Patient App Demo** to see the mobile onboarding flow
  2. Try the **AI Assistant** and ask: "When is my next appointment?"
  3. View the **FHIR Mobile Chat Demo** to see medical record queries

  **For Staff/Clinical Experience:**
  1. Open the **Unified Staff Portal** to see the complete EHR view
  2. Navigate through Messages, Patients, Appointments, and Tasks tabs
  3. Try the **Summarization Demo** to see AI-generated summaries

  **For Technical/Integration:**
  1. Check the **FHIR Integration Demo** to see live HealthLake data
  2. View the **Wearable Integration Demo** for device connectivity
  3. Explore the **Billing Integration Demo** for FHIR-based billing

  ## Documentation

  For detailed information about each demo and how they integrate with each other, see:
  - [`src/DEMO_DOCUMENTATION.md`](src/DEMO_DOCUMENTATION.md) - Complete demo catalog with integration maps
  - [`src/FHIR_INTEGRATION.md`](src/FHIR_INTEGRATION.md) - FHIR implementation details
  - [`src/PAYMENT_INTEGRATION_GUIDE.md`](src/PAYMENT_INTEGRATION_GUIDE.md) - Billing integration guide

  ## Troubleshooting

  **Q: The app won't start**
  - Make sure you've run `npm i` first
  - Check that port 5173 is not already in use
  - Try clearing node_modules and reinstalling: `rm -rf node_modules && npm i`

  **Q: I can't see any demos**
  - Make sure you've logged in first
  - Click "Demo Hub" in the left sidebar
  - Refresh the page if needed

  **Q: FHIR Demo shows no data**
  - The demo connects to Greenway Health's staging endpoint
  - Patient ID must be: `0efed85b-e8a2-417b-a1f4-6a30fd74e7c2`
  - Check your internet connection

  **Q: OTP verification fails**
  - You must use PIN: `123456`
  - Any other code will show an error (this is by design for demo purposes)

  ## Development

  - **Framework**: React 18 + Vite
  - **UI Components**: Radix UI + Tailwind CSS
  - **Authentication**: Mock auth (Supabase ready)
  - **External APIs**: Greenway Health FHIR R4, OpenAI GPT-4

  ## Building for Production

  ```bash
  npm run build
  ```

  The built files will be in the `dist` directory.
  