# Email System Architecture

## The Problem (Before Fix)

```
┌─────────────────────────────────────────────────────────────┐
│  LOCAL DEVELOPMENT (http://localhost:5173)                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User Action (Purchase/Request)                             │
│         │                                                    │
│         ▼                                                    │
│  Frontend tries to call: /api/send-email                    │
│         │                                                    │
│         ▼                                                    │
│  ❌ 404 NOT FOUND                                           │
│  (Endpoint doesn't exist in Vite dev server)                │
│                                                              │
│  Result: Silent failure, no emails sent                     │
└─────────────────────────────────────────────────────────────┘
```

---

## The Solution (After Fix)

### Local Development Setup

```
┌──────────────────────────────────────────────────────────────────────┐
│  TERMINAL 1: Email API Server (Port 3001)                           │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  $ node api-server.js                                                │
│                                                                       │
│  ┌─────────────────────────────────────────────────────┐            │
│  │  Express Server                                      │            │
│  │  • Listens on http://localhost:3001                 │            │
│  │  • Endpoint: /api/send-email                        │            │
│  │  • Reads RESEND_API_KEY from .env                   │            │
│  └─────────────────────────────────────────────────────┘            │
│                          │                                            │
│                          │ Forwards to                                │
│                          ▼                                            │
│                  Resend API                                           │
│                  (https://api.resend.com)                             │
│                          │                                            │
│                          ▼                                            │
│                  📧 Email Delivered                                   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  TERMINAL 2: Vite Dev Server (Port 5173)                            │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  $ npm run dev                                                        │
│                                                                       │
│  User Action (Purchase/Request)                                      │
│         │                                                             │
│         ▼                                                             │
│  Frontend detects: window.location.hostname === 'localhost'          │
│         │                                                             │
│         ▼                                                             │
│  Calls: http://localhost:3001/api/send-email                         │
│         │                                                             │
│         ▼                                                             │
│  ✅ SUCCESS - Email sent!                                            │
└──────────────────────────────────────────────────────────────────────┘
```

### Production Setup (Vercel)

```
┌──────────────────────────────────────────────────────────────────────┐
│  PRODUCTION (https://greenlifesolarsolution.com)                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  User Action (Purchase/Request)                                      │
│         │                                                             │
│         ▼                                                             │
│  Frontend detects: window.location.hostname !== 'localhost'          │
│         │                                                             │
│         ▼                                                             │
│  Calls: /api/send-email (relative path)                              │
│         │                                                             │
│         ▼                                                             │
│  ┌─────────────────────────────────────────────────────┐            │
│  │  Vercel Serverless Function                         │            │
│  │  • File: api/send-email.ts                          │            │
│  │  • Reads RESEND_API_KEY from Vercel env vars       │            │
│  └─────────────────────────────────────────────────────┘            │
│                          │                                            │
│                          │ Forwards to                                │
│                          ▼                                            │
│                  Resend API                                           │
│                  (https://api.resend.com)                             │
│                          │                                            │
│                          ▼                                            │
│                  📧 Email Delivered                                   │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Code Flow

### 1. Email Request Initiated

```typescript
// CheckoutPage.tsx, ServiceRequestForm.tsx, etc.
const emailResult = await sendOrderEmails({
  customerName: formData.name,
  customerEmail: formData.email,
  // ... other data
});
```

### 2. Environment Detection

```typescript
// src/lib/sendEmailRequest.ts
const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api/send-email'  // 🏠 Local
  : '/api/send-email';                       // 🌐 Production
