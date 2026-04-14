# Email Sending Debugging & Fix Guide

## 🔴 The Root Issue

Your email sending is failing because:

### **The Problem Architecture:**
```
Frontend (Vite)  →  tries to call →  /api/send-email
    ❌ This endpoint doesn't exist in development!
    
This endpoint ONLY exists on Vercel after deployment
```

### **Why You Don't See Errors:**
1. The fetch request fails silently (404 or network error)
2. It's caught in the `catch` block but might not be visible in console
3. The email gets "not sent" but no error displays to user

---

## ✅ Step 1: Enable Debug Logging

I've updated `src/lib/sendEmailRequest.ts` to add console logging. Now when you make a purchase:

1. **Open Browser DevTools** (F12)
2. **Go to Console tab**
3. **Complete a purchase**
4. **Look for messages starting with 📧, 📬, or ❌**

Expected output if working:
```
📧 Sending email via /api/send-email {to: "user@example.com", subject: "..."}
📬 Email API Response Status: 200
✅ Email sent successfully! {id: "email-id-123"}
```

Expected output if FAILING:
```
📧 Sending email via /api/send-email {to: "user@example.com", subject: "..."}
❌ Email request failed: fetch failed / Network error / 404 Not Found
```

---

## ✅ Step 2: Check Your Deployment Environment

### **Are you running locally or deployed?**

**Local Development (Vite):**
```bash
npm run dev
# Opens at http://localhost:5173
# ❌ /api/send-email does NOT work here!
```

**Deployed on Vercel:**
```
https://greenlifesolarsolution.com
✅ /api/send-email WILL work here!
```

### **What This Means:**
- **Local testing**: `/api` routes fail because Vite doesn't serve them
- **Production**: `/api` routes work because Vercel serverless functions handle them

---

## ✅ Step 3: Fix Your Setup

### **OPTION A: Deploy to Vercel (Recommended)**

1. **Ensure your `.env` file on Vercel has:**
   ```
   RESEND_API_KEY=re_xxx...
   RESEND_FROM_EMAIL=noreply@greenlifesolarsolution.com
   ADMIN_EMAIL=infogreenlifetechnology@gmail.com
   ```

2. **Check Vercel project settings:**
   - Go to https://vercel.com/dashboard
   - Click your project
   - Settings → Environment Variables
   - Verify `RESEND_API_KEY` is set (without VITE_ prefix!)

3. **Redeploy after adding env vars:**
   ```bash
   git push
   # or in Vercel dashboard: Redeploy
   ```

4. **Test on production URL:**
   - Purchase a product on your deployed site
   - Check console for email success logs

---

### **OPTION B: Local Testing Without Vercel**

If you want to test emails locally before deploying, create a simple Node.js backend:

#### **Create `api-server.js` in your project root:**

```javascript
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

if (!RESEND_API_KEY) {
  console.error('❌ RESEND_API_KEY not set in .env');
  process.exit(1);
}

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, replyTo, tags } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        error: 'Missing required fields: to, subject, html',
      });
    }

    const emailPayload = {
      from: RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    };

    if (replyTo) emailPayload.replyTo = replyTo;
    if (tags) {
      emailPayload.tags = Object.entries(tags).map(([name, value]) => ({
        name,
        value: String(value),
      }));
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(response.status).json({
        error: data.message || 'Failed to send email',
      });
    }

    res.json({
      success: true,
      id: data.id,
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      error: error.message,
    });
  }
});

app.listen(3001, () => {
  console.log('✅ Email API server running on http://localhost:3001');
});
```

#### **Install dependencies:**
```bash
npm install express cors node-fetch
```

#### **Run both servers in separate terminals:**

**Terminal 1 - API Server:**
```bash
node api-server.js
# ✅ Email API server running on http://localhost:3001
```

**Terminal 2 - Vite Frontend:**
```bash
npm run dev
```

#### **Update fetch URL for local testing:**

In `src/lib/sendEmailRequest.ts`, change:
```typescript
const response = await fetch('/api/send-email', {  // ❌ Won't work locally
```

To:
```typescript
const apiUrl = window.location.hostname === 'localhost' 
  ? 'http://localhost:3001/api/send-email'  // Local
  : '/api/send-email';  // Production
  
const response = await fetch(apiUrl, {
```

---

## ✅ Step 4: Verify Environment Variables

### **Check if variables are set:**

In browser console, these should be valid (check your [api/config.ts](api/config.ts)):
```javascript
fetch('/api/config').then(r => r.json()).then(console.log)
```

You should see Supabase config. The backend also needs access to:
- `RESEND_API_KEY` ✓
- `RESEND_FROM_EMAIL` ✓
- `ADMIN_EMAIL` ✓

### **These MUST be set on Vercel:**
1. Go to https://vercel.com → Your Project → Settings → Environment Variables
2. Add without `VITE_` prefix:
   - `RESEND_API_KEY=re_xxx...`
   - `RESEND_FROM_EMAIL=noreply@greenlifesolarsolution.com`
   - `ADMIN_EMAIL=infogreenlifetechnology@gmail.com`
3. Redeploy

---

## 🧪 Testing Checklist

- [ ] Added `RESEND_API_KEY` to Vercel environment variables
- [ ] Deployed latest code to Vercel (`git push`)
- [ ] Opened DevTools console (F12)
- [ ] Completed test purchase on production site
- [ ] Saw `✅ Email sent successfully!` in console
- [ ] Received email at customer address
- [ ] Received email at admin address

---

## 🆘 Still Not Working?

Run this in browser console to diagnose:

```javascript
// Test 1: Can we reach the API?
fetch('/api/send-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'test@example.com',
    subject: 'Test',
    html: '<h1>Test</h1>'
  })
})
.then(r => {
  console.log('Status:', r.status);
  return r.json();
})
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

### **Expected responses:**

If working (Status 200):
```javascript
{success: true, id: "email-id-123"}
```

If API not found (Status 404):
```
❌ This means /api/send-email is not deployed/accessible
```

If missing API key (Status 500):
```javascript
{error: "Email service not configured"}
```

---

## 📞 Quick Summary

| Issue | Solution |
|-------|----------|
| Emails not sending locally | Use Option B: Local API server, OR deploy to Vercel |
| Emails fail on production | Check `RESEND_API_KEY` is set in Vercel env vars |
| 404 error in console | The `/api/send-email` endpoint isn't deployed yet |
| 500 error | `RESEND_API_KEY` not set on backend |
| No console errors | Added detailed logging - check again |
