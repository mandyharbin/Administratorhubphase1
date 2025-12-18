
  # Administrator Hub Phase 1

  A healthcare platform with **10 interactive demos** showing patient apps, staff portals, AI assistants, medical records integration, billing, and more.

  **Original design:** https://www.figma.com/design/xgKozUdAAY7BvS5dtpti3E/Administrator-Hub-Phase-1

  ## 🎯 Quick Start: How to See This in Action

  **Choose your path:**

  - **👔 For Product Managers / Non-Technical Users** → See [HOW_TO_VIEW_DEMOS.md](HOW_TO_VIEW_DEMOS.md) - Simple, no-tech-jargon guide to explore the demos
  - **👨‍💻 For Developers** → Continue reading below for technical setup instructions
  - **📚 For Detailed Technical Docs** → See [QUICK_START.md](QUICK_START.md) for comprehensive developer guide

  ### What You'll See

  After setup, you'll log in and access the **Demo Hub** which shows:
  
  - 🤖 AI chatbot for patients
  - 📱 Patient mobile app registration flow  
  - 🏥 Staff portal with messages, appointments, and tasks
  - 📊 Live medical records integration
  - 💳 Patient billing and payments
  - ⌚ Wearable device integration
  - And 4 more interactive demos!

  ---

  ## For Developers: Technical Setup

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

  When you first access the application, you'll see a login screen. 

  **For demo purposes, use any email and password you want:**
  - Email: `demo@example.com`
  - Password: `demo123`
  - Organization ID: `demo-org`

  > **Why?** This is a demo environment with mock authentication - any credentials will work! Real authentication will be added in production.

  ### 4. Accessing the Demos

  After logging in, look for **"Demo Hub"** in the left sidebar and click it.

  You'll see a gallery with 10 demos:

  1. **AI Assistant** - Patient chatbot
  2. **Patient App Demo** - Mobile registration  
  3. **Unified Staff Portal** - Staff dashboard with messages & appointments
  4. **FHIR Integration Demo** - Live medical records
  5. **FHIR Mobile Chat Demo** - Patient medical queries
  6. **Appointment Reminder Demo** - Pre-visit workflow
  7. **Summarization Demo** - AI conversation summaries
  8. **OTP Migration Demo** - Phone verification (use PIN: `123456`)
  9. **Wearable Integration Demo** - Fitness device connection
  10. **Billing Integration Demo** - Patient billing portal

  **Click any demo card to launch it!**

  ### 5. Test Credentials

  **Important:** When trying the OTP (phone verification) demo, always use PIN: **`123456`**

  All other demos work automatically with sample data.

  ### 6. Recommended First Demos to Try

  **Start with these:**
  1. **AI Assistant** - Type: "When is my next appointment?"
  2. **Staff Portal** - Click through the Messages, Patients, Appointments, and Tasks tabs
  3. **Patient App Demo** - See the complete patient registration flow

  ## Documentation

  For detailed information about each demo and how they integrate with each other, see:
  - [`src/DEMO_DOCUMENTATION.md`](src/DEMO_DOCUMENTATION.md) - Complete demo catalog with integration maps
  - [`src/FHIR_INTEGRATION.md`](src/FHIR_INTEGRATION.md) - FHIR implementation details
  - [`src/PAYMENT_INTEGRATION_GUIDE.md`](src/PAYMENT_INTEGRATION_GUIDE.md) - Billing integration guide

  ## Common Issues

  **Can't see the demos?**
  - Click "Demo Hub" in the left sidebar after logging in
  - Try refreshing your browser

  **OTP verification not working?**
  - You must use PIN: `123456` (any other code will fail - this is intentional for the demo)

  **App won't start?** (For developers)
  - Make sure you ran `npm i` first
  - Check that port 5173 is available

  ---

  ## Additional Resources

  - **[HOW_TO_VIEW_DEMOS.md](HOW_TO_VIEW_DEMOS.md)** - Non-technical guide for product managers
  - **[QUICK_START.md](QUICK_START.md)** - Detailed developer guide with full walkthrough
  - **[src/DEMO_DOCUMENTATION.md](src/DEMO_DOCUMENTATION.md)** - Complete technical documentation

  ## Technology Stack

  React 18, Vite, Radix UI, Tailwind CSS | Connects to: Greenway Health FHIR R4, OpenAI GPT-4

  ## Building for Production

  ```bash
  npm run build
  ```
  