```

### 3. API Call

```typescript
const response = await fetch(apiUrl, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'customer@email.com',
    subject: 'Order Confirmation',
    html: '<html>...</html>',
    tags: { category: 'order' }
  })
});
```

### 4. Response Handling

```typescript
if (response.ok) {
  console.log('✅ Email sent successfully!');
  // Show success message to user
} else {
  console.error('❌ Email failed:', await response.json());
  // Show error message to user
}
```

---

## Email Types Supported

### 1. Order Confirmation Emails
- **Trigger:** User completes purchase
- **Recipients:** Customer + Admin
- **File:** `src/lib/sendOrderEmail.ts`

### 2. Service Request Emails
- **Trigger:** User submits maintenance/survey request
- **Recipients:** Customer + Admin
- **File:** `src/lib/sendServiceRequestEmail.ts`

### 3. Low Stock Alerts
- **Trigger:** Product stock falls below threshold
- **Recipients:** Admin only
- **File:** `src/lib/sendLowStockAlert.ts`

### 4. Consultation Request Emails
- **Trigger:** User submits consultation form
- **Recipients:** Customer + Admin
- **File:** `src/lib/sendConsultationEmail.ts`

---

## Configuration Files

```
.env                          # Local environment variables
├── RESEND_API_KEY           # Your Resend API key
├── RESEND_FROM_EMAIL        # Sender email address
└── ADMIN_EMAIL              # Admin notification email

api-server.js                 # Local development email server
api/send-email.ts            # Production serverless function

src/lib/
├── sendEmailRequest.ts      # Core email sending logic
├── sendOrderEmail.ts        # Order confirmation emails
├── sendServiceRequestEmail.ts  # Service request emails
├── sendLowStockAlert.ts     # Inventory alerts
└── emailTemplates.ts        # HTML email templates
```

---

## Environment Variables

### Local Development (.env)
```env
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@greenlifesolarsolution.com
ADMIN_EMAIL=infogreenlifetechnology@gmail.com
```

### Production (Vercel Dashboard)
```
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@greenlifesolarsolution.com
ADMIN_EMAIL=infogreenlifetechnology@gmail.com
SUPPORT_EMAIL=support@greenlifesolarsolution.com
```

---

## Testing Flow

```
1. Start API Server
   $ node api-server.js
   ✅ Email API server running on http://localhost:3001

2. Start Dev Server
   $ npm run dev
   ✅ Vite dev server running on http://localhost:5173

3. Open Browser
   → http://localhost:5173

4. Open DevTools Console (F12)

5. Trigger Email Action
   • Complete a purchase
   • Submit service request
   • Trigger low stock alert

6. Check Console Output
   📧 Sending email via http://localhost:3001/api/send-email
   📬 Email API Response Status: 200
   ✅ Email sent successfully! {id: "abc123"}

7. Check Email Inbox
   📬 Email received!
```

---

## Troubleshooting Decision Tree

```
Email not working?
│
├─ Are you in local development?
│  │
│  ├─ YES → Is api-server.js running?
│  │  │
│  │  ├─ NO → Run: node api-server.js
│  │  │
│  │  └─ YES → Is RESEND_API_KEY in .env?
│  │     │
│  │     ├─ NO → Add to .env file
│  │     │
│  │     └─ YES → Check browser console for errors
│  │
│  └─ NO (Production) → Are env vars set in Vercel?
│     │
│     ├─ NO → Add in Vercel dashboard
│     │
│     └─ YES → Check Resend dashboard for delivery status
│
└─ Check spam folder / Verify email address
```

---

## Quick Reference

| Environment | API Endpoint | Configuration |
|-------------|--------------|---------------|
| Local Dev | `http://localhost:3001/api/send-email` | `.env` file |
| Production | `/api/send-email` (relative) | Vercel env vars |

| Command | Purpose |
|---------|---------|
| `node api-server.js` | Start local email API |
| `npm run dev` | Start Vite dev server |
| `npm run dev:all` | Start both servers |
| `node test-email-connection.js your@email.com` | Test email config |

---

## Success Indicators

✅ **Local Development Working:**
- API server shows: `✅ Email API server running`
- Browser console shows: `✅ Email sent successfully!`
- API server logs: `✅ Email sent successfully! ID: abc123`
- Email arrives in inbox

✅ **Production Working:**
- Browser console shows: `✅ Email sent successfully!`
- Email arrives in inbox
- Resend dashboard shows successful delivery
- No errors in Vercel logs
