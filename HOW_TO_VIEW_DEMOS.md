# How to View the Demos - Simple Guide

**For Product Managers and Non-Technical Users**

This guide explains how to see the Administrator Hub demos in the simplest way possible. No technical knowledge required!

---

## What You Need

1. **Get help from a developer** to set up the application (they'll need to run 2 commands)
2. A web browser (Chrome, Safari, Firefox, or Edge)
3. 5-10 minutes to explore

---

## Getting Started (Ask Your Developer)

Your developer will need to:

**Step 1:** Install the application  
**Step 2:** Start it running  

Once they do this, they'll give you a web address that looks like: `http://localhost:5173`

Open that address in your web browser.

---

## Logging In

You'll see a login screen. For the demo, you can use **any** email and password you want. For example:

- Email: `demo@example.com`
- Password: `demo123`
- Organization ID: `demo-org`

Click "Sign in" and you're in!

> **Why any password works:** This is a demo system, so it doesn't have real security yet. In the final product, there will be real login credentials.

---

## Finding the Demos

Once you're logged in, you'll see the main screen with a menu on the left side.

**Look for "Demo Hub"** in the left menu and click it.

You'll see a gallery showing 10 different demos. Each demo shows a different part of the healthcare platform.

---

## The 10 Demos Explained

### 1. **AI Assistant** 🤖
**What it shows:** A chatbot that patients can talk to about appointments and health questions.

**What to try:**
- Type: "When is my next appointment?"
- Type: "What are your office hours?"
- Type: "I need to speak to a staff member"

**Why it matters:** Shows how AI can answer common patient questions automatically, saving staff time.

---

### 2. **Patient App Demo** 📱
**What it shows:** How a patient downloads and registers for the mobile app.

**What to try:**
- Click through the registration steps
- See how patients scan a QR code to sign up
- View the phone verification process

**Why it matters:** Shows the complete patient onboarding experience from download to first login.

---

### 3. **Unified Staff Portal** 🏥
**What it shows:** The main screen that doctors, nurses, and staff see when they log in.

**What to try:**
- Click the "Messages" tab to see patient messages
- Click "Patients" to see the patient list
- Click "Appointments" to see today's schedule
- Click "Tasks" to see forms patients completed

**Why it matters:** This is the heart of the system - where staff manage their daily work.

---

### 4. **FHIR Integration Demo** 📊
**What it shows:** Real patient medical data from an electronic health record system.

**What to try:**
- Click different tabs at the top (Patient, Observations, Conditions, Medications)
- See actual patient information and medical history

**Why it matters:** Proves the system can connect to existing hospital record systems.

---

### 5. **FHIR Mobile Chat Demo** 💬
**What it shows:** Patients chatting about their medical records on their phone.

**What to try:**
- Type: "What are my current conditions?"
- Type: "Show my medications"
- Type: "What were my last vitals?"

**Why it matters:** Shows how patients can easily access their medical information through simple conversations.

---

### 6. **Appointment Reminder Demo** 📅
**What it shows:** The reminder patients get before their appointment with pre-visit tasks.

**What to try:**
- Click through all 7 steps
- Review medications on step 2
- Complete the health questions
- See the final confirmation

**Why it matters:** Reduces no-shows and ensures staff have updated information before appointments.

---

### 7. **Summarization Demo** ✨
**What it shows:** How AI creates quick summaries of long patient conversations.

**What to try:**
- Read a long patient conversation
- See how AI summarizes it in 2-3 sentences for staff

**Why it matters:** Saves staff time - they can read a summary instead of a full conversation.

---

### 8. **OTP Migration Demo** 🔐
**What it shows:** How patients verify their phone number when signing up.

**What to try:**
- Enter a phone number
- When it asks for a verification code, type: **123456**
- See the confirmation screen

**Why it matters:** Shows secure patient identity verification.

> **Important:** Always use code `123456` in this demo - it's the only code that works!

---

### 9. **Wearable Integration Demo** ⌚
**What it shows:** How patients connect fitness trackers (Apple Watch, Fitbit) to share health data.

**What to try:**
- See the device connection flow
- View heart rate and steps data charts
- Look at the 7-day activity trends

**Why it matters:** Shows how the system can use data from fitness devices for better health monitoring.

---

### 10. **Billing Integration Demo** 💳
**What it shows:** Where patients view and pay their medical bills online.

**What to try:**
- See the billing summary with current balance
- Click on a statement to see detailed charges
- View payment history
- Go through the payment process

**Why it matters:** Makes billing transparent and allows patients to pay online 24/7.

---

## Quick Tips

### Moving Between Demos
- Click "Demo Hub" in the left menu to go back to the demo gallery
- Click on any demo card to open that demo

### If Something Doesn't Work
- Click the refresh button in your browser
- If you get stuck, click "Demo Hub" to start over

### What the Test Numbers Mean

Some demos need special test data:

- **Phone verification code:** Always use `123456` (for demo purposes only)
- **Patient ID:** The demos use sample patient data automatically - you don't need to enter any patient IDs

These are just for testing - in the real system, these would be real patient phone numbers and actual patient IDs from your records.

---

## Understanding How Demos Connect

The demos show different parts of the same system:

1. **Patient sends message** in AI Assistant → **Staff sees it** in Staff Portal Messages tab
2. **Patient completes pre-visit form** in Appointment Reminder → **Staff sees it** in Staff Portal Tasks tab
3. **Patient connects Apple Watch** in Wearable Integration → **Staff sees health data** in Staff Portal Patients tab

This shows how the whole system works together!

---

## Questions You Might Have

**Q: Is this using real patient data?**  
A: Some demos use sample data from a test system. No real patient information is used.

**Q: Can I break anything?**  
A: No! This is a demo environment. Click around freely - you can't hurt anything.

**Q: Why does it say "mock authentication"?**  
A: That's technical language for "this is a demo login." The real system will have proper security.

**Q: What should I focus on?**  
A: Focus on the **user experience** - how easy is it to use? Does it make sense? Does it solve problems for patients and staff?

---

## What to Look For as a Product Manager

When reviewing these demos, consider:

### User Experience
- Is the interface intuitive?
- Can you figure out what to do without instructions?
- Are the important features easy to find?

### Patient Benefits
- Does this save patients time?
- Does it give them better access to their healthcare?
- Is it easier than calling the office?

### Staff Benefits
- Does this save staff time?
- Does it reduce repetitive work?
- Can staff handle more patients more efficiently?

### Business Value
- Will this reduce no-shows?
- Will this improve patient satisfaction?
- Will this reduce administrative costs?

---

## Next Steps After Viewing Demos

1. **Take notes** on what you liked and what could be improved
2. **Think about your users** - would your patients and staff use this?
3. **Compare to current process** - how does this improve on how you work today?
4. **List questions** - write down anything unclear to discuss with the team

---

## Need More Details?

- **For technical architecture:** Ask your developer to review `src/DEMO_DOCUMENTATION.md`
- **For integration details:** Review `src/FHIR_INTEGRATION.md` (with a developer)
- **For billing specifics:** Check `src/PAYMENT_INTEGRATION_GUIDE.md`

---

**Remember:** These are interactive demos - click around, try things, and explore. You can't break anything!

**Questions?** Ask your development team to walk through any demo with you.
