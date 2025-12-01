# OpenAI API Key Setup Guide

## Current Issue

Your OpenAI API key is **invalid or expired**. The system has automatically switched to **Demo Mode** with sample responses.

## Symptoms

- ❌ AI chat returns sample/demo responses
- ❌ Console shows: "Invalid OpenAI API key detected"
- ❌ Error: `Incorrect API key provided: sk-...Ay0A`

---

## How to Fix

### Step 1: Get a New OpenAI API Key

1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Log in to your OpenAI account
3. Click **"Create new secret key"**
4. Name it (e.g., "BASE Admin Hub")
5. Copy the key (starts with `sk-proj-...` or `sk-...`)
   - ⚠️ **Save it immediately** - you won't see it again!

### Step 2: Update the Key in Supabase

#### Option A: Via Supabase Dashboard (Recommended)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to: **Project Settings** → **Edge Functions** → **Secrets**
4. Find `OPENAI_API_KEY_NEW` or create a new secret with this name
5. Paste your new OpenAI API key
6. Click **Save**

#### Option B: Via Supabase CLI

```bash
# Set the secret
supabase secrets set OPENAI_API_KEY_NEW=sk-proj-YOUR-NEW-KEY-HERE

# Verify it was set
supabase secrets list
```

### Step 3: Restart Edge Functions

After updating the secret:

1. Go to **Edge Functions** in Supabase Dashboard
2. Find the function named `make-server-66fdb7c0`
3. Click **Redeploy** or restart the function
4. Wait 30-60 seconds for deployment

### Step 4: Test the Fix

1. Open the Patient App Demo
2. Click on the **AI Chat** tab
3. Send a test message like: "What are my office hours?"
4. If working correctly:
   - ✅ You'll get intelligent AI responses (not demo mode)
   - ✅ Console won't show demo mode warnings

---

## Environment Variable Names

The system checks for the OpenAI key in this order:

1. `OPENAI_API_KEY_NEW` ← **Use this one**
2. `OPENAI_API_KEY`
3. `OPENAI_KEY`

**Recommendation:** Always use `OPENAI_API_KEY_NEW` for clarity.

---

## Demo Mode

When the API key is invalid, the system automatically falls back to **Demo Mode**:

- ✅ No crashes or errors
- ✅ Sample responses for common questions
- ✅ Full functionality preserved
- ⚠️ Responses are pre-programmed (not AI-generated)

**Features in Demo Mode:**
- Appointment inquiries → Sample response
- Prescription questions → Sample response
- General questions → Routes to staff (sample)
- Knowledge base still works
- All other app features work normally

---

## Troubleshooting

### "Still seeing demo mode after updating key"

1. Check the key format:
   - ✅ Starts with `sk-proj-` or `sk-`
   - ✅ No extra spaces or quotes
   - ✅ Full key copied (not truncated)

2. Verify deployment:
   ```bash
   # Check current secrets
   supabase secrets list
   
   # Should show OPENAI_API_KEY_NEW with digest
   ```

3. Hard refresh your browser:
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

### "My key is valid but still getting errors"

Check OpenAI account status:
- Have you added a payment method?
- Is your account in good standing?
- Do you have remaining credits/quota?
- Visit: https://platform.openai.com/account/billing

### "Need help setting up Supabase CLI"

Install Supabase CLI:
```bash
# macOS
brew install supabase/tap/supabase

# Windows (via npm)
npm install -g supabase

# Login
supabase login
```

---

## Testing Different Scenarios

After fixing the API key, test these scenarios:

### Patient App Demo → AI Chat
- "What are your office hours?" → Should get intelligent response
- "When is my next appointment?" → Should use patient data
- "I need a prescription refill" → Should provide medication info

### Tenant Knowledge Hub → Test Chat
- Ask questions from your knowledge base
- Should get contextual AI responses
- Should reference knowledge sources when relevant

### OCR Form Upload
- Upload a medical form
- Should extract fields with medical terminology
- Should map to FHIR resources

---

## Security Best Practices

1. **Never commit API keys to Git**
   - Keys should only be in Supabase secrets
   - Never in code files

2. **Rotate keys regularly**
   - Create new keys every 90 days
   - Delete old keys after rotation

3. **Monitor usage**
   - Check OpenAI dashboard for unexpected usage
   - Set up billing alerts

4. **Use project-specific keys**
   - Different keys for dev/staging/production
   - Easier to track and revoke

---

## Cost Optimization

Current model usage in BASE Admin Hub:

- **Patient AI Chat:** `gpt-4o-mini` (very cost-effective)
- **OCR Form Extraction:** `gpt-4o` (more capable, higher cost)
- **Knowledge Hub Chat:** `gpt-4o-mini`

**Estimated costs:**
- Patient chat message: ~$0.0001-0.0005
- OCR form upload: ~$0.01-0.03
- Knowledge hub query: ~$0.0001-0.0005

**Tip:** Most users will cost less than $1/month for typical usage.

---

## Need Help?

1. Check browser console for detailed error messages
2. Check Supabase Edge Functions logs
3. Verify OpenAI API status: https://status.openai.com/

## Resources

- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [OpenAI Pricing](https://openai.com/api/pricing/)
- [Supabase Secrets Docs](https://supabase.com/docs/guides/functions/secrets)
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)

---

**Last Updated:** November 25, 2025
