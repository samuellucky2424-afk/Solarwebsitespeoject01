#!/usr/bin/env node

/**
 * Test script to simulate a consultation form submission
 * and test the email sending functionality
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file
function readEnvFile() {
  const envPath = path.resolve(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};

  content.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      env[key.trim()] = valueParts.join('=').trim();
    }
  });

  return env;
}

const envVars = readEnvFile();
const RESEND_API_KEY = envVars.RESEND_API_KEY;
const RESEND_FROM_EMAIL = envVars.RESEND_FROM_EMAIL;
const ADMIN_EMAIL = envVars.ADMIN_EMAIL;

// Sample quote data (matching the application)
const sampleQuote = {
  id: 'power-tank-student',
  title: '10kVA 48V Hybrid System',
  tagline: 'Complete Solar Solution with Battery Backup',
  inverter: '10kVA Hybrid Inverter',
  battery: '15kWh LiFePOâ‚„ Battery',
  panels: '20 x 550W Solar Panels',
  loadText: 'Perfect for Family homes with AC, Refrigerator, Washing Machine',
  recommendedProperty: '4-5 Bedroom House',
  price: 3500000,
  maxBedrooms: 5,
  allowedHousing: ['bungalow', 'upstairs', 'duplex'],
  maxFans: 10,
  maxTVs: 4,
  maxFridges: 2,
  supportedFridgeTypes: ['double-door', 'side-by-side'],
  maxAc: 3,
  maxWashingMachines: 2,
  supportsHeavyWashingMachine: true,
  supportsEvCharging: true,
  supportedExtras: ['EV charging (car charging)', 'Pumping machine', 'Electric cooker'],
};

// Sample consultation request data
const consultationData = {
  customerName: 'Samuel Lucky',
  customerEmail: 'customer.one@example.com',
  customerPhone: '+234 803-123-4567',
  propertyAddress: '123 Lekki Phase 1, Lagos, Nigeria',
  roofType: 'Concrete (Flat)',
  housingType: 'bungalow',
  bedroomCount: 4,
  fans: 6,
  tvs: 3,
  fridges: 2,
  fridgeType: 'double-door',
  acCount: 2,
  acType: '1.5hp',
  washingMachineCount: 1,
  washingMachineType: 'fully-automatic',
  washingMachineSize: 'large',
  additionalAppliances: ['Electric cooker', 'Water heater'],
  selectedQuote: {
    quote: sampleQuote,
    score: 92,
    isStrongMatch: true,
    notes: [
      'This package will comfortably handle all your appliances',
      'The 15kWh battery provides 24-hour backup',
      'Expandable to add more panels in the future',
    ],
  },
};

async function generateAdminEmailHTML() {
  const submissionDate = new Date().toISOString();
  const data = {
    ...consultationData,
    submissionDate,
    adminEmail: ADMIN_EMAIL,
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.4; color: #333; background: #f5f7fa; }
    .container { width: 100%; max-width: 100%; margin: 0; padding: 0; background: #f5f7fa; }
    .email-wrapper { background: white; width: 100%; margin: 0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 30px 20px; text-align: center; width: 100%; }
    .header h1 { font-size: 22px; margin-bottom: 8px; }
    .header p { font-size: 12px; opacity: 0.9; }
    .content { padding: 20px; width: 100%; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: 600; color: #0d1b0f; margin-bottom: 10px; border-bottom: 2px solid #4c9a52; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th { background: #4c9a52; color: white; padding: 8px; text-align: left; font-size: 11px; font-weight: 600; }
    td { padding: 8px; border-bottom: 1px solid #e7f3e8; font-size: 12px; }
    tr:nth-child(even) { background: #f8fcf8; }
    .label { font-weight: 600; color: #0d1b0f; width: 40%; }
    .value { color: #666; }
    .quote-card { background: linear-gradient(135deg, #f8fcf8 0%, #f0f5f1 100%); border-left: 3px solid #4c9a52; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .quote-title { font-size: 14px; font-weight: 600; color: #0d1b0f; margin-bottom: 8px; }
    .quote-price { font-size: 18px; font-weight: 700; color: #4c9a52; margin: 8px 0; }
    .quote-details { font-size: 11px; line-height: 1.5; }
    .quote-details strong { color: #0d1b0f; }
    .quote-tagline { color: #4c9a52; font-size: 11px; margin-bottom: 8px; font-style: italic; }
    .badge { display: inline-block; background: #4c9a52; color: white; padding: 3px 10px; border-radius: 15px; font-size: 10px; font-weight: 600; margin-right: 5px; }
    .action-section { background: #f8fcf8; padding: 15px; border-radius: 6px; text-align: center; margin-top: 20px; border: 1px solid #e7f3e8; }
    .action-button { display: inline-block; background: #4c9a52; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600; font-size: 12px; }
    .footer { background: #f8fcf8; padding: 15px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #e7f3e8; width: 100%; }
    .footer p { margin-bottom: 3px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>New Consultation Request</h1>
        <p>A customer has submitted their solar consultation form</p>
      </div>

      <div class="content">
        <!-- Customer Information -->
        <div class="section">
          <h2 class="section-title">Customer Information</h2>
          <table>
            <tr>
              <td class="label">Full Name</td>
              <td class="value">${data.customerName}</td>
            </tr>
            <tr>
              <td class="label">Email Address</td>
              <td class="value"><a href="mailto:${data.customerEmail}" style="color: #4c9a52; text-decoration: none;">${data.customerEmail}</a></td>
            </tr>
            <tr>
              <td class="label">Phone Number</td>
              <td class="value"><a href="tel:${data.customerPhone}" style="color: #4c9a52; text-decoration: none;">${data.customerPhone}</a></td>
            </tr>
            <tr>
              <td class="label">Submission Date</td>
              <td class="value">${new Date(data.submissionDate).toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <!-- Property Details -->
        <div class="section">
          <h2 class="section-title">Property Details</h2>
          <table>
            <tr>
              <td class="label">Property Address</td>
              <td class="value">${data.propertyAddress}</td>
            </tr>
            <tr>
              <td class="label">Roof Type</td>
              <td class="value">${data.roofType}</td>
            </tr>
            <tr>
              <td class="label">Housing Type</td>
              <td class="value">${data.housingType}</td>
            </tr>
            <tr>
              <td class="label">Number of Bedrooms</td>
              <td class="value">${data.bedroomCount}</td>
            </tr>
          </table>
        </div>

        <!-- Appliance Configuration -->
        <div class="section">
          <h2 class="section-title">Appliance Configuration</h2>
          <table>
            <tr>
              <td class="label">Fans</td>
              <td class="value">${data.fans}</td>
            </tr>
            <tr>
              <td class="label">TVs</td>
              <td class="value">${data.tvs}</td>
            </tr>
            <tr>
              <td class="label">Fridges (Type)</td>
              <td class="value">${data.fridges} (${data.fridgeType})</td>
            </tr>
            <tr>
              <td class="label">Air Conditioners (Type)</td>
              <td class="value">${data.acCount} (${data.acType})</td>
            </tr>
            <tr>
              <td class="label">Washing Machines</td>
              <td class="value">${data.washingMachineCount}</td>
            </tr>
            <tr>
              <td class="label">Washing Machine Details</td>
              <td class="value">${data.washingMachineType} / ${data.washingMachineSize}</td>
            </tr>
            <tr>
              <td class="label">Additional Appliances</td>
              <td class="value">${data.additionalAppliances.length > 0 ? data.additionalAppliances.join(', ') : 'None'}</td>
            </tr>
          </table>
        </div>

        <!-- Selected Quote Package -->
        <div class="section">
          <h2 class="section-title">Selected Solar Package</h2>
          <div class="quote-card">
            <div class="quote-title">${data.selectedQuote.quote.title}</div>
            <div class="quote-tagline">${data.selectedQuote.quote.tagline}</div>
            <div class="quote-price">â‚¦${data.selectedQuote.quote.price.toLocaleString()}</div>
            
            <table style="margin-top: 10px; font-size: 11px;">
              <tr>
                <td class="label">Inverter</td>
                <td class="value">${data.selectedQuote.quote.inverter}</td>
              </tr>
              <tr>
                <td class="label">Battery</td>
                <td class="value">${data.selectedQuote.quote.battery}</td>
              </tr>
              <tr>
                <td class="label">Panels</td>
                <td class="value">${data.selectedQuote.quote.panels}</td>
              </tr>
              <tr>
                <td class="label">Recommended For</td>
                <td class="value">${data.selectedQuote.quote.recommendedProperty}</td>
              </tr>
              <tr>
                <td class="label">Load Coverage</td>
                <td class="value">${data.selectedQuote.quote.loadText}</td>
              </tr>
            </table>

            <div style="background: #fffbea; border-left: 2px solid #ffc107; padding: 10px; border-radius: 4px; margin-top: 10px; font-size: 11px;">
              <strong style="color: #995400;">Notes:</strong>
              <ul style="margin-top: 5px; padding-left: 18px; color: #666;">
                ${data.selectedQuote.notes.map((note) => `<li>${note}</li>`).join('')}
              </ul>
            </div>

            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #cfe7d1; font-size: 10px;">
              <span style="color: #4c9a52; font-weight: 600;">Match Score: ${data.selectedQuote.score}/100</span>
              <span class="badge" style="background: #28a745; margin-left: 10px;">Strong Match</span>
            </div>
          </div>
        </div>

        <!-- Action Section -->
        <div class="action-section">
          <h3 style="color: #0d1b0f; margin-bottom: 10px; font-size: 13px;">Next Steps</h3>
          <p style="font-size: 11px; color: #666; margin-bottom: 10px;">This is a qualified lead. Consider reaching out to discuss custom configurations or installation timeline.</p>
          <a href="mailto:${data.customerEmail}" class="action-button">Reply to Customer</a>
        </div>
      </div>

      <div class="footer">
        <p><strong>Greenlife Solar Solutions</strong></p>
        <p>Solar Consultation Management System</p>
        <p>This is an automated consultation submission notification.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

async function sendTestConsultationEmail() {
  console.log('ðŸ§ª Testing Consultation Email Functionality');
  console.log('==========================================\n');

  // Validate configuration
  if (!RESEND_API_KEY) {
    console.error('âŒ RESEND_API_KEY is not configured');
    process.exit(1);
  }

  if (!ADMIN_EMAIL) {
    console.error('âŒ ADMIN_EMAIL is not configured');
    process.exit(1);
  }

  console.log('ðŸ“‹ Consultation Form Data:');
  console.log(`   Name: ${consultationData.customerName}`);
  console.log(`   Email: ${consultationData.customerEmail}`);
  console.log(`   Phone: ${consultationData.customerPhone}`);
  console.log(`   Property: ${consultationData.propertyAddress}`);
  console.log(`   Selected Package: ${consultationData.selectedQuote.quote.title}`);
  console.log(`   Package Price: â‚¦${consultationData.selectedQuote.quote.price.toLocaleString()}\n`);

  try {
    console.log('ðŸ“¤ Generating email HTML...\n');
    const adminHTML = await generateAdminEmailHTML();

    // Save HTML preview to file
    const htmlPath = path.resolve(__dirname, 'consultation-email-preview.html');
    fs.writeFileSync(htmlPath, adminHTML);
    console.log(`âœ“ Email preview saved to: consultation-email-preview.html\n`);

    console.log('ðŸ“¤ Sending test email to admin...\n');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `New Consultation Request - ${consultationData.customerName}`,
        html: adminHTML,
        replyTo: consultationData.customerEmail,
        tags: {
          category: 'consultation',
          type: 'admin_notification',
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('âŒ Email Send Failed');
      console.error(`Status: ${response.status}`);
      console.error(`Error:`, data);
      process.exit(1);
    }

    console.log('âœ… Consultation Email Sent Successfully!');
    console.log(`\nðŸ“§ Email ID: ${data.id}`);
    console.log(`âœ“ Sent to: ${ADMIN_EMAIL}`);
    console.log(`âœ“ Reply-To: ${consultationData.customerEmail}`);
    console.log(`\nâœ“ Email template design has been generated and saved.`);
    console.log(`âœ“ Open consultation-email-preview.html in your browser to see the design.\n`);

  } catch (error) {
    console.error('âŒ Error sending email:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the test
await sendTestConsultationEmail();
