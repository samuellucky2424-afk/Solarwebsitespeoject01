# Email System Flow & Integration Guide

## System Overview

When a user submits the consultation form, the system:

1. **Collects Form Data** - Property details, appliances, contact info
2. **Validates Input** - Ensures all required fields are filled
3. **Saves to Database** - Stores request in Supabase via AdminContext
4. **Sends Emails** - Sends two HTML emails (admin notification + customer confirmation)
5. **Shows Confirmation** - Displays success message to user

## Email Flow Diagram

```
User Submits Form
    ↓
ConsultationForm.tsx → handleSubmit()
    ↓
[Validate & Prepare Data]
    ↓
addRequest() → Save to Supabase
    ↓
sendConsultationEmails() → Email Service
    ↓
Email 1: Admin Notification          Email 2: Customer Confirmation
├─ To: infogreenlifetechnology...   ├─ To: customer email
├─ Subject: New Consultation...     ├─ Subject: Your Solar Consultation
├─ Content: Full Details            ├─ Content: Confirmation + Next Steps
└─ Actions: Reply/Dashboard         └─ Info: What happens next
    ↓
User Sees Success Page
```

## File Structure

```
src/
├── lib/
│   ├── emailTemplates.ts
│   │   ├── generateAdminEmailHTML()     → Admin email HTML
│   │   └── generateCustomerEmailHTML()  → Customer email HTML
│   └── sendConsultationEmail.ts
│       ├── SendConsultationEmailParams  → Type definitions
│       └── sendConsultationEmails()     → Main function
│
api/
└── send-email.ts
    └── POST /api/send-email            → Resend API endpoint

pages/
└── PublicPages/
    └── ConsultationForm.tsx
        └── handleSubmit()               → Form submission logic
```

## Data Flow in Detail

### 1. Form Data Collection
```typescript
const formData = {
  propertyData: {
    address: string,
    roofType: string,
    housingType: 'bungalow' | 'upstairs' | 'duplex'
  },
  applianceData: QuoteSelectionInput {
    bedroomCount: number,
    fans: number,
    tvs: number,
    fridges: number,
    fridgeType: string,
    acCount: number,
    acType: string,
    washingMachineCount: number,
    washingMachineType: string,
    washingMachineSize: string,
    additionalAppliances: string[]
  },
  contactData: {
    firstName: string,
    lastName: string,
    email: string,
    phone: string
  },
  selectedQuote: QuoteRecommendation
}
```

### 2. Request Creation
```typescript
const request = {
  id: `consultation-${Date.now()}`,
  title: string,
  type: 'Consultation Request',
  customer: string,
  address: string,
  date: ISO timestamp,
  status: 'New',
  priority: 'Normal',
  description: detailed text,
  phone: string,
  email: string,
  packageId: string
}
```

### 3. Email Parameters
```typescript
const emailParams = {
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  propertyAddress: string,
  roofType: string,
  housingType: string,
  bedroomCount: number,
  fans: number,
  tvs: number,
  fridges: number,
  fridgeType: string,
  acCount: number,
  acType: string,
  washingMachineCount: number,
  washingMachineType: string,
  washingMachineSize: string,
  additionalAppliances: string[],
  selectedQuote: QuoteRecommendation,
  adminEmail: string,
  submissionDate: ISO timestamp
}
```

### 4. Email Sending
```
sendConsultationEmails(emailParams)
    ↓
Generate Admin HTML Email ← emailTemplates.generateAdminEmailHTML()
    ↓
POST /api/send-email {
  to: params.adminEmail,
  subject: "New Consultation Request",
  html: adminHTML,
  replyTo: params.customerEmail,
  tags: { category, type, customerEmail }
}
    ↓
Resend API
    ↓
Returns: { id: string, success: boolean }
    ↓
Generate Customer HTML Email ← emailTemplates.generateCustomerEmailHTML()
    ↓
POST /api/send-email {
  to: params.customerEmail,
  subject: "Your Solar Consultation Request",
  html: customerHTML,
  tags: { category, type, customerEmail }
}
    ↓
Resend API
    ↓
Returns: { id: string, success: boolean }
```

## Key Functions

### 1. sendConsultationEmails()
**Location**: `src/lib/sendConsultationEmail.ts`

**Purpose**: Main function that orchestrates email sending

**Parameters**: SendConsultationEmailParams

