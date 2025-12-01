# Payment Integration Guide - Billing Demo

## Overview

The current Billing Integration Demo has a **mock payment flow** for prototyping. This guide explains how to integrate with a **real payment processor** for production.

---

## 📊 Payment Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PATIENT APP (Frontend)                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Patient enters card details:                            │  │
│  │  • Card Number: 4242 4242 4242 4242                      │  │
│  │  • Expiry: 12/25                                         │  │
│  │  • CVV: 123                                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│                            │ ⚠️ NEVER SEND RAW CARD DATA       │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Stripe.js SDK (loaded from stripe.com)                  │  │
│  │  stripe.createPaymentMethod({ card: cardElement })       │  │
│  │                                                           │  │
│  │  ✅ Tokenizes card securely                              │  │
│  │  Returns: { id: "pm_1ABC123..." }                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│                            │ ✅ Safe to send token              │
│                            ▼                                    │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             │ POST /api/billing/payment
                             │ {
                             │   paymentMethodId: "pm_1ABC123...",
                             │   amount: 350.00,
                             │   patientId: "pat-001"
                             │ }
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                     YOUR BACKEND (Server)                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Receive payment token (NOT raw card data)            │  │
│  │  2. Validate user authorization                          │  │
│  │  3. Verify amount matches invoice                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Call Stripe API with SECRET KEY:                        │  │
│  │                                                           │  │
│  │  const paymentIntent = await stripe.paymentIntents       │  │
│  │    .create({                                             │  │
│  │      amount: 35000, // cents                             │  │
│  │      currency: 'usd',                                    │  │
│  │      payment_method: "pm_1ABC123...",                    │  │
│  │      confirm: true                                       │  │
│  │    });                                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             │ API Request (with SECRET key)
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                    STRIPE (Payment Processor)                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. Validate payment method                              │  │
│  │  2. Contact card network (Visa/Mastercard)               │  │
│  │  3. Process payment                                      │  │
│  │  4. Return charge confirmation                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│                            │ Returns:                           │
│                            │ {                                  │
│                            │   id: "ch_1DEF456...",             │
│                            │   status: "succeeded",             │
│                            │   amount: 35000                    │
│                            │ }                                  │
│                            │                                    │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             │ Payment Confirmation
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                     YOUR BACKEND (Server)                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  5. Update FHIR PaymentReconciliation resource           │  │
│  │  6. Update patient account balance                       │  │
│  │  7. Send receipt email                                   │  │
│  │  8. Return confirmation to frontend                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
└────────────────────────────┬───────────────────────────────────┘
                             │
                             │ {
                             │   success: true,
                             │   confirmationNumber: "PAY-12345",
                             │   newBalance: 0.00
                             │ }
                             │
┌────────────────────────────▼───────────────────────────────────┐
│                     PATIENT APP (Frontend)                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ✅ Payment Success!                                      │  │
│  │                                                           │  │
│  │  Confirmation: PAY-12345                                 │  │
│  │  Amount Paid: $350.00                                    │  │
│  │  New Balance: $0.00                                      │  │
│  │                                                           │  │
│  │  [Download Receipt] [Email Receipt]                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 🔑 Key Points:

1. **Frontend (Patient App):**
   - Collects card details
   - Uses Stripe.js to tokenize (card never touches your server)
   - Sends token to your backend

2. **Your Backend:**
   - Receives token (NOT card data)
   - Calls Stripe API with secret key
   - Updates FHIR billing records
   - Returns confirmation

3. **Stripe:**
   - Processes actual payment
   - Handles card network communication
   - Returns success/failure

4. **Security:**
   - ✅ Card data goes directly to Stripe (PCI compliant)
   - ✅ Only tokens sent to your backend
   - ✅ Secret keys never exposed to frontend

---

## ⚠️ Critical: PCI Compliance

**NEVER send raw card data to your backend!** This violates PCI DSS compliance.

### The Right Way:
```
Patient enters card → Vendor SDK tokenizes → Send token to backend → Backend processes payment
```

