/**
 * Test Service Request Email Templates
 * Tests emails for: Maintenance, Site Survey, and Package Requests
 */

import fs from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
const envPath = new URL('.env', import.meta.url);
let RESEND_API_KEY = '';
let RESEND_FROM_EMAIL = '';
let ADMIN_EMAIL = '';

try {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    if (line.includes('RESEND_API_KEY=')) {
      RESEND_API_KEY = line.split('=')[1].trim();
    }
    if (line.includes('RESEND_FROM_EMAIL=')) {
      RESEND_FROM_EMAIL = line.split('=')[1].trim();
    }
    if (line.includes('ADMIN_EMAIL=')) {
      ADMIN_EMAIL = line.split('=')[1].trim();
    }
  });
} catch (e) {
  console.error('Error loading .env file');
}

// Sample service requests
const maintenanceRequest = {
  requestId: 'SVC-2026-04-001',
  requestType: 'Maintenance Request',
  customerName: 'Samuel Lucky',
  customerEmail: 'samuellucky2424@gmail.com',
  customerPhone: '+234 803-123-4567',
  address: '123 Solar Street, Lagos, Nigeria',
  date: new Date().toISOString(),
  issueType: 'Inverter Fault',
  description: 'The inverter is showing red light and beeping. Not converting solar power properly. System has been offline for 2 days.',
  priority: 'High'
};

const surveyRequest = {
  requestId: 'SVC-2026-04-002',
  requestType: 'Site Survey Request',
  customerName: 'Chioma Okafor',
  customerEmail: 'chioma.okafor@email.com',
  customerPhone: '+234 701-234-5678',
  address: '456 Green Avenue, Abuja, Nigeria',
  date: new Date().toISOString(),
  time: '2:00 PM - 4:00 PM',
  description: 'I want to install a solar system on my 4-bedroom house. Need a professional assessment of my roof and power requirements.',
  priority: 'Normal'
};

const packageRequest = {
  requestId: 'SVC-2026-04-003',
  requestType: 'Package Request',
  customerName: 'Ikechukwu Nnamdi',
  customerEmail: 'ikechukwu.n@email.com',
  customerPhone: '+234 905-678-9012',
  address: '789 Power Lane, Port Harcourt, Nigeria',
  date: new Date().toISOString(),
  description: 'Interested in upgrading from the Basic package to the Standard package. Current system is generating good power, but want more capacity for my expanding business.',
  priority: 'Normal'
};

