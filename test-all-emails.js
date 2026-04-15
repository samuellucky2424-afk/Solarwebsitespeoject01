/**
 * Master Test Script - Send All Email Templates via Resend API
 * Tests every template type in sequence
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

// Sample data for all template types
const sampleData = {
  // Order data
  order: {
    orderId: 'ORD-2026-04-MASTER',
    customerName: 'Samuel Lucky',
    customerEmail: 'customer.one@example.com',
    customerPhone: '+234 803-123-4567',
    items: [
      { name: 'Solar Panel Ultra Efficiency', quantity: 2, price: 461000 },
      { name: 'Smart Hybrid Inverter', quantity: 1, price: 2237000 }
    ],
    subtotal: 3159000,
    tax: 236925,
    shipping: 50000,
    total: 3445925,
    orderDate: new Date().toISOString(),
    transactionRef: 'FLW-TXN-001'
  },

  // Consultation data
  consultation: {
    customerName: 'Chioma Okafor',
    customerEmail: 'chioma@example.com',
    customerPhone: '+234 701-234-5678',
    propertyAddress: '45 Green Street, Abuja',
    roofType: 'Concrete Slab',
    housingType: '4-Bedroom Duplex',
    bedroomCount: 4,
    fans: 8,
    tvs: 3,
    fridges: 2,
    fridgeType: 'Double Door',
    acCount: 2,
    acType: '2HP',
    washingMachineCount: 1,
    washingMachineType: 'Semi-Automatic',
    washingMachineSize: 'Large',
    additionalAppliances: ['Microwave', 'Blender', 'Water Heater'],
    selectedQuote: {
      quote: {
        title: 'Standard Home Solution',
        tagline: 'Perfect for medium-sized homes',
        price: 1350000,
        inverter: '5KVA Smart Hybrid',
        battery: 'LiFePO4 10.24kWh',
        panels: '8 x 550W Bifacial',
        recommendedProperty: '3-5 Bedroom Homes',
        loadText: 'Supports 24-hour power for 4-bedroom home with 8-10 hours daily usage'
      },
      notes: ['Professional installation included', '1-year warranty on all components'],
      score: 92,
      isStrongMatch: true
    },
    submissionDate: new Date().toISOString(),
    adminEmail: ADMIN_EMAIL
  },

  // Upgrade data
  upgrade: {
    customerName: 'Ikechukwu Nnamdi',
    customerEmail: 'ikechukwu@example.com',
    customerPhone: '+234 905-678-9012',
    propertyAddress: '120 Power Avenue, Lagos',
    upgradeType: 'Battery Expansion',
    specifications: 'Current: 5.12kWh | Requested: 10.24kWh additional',
    description: 'Business is expanding, need more power storage capacity.',
    submissionDate: new Date().toISOString()
  },

  // Maintenance Request
  maintenance: {
    requestId: 'SVC-2026-04-MAINT',
    requestType: 'Maintenance Request',
    customerName: 'Adebayo Oluwaseun',
    customerEmail: 'adebayo@example.com',
    customerPhone: '+234 803-987-6543',
    address: '78 Solar Drive, Port Harcourt',
    date: new Date().toISOString(),
    issueType: 'Inverter Not Responding',
    description: 'Inverter screen is blank. No display. System not converting power.',
    priority: 'High'
  },

  // Site Survey Request
  survey: {
    requestId: 'SVC-2026-04-SURVEY',
    requestType: 'Site Survey Request',
    customerName: 'Zainab Muhammad',
    customerEmail: 'zainab@example.com',
    customerPhone: '+234 702-111-2222',
    address: '234 Renewable Lane, Kano',
    date: new Date().toISOString(),
    time: '2:00 PM - 4:00 PM',
    description: 'Need comprehensive site survey for new office building. Want to install 50kW system.',
    priority: 'Normal'
  },

  // Package Request
  package: {
    requestId: 'SVC-2026-04-PKG',
    requestType: 'Package Request',
    customerName: 'Tunde Aladunni',
    customerEmail: 'tunde@example.com',
    customerPhone: '+234 905-555-6666',
    address: '567 Energy Way, Ibadan',
    date: new Date().toISOString(),
    description: 'Interested in Premium Plus package. Want to discuss financing options and installation timeline.',
    priority: 'Normal'
  }
};

// Email template functions
function generateOrderAdminHTML(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background: #f5f7fa; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; }
    .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin-bottom: 20px; color: #856404; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f8fcf8; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e7f3e8; }
    td { padding: 12px; border-bottom: 1px solid #e7f3e8; }
    .summary { background: #f8fcf8; padding: 15px; border-radius: 6px; margin-top: 20px; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>ðŸ›’ New Order Received</h1></div>
    <div class="content">
      <div class="alert"><strong>APPROVAL REQUIRED:</strong> Review and approve this order before customer receives confirmation.</div>
      <p><strong>Customer:</strong> ${data.customerName}</p>
      <p><strong>Email:</strong> ${data.customerEmail} | <strong>Phone:</strong> ${data.customerPhone}</p>
      <p><strong>Order ID:</strong> ${data.orderId}</p>
      <p><strong>Date:</strong> ${new Date(data.orderDate).toLocaleString()}</p>
      <table>
        <tr><th>Product</th><th>Qty</th><th>Price</th></tr>
        ${data.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>â‚¦${i.price.toLocaleString()}</td></tr>`).join('')}
        <tr><td colspan="2"><strong>Subtotal:</strong></td><td><strong>â‚¦${data.subtotal.toLocaleString()}</strong></td></tr>
        <tr><td colspan="2"><strong>Tax (7.5%):</strong></td><td><strong>â‚¦${data.tax.toLocaleString()}</strong></td></tr>
        <tr><td colspan="2"><strong>Shipping:</strong></td><td><strong>â‚¦${data.shipping.toLocaleString()}</strong></td></tr>
        <tr style="background: #e8f5e9;"><td colspan="2"><strong>TOTAL:</strong></td><td><strong style="color: #4c9a52;">â‚¦${data.total.toLocaleString()}</strong></td></tr>
      </table>
    </div>
    <div class="footer"><p>Greenlife Solar Solutions</p></div>
  </div>
</body>
</html>
  `;
}

function generateOrderCustomerHTML(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background: #f5f7fa; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; }
    .success { background: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f8fcf8; padding: 12px; text-align: left; font-weight: 600; }
    td { padding: 12px; border-bottom: 1px solid #e7f3e8; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>âœ… Thank You For Your Order!</h1></div>
    <div class="content">
      <div class="success"><p>Your order #${data.orderId} has been received. We'll contact you within 24 hours to confirm.</p></div>
      <p>Thank you for choosing Greenlife Solar Solutions!</p>
      <table>
        <tr><th>Product</th><th>Qty</th><th>Price</th></tr>
        ${data.items.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>â‚¦${i.price.toLocaleString()}</td></tr>`).join('')}
        <tr style="background: #f8fcf8;"><td colspan="2"><strong>Total:</strong></td><td><strong>â‚¦${data.total.toLocaleString()}</strong></td></tr>
      </table>
    </div>
    <div class="footer"><p>Greenlife Solar Solutions Limited</p></div>
  </div>
</body>
</html>
  `;
}

function generateConsultationAdminHTML(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; background: #f5f7fa; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .info-item { background: #f8fcf8; padding: 12px; border-left: 3px solid #4c9a52; }
    .label { font-size: 11px; color: #666; font-weight: 600; text-transform: uppercase; }
    .value { font-size: 13px; color: #0d1b0f; margin-top: 4px; }
    .quote-box { background: #f0f5f1; border-left: 4px solid #4c9a52; padding: 15px; margin: 20px 0; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>ðŸ“‹ New Consultation Request</h1></div>
    <div class="content">
      <div class="info-grid">
        <div class="info-item"><div class="label">Name</div><div class="value">${data.customerName}</div></div>
        <div class="info-item"><div class="label">Email</div><div class="value">${data.customerEmail}</div></div>
        <div class="info-item"><div class="label">Phone</div><div class="value">${data.customerPhone}</div></div>
        <div class="info-item"><div class="label">Address</div><div class="value">${data.propertyAddress}</div></div>
      </div>
      <div class="quote-box">
        <strong>${data.selectedQuote.quote.title}</strong>
        <p style="color: #4c9a52; margin-top: 8px; font-weight: 600;">â‚¦${data.selectedQuote.quote.price.toLocaleString()}</p>
        <p style="font-size: 12px; margin-top: 8px;">${data.selectedQuote.quote.loadText}</p>
      </div>
    </div>
    <div class="footer"><p>Greenlife Solar Solutions</p></div>
  </div>
</body>
</html>
  `;
}

function generateConsultationCustomerHTML(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; background: #f5f7fa; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; }
    .success { background: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>âœ… Thank You for Your Consultation!</h1></div>
    <div class="content">
      <div class="success"><p>We've received your solar consultation request. Our team will contact you within 24 hours.</p></div>
      <p>We're excited to help you find the perfect solar solution for your needs!</p>
    </div>
    <div class="footer"><p>Greenlife Solar Solutions Limited</p></div>
  </div>
</body>
</html>
  `;
}

function generateUpgradeAdminHTML(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; background: #f5f7fa; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; }
    .info-box { background: #f8fcf8; border-left: 3px solid #4c9a52; padding: 15px; margin-bottom: 15px; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>â¬†ï¸ System Upgrade Request</h1></div>
    <div class="content">
      <div class="info-box"><strong>Customer:</strong> ${data.customerName}</div>
      <div class="info-box"><strong>Upgrade Type:</strong> ${data.upgradeType}</div>
      <div class="info-box"><strong>Specifications:</strong> ${data.specifications}</div>
      <div class="info-box"><strong>Notes:</strong> ${data.description}</div>
      <p><strong>Contact:</strong> ${data.customerEmail} | ${data.customerPhone}</p>
    </div>
    <div class="footer"><p>Greenlife Solar Solutions</p></div>
  </div>
</body>
</html>
  `;
}

function generateUpgradeCustomerHTML(data) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; background: #f5f7fa; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; }
    .success { background: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>âœ… Upgrade Request Received</h1></div>
    <div class="content">
      <div class="success"><p>We've received your system upgrade request for: ${data.upgradeType}</p></div>
      <p>Our team will review your request and contact you within 24 hours to discuss the next steps.</p>
    </div>
    <div class="footer"><p>Greenlife Solar Solutions Limited</p></div>
  </div>
</body>
</html>
  `;
}

function generateServiceRequestAdminHTML(data) {
  const priorityColor = data.priority === 'High' ? '#ff9800' : '#17a2b8';
  const priorityBg = data.priority === 'High' ? '#fff3cd' : '#d1ecf1';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; background: #f5f7fa; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; }
    .priority { display: inline-block; background: ${priorityBg}; color: ${priorityColor}; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-bottom: 20px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; }
    .info-item { background: #f8fcf8; padding: 12px; border-left: 3px solid #4c9a52; }
    .label { font-size: 11px; color: #666; font-weight: 600; text-transform: uppercase; }
    .value { font-size: 13px; color: #0d1b0f; margin-top: 4px; }
    .desc { background: #f8fcf8; padding: 15px; border: 1px solid #e7f3e8; margin-top: 15px; border-radius: 4px; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>ðŸ”§ New Service Request</h1></div>
    <div class="content">
      <p><span class="priority">${data.priority} Priority</span></p>
      <p><strong>${data.requestType}</strong> (ID: ${data.requestId})</p>
      <div class="info-grid">
        <div class="info-item"><div class="label">Customer</div><div class="value">${data.customerName}</div></div>
        <div class="info-item"><div class="label">Phone</div><div class="value">${data.customerPhone}</div></div>
        <div class="info-item"><div class="label">Email</div><div class="value">${data.customerEmail}</div></div>
        <div class="info-item"><div class="label">Address</div><div class="value">${data.address}</div></div>
      </div>
      <div class="desc"><p>${data.description}</p></div>
    </div>
    <div class="footer"><p>Greenlife Solar Solutions</p></div>
  </div>
</body>
</html>
  `;
}

function generateServiceRequestCustomerHTML(data) {
  const icon = data.requestType === 'Maintenance Request' ? 'ðŸ”§' : data.requestType === 'Site Survey Request' ? 'ðŸ“' : 'ðŸ“¦';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; color: #333; background: #f5f7fa; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: white; padding: 30px; }
    .success { background: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #999; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>âœ… ${icon} Request Received</h1></div>
    <div class="content">
      <div class="success"><p>Your ${data.requestType.toLowerCase()} has been received (ID: ${data.requestId}). We'll contact you within 24 hours.</p></div>
      <p>Thank you for choosing Greenlife Solar Solutions. Our team is working on your request.</p>
    </div>
    <div class="footer"><p>Greenlife Solar Solutions Limited</p></div>
  </div>
</body>
</html>
  `;
}

// Main function to send all test emails
async function sendAllTestEmails() {
  console.log('ðŸš€ MASTER EMAIL TEST - Sending All Templates');
  console.log('==========================================\n');

  const emailTests = [
    {
      name: 'ðŸ“¦ ORDER EMAIL',
      admin: {
        to: ADMIN_EMAIL,
        subject: 'ðŸ›’ New Order Received - ORD-2026-04-MASTER',
        html: generateOrderAdminHTML(sampleData.order),
        tags: { category: 'order', type: 'admin' }
      },
      customer: {
        to: sampleData.order.customerEmail,
        subject: 'âœ… Thank You For Your Order - ORD-2026-04-MASTER',
        html: generateOrderCustomerHTML(sampleData.order),
        tags: { category: 'order', type: 'customer' }
      }
    },
    {
      name: 'ðŸ“‹ CONSULTATION EMAIL',
      admin: {
        to: ADMIN_EMAIL,
        subject: 'ðŸ“‹ New Consultation Request - Chioma Okafor',
        html: generateConsultationAdminHTML(sampleData.consultation),
        tags: { category: 'consultation', type: 'admin' }
      },
      customer: {
        to: sampleData.consultation.customerEmail,
        subject: 'âœ… Thank You for Your Consultation Request',
        html: generateConsultationCustomerHTML(sampleData.consultation),
        tags: { category: 'consultation', type: 'customer' }
      }
    },
    {
      name: 'â¬†ï¸ UPGRADE EMAIL',
      admin: {
        to: ADMIN_EMAIL,
        subject: 'â¬†ï¸ New System Upgrade Request - Ikechukwu Nnamdi',
        html: generateUpgradeAdminHTML(sampleData.upgrade),
        tags: { category: 'upgrade', type: 'admin' }
      },
      customer: {
        to: sampleData.upgrade.customerEmail,
        subject: 'âœ… Upgrade Request Received',
        html: generateUpgradeCustomerHTML(sampleData.upgrade),
        tags: { category: 'upgrade', type: 'customer' }
      }
    },
    {
      name: 'ðŸ”§ MAINTENANCE REQUEST EMAIL',
      admin: {
        to: ADMIN_EMAIL,
        subject: 'ðŸ”§ New Maintenance Request - Adebayo Oluwaseun',
        html: generateServiceRequestAdminHTML(sampleData.maintenance),
        tags: { category: 'service-request', type: 'admin', requestType: 'maintenance' }
      },
      customer: {
        to: sampleData.maintenance.customerEmail,
        subject: 'âœ… Maintenance Request Received',
        html: generateServiceRequestCustomerHTML(sampleData.maintenance),
        tags: { category: 'service-request', type: 'customer', requestType: 'maintenance' }
      }
    },
    {
      name: 'ðŸ“ SITE SURVEY REQUEST EMAIL',
      admin: {
        to: ADMIN_EMAIL,
        subject: 'ðŸ“ New Site Survey Request - Zainab Muhammad',
        html: generateServiceRequestAdminHTML(sampleData.survey),
        tags: { category: 'service-request', type: 'admin', requestType: 'survey' }
      },
      customer: {
        to: sampleData.survey.customerEmail,
        subject: 'âœ… Site Survey Request Received',
        html: generateServiceRequestCustomerHTML(sampleData.survey),
        tags: { category: 'service-request', type: 'customer', requestType: 'survey' }
      }
    },
    {
      name: 'ðŸ“¦ PACKAGE REQUEST EMAIL',
      admin: {
        to: ADMIN_EMAIL,
        subject: 'ðŸ“¦ New Package Request - Tunde Aladunni',
        html: generateServiceRequestAdminHTML(sampleData.package),
        tags: { category: 'service-request', type: 'admin', requestType: 'package' }
      },
      customer: {
        to: sampleData.package.customerEmail,
        subject: 'âœ… Package Request Received',
        html: generateServiceRequestCustomerHTML(sampleData.package),
        tags: { category: 'service-request', type: 'customer', requestType: 'package' }
      }
    }
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const test of emailTests) {
    console.log(`\nðŸ“§ ${test.name}`);
    console.log('â”€'.repeat(50));

    // Send admin email
    try {
      const adminRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          ...test.admin,
        }),
      });

      if (adminRes.ok) {
        const adminData = await adminRes.json();
        console.log(`âœ… Admin Email Sent`);
        console.log(`   Email ID: ${adminData.id}`);
        console.log(`   To: ${test.admin.to}`);
        successCount++;
      } else {
        console.log(`âŒ Admin Email Failed: ${adminRes.statusText}`);
        errorCount++;
      }
    } catch (err) {
      console.log(`âŒ Admin Email Error: ${err.message}`);
      errorCount++;
    }

    // Send customer email
    try {
      const customerRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          ...test.customer,
        }),
      });

      if (customerRes.ok) {
        const customerData = await customerRes.json();
        console.log(`âœ… Customer Email Sent`);
        console.log(`   Email ID: ${customerData.id}`);
        console.log(`   To: ${test.customer.to}`);
        successCount++;
      } else {
        console.log(`âŒ Customer Email Failed: ${customerRes.statusText}`);
        errorCount++;
      }
    } catch (err) {
      console.log(`âŒ Customer Email Error: ${err.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`\nðŸ“Š TEST RESULTS`);
  console.log(`âœ… Successful: ${successCount} emails`);
  console.log(`âŒ Failed: ${errorCount} emails`);
  console.log(`\nâœ¨ All templates have been tested!`);
  console.log(`\nYou should now see emails in:`);
  console.log(`ðŸ“§ Admin inbox: ${ADMIN_EMAIL}`);
  console.log(`ðŸ“§ Customer inboxes at various test emails`);
}

// Run the master test
sendAllTestEmails().catch(console.error);