### The Wrong Way (DO NOT DO):
```
Patient enters card → Send card number to backend → ❌ PCI violation
```

---

## Recommended Payment Vendors

### 1. **Stripe** ⭐ (Recommended)
- **Best for:** Modern, developer-friendly API
- **Healthcare:** HIPAA-compliant with BAA
- **Cost:** 2.9% + $0.30 per transaction
- **Integration:** Stripe Elements (no PCI burden on you)
- **Website:** https://stripe.com/payments

### 2. **InstaMed** (J.P. Morgan)
- **Best for:** Healthcare-specific features
- **Healthcare:** Built for medical billing
- **Cost:** Custom pricing (typically 2.5-3%)
- **Integration:** Payment portal + API
- **Website:** https://www.instamed.com

### 3. **Square**
- **Best for:** Small practices, easy setup
- **Healthcare:** HIPAA-compliant
- **Cost:** 2.6% + $0.10 per transaction
- **Integration:** Square Web Payments SDK
- **Website:** https://squareup.com/us/en/payments

### 4. **PaymentSpring**
- **Best for:** Medical billing focus
- **Healthcare:** HIPAA-compliant, patient payment plans
- **Cost:** Custom pricing
- **Integration:** RESTful API
- **Website:** https://www.paymentspring.com

### 5. **Authorize.Net**
- **Best for:** Traditional gateway, enterprise
- **Healthcare:** HIPAA-compliant with BAA
- **Cost:** $25/month + 2.9% + $0.30
- **Integration:** Accept.js (hosted form)
- **Website:** https://www.authorize.net

---

## Integration Architecture (Using Stripe as Example)

### **Frontend (React)**

```tsx
// Install Stripe SDK
// npm install @stripe/stripe-js @stripe/react-stripe-js

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Publishable key (safe to expose in frontend)
const stripePromise = loadStripe('pk_test_YOUR_PUBLISHABLE_KEY');

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayment = async () => {
    if (!stripe || !elements) return;

    // Step 1: Create payment method (Stripe tokenizes card)
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.error('Payment error:', error);
      return;
    }

    // Step 2: Send token to YOUR backend (NOT raw card data)
    const response = await fetch('https://your-backend.com/api/billing/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        paymentMethodId: paymentMethod.id,  // Safe token from Stripe
        amount: 350.00,
        patientId: 'pat-001',
        invoiceId: 'INV-2025-11-001'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      // Show success screen with confirmation
      setPaymentConfirmation(result.confirmation);
      setCurrentView('payment-success');
    } else {
      // Show error
      alert(result.error);
    }
  };

  return (
    <Elements stripe={stripePromise}>
      <CardElement />
      <Button onClick={handlePayment}>Pay $350.00</Button>
    </Elements>
  );
}
```

### **Backend (Node.js/Supabase Edge Function)**

```typescript
// /supabase/functions/server/billing.tsx

import Stripe from 'npm:stripe';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'), {
  apiVersion: '2023-10-16',
});

// Payment endpoint
app.post('/make-server-66fdb7c0/billing/payment', async (c) => {
  const { paymentMethodId, amount, patientId, invoiceId } = await c.req.json();

  try {
    // Step 1: Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      description: `Medical bill payment for invoice ${invoiceId}`,
      metadata: {
        patientId,
        invoiceId
      }
    });

    // Step 2: Update FHIR PaymentReconciliation resource
    const paymentReconciliation = {
      resourceType: 'PaymentReconciliation',
      id: `PAY-${Date.now()}`,
      status: 'active',
      paymentDate: new Date().toISOString(),
      paymentAmount: {
        value: amount,
        currency: 'USD'
      },
      paymentIdentifier: {
        value: paymentIntent.id
      },
      detail: [{
        type: { coding: [{ code: 'payment' }] },
        request: { reference: `Invoice/${invoiceId}` },
        amount: { value: amount, currency: 'USD' }
      }]
    };

    // Step 3: Save to your database/FHIR server
    await kv.set(`payment:${paymentIntent.id}`, paymentReconciliation);

    // Step 4: Update patient account balance
    const account = await kv.get(`account:${patientId}`);
    account.summary.currentBalance.value -= amount;
    await kv.set(`account:${patientId}`, account);

    // Step 5: Return confirmation
    return c.json({
      success: true,
      confirmation: {
        confirmationNumber: paymentIntent.id,
        amount: amount,
        method: `Credit Card ending in ${paymentIntent.charges.data[0].payment_method_details.card.last4}`,
        date: new Date().toISOString(),
        status: 'completed'
      }
    });

  } catch (error) {
    console.error('Payment processing error:', error);
    return c.json({
      success: false,
      error: error.message
    }, 400);
  }
});
```

