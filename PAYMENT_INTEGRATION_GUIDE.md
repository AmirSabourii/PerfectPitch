# Payment Integration Guide

## 🎯 Overview

This guide explains how to integrate a payment gateway into the credit system.

## ⚠️ Current Status

**DEMO MODE**: The system does NOT process real payments currently.

## 🔧 Integration Steps

### Step 1: Choose Payment Gateway

#### Option A: Stripe (International)
- Best for: Global payments
- Fees: 2.9% + $0.30 per transaction
- Setup: https://stripe.com/docs

#### Option B: ZarinPal (Iran)
- Best for: Iranian market
- Fees: Variable
- Setup: https://www.zarinpal.com/docs

#### Option C: PayPal
- Best for: Alternative international
- Fees: 2.9% + fixed fee
- Setup: https://developer.paypal.com

### Step 2: Install Dependencies

```bash
# For Stripe
npm install stripe @stripe/stripe-js

# For ZarinPal
npm install zarinpal-checkout
```

### Step 3: Add Environment Variables

```env
# .env.local

# Stripe
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Or ZarinPal
ZARINPAL_MERCHANT_ID=...
ZARINPAL_CALLBACK_URL=https://yourdomain.com/api/credits/callback
```

### Step 4: Update CreditManagement Component

```typescript
// components/CreditManagement.tsx

import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const handlePurchase = async () => {
  if (!user) return;
  
  try {
    setPurchasing(true);
    
    // 1. Create payment intent
    const response = await fetch('/api/credits/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.uid,
        credits,
        amount: pkg.price
      })
    });
    
    const { clientSecret } = await response.json();
    
    // 2. Process payment
    const stripe = await stripePromise;
    const result = await stripe!.confirmPayment({
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard?view=credits`,
      },
    });
    
    if (result.error) {
      alert(result.error.message);
    }
    
  } catch (error) {
    console.error('Purchase failed:', error);
    alert('Purchase failed. Please try again.');
  } finally {
    setPurchasing(false);
  }
};
```

### Step 5: Implement Purchase API

```typescript
// app/api/credits/purchase/route.ts

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { userId, credits, amount } = await request.json();
  
  // Validate
  if (!userId || !credits || !amount) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }
  
  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency: 'usd',
    metadata: {
      userId,
      credits: credits.toString(),
      type: 'credit_purchase'
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });
  
  return Response.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id
  });
}
```

### Step 6: Implement Webhook

```typescript
// app/api/credits/webhook/route.ts

import Stripe from 'stripe';
import { creditService } from '@/lib/services/creditService';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature')!;
  const body = await request.text();
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return Response.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }
  
  // Handle payment success
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const { userId, credits } = paymentIntent.metadata;
    
    // Add credits
    await creditService.purchaseCredits(
      userId,
      parseInt(credits),
      paymentIntent.amount / 100,
      'stripe',
      paymentIntent.id
    );
    
    console.log(`✅ Credits added: ${credits} for user ${userId}`);
  }
  
  // Handle payment failure
  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.error('❌ Payment failed:', paymentIntent.id);
    // TODO: Send notification to user
  }
  
  return Response.json({ received: true });
}
```

### Step 7: Configure Webhook in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/credits/webhook`
4. Events to listen:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy webhook secret to `.env.local`

### Step 8: Test in Sandbox

```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/credits/webhook

# Test payment
stripe trigger payment_intent.succeeded
```

### Step 9: Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0025 0000 3155
```

## 🔒 Security Checklist

- [ ] Webhook signature verification
- [ ] HTTPS only in production
- [ ] Rate limiting on purchase endpoint
- [ ] Duplicate payment prevention
- [ ] Transaction logging
- [ ] Error handling
- [ ] Refund handling
- [ ] User notification system

## 📊 Monitoring

Add logging for:
- All payment attempts
- Successful payments
- Failed payments
- Webhook calls
- Credit additions
- Errors

## 🧪 Testing Checklist

- [ ] Successful payment adds credits
- [ ] Failed payment does NOT add credits
- [ ] Duplicate webhook ignored
- [ ] Invalid signature rejected
- [ ] Network failure handled
- [ ] User sees correct balance
- [ ] Transaction history updated

## 🚀 Going Live

1. Switch to production keys
2. Update webhook URL
3. Test with real card (small amount)
4. Monitor for 24 hours
5. Enable for all users

## 📞 Support

- Stripe Docs: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- ZarinPal Docs: https://www.zarinpal.com/docs

---

**Remember**: Never add credits without payment verification!
