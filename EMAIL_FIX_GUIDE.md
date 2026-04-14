# 🔧 Email Notification Fix Guide

## Problem
Email notifications for purchases, service requests, and low stock alerts are failing silently because the `/api/send-email` endpoint doesn't exist in your local development environment.

## Solution

You have **two options** depending on whether you want to test locally or deploy to production:

---

## Option 1: Test Locally (Development)

### Step 1: Install Dependencies
```bash
npm install express cors dotenv
```

### Step 2: Get a Resend API Key
1. Go to https://resend.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `re_`)

### Step 3: Add Email Configuration to .env
Add these lines to your `.env` file:
```env
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=noreply@greenlifesolarsolution.com
ADMIN_EMAIL=infogreenlifetechnology@gmail.com
```

### Step 4: Verify Your Domain (Optional but Recommended)
For production use, verify your domain in Resend:
1. Go to https://resend.com/domains
2. Add your domain: `greenlifesolarsolution.com`
3. Follow DNS verification steps
4. Once verified, you can send from `noreply@greenlifesolarsolution.com`

For testing, you can use Resend's test domain.

### Step 5: Run the Local API Server
Open a terminal and run:
```bash
node api-server.js
```

You should see:
```
✅ Email API server running on http://localhost:3001
📬 Endpoint: http://localhost:3001/api/send-email
Ready to receive email requests!
```

### Step 6: Run Your Vite Dev Server
In a **separate terminal**, run:
```bash
npm run dev
```

### Step 7: Test Email Notifications
Now test your application:
1. Open http://localhost:5173 in your browser
2. Open DevTools (F12) → Console tab
3. Try one of these actions:
   - Make a purchase (checkout flow)
   - Submit a service request
   - Trigger a low stock alert

You should see in the console:
```
📧 Sending email via http://localhost:3001/api/send-email
📬 Email API Response Status: 200
✅ Email sent successfully! {id: "..."}
```

---

## Option 2: Deploy to Production (Vercel)

### Step 1: Add Environment Variables to Vercel
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables (without `VITE_` prefix):
   ```
   RESEND_API_KEY=re_your_actual_api_key_here
   RESEND_FROM_EMAIL=noreply@greenlifesolarsolution.com
   ADMIN_EMAIL=infogreenlifetechnology@gmail.com
   SUPPORT_EMAIL=support@greenlifesolarsolution.com
   ```

### Step 2: Deploy Your Code
```bash
git add .
git commit -m "Fix email notifications"
git push
```

Vercel will automatically deploy your changes.

### Step 3: Test on Production
1. Visit your production URL (e.g., https://greenlifesolarsolution.com)
2. Open DevTools (F12) → Console tab
3. Test email notifications (purchase, service request, etc.)
4. Check for success messages in console
5. Verify emails arrive in inbox

---

## Troubleshooting

### No emails are being sent

**Check 1: Is the API server running?**
```bash
# You should see this in the terminal running api-server.js:
✅ Email API server running on http://localhost:3001
```

**Check 2: Is RESEND_API_KEY set?**
```bash
# Check your .env file contains:
RESEND_API_KEY=re_...
```

**Check 3: Check browser console**
Open DevTools (F12) and look for:
- ❌ Network errors (API server not running)
- ❌ 401 errors (invalid API key)
- ❌ 403 errors (domain not verified)

### Emails sent but not received

**Check 1: Spam folder**
Check your spam/junk folder

**Check 2: Resend dashboard**
1. Go to https://resend.com/emails
2. Check if emails were sent successfully
3. Look for delivery status

**Check 3: Email address**
Verify the recipient email address is correct

### 404 Error in Console

This means the API endpoint is not accessible:
- **Local**: Make sure `api-server.js` is running on port 3001
- **Production**: Make sure your code is deployed to Vercel

### 401 or 403 Error

This means authentication failed:
- Check your `RESEND_API_KEY` is correct
- Verify your domain in Resend dashboard
- For testing, use Resend's test domain

---

## Testing Checklist

- [ ] Installed dependencies (`express`, `cors`, `dotenv`)
- [ ] Added `RESEND_API_KEY` to `.env` file
- [ ] Started local API server (`node api-server.js`)
- [ ] Started Vite dev server (`npm run dev`)
- [ ] Opened browser DevTools console
- [ ] Tested purchase flow
- [ ] Tested service request
- [ ] Saw success messages in console
- [ ] Received test emails

---

## What Changed?

### Files Modified:
1. **src/lib/sendEmailRequest.ts** - Now detects local vs production and uses correct endpoint
2. **src/lib/sendLowStockAlert.ts** - Same endpoint detection logic
3. **api-server.js** (NEW) - Local development email API server

### How It Works:
```javascript
// Automatically detects environment
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api/send-email'  // Local
  : '/api/send-email';  // Production (Vercel)
```

---

## Quick Start Commands

```bash
# Terminal 1: Start email API server
node api-server.js

# Terminal 2: Start Vite dev server
npm run dev

# Open browser
# http://localhost:5173
```

---

## Need Help?

If you're still having issues:

1. Check the console logs in both terminals
2. Verify your `.env` file has the correct API key
3. Test the API directly:
   ```bash
   curl -X POST http://localhost:3001/api/health
   ```
4. Check Resend dashboard for error logs

---

## Production Deployment Notes

When deploying to Vercel:
- The `api/send-email.ts` file is used (serverless function)
- Environment variables must be set in Vercel dashboard
- No need to run `api-server.js` in production
- The code automatically detects production and uses `/api/send-email`
