#!/usr/bin/env node

/**
 * Test script to simulate a product order and send emails
 * APPROVAL WORKFLOW: Admin must approve before customer receives confirmation
 * Step 1: Admin gets approval request email
 * Step 2: Admin approves in dashboard
 * Step 3: Customer receives confirmation email
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

// Sample order data with multiple products
const sampleOrder = {
  orderId: 'ORD-2026-04-001',
  orderDate: new Date().toISOString(),
  customerName: 'Samuel Lucky',
  customerEmail: 'customer.one@example.com',
  customerPhone: '+234 803-123-4567',
  deliveryAddress: '123 Lekki Phase 1, Lagos, Nigeria',
  status: 'pending_approval',
  items: [
    {
      id: 1,
      name: 'Ultra High-Efficiency Solar Panel',
      price: 461000,
      quantity: 4,
      image: 'https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg?auto=compress&cs=tinysrgb&w=100',
      category: 'Solar Panels',
      brand: 'EcoVolt',
    },
    {
      id: 3,
      name: 'LiFePO4 Home Battery Storage',
      price: 6480000,
      quantity: 1,
      image: 'https://images.pexels.com/photos/8566570/pexels-photo-8566570.jpeg?auto=compress&cs=tinysrgb&w=100',
      category: 'Batteries',
      brand: 'Lumina Solar',
    },
    {
      id: 2,
      name: 'Smart Hybrid Power Inverter',
      price: 2237000,
      quantity: 1,
      image: 'https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=100',
      category: 'Inverters',
      brand: 'SunMaster',
    },
  ],
};

// Calculate totals
const subtotal = sampleOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
const tax = subtotal * 0.075; // 7.5% tax
const shipping = 50000; // Naira
const total = subtotal + tax + shipping;

async function generateAdminOrderEmailHTML() {
  const data = { ...sampleOrder, subtotal, tax, shipping, total };
  const adminLoginUrl = `https://www.greenlifesolarsolution.com/#/php/greenlife/privatelog?action=approve&orderId=${data.orderId}`;
  const adminRejectUrl = `https://www.greenlifesolarsolution.com/#/php/greenlife/privatelog?action=reject&orderId=${data.orderId}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.4; color: #333; background: #f5f7fa; }
    .container { width: 100%; margin: 0; padding: 0; background: #f5f7fa; }
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
    .product-item { background: #f8fcf8; padding: 15px; margin-bottom: 12px; border-radius: 6px; border-left: 3px solid #4c9a52; }
    .product-header { display: flex; gap: 12px; margin-bottom: 10px; }
    .product-image { width: 60px; height: 60px; border-radius: 4px; overflow: hidden; background: white; border: 1px solid #e7f3e8; flex-shrink: 0; }
    .product-image img { width: 100%; height: 100%; object-fit: cover; }
    .product-info { flex: 1; }
    .product-name { font-size: 12px; font-weight: 600; color: #0d1b0f; margin-bottom: 3px; }
    .product-category { font-size: 10px; color: #4c9a52; margin-bottom: 5px; }
    .product-details { font-size: 11px; color: #666; line-height: 1.4; }
    .product-details strong { color: #0d1b0f; }
    .order-summary { background: #f8fcf8; border: 1px solid #e7f3e8; border-radius: 6px; padding: 15px; margin-top: 15px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #e7f3e8; }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { font-weight: 600; color: #0d1b0f; }
    .summary-value { color: #666; }
    .total-row { font-size: 14px; font-weight: 700; color: #4c9a52; display: flex; justify-content: space-between; }
    .badge { display: inline-block; background: #4c9a52; color: white; padding: 3px 10px; border-radius: 15px; font-size: 10px; font-weight: 600; margin-right: 5px; }
    .action-section { background: #f8fcf8; padding: 15px; border-radius: 6px; text-align: center; margin-top: 20px; border: 1px solid #e7f3e8; }
    .approval-banner { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
    .approval-banner h3 { color: #856404; font-size: 13px; margin-bottom: 8px; }
    .approval-banner p { font-size: 11px; color: #856404; line-height: 1.5; margin-bottom: 5px; }
    .approval-button { display: inline-block; background: #28a745; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600; font-size: 12px; margin-right: 5px; }
    .reject-button { display: inline-block; background: #dc3545; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none; font-weight: 600; font-size: 12px; }
    .footer { background: #f8fcf8; padding: 15px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #e7f3e8; width: 100%; }
    .footer p { margin-bottom: 3px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>New Product Order Received</h1>
        <p>Action Required: Order Awaiting Your Approval</p>
      </div>

      <div class="content">
        <!-- Approval Banner -->
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
          <h3 style="color: #856404; font-size: 13px; margin-bottom: 8px; font-weight: 600;">APPROVAL REQUIRED</h3>
          <p style="font-size: 11px; color: #856404; line-height: 1.5; margin-bottom: 8px;">This order is pending your approval. Customer will NOT receive confirmation email until you approve this order in the admin dashboard.</p>
          <p style="font-size: 11px; color: #856404;"><strong>Order Status:</strong> Pending Approval</p>
        </div>

        <!-- Order Information -->
        <div class="section">
          <h2 class="section-title">Order Information</h2>
          <table>
            <tr>
              <td class="label">Order ID</td>
              <td class="value">${data.orderId}</td>
            </tr>
            <tr>
              <td class="label">Order Date</td>
              <td class="value">${new Date(data.orderDate).toLocaleString()}</td>
            </tr>
            <tr>
              <td class="label">Total Items</td>
              <td class="value">${data.items.length} Product${data.items.length > 1 ? 's' : ''}</td>
            </tr>
            <tr>
              <td class="label">Order Status</td>
              <td class="value"><span class="badge">Pending Approval</span></td>
            </tr>
          </table>
        </div>

        <!-- Customer Details -->
        <div class="section">
          <h2 class="section-title">Customer Details</h2>
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
              <td class="label">Delivery Address</td>
              <td class="value">${data.deliveryAddress}</td>
            </tr>
          </table>
        </div>

        <!-- Ordered Products -->
        <div class="section">
          <h2 class="section-title">Ordered Products</h2>
          ${data.items.map((item) => `
            <div class="product-item">
              <div class="product-header" style="display: flex; gap: 10px; margin-bottom: 8px;">
                <div class="product-image" style="width: 40px; height: 40px; border-radius: 3px; overflow: hidden; background: white; border: 1px solid #e7f3e8; flex-shrink: 0;">
                  <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 11px; font-weight: 600; color: #0d1b0f; margin-bottom: 2px;">${item.name}</div>
                  <div style="font-size: 9px; color: #4c9a52; margin-bottom: 3px;">${item.brand} - ${item.category}</div>
                  <div style="font-size: 10px; color: #666; line-height: 1.3;">
                    <strong>ID:</strong> ${item.id} | <strong>Price:</strong> â‚¦${item.price} | <strong>Qty:</strong> ${item.quantity} | <strong>Total:</strong> â‚¦${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Order Summary -->
        <div class="section">
          <h2 class="section-title">Order Summary</h2>
          <div class="order-summary">
            <div class="summary-row">
              <span class="summary-label">Subtotal (${data.items.length} items)</span>
              <span class="summary-value">â‚¦${data.subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Tax (7.5%)</span>
              <span class="summary-value">â‚¦${data.tax.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Shipping</span>
              <span class="summary-value">â‚¦${data.shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row total-row">
              <span>TOTAL</span>
              <span>â‚¦${data.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Action Section -->
        <div class="action-section">
          <h3 style="color: #0d1b0f; margin-bottom: 10px; font-size: 13px;">Admin Actions</h3>
          <p style="font-size: 11px; color: #666; margin-bottom: 12px;">Click a button below or go to your admin dashboard to approve or reject this order.</p>
          <a href="${adminLoginUrl}" style="display: inline-block; background: #28a745; color: white; padding: 10px 18px; border-radius: 5px; text-decoration: none; font-weight: 600; font-size: 12px; margin-right: 5px;">Approve Order</a>
          <a href="${adminRejectUrl}" style="display: inline-block; background: #dc3545; color: white; padding: 10px 18px; border-radius: 5px; text-decoration: none; font-weight: 600; font-size: 12px;">Reject Order</a>
        </div>
      </div>

      <div class="footer">
        <p><strong>Greenlife Solar Solutions</strong></p>
        <p>Order Management System</p>
        <p>Customer will be notified after you approve this order.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

async function generateCustomerOrderEmailHTML() {
  const data = { ...sampleOrder, subtotal, tax, shipping, total };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.4; color: #333; background: #f5f7fa; }
    .container { width: 100%; margin: 0; padding: 0; background: #f5f7fa; }
    .email-wrapper { background: white; width: 100%; margin: 0; overflow: hidden; }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 30px 20px; text-align: center; width: 100%; }
    .header h1 { font-size: 22px; margin-bottom: 8px; }
    .header p { font-size: 12px; opacity: 0.9; }
    .content { padding: 20px; width: 100%; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 14px; font-weight: 600; color: #0d1b0f; margin-bottom: 10px; border-bottom: 2px solid #4c9a52; padding-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    td { padding: 8px; border-bottom: 1px solid #e7f3e8; font-size: 12px; }
    tr:nth-child(even) { background: #f8fcf8; }
    .label { font-weight: 600; color: #0d1b0f; width: 40%; }
    .value { color: #666; }
    .product-item { background: #f8fcf8; padding: 15px; margin-bottom: 12px; border-radius: 6px; border-left: 3px solid #4c9a52; }
    .product-header { display: flex; gap: 12px; margin-bottom: 10px; }
    .product-image { width: 60px; height: 60px; border-radius: 4px; overflow: hidden; background: white; border: 1px solid #e7f3e8; flex-shrink: 0; }
    .product-image img { width: 100%; height: 100%; object-fit: cover; }
    .product-info { flex: 1; }
    .product-name { font-size: 12px; font-weight: 600; color: #0d1b0f; margin-bottom: 3px; }
    .product-category { font-size: 10px; color: #4c9a52; margin-bottom: 5px; }
    .product-details { font-size: 11px; color: #666; line-height: 1.4; }
    .product-details strong { color: #0d1b0f; }
    .order-summary { background: #f8fcf8; border: 1px solid #e7f3e8; border-radius: 6px; padding: 15px; margin-top: 15px; }
    .summary-row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #e7f3e8; }
    .summary-row:last-child { border-bottom: none; }
    .summary-label { font-weight: 600; color: #0d1b0f; }
    .summary-value { color: #666; }
    .total-row { font-size: 14px; font-weight: 700; color: #4c9a52; display: flex; justify-content: space-between; }
    .success-box { background: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
    .success-box h3 { color: #28a745; font-size: 14px; margin-bottom: 8px; }
    .success-box p { font-size: 12px; color: #2e7d32; line-height: 1.5; }
    .delivery-box { background: #e3f2fd; border-left: 4px solid #2196F3; padding: 15px; border-radius: 6px; margin-top: 15px; }
    .delivery-box h4 { color: #1565c0; font-size: 12px; font-weight: 600; margin-bottom: 8px; }
    .delivery-box p { font-size: 11px; color: #0d47a1; line-height: 1.5; }
    .footer { background: #f8fcf8; padding: 15px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #e7f3e8; width: 100%; }
    .footer p { margin-bottom: 3px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>Order Confirmation</h1>
        <p>Your solar products order has been confirmed</p>
      </div>

      <div class="content">
        <!-- Success Message -->
        <div class="success-box">
          <h3>Thank You for Your Order!</h3>
          <p>Your order has been successfully confirmed and received. Our team is preparing your items for delivery. You will receive a shipping notification within 24 hours with tracking details.</p>
        </div>

        <!-- Order Details -->
        <div class="section">
          <h2 class="section-title">Order Details</h2>
          <table>
            <tr>
              <td class="label">Order ID</td>
              <td class="value">${data.orderId}</td>
            </tr>
            <tr>
              <td class="label">Order Date</td>
              <td class="value">${new Date(data.orderDate).toLocaleString()}</td>
            </tr>
            <tr>
              <td class="label">Delivery Address</td>
              <td class="value">${data.deliveryAddress}</td>
            </tr>
            <tr>
              <td class="label">Total Amount</td>
              <td class="value" style="font-size: 13px; font-weight: 600; color: #4c9a52;">â‚¦${data.total.toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <!-- Ordered Items -->
        <div class="section">
          <h2 class="section-title">Your Items</h2>
          ${data.items.map((item) => `
            <div class="product-item">
              <div class="product-header" style="display: flex; gap: 10px; margin-bottom: 8px;">
                <div class="product-image" style="width: 40px; height: 40px; border-radius: 3px; overflow: hidden; background: white; border: 1px solid #e7f3e8; flex-shrink: 0;">
                  <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 11px; font-weight: 600; color: #0d1b0f; margin-bottom: 2px;">${item.name}</div>
                  <div style="font-size: 9px; color: #4c9a52; margin-bottom: 3px;">${item.brand} - ${item.category}</div>
                  <div style="font-size: 10px; color: #666; line-height: 1.3;">
                    <strong>Qty:</strong> ${item.quantity} | <strong>Price/Unit:</strong> â‚¦${item.price.toFixed(2)} | <strong>Total:</strong> â‚¦${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Order Summary -->
        <div class="section">
          <h2 class="section-title">Order Summary</h2>
          <div class="order-summary">
            <div class="summary-row">
              <span class="summary-label">Subtotal</span>
              <span class="summary-value">â‚¦${data.subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Tax (7.5%)</span>
              <span class="summary-value">â‚¦${data.tax.toFixed(2)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Shipping</span>
              <span class="summary-value">â‚¦${data.shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row total-row">
              <span>TOTAL</span>
              <span>â‚¦${data.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Delivery Information -->
        <div class="delivery-box">
          <h4>Delivery Information</h4>
          <p>Your order is being prepared and will be shipped within 1-2 business days. You will receive an email with tracking information and estimated delivery date. Standard delivery takes 5-7 business days.</p>
        </div>

        <!-- Support Section -->
        <div class="section" style="background: #f8fcf8; padding: 15px; border-radius: 6px; margin-top: 20px; border: 1px solid #e7f3e8;">
          <h3 style="color: #0d1b0f; font-size: 12px; margin-bottom: 10px;">Need Help?</h3>
          <p style="font-size: 11px; color: #666; margin-bottom: 8px;">If you have any questions about your order, please don't hesitate to contact us:</p>
          <p style="font-size: 11px; color: #4c9a52;"><strong>Email:</strong> ${ADMIN_EMAIL}</p>
          <p style="font-size: 11px; color: #4c9a52;"><strong>Phone:</strong> +234 803-123-4567</p>
        </div>
      </div>

      <div class="footer">
        <p><strong>Greenlife Solar Solutions</strong></p>
        <p>Thank you for choosing us for your solar needs!</p>
        <p>This is an automated order confirmation email.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

async function sendTestOrderEmails() {
  console.log('ðŸ§ª Testing Product Order Email Functionality');
  console.log('=========================================\n');

  // Validate configuration
  if (!RESEND_API_KEY) {
    console.error('âŒ RESEND_API_KEY is not configured');
    process.exit(1);
  }

  if (!ADMIN_EMAIL) {
    console.error('âŒ ADMIN_EMAIL is not configured');
    process.exit(1);
  }

  console.log('ðŸ“¦ Order Details:');
  console.log(`   Order ID: ${sampleOrder.orderId}`);
  console.log(`   Customer: ${sampleOrder.customerName}`);
  console.log(`   Email: ${sampleOrder.customerEmail}`);
  console.log(`   Total Items: ${sampleOrder.items.length}`);
  console.log(`   Order Total: â‚¦${total.toFixed(2)}\n`);

  try {
    // Generate admin and customer emails
    console.log('ðŸ“„ Generating email templates...\n');
    const adminHTML = await generateAdminOrderEmailHTML();
    const customerHTML = await generateCustomerOrderEmailHTML();

    // Save HTML previews to files
    const adminPath = path.resolve(__dirname, 'order-email-admin-preview.html');
    const customerPath = path.resolve(__dirname, 'order-email-customer-preview.html');
    fs.writeFileSync(adminPath, adminHTML);
    fs.writeFileSync(customerPath, customerHTML);
    console.log(`âœ“ Admin email preview saved: order-email-admin-preview.html`);
    console.log(`âœ“ Customer email preview saved: order-email-customer-preview.html\n`);

    // Send ONLY admin approval email (customer email sent after approval)
    console.log('ðŸ“¤ Sending admin approval request...\n');
    const adminResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `New Order Awaiting Approval - ${sampleOrder.orderId}`,
        html: adminHTML,
        replyTo: sampleOrder.customerEmail,
        tags: {
          category: 'order',
          type: 'admin_approval_needed',
        },
      }),
    });

    const adminData = await adminResponse.json();

    if (!adminResponse.ok) {
      console.error('âŒ Admin Email Send Failed');
      console.error(`Status: ${adminResponse.status}`);
      console.error(`Error:`, adminData);
      process.exit(1);
    }

    console.log('âœ… Admin Email Sent Successfully!');
    console.log(`   Email ID: ${adminData.id}`);
    console.log(`   Sent to: ${ADMIN_EMAIL}\n`);

    console.log('========================================');
    console.log('APPROVAL WORKFLOW:');
    console.log(`1. âœ“ Admin received approval request email`);
    console.log(`2. Admin goes to dashboard to approve/reject`);
    console.log(`3. Customer receives confirmation ONLY after approval`);
    console.log('========================================\n');
    console.log('âœ“ Admin approval email sent successfully!');
    console.log('âœ“ Images reduced to 40x40px for email compatibility');
    console.log('âœ“ Product details clearly visible in compact table format');
    console.log('âœ“ Customer email template ready (will be sent after approval)\n');

  } catch (error) {
    console.error('âŒ Error sending emails:');
    console.error(error.message);
    process.exit(1);
  }
}

// Run the test
await sendTestOrderEmails();
