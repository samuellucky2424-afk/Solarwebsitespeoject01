# Greenlife Solar - Email Configuration Guide

## Overview
The consultation request form now sends automated emails to both the admin and the customer when a submission is made. This uses the Resend email service API.

## Setup Instructions

### 1. Install Resend (Optional)
If you want to use the Resend SDK instead of direct HTTP calls:

```bash
npm install resend
```

### 2. Get Your Resend API Key
1. Go to [Resend.com](https://resend.com)
2. Sign up for a free account
3. Navigate to **API Keys** in your dashboard
4. Copy your API key

### 3. Configure Environment Variables

#### For Vercel Deployment:
1. Go to your Vercel project settings
2. Click **Environment Variables**
3. Add the following variables:

```
RESEND_API_KEY=<your-api-key-here>
RESEND_FROM_EMAIL=noreply@greenlifesolar.com
ADMIN_EMAIL=infogreenlifetechnology@gmail.com
```

#### For Local Development:
Create a `.env.local` file in the root of your project:

```env
VITE_RESEND_API_KEY=<your-api-key-here>
RESEND_FROM_EMAIL=noreply@greenlifesolar.com
ADMIN_EMAIL=infogreenlifetechnology@gmail.com
```

### 4. Verify Your Domain (Production)
For production emails, verify your domain with Resend:

1. In Resend dashboard, go to **Domains**
2. Add your domain (e.g., `greenlifesolar.com`)
3. Add the provided DNS records to your domain
4. Update your from email to use the verified domain

For development, use Resend's test domain.

### 5. API Endpoint Setup

#### Option A: Vercel Serverless Functions (Recommended)
Place the email sending endpoint at: `api/send-email.ts`

The endpoint is already configured to handle POST requests with:
- `to`: recipient email
- `subject`: email subject
- `html`: email HTML content
- `replyTo`: reply to email (optional)
- `tags`: email tags for analytics (optional)

#### Option B: Traditional Backend Server
If you have a Node.js backend, use the example in `api/send-email.ts` and adapt it to your framework.

### 6. Test the Integration

#### Test with Sample Request:
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h1>Test</h1>"
  }'
```

#### Test via UI:
1. Fill out the consultation form
2. Complete all steps
3. Click Submit
4. Check both:
   - Admin email (infogreenlifetechnology@gmail.com)
   - Customer email for confirmation

### 7. Email Templates

The system includes two email templates:

#### Admin Email
- **Location**: [emailTemplates.ts](src/lib/emailTemplates.ts)
- **Function**: `generateAdminEmailHTML()`
- **Content**: Full customer details, appliance configuration, selected package, and action items

#### Customer Email
- **Location**: [emailTemplates.ts](src/lib/emailTemplates.ts)
- **Function**: `generateCustomerEmailHTML()`
- **Content**: Consultation confirmation, selected package details, next steps

### 8. Customizing Email Templates

To customize the email templates:

1. Open `src/lib/emailTemplates.ts`
2. Modify the HTML content in either function
3. Update colors, text, and structure as needed
4. Test by submitting the form

### 9. Email Delivery Status

Monitor email delivery in your Resend dashboard:
- Delivered emails
- Bounced emails
- Opened emails (if tracking enabled)
- Clicked links

### 10. Troubleshooting

#### Emails Not Sending

**Check 1: API Key**
```typescript
// Verify RESEND_API_KEY is set
console.log(process.env.RESEND_API_KEY ? 'API Key configured' : 'API Key missing');
```

**Check 2: Email Validation**
- Ensure email addresses are valid
- Check spam folder for undelivered emails

**Check 3: Rate Limiting**
- Resend has rate limits on free tier
- Check dashboard for any errors

**Check 4: Logs**
- Check browser console for client-side errors
- Check server logs for API response errors

#### 500 Error on Email Send
1. Verify RESEND_API_KEY environment variable is set
2. Check that the API key is valid and not expired
3. Ensure the from email is configured correctly

#### Emails Going to Spam
1. Set up DKIM/SPF records for your domain
2. Use email authentication (DMARC)
3. Test with Resend's test email first
4. Warm up your sending domain gradually

### 11. Resend Pricing

**Free Tier:**
- 100 emails per day
- Full feature access
- Perfect for testing

**Paid Plans:**
- Pay per email sent
- Higher daily limits
- Advanced analytics

### 12. Alternative Email Services

If you prefer other services, you can swap Resend for:

- **SendGrid**: Industry-leading email delivery
- **Mailgun**: Developer-friendly API
- **AWS SES**: Scalable and cost-effective
- **Nodemailer**: Simple, works with any SMTP server

Replace the API call in `src/lib/sendConsultationEmail.ts` with your chosen service.

### 13. Security Best Practices

1. **Never commit API keys to git**
   - Use environment variables only
   - Add `.env.local` to `.gitignore`

2. **Validate all input**
   - Email addresses are validated on form submission
   - Sanitize HTML before sending

3. **Use HTTPS only**
   - All email endpoints require HTTPS in production
   - Test with HTTPS in development

4. **Rate limiting**
   - Implement rate limiting on your backend
   - Prevent abuse of email endpoint

### 14. Files Reference

| File | Purpose |
|------|---------|
| `src/lib/emailTemplates.ts` | HTML email templates |
| `src/lib/sendConsultationEmail.ts` | Email sending logic |
| `api/send-email.ts` | Serverless endpoint |
| `pages/PublicPages/ConsultationForm.tsx` | Form with email integration |

### 15. Next Steps

1. Set up Resend account (if not already done)
2. Configure environment variables
3. Deploy to Vercel or your hosting
4. Test email sending on production
5. Monitor delivery in Resend dashboard
6. Customize templates to match your branding

## Support

For issues with:
- **Resend API**: Visit [Resend docs](https://resend.com/docs)
- **This integration**: Check the code comments in `src/lib/sendConsultationEmail.ts`
- **Email templates**: Modify `src/lib/emailTemplates.ts`

---

**Last Updated**: April 2026
**Status**: Production Ready