### **Environment Variables**

```bash
# .env file (NEVER commit to git)

# Stripe Keys (get from https://dashboard.stripe.com/apikeys)
STRIPE_PUBLISHABLE_KEY=pk_test_51abc...xyz
STRIPE_SECRET_KEY=sk_test_51abc...xyz

# FHIR Endpoint
FHIR_BASE_URL=https://fhir.cloud.greenway.com/greenway-development/uscdi/r4

# Your backend
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Security Best Practices

### 1. **PCI Compliance**
- ✅ Use vendor SDK (Stripe Elements, Square Web Payments)
- ✅ Never store card numbers in your database
- ✅ Use tokens/payment method IDs only
- ✅ Serve frontend over HTTPS only

### 2. **Backend Security**
- ✅ Validate amount on backend (don't trust frontend)
- ✅ Check user authorization before processing payment
- ✅ Use secret keys only on backend (never expose)
- ✅ Log all payment attempts for audit

### 3. **HIPAA Compliance**
- ✅ Sign Business Associate Agreement (BAA) with payment vendor
- ✅ Encrypt payment data in transit (HTTPS)
- ✅ Log access to payment records
- ✅ Implement audit trails

---

## Testing

### **Stripe Test Cards**

```
Success: 4242 4242 4242 4242 (any expiry/CVV)
Decline: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
```

### **Test Mode Setup**

1. Create Stripe account at https://dashboard.stripe.com
2. Get test keys (starts with `pk_test_` and `sk_test_`)
3. Use test cards above
4. No real money is charged in test mode

---

## Step-by-Step Implementation

### **Phase 1: Setup Stripe Account**

1. Go to https://stripe.com → Sign up
2. Complete business verification
3. Sign HIPAA BAA (Settings → Compliance → HIPAA)
4. Get API keys (Developers → API keys)

### **Phase 2: Install Dependencies**

```bash
# Frontend
npm install @stripe/stripe-js @stripe/react-stripe-js

# Backend (Supabase Edge Function)
# Add to import_map.json:
{
  "imports": {
    "stripe": "npm:stripe@^14.0.0"
  }
}
```

### **Phase 3: Update Frontend Code**

1. Replace mock card input with `<CardElement />` from Stripe
2. Remove manual card number state
3. Use `stripe.createPaymentMethod()` to tokenize
4. Send token to backend, not card data

### **Phase 4: Create Backend Endpoint**

1. Create `/supabase/functions/server/billing.tsx`
2. Import Stripe with secret key
3. Create payment intent
4. Update FHIR resources
5. Return confirmation

### **Phase 5: Update Environment Variables**

```bash
# Add to Supabase dashboard → Settings → Secrets
STRIPE_SECRET_KEY=sk_test_...
```

### **Phase 6: Test End-to-End**

1. Use test card `4242 4242 4242 4242`
2. Enter any expiry/CVV
3. Click Pay
4. Verify charge appears in Stripe dashboard
5. Verify balance updates in FHIR

---

## Production Checklist

Before going live:

- [ ] Switch from test keys to live keys
- [ ] Test with real card (small amount)
- [ ] Verify webhook endpoints work (payment.succeeded, payment.failed)
- [ ] Setup email receipts
- [ ] Enable 3D Secure (SCA compliance for EU)
- [ ] Test refund flow
- [ ] Setup monitoring/alerts for failed payments
- [ ] Document PCI compliance measures
- [ ] Sign BAA with Stripe
- [ ] Test in production-like environment

---

## Cost Analysis

### **Stripe Pricing**

**Standard:**
- 2.9% + $0.30 per successful transaction
- No monthly fees
- No setup fees

**Example:**
- $100 payment = $3.20 fee (you receive $96.80)
- $350 payment = $10.45 fee (you receive $339.55)

**Volume Discounts:**
- $1M+/year: Custom pricing (typically 2.5% + $0.30)

### **InstaMed Pricing**

- Custom pricing (typically 2.5-3%)
- Monthly minimum may apply
- Healthcare-specific features included

---

## Alternative: Embedded Stripe Checkout

For **simpler integration** (but less customization):

```tsx
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe('pk_test_...');

