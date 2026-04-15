# Email System Architecture

## The Problem (Before Fix)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  LOCAL DEVELOPMENT (http://localhost:5173)                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                              â”‚
â”‚  User Action (Purchase/Request)                             â”‚
â”‚         â”‚                                                    â”‚
â”‚         â–¼                                                    â”‚
â”‚  Frontend tries to call: /api/send-email                    â”‚
â”‚         â”‚                                                    â”‚
â”‚         â–¼                                                    â”‚
â”‚  âŒ 404 NOT FOUND                                           â”‚
â”‚  (Endpoint doesn't exist in Vite dev server)                â”‚
â”‚                                                              â”‚
â”‚  Result: Silent failure, no emails sent                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## The Solution (After Fix)

### Local Development Setup

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  TERMINAL 1: Email API Server (Port 3001)                           â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                       â”‚
â”‚  $ node api-server.js                                                â”‚
â”‚                                                                       â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”            â”‚
â”‚  â”‚  Express Server                                      â”‚            â”‚
â”‚  â”‚  â€¢ Listens on http://localhost:3001                 â”‚            â”‚
â”‚  â”‚  â€¢ Endpoint: /api/send-email                        â”‚            â”‚
â”‚  â”‚  â€¢ Reads RESEND_API_KEY from .env                   â”‚            â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â”‚
â”‚                          â”‚                                            â”‚
â”‚                          â”‚ Forwards to                                â”‚
â”‚                          â–¼                                            â”‚
â”‚                  Resend API                                           â”‚
â”‚                  (https://api.resend.com)                             â”‚
â”‚                          â”‚                                            â”‚
â”‚                          â–¼                                            â”‚
â”‚                  ðŸ“§ Email Delivered                                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  TERMINAL 2: Vite Dev Server (Port 5173)                            â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                       â”‚
â”‚  $ npm run dev                                                        â”‚
â”‚                                                                       â”‚
â”‚  User Action (Purchase/Request)                                      â”‚
â”‚         â”‚                                                             â”‚
â”‚         â–¼                                                             â”‚
â”‚  Frontend detects: window.location.hostname === 'localhost'          â”‚
â”‚         â”‚                                                             â”‚
â”‚         â–¼                                                             â”‚
â”‚  Calls: http://localhost:3001/api/send-email                         â”‚
â”‚         â”‚                                                             â”‚
â”‚         â–¼                                                             â”‚
â”‚  âœ… SUCCESS - Email sent!                                            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Production Setup (Vercel)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  PRODUCTION (https://greenlifesolarsolution.com)                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                       â”‚
â”‚  User Action (Purchase/Request)                                      â”‚
â”‚         â”‚                                                             â”‚
â”‚         â–¼                                                             â”‚
â”‚  Frontend detects: window.location.hostname !== 'localhost'          â”‚
â”‚         â”‚                                                             â”‚
â”‚         â–¼                                                             â”‚
â”‚  Calls: /api/send-email (relative path)                              â”‚
â”‚         â”‚                                                             â”‚
â”‚         â–¼                                                             â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”            â”‚
â”‚  â”‚  Vercel Serverless Function                         â”‚            â”‚
â”‚  â”‚  â€¢ File: api/send-email.ts                          â”‚            â”‚
â”‚  â”‚  â€¢ Reads RESEND_API_KEY from Vercel env vars       â”‚            â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜            â”‚
â”‚                          â”‚                                            â”‚
â”‚                          â”‚ Forwards to                                â”‚
â”‚                          â–¼                                            â”‚
â”‚                  Resend API                                           â”‚
â”‚                  (https://api.resend.com)                             â”‚
â”‚                          â”‚                                            â”‚
â”‚                          â–¼                                            â”‚
â”‚                  ðŸ“§ Email Delivered                                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
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
  ? 'http://localhost:3001/api/send-email'  // ðŸ  Local
  : '/api/send-email';                       // ðŸŒ Production
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
  console.log('âœ… Email sent successfully!');
  // Show success message to user
} else {
  console.error('âŒ Email failed:', await response.json());
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
â”œâ”€â”€ RESEND_API_KEY           # Your Resend API key
â”œâ”€â”€ RESEND_FROM_EMAIL        # Sender email address
â””â”€â”€ ADMIN_EMAIL              # Admin notification email

api-server.js                 # Local development email server
api/send-email.ts            # Production serverless function

src/lib/
â”œâ”€â”€ sendEmailRequest.ts      # Core email sending logic
â”œâ”€â”€ sendOrderEmail.ts        # Order confirmation emails
â”œâ”€â”€ sendServiceRequestEmail.ts  # Service request emails
â”œâ”€â”€ sendLowStockAlert.ts     # Inventory alerts
â””â”€â”€ emailTemplates.ts        # HTML email templates
```

---

## Environment Variables

### Local Development (.env)
```env
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=YOUR_VERIFIED_SENDER_ADDRESS
ADMIN_EMAIL=YOUR_ADMIN_NOTIFICATION_ADDRESS
```

### Production (Vercel Dashboard)
```
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=YOUR_VERIFIED_SENDER_ADDRESS
ADMIN_EMAIL=YOUR_ADMIN_NOTIFICATION_ADDRESS
SUPPORT_EMAIL=YOUR_SUPPORT_CONTACT_ADDRESS
```

---

## Testing Flow

```
1. Start API Server
   $ node api-server.js
   âœ… Email API server running on http://localhost:3001

2. Start Dev Server
   $ npm run dev
   âœ… Vite dev server running on http://localhost:5173

3. Open Browser
   â†’ http://localhost:5173

4. Open DevTools Console (F12)

5. Trigger Email Action
   â€¢ Complete a purchase
   â€¢ Submit service request
   â€¢ Trigger low stock alert

6. Check Console Output
   ðŸ“§ Sending email via http://localhost:3001/api/send-email
   ðŸ“¬ Email API Response Status: 200
   âœ… Email sent successfully! {id: "abc123"}

7. Check Email Inbox
   ðŸ“¬ Email received!
```

---

## Troubleshooting Decision Tree

```
Email not working?
â”‚
â”œâ”€ Are you in local development?
â”‚  â”‚
â”‚  â”œâ”€ YES â†’ Is api-server.js running?
â”‚  â”‚  â”‚
â”‚  â”‚  â”œâ”€ NO â†’ Run: node api-server.js
â”‚  â”‚  â”‚
â”‚  â”‚  â””â”€ YES â†’ Is RESEND_API_KEY in .env?
â”‚  â”‚     â”‚
â”‚  â”‚     â”œâ”€ NO â†’ Add to .env file
â”‚  â”‚     â”‚
â”‚  â”‚     â””â”€ YES â†’ Check browser console for errors
â”‚  â”‚
â”‚  â””â”€ NO (Production) â†’ Are env vars set in Vercel?
â”‚     â”‚
â”‚     â”œâ”€ NO â†’ Add in Vercel dashboard
â”‚     â”‚
â”‚     â””â”€ YES â†’ Check Resend dashboard for delivery status
â”‚
â””â”€ Check spam folder / Verify email address
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

âœ… **Local Development Working:**
- API server shows: `âœ… Email API server running`
- Browser console shows: `âœ… Email sent successfully!`
- API server logs: `âœ… Email sent successfully! ID: abc123`
- Email arrives in inbox

âœ… **Production Working:**
- Browser console shows: `âœ… Email sent successfully!`
- Email arrives in inbox
- Resend dashboard shows successful delivery
- No errors in Vercel logs