**Returns**: 
```typescript
{
  success: boolean,
  adminEmailId?: string,
  customerEmailId?: string,
  error?: string
}
```

**Flow**:
1. Prepares email data with timestamp
2. Generates admin email HTML
3. Sends admin email via Resend
4. Generates customer email HTML
5. Sends customer email via Resend
6. Returns success/error status

### 2. generateAdminEmailHTML()
**Location**: `src/lib/emailTemplates.ts`

**Purpose**: Generate professional HTML email for admin

**Content**:
- Customer info (name, email, phone, submission date)
- Property details (address, roof type, housing type, bedrooms)
- Appliance configuration (all selected appliances)
- Selected solar package (specs, price, load coverage)
- Match score and notes
- Action buttons (reply, view dashboard)

**Styling**:
- Responsive design
- Professional color scheme (green theme)
- Clear section headers
- Easy-to-read tables and grids

### 3. generateCustomerEmailHTML()
**Location**: `src/lib/emailTemplates.ts`

**Purpose**: Generate friendly HTML email for customer

**Content**:
- Greeting and thanks
- Selected package summary
- What happens next (24-hour follow-up)
- Contact information
- Process timeline (5 steps)
- Link to website

**Styling**:
- Customer-friendly tone
- Clear next steps
- Visual hierarchy
- Action buttons

## API Endpoint

### POST /api/send-email

**Request Body**:
```json
{
  "to": "recipient@example.com",
  "subject": "Email Subject",
  "html": "<html>...</html>",
  "replyTo": "optional@example.com",
  "tags": {
    "category": "consultation",
    "type": "admin-notification",
    "customerEmail": "customer@example.com"
  }
}
```

**Response (Success)**:
```json
{
  "success": true,
  "id": "email_sent_id_12345",
  "message": "Email sent successfully"
}
```

**Response (Error)**:
```json
{
  "success": false,
  "error": "Email validation error",
  "details": { ... }
}
```

**Environment Variables Required**:
- `RESEND_API_KEY`: Resend API key
- `RESEND_FROM_EMAIL`: Email sender address

## Error Handling

### Form Level
- Validates all required fields before submission
- Shows error toast if submission fails
- Allows user to retry

### Email Level
- Admin email failure doesn't block user completion
- Customer email failure is logged but doesn't prevent success
- API returns detailed error messages

### Database Level
- Request saved to Supabase via AdminContext
- Email sending is separate transaction
- Database save is critical, emails are secondary

## Testing

### Unit Test Example
```typescript
import { sendConsultationEmails } from '@/src/lib/sendConsultationEmail';

const mockParams = {
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  // ... other required fields
};

const result = await sendConsultationEmails(mockParams);
expect(result.success).toBe(true);
expect(result.adminEmailId).toBeDefined();
expect(result.customerEmailId).toBeDefined();
```

### Integration Test
1. Fill out consultation form completely
2. Select a solar package
3. Enter contact information
4. Click Submit
5. Verify success page appears
6. Check admin email inbox
7. Check customer email inbox

## Email Customization

### Change Colors
Edit `emailTemplates.ts`:
```css
/* Admin email primary color */
.header { background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%); }

/* Customer email theme color */
.quote-price { color: #your-color; }
```

### Change Text
Edit the strings in `generateAdminEmailHTML()` and `generateCustomerEmailHTML()`

### Add/Remove Sections
Modify the template functions to include/exclude sections

### Change Layout
Modify CSS in the `<style>` block of the templates

## Monitoring

### In Resend Dashboard
1. View email delivery status
2. Track open rates (if enabled)
3. Monitor bounce/spam rates
4. View analytics by tag

### In Application Logs
1. Check console for sendConsultationEmails() response
2. Monitor database for request creation

### Email Test
Send a test email:
```bash
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test",
    "html": "<h1>Test Email</h1>"
  }'
```

## Best Practices

1. **Always validate email addresses** - Use email input type
2. **Sanitize HTML** - Resend handles this, but be careful with user data
3. **Use meaningful subject lines** - Makes emails easy to find
4. **Include reply-to address** - Allows easy customer responses
5. **Test before production** - Send test emails to yourself
6. **Monitor delivery rates** - Check dashboard regularly
7. **Handle errors gracefully** - Show user-friendly error messages

---

**Last Updated**: April 2026
**Integration Status**: Production Ready