// Redirect to Stripe-hosted checkout page
const { error } = await stripe.redirectToCheckout({
  lineItems: [{
    price: 'price_medical_bill',
    quantity: 1,
  }],
  mode: 'payment',
  successUrl: 'https://your-app.com/payment-success',
  cancelUrl: 'https://your-app.com/billing',
});
```

**Pros:**
- Stripe handles entire payment UI
- Fully PCI compliant
- Faster to implement

**Cons:**
- Less control over UI
- Redirects away from your app

---

## Webhook Integration

Handle payment status updates:

```typescript
// /supabase/functions/server/stripe-webhook.tsx

app.post('/make-server-66fdb7c0/webhook/stripe', async (c) => {
  const signature = c.req.header('stripe-signature');
  const payload = await c.req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );
  } catch (err) {
    return c.json({ error: 'Invalid signature' }, 400);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Payment succeeded - update FHIR, send receipt
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;

    case 'payment_intent.payment_failed':
      // Payment failed - notify patient
      await handlePaymentFailure(event.data.object);
      break;

    case 'charge.refunded':
      // Refund processed - update balance
      await handleRefund(event.data.object);
      break;
  }

  return c.json({ received: true });
});
```

---

## Common Issues & Solutions

### Issue: "Card declined"
**Solution:** Use test card `4242 4242 4242 4242` in test mode

### Issue: "Invalid API key"
**Solution:** Make sure using correct key (test vs live) and it's not exposed in frontend

### Issue: "PCI compliance error"
**Solution:** Never send raw card data to backend. Use Stripe Elements.

### Issue: "HIPAA concerns"
**Solution:** Sign BAA with Stripe. Enable audit logs. Encrypt data.

### Issue: "Webhook not receiving events"
**Solution:** Check URL is publicly accessible. Verify signature validation.

---

## Resources

### **Stripe Documentation**
- Quickstart: https://stripe.com/docs/payments/quickstart
- React integration: https://stripe.com/docs/stripe-js/react
- HIPAA compliance: https://stripe.com/docs/security/guide#hipaa

### **FHIR Resources**
- PaymentReconciliation: https://www.hl7.org/fhir/paymentreconciliation.html
- PaymentNotice: https://www.hl7.org/fhir/paymentnotice.html

### **Security Standards**
- PCI DSS: https://www.pcisecuritystandards.org
- HIPAA compliance: https://www.hhs.gov/hipaa

---

## Next Steps

1. **Sign up for Stripe** (or chosen vendor)
2. **Get test API keys**
3. **Install SDKs** (@stripe/stripe-js)
4. **Update frontend** to use CardElement
5. **Create backend endpoint** for payment processing
6. **Test with test cards**
7. **Setup webhooks** for payment status
8. **Go live** with production keys

---

## Support

For payment integration help:
- Stripe Support: https://support.stripe.com
- This codebase: Check `/components/BillingIntegrationDemo.tsx`
- Backend example: See code above for Supabase Edge Function pattern

---

**Last Updated:** November 24, 2025