// Email template functions
function generateServiceRequestAdminEmailHTML(data) {
  const priorityColor = data.priority === 'Urgent' ? '#dc3545' : data.priority === 'High' ? '#ff9800' : '#17a2b8';
  const priorityBgColor = data.priority === 'Urgent' ? '#f8d7da' : data.priority === 'High' ? '#fff3cd' : '#d1ecf1';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .email-wrapper { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header p { opacity: 0.9; font-size: 14px; }
    .priority-badge { display: inline-block; background: ${priorityBgColor}; color: ${priorityColor}; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-top: 10px; }
    .content { padding: 25px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 14px; font-weight: 700; color: #0d1b0f; margin-bottom: 12px; border-bottom: 2px solid #4c9a52; padding-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .info-item { background: #f8fcf8; padding: 12px; border-radius: 6px; border-left: 3px solid #4c9a52; }
    .info-label { font-size: 11px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
    .info-value { font-size: 13px; color: #0d1b0f; font-weight: 500; }
    .info-value a { color: #4c9a52; text-decoration: none; }
    .description-box { background: #f8fcf8; padding: 15px; border-radius: 6px; border: 1px solid #e7f3e8; }
    .description-box strong { color: #0d1b0f; display: block; margin-bottom: 8px; }
    .description-box p { font-size: 13px; color: #666; line-height: 1.5; white-space: pre-wrap; }
    .action-section { background: #f8fcf8; padding: 20px; border-radius: 6px; text-align: center; margin-top: 25px; border-left: 4px solid #4c9a52; }
    .action-button { display: inline-block; background: #4c9a52; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-weight: 600; margin: 8px 5px; font-size: 13px; }
    .action-button:hover { background: #0d1b0f; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e7f3e8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>🔧 New Service Request</h1>
        <p>${data.requestType}</p>
        <div class="priority-badge">${data.priority} Priority</div>
      </div>

      <div class="content">
        <!-- Customer Information -->
        <div class="section">
          <h2 class="section-title">👤 Customer Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Name</div>
              <div class="info-value">${data.customerName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Request ID</div>
              <div class="info-value">${data.requestId}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value"><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></div>
            </div>
            <div class="info-item">
              <div class="info-label">Phone</div>
              <div class="info-value"><a href="tel:${data.customerPhone}">${data.customerPhone}</a></div>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
              <div class="info-label">Service Address</div>
              <div class="info-value">${data.address}</div>
            </div>
          </div>
        </div>

        <!-- Request Details -->
        <div class="section">
          <h2 class="section-title">📋 Request Details</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Request Type</div>
              <div class="info-value">${data.requestType}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Submitted</div>
              <div class="info-value">${new Date(data.date).toLocaleString()}</div>
            </div>
            ${data.time ? `
              <div class="info-item">
                <div class="info-label">Preferred Time</div>
                <div class="info-value">${data.time}</div>
              </div>
            ` : ''}
            ${data.issueType ? `
              <div class="info-item">
                <div class="info-label">Issue Type</div>
                <div class="info-value">${data.issueType}</div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Description -->
        <div class="section">
          <h2 class="section-title">📝 Description</h2>
          <div class="description-box">
            <p>${data.description}</p>
          </div>
        </div>

        <!-- Action Section -->
        <div class="action-section">
          <h3 style="color: #0d1b0f; margin-bottom: 12px; font-size: 14px;">Next Steps</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 15px;">Please contact the customer to confirm the service appointment and provide more details.</p>
          <a href="mailto:${data.customerEmail}?subject=Re: Your Service Request" class="action-button">📧 Reply to Customer</a>
          <a href="#" class="action-button">📊 View Dashboard</a>
        </div>
      </div>

      <div class="footer">
        <p><strong>Greenlife Solar Solutions Limited</strong></p>
        <p>Total Plaza, 78 Old Lagos-Asaba Rd, Agbor, Delta</p>
        <p>📞 0903 657 0294 | 📧 support@greenlifesolarsolution.com</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

function generateServiceRequestCustomerEmailHTML(data) {
  const requestTypeIcon = data.requestType === 'Maintenance Request' ? '🔧' : 
                           data.requestType === 'Site Survey Request' ? '📍' : '📦';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .email-wrapper { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { font-size: 22px; margin-bottom: 8px; }
    .header p { opacity: 0.9; font-size: 14px; }
    .content { padding: 25px; }
    .success-box { background: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
    .success-box h3 { color: #1b5e20; font-size: 14px; margin-bottom: 8px; font-weight: 700; }
    .success-box p { font-size: 13px; color: #2e7d32; line-height: 1.5; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: 700; color: #0d1b0f; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-box { background: #f8fcf8; padding: 12px; border-radius: 6px; border-left: 3px solid #4c9a52; margin-bottom: 10px; }
    .info-box strong { color: #0d1b0f; }
    .info-box p { font-size: 13px; color: #666; margin-top: 4px; }
    .highlight-box { background: #fffbea; border-left: 3px solid #ffc107; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .highlight-box p { font-size: 13px; color: #856404; line-height: 1.5; margin: 0; }
    .support-box { background: #e3f2fd; border-left: 3px solid #2196F3; padding: 15px; border-radius: 6px; margin-top: 20px; }
    .support-box h4 { color: #1565c0; font-size: 13px; margin-bottom: 8px; font-weight: 700; }
    .support-box p { font-size: 12px; color: #0d47a1; margin-bottom: 6px; }
    .support-box p:last-child { margin-bottom: 0; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e7f3e8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>✅ ${requestTypeIcon} Request Received</h1>
        <p>Thank you for submitting your service request</p>
      </div>

      <div class="content">
        <!-- Success Message -->
        <div class="success-box">
          <h3>Your request has been received!</h3>
          <p>We have successfully received your ${data.requestType.toLowerCase()} and our team is reviewing it. We will get back to you shortly to confirm the details and schedule the service.</p>
        </div>

        <!-- Request Summary -->
        <div class="section">
          <h2 class="section-title">📋 Request Summary</h2>
          <div class="info-box">
            <strong>Request ID:</strong>
            <p>${data.requestId}</p>
          </div>
          <div class="info-box">
            <strong>Type:</strong>
            <p>${data.requestType}</p>
          </div>
          <div class="info-box">
            <strong>Service Address:</strong>
            <p>${data.address}</p>
          </div>
          <div class="info-box">
            <strong>Submitted On:</strong>
            <p>${new Date(data.date).toLocaleString()}</p>
          </div>
        </div>

        <!-- What's Next -->
        <div class="highlight-box">
          <p><strong>What's Next?</strong> Our team is processing your request and will contact you within 24 hours at <strong>${data.customerPhone}</strong> to confirm the appointment and provide you with more details about the service.</p>
        </div>

        <!-- Support Section -->
        <div class="support-box">
          <h4>📞 Have Questions?</h4>
          <p><strong>Email:</strong> support@greenlifesolarsolution.com</p>
          <p><strong>Phone:</strong> 0903 657 0294</p>
          <p>Feel free to reach out if you need to reschedule or have any questions about your request.</p>
        </div>

        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 25px;">
          We appreciate your trust in Greenlife Solar Solutions. Our team is committed to providing you with excellent service!
        </p>
      </div>

      <div class="footer">
        <p><strong>Greenlife Solar Solutions Limited</strong></p>
        <p>Total Plaza, 78 Old Lagos-Asaba Rd, Agbor, Delta</p>
        <p>© 2026 Greenlife Solar Solutions. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// Main function
async function testServiceRequestEmails() {
  console.log('🧪 Testing Service Request Email Templates');
  console.log('=========================================\n');

  const requests = [maintenanceRequest, surveyRequest, packageRequest];
  
  for (const request of requests) {
    console.log(`📮 Testing: ${request.requestType}`);
    console.log(`   Customer: ${request.customerName}`);
    console.log(`   Request ID: ${request.requestId}\n`);

    // Generate HTML previews
    const adminHTML = generateServiceRequestAdminEmailHTML(request);
    const customerHTML = generateServiceRequestCustomerEmailHTML(request);

    // Save preview files
    const safeType = request.requestType.replace(/\s+/g, '-').toLowerCase();
    const adminPreviewPath = `service-request-${safeType}-admin-preview.html`;
    const customerPreviewPath = `service-request-${safeType}-customer-preview.html`;

    fs.writeFileSync(adminPreviewPath, adminHTML);
    fs.writeFileSync(customerPreviewPath, customerHTML);

    console.log(`✓ Admin preview saved: ${adminPreviewPath}`);
    console.log(`✓ Customer preview saved: ${customerPreviewPath}\n`);
  }

  console.log('========================================');
  console.log('✓ All service request email templates generated!');
  console.log('✓ Admin email: Notification with priority badge & contact info');
  console.log('✓ Customer email: Thank you message with request summary');
  console.log('========================================');
}

// Run tests
testServiceRequestEmails().catch(error => {
  console.error('Error testing service request emails:', error);
  process.exit(1);
});
