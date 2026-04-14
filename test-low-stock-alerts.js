/**
 * Test Low Stock Alert System
 * Table-based design with sharp edges, no emojis
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

// Product inventory
let products = [
  {
    id: 'PROD-PANEL-001',
    name: 'Ultra High-Efficiency Solar Panel',
    brand: 'SolarTech Pro',
    category: 'Solar Panels',
    price: 461000,
    stock: 10
  },
  {
    id: 'PROD-BATT-001',
    name: 'LiFePO4 Home Battery Storage',
    brand: 'PowerBank Plus',
    category: 'Batteries',
    price: 6480000,
    stock: 10
  },
  {
    id: 'PROD-INV-001',
    name: 'Smart Hybrid Power Inverter',
    brand: 'InvertPro',
    category: 'Inverters',
    price: 2237000,
    stock: 10
  }
];

// Low stock threshold
const LOW_STOCK_THRESHOLD = 3;

// Email template function - Table based, sharp edges, no emojis
function generateLowStockEmailHTML(data) {
  const stockStatus = data.currentStock === 0 ? 'OUT OF STOCK' : 'LOW STOCK';
  const alertBg = data.currentStock === 0 ? '#ffcccc' : '#ffffcc';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; background: #f5f5f5; }
    table { border-collapse: collapse; width: 100%; }
    td { padding: 0; }
    .wrapper { width: 100%; max-width: 700px; margin: 0 auto; background: white; }
    .header { width: 100%; background: #0d1b0f; color: white; padding: 20px; text-align: center; }
    .header-title { font-size: 20px; font-weight: bold; margin: 0; padding: 0; }
    .content { padding: 20px; }
    .alert-banner { background: ${alertBg}; border-top: 3px solid #0d1b0f; padding: 15px; margin-bottom: 15px; }
    .alert-title { font-size: 13px; font-weight: bold; color: #0d1b0f; margin-bottom: 8px; }
    .alert-text { font-size: 11px; color: #333; line-height: 1.4; }
    .product-table { width: 100%; border: 1px solid #ddd; margin-bottom: 15px; }
    .product-table td { border: 1px solid #ddd; padding: 10px; font-size: 11px; }
    .product-label { background: #f8f8f8; font-weight: bold; color: #0d1b0f; width: 35%; }
    .product-value { color: #333; }
    .stock-alert { background: ${alertBg}; border: 1px solid #ddd; padding: 12px; margin-bottom: 15px; }
    .stock-label { font-size: 10px; font-weight: bold; color: #0d1b0f; text-transform: uppercase; margin-bottom: 6px; }
    .stock-value { font-size: 16px; font-weight: bold; color: #0d1b0f; }
    .action-buttons { width: 100%; text-align: center; margin: 20px 0; padding: 20px 0; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; }
    .btn { display: inline-block; padding: 8px 15px; margin: 5px; font-size: 11px; font-weight: bold; text-decoration: none; color: white; background: #4c9a52; border: none; }
    .btn.danger { background: #cc0000; }
    .footer { background: #f8f8f8; padding: 15px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <table class="wrapper">
    <tr>
      <td class="header">
        <p class="header-title">Inventory Alert</p>
      </td>
    </tr>
    <tr>
      <td class="content">
        <table class="alert-banner">
          <tr>
            <td>
              <div class="alert-title">${stockStatus}: ${data.productName}</div>
              <div class="alert-text">
                ${data.currentStock === 0 
                  ? 'This product has run out of stock and has been automatically removed from the product catalog.'
                  : `This product is running low on inventory. Only ${data.currentStock} units remaining. Restock immediately.`
                }
              </div>
            </td>
          </tr>
        </table>

        <table class="product-table">
          <tr>
            <td class="product-label">Product Name</td>
            <td class="product-value">${data.productName}</td>
          </tr>
          <tr>
            <td class="product-label">Brand</td>
            <td class="product-value">${data.brand}</td>
          </tr>
          <tr>
            <td class="product-label">Product ID</td>
            <td class="product-value">${data.productId}</td>
          </tr>
          <tr>
            <td class="product-label">Category</td>
            <td class="product-value">${data.category}</td>
          </tr>
          <tr>
            <td class="product-label">Price</td>
            <td class="product-value">₦${data.price.toLocaleString()}</td>
          </tr>
        </table>

        <table class="stock-alert">
          <tr>
            <td>
              <div class="stock-label">Current Stock Level</div>
              <div class="stock-value">${data.currentStock} units</div>
              ${data.currentStock > 0 ? `<p style="margin-top: 6px; font-size: 11px; color: #333;">Estimated stockout in ${Math.ceil(data.currentStock / 5)} days</p>` : ''}
            </td>
          </tr>
        </table>

        <table class="action-buttons">
          <tr>
            <td style="text-align: center;">
              ${data.currentStock === 0 
                ? '<a href="#" class="btn danger">RESTORE PRODUCT</a>'
                : '<a href="#" class="btn">RESTOCK NOW</a>'
              }
              <a href="#" class="btn">VIEW INVENTORY</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td class="footer">
        <p>Greenlife Solar Solutions Limited</p>
        <p>Automatic Inventory Management System</p>
        <p>© 2026 All rights reserved</p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

// Simulate a purchase and check inventory
async function simulatePurchase(productId, quantityPurchased) {
  const product = products.find(p => p.id === productId);
  if (!product) {
    console.log(`Product not found: ${productId}\n`);
    return;
  }

  console.log(`\nProcessing Purchase...`);
  console.log(`   Product: ${product.name}`);
  console.log(`   Quantity: ${quantityPurchased}`);
  console.log(`   Stock Before: ${product.stock} units`);

  // Deduct from stock
  product.stock -= quantityPurchased;
  if (product.stock < 0) product.stock = 0;

  console.log(`   Stock After: ${product.stock} units`);

  // Check if alert should be triggered
  if (product.stock === 0) {
    console.log(`\nOUT OF STOCK DETECTED!`);
    console.log(`   Status: Product will be removed from catalog`);
    console.log(`   Sending alert to admin...`);

    // Send alert email
    try {
      const emailHTML = generateLowStockEmailHTML({
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        currentStock: 0,
        price: product.price,
      });

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `OUT OF STOCK: ${product.name}`,
          html: emailHTML,
          tags: {
            category: 'inventory',
            type: 'out-of-stock',
            productId: product.id,
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`   Alert Email Sent!`);
        console.log(`   Email ID: ${data.id}`);
        
        // Remove product from catalog
        products = products.filter(p => p.id !== productId);
        console.log(`   Product REMOVED from catalog`);
      } else {
        console.log(`   Failed to send alert`);
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  } else if (product.stock <= LOW_STOCK_THRESHOLD && product.stock > 0) {
    console.log(`\nLOW STOCK DETECTED!`);
    console.log(`   Status: ${product.stock} units remaining (threshold: ${LOW_STOCK_THRESHOLD})`);
    console.log(`   Sending alert to admin...`);

    // Send alert email
    try {
      const emailHTML = generateLowStockEmailHTML({
        productId: product.id,
        productName: product.name,
        brand: product.brand,
        currentStock: product.stock,
        price: product.price,
      });

      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: ADMIN_EMAIL,
          subject: `LOW STOCK: ${product.name} (${product.stock} units)`,
          html: emailHTML,
          tags: {
            category: 'inventory',
            type: 'low-stock',
            productId: product.id,
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`   Alert Email Sent!`);
        console.log(`   Email ID: ${data.id}`);
      } else {
        console.log(`   Failed to send alert`);
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`);
    }
  } else {
    console.log(`   Stock level is healthy - no alert needed`);
  }
}

// Main test function
async function testLowStockSystem() {
  console.log('Low Stock Alert System Test');
  console.log('='.repeat(50));
  console.log(`Low Stock Threshold: ${LOW_STOCK_THRESHOLD} units\n`);

  // Scenario 1: Solar Panel - Drop to low stock
  await simulatePurchase('PROD-PANEL-001', 8);

  // Scenario 2: Solar Panel - Drop to out of stock
  await simulatePurchase('PROD-PANEL-001', 2);

  // Scenario 3: Battery - Drop to low stock
  await simulatePurchase('PROD-BATT-001', 7);

  // Scenario 4: Inverter - Drop to out of stock
  await simulatePurchase('PROD-INV-001', 12);

  // Show final inventory
  console.log('\n' + '='.repeat(50));
  console.log('FINAL INVENTORY STATUS');
  console.log('='.repeat(50));
  if (products.length === 0) {
    console.log('\nAll products are out of stock and removed.');
  } else {
    console.log('\nRemaining Products in Catalog:');
    products.forEach(p => {
      console.log(`  - ${p.name}: ${p.stock} units`);
    });
  }
  console.log('\nOut of Stock (Removed):');
  console.log(`  - Ultra High-Efficiency Solar Panel: REMOVED`);
  console.log(`  - Smart Hybrid Power Inverter: REMOVED`);

  console.log('\nTest Complete!');
}

// Run the test
testLowStockSystem().catch(console.error);
