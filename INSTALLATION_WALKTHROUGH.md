# Installation Walkthrough - Let's Get You Started!

This is a step-by-step guide to help you install and run the Administrator Hub demos. I'll walk you through everything!

---

## What You'll Need

Before we start, make sure you have:
1. A computer (Windows, Mac, or Linux)
2. About 10-15 minutes
3. An internet connection

Don't worry if you don't have the software installed yet - I'll show you how!

---

## Step 1: Install Node.js

Node.js is the software that runs this application.

### Check if you already have it:

**On Mac/Linux:**
1. Open Terminal (search for "Terminal" in your applications)
2. Type: `node --version` and press Enter
3. If you see a version number (like v16.0.0 or higher), you're good! Skip to Step 2.

**On Windows:**
1. Open Command Prompt (search for "cmd" in the Start menu)
2. Type: `node --version` and press Enter
3. If you see a version number (like v16.0.0 or higher), you're good! Skip to Step 2.

### If you need to install Node.js:

1. Go to: https://nodejs.org/
2. Click the big green button that says "Download" (choose the LTS version)
3. Run the installer and follow the prompts
4. Keep clicking "Next" and accept the defaults
5. When it's done, close and reopen your Terminal/Command Prompt

**Verify it worked:**
- Type `node --version` again
- You should now see a version number!

---

## Step 2: Get the Code

You'll need to download this project to your computer.

### If you're using Git (ask a developer if you're not sure):

1. Open Terminal (Mac/Linux) or Command Prompt (Windows)
2. Navigate to where you want to put the project, for example:
   ```bash
   cd Desktop
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/mandyharbin/Administratorhubphase1.git
   ```
4. Go into the project folder:
   ```bash
   cd Administratorhubphase1
   ```

### If you don't use Git:

1. Go to: https://github.com/mandyharbin/Administratorhubphase1
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to your Desktop
5. Open Terminal/Command Prompt
6. Navigate to the folder:
   ```bash
   cd Desktop/Administratorhubphase1-main
   ```

---

## Step 3: Install Dependencies

Now we need to install all the packages the application needs.

1. Make sure you're in the project folder (you should see `package.json` if you type `ls` on Mac/Linux or `dir` on Windows)

2. Type this command and press Enter:
   ```bash
   npm install
   ```
   
   (You can also use the short version: `npm i`)

3. **Wait for it to finish** - This might take 2-5 minutes. You'll see a lot of text scrolling by. That's normal!

4. When it's done, you'll see your command prompt again.

**If you see any errors:**
- Make sure you're in the right folder (should see `package.json`)
- Try closing Terminal/Command Prompt and reopening it
- Make sure Node.js is installed correctly (Step 1)

---

## Step 4: Start the Application

Now for the exciting part - let's run it!

1. Type this command:
   ```bash
   npm run dev
   ```

2. Wait a few seconds. You should see something like:
   ```
   VITE v6.3.5  ready in 500 ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

3. **Success!** The application is now running on your computer.

---

## Step 5: Open in Your Browser

1. **Open your web browser** (Chrome, Firefox, Safari, or Edge)

2. **Go to this address:**
   ```
   http://localhost:5173
   ```
   
   Or just click the link if your Terminal/Command Prompt makes it clickable!

3. **You should see the login screen!** 🎉

---

## Step 6: Log In

On the login screen, you'll see fields for:
- Email
- Password  
- Organization ID

**Important:** Since this is a demo, you can type ANYTHING you want. It doesn't matter!

**Here's what I recommend typing:**
- Email: `demo@example.com`
- Password: `demo123`
- Organization ID: `demo-org`

Click **"Sign in"** and you're in!

---

## Step 7: Find the Demos

After logging in:

1. **Look at the left side** of the screen - you'll see a menu
2. **Scroll down** until you see "Demos & Testing"
3. **Click on "Demo Hub"**
4. **You'll see a gallery of 10 demos!**

Click on any demo card to try it out!

---

## Quick Reference

### To Start the App (after first installation):
1. Open Terminal/Command Prompt
2. Go to the project folder: `cd path/to/Administratorhubphase1`
3. Run: `npm run dev`
4. Open browser to: `http://localhost:5173`

### To Stop the App:
- Press `Ctrl+C` in the Terminal/Command Prompt where it's running
- Then close the browser tab

### Test Credentials for Demos:
- **Login:** Any email/password (I suggest: demo@example.com / demo123 / demo-org)
- **OTP Demo:** When it asks for a code, type: `123456`

---

## Troubleshooting

### "Command not found: npm"
- Node.js isn't installed correctly
- Go back to Step 1 and reinstall Node.js
- Make sure to close and reopen your Terminal/Command Prompt after installing

### "Port 5173 is already in use"
- The app is already running somewhere
- Close any Terminal/Command Prompt windows that might be running it
- Or try: `http://localhost:5174` (it might use the next port)

### "Cannot find module"
- The installation didn't complete
- Go back to Step 3 and run `npm install` again

### Browser shows "This site can't be reached"
- Make sure the app is running (you should see the VITE message in Terminal)
- Double-check you're going to: `http://localhost:5173` (not https)
- Try refreshing the page

### The screen looks broken or weird
- Try a different browser
- Try clearing your browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Make sure your browser window is wide enough (at least 1024px)

### Still having issues?
- Take a screenshot of the error
- Note which step you're on
- Ask a developer on your team for help!

---

## What to Do Next

Once you're logged in and in the Demo Hub:

1. **Start with AI Assistant** - It's the easiest to understand
   - Just type questions like: "When is my next appointment?"
   
2. **Try Staff Portal** - See what staff members would see
   - Click through the tabs: Messages, Patients, Appointments, Tasks

3. **Explore Patient App Demo** - See the patient registration flow
   - Click through each step to see the complete experience

**Remember:** You can't break anything! Click around and explore freely.

---

## Video Tutorial (If Available)

If someone on your team has created a video walkthrough, ask them to share it. Seeing it in action can be really helpful!

---

## Still Stuck?

If you're stuck on any step:
1. Take a screenshot of what you're seeing
2. Note which step number you're on
3. Ask a developer on your team - they can help!

Most issues are quick fixes like:
- Being in the wrong folder
- Needing to close and reopen Terminal
- Having an old version of Node.js

---

**You've got this! 🚀**

Remember: The first time is always the trickiest. After you've done it once, it'll be easy to run it again!
