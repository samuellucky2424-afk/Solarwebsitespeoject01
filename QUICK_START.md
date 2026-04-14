# 🚀 Quick Start - Email Notifications

## The Problem
Your email notifications weren't working because the email API endpoint only exists on Vercel (production), not in local development.

## The Solution
I've created a local development email server that runs alongside your Vite dev server.

---

## Setup (One-Time)

### 1. Install Required Dependencies
```bash
npm install express cors dotenv
```

### 2. Get Your Resend API Key
1. Visit https://resend.com/
2. Sign up or log in
3. Go to **API Keys**
4. Click **Create API Key**
5. Copy the key (starts with `re_`)

### 3. Add to Your .env File
Open your `.env` file and add:
```env
RESEND_API_KEY=re_your_actual_key_here
RESEND_FROM_EMAIL=noreply@greenlifesolarsolution.com
ADMIN_EMAIL=infogreenlifetechnology@gmail.com
```

---

## Running the Application

### Option A: Run Both Servers Manually

**Terminal 1 - Email API Server:**
```bash
node api-server.js
```
Wait for: `✅ Email API server running on http://localhost:3001`

**Terminal 2 - Vite Dev Server:**
```bash
npm run dev
```

### Option B: Run Both Servers Together (Recommended)
First install concurrently:
```bash
npm install -D concurrently
```

Then run:
```bash
npm run dev:all
```

This starts both servers at once!

---

## Testing Email Notifications

1. **Open your browser** to http://localhost:5173
2. **Open DevTools** (Press F12)
3. **Go to Console tab**
4. **Test any of these:**
   - Complete a purchase (checkout page)
   - Submit a service request
   - Trigger a low stock alert

### What You Should See:
```
📧 Sending email via http://localhost:3001/api/send-email
📬 Email API Response Status: 200
✅ Email sent successfully! {id: "abc123"}
```

### In the API Server Terminal:
```
📧 Incoming email request: Order Confirmation → customer@email.com
✅ Email sent successfully! ID: abc123
```

---

## Troubleshooting

### "RESEND_API_KEY not found"
- Check your `.env` file has `RESEND_API_KEY=re_...`
- Make sure there are no spaces around the `=`
- Restart the api-server after adding the key

### "fetch failed" or Network Error
- Make sure `api-server.js` is running on port 3001
- Check the terminal for error messages
- Try: `curl http://localhost:3001/api/health`

### Emails Not Arriving
- Check spam/junk folder
- Verify email address is correct
- Check Resend dashboard: https://resend.com/emails
- For production use, verify your domain in Resend

### Port 3001 Already in Use
Kill the process using port 3001:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill -9
```

---

## Production Deployment (Vercel)

When you're ready to deploy:

1. **Add Environment Variables in Vercel:**
   - Go to https://vercel.com/dashboard
   - Select your project → Settings → Environment Variables
   - Add:
     ```
     RESEND_API_KEY=re_your_key
     RESEND_FROM_EMAIL=noreply@greenlifesolarsolution.com
     ADMIN_EMAIL=infogreenlifetechnology@gmail.com
     ```

2. **Deploy:**
   ```bash
   git add .
   git commit -m "Enable email notifications"
   git push
   ```

3. **Test on Production:**
   - Visit your live site
   - Test email notifications
   - Check console for success messages

---

## Files Changed

✅ **api-server.js** (NEW) - Local email API server  
✅ **src/lib/sendEmailRequest.ts** - Auto-detects local vs production  
✅ **src/lib/sendLowStockAlert.ts** - Auto-detects local vs production  
✅ **package.json** - Added helpful scripts  
✅ **.env.example** - Updated with email config  

---

## Need More Help?

See the detailed guides:
- **EMAIL_FIX_GUIDE.md** - Complete troubleshooting guide
- **EMAIL_DEBUGGING_GUIDE.md** - Advanced debugging
- **EMAIL_SETUP.md** - Original setup documentation

---

## Summary

✅ Email notifications now work in local development  
✅ Automatic detection of local vs production  
✅ Clear console logging for debugging  
✅ Ready for Vercel deployment  

**Next Steps:**
1. Install dependencies: `npm install express cors dotenv`
2. Add `RESEND_API_KEY` to `.env`
3. Run: `node api-server.js` (Terminal 1)
4. Run: `npm run dev` (Terminal 2)
5. Test email notifications!
