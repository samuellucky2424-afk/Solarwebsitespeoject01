#!/usr/bin/env node

/**
 * Test script to verify Resend API email sending functionality
 * 
 * Usage:
 *   node test-resend.js
 *   node test-resend.js your-test@email.com
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file manually
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
const RESEND_FROM_EMAIL = envVars.RESEND_FROM_EMAIL || 'noreply@greenlifesolarsolution.com';

// Get recipient email from command line argument or use a test default
const recipientEmail = process.argv[2] || 'infogreenlifetechnology@gmail.com';

async function testResendAPI() {
  console.log('🧪 Testing Resend API Email Functionality');
  console.log('==========================================\n');

  // Check if API key is set
  if (!RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY is not set in .env file');
    console.log('\nTo set up Resend:');
    console.log('1. Go to https://resend.com/api-keys');
    console.log('2. Create an API key');
    console.log('3. Add RESEND_API_KEY to your .env file\n');
    process.exit(1);
  }

  console.log(`✓ RESEND_API_KEY is configured`);
  console.log(`✓ From Email: ${RESEND_FROM_EMAIL}`);
  console.log(`✓ Test Recipient: ${recipientEmail}\n`);

  const emailPayload = {
    from: RESEND_FROM_EMAIL,
    to: recipientEmail,
    subject: 'Test Email from Resend API',
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">🎉 Resend API Test Email</h2>
            <p>Hello,</p>
            <p>This is a test email to verify that the Resend API is working correctly with your application.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Sent at: ${new Date().toISOString()}</li>
              <li>From: ${RESEND_FROM_EMAIL}</li>
              <li>To: ${recipientEmail}</li>
            </ul>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p>If you're reading this, the Resend API is working! 🚀</p>
            <p style="color: #666; font-size: 12px;">This is an automated test email.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    console.log('📤 Sending test email...\n');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Email Send Failed');
      console.error(`Status: ${response.status}`);
      console.error(`Error:`, data);

      if (data.message === 'Unauthorized') {
        console.log('\n⚠️  API key appears to be invalid. Please verify:');
        console.log('1. The RESEND_API_KEY in your .env file is correct');
        console.log('2. The key hasn\'t been revoked in your Resend dashboard');
      }
      process.exit(1);
    }

    console.log('✅ Email Sent Successfully!');
    console.log(`\n📧 Email ID: ${data.id}`);
    console.log(`\n✓ The Resend API is working correctly!`);
    console.log(`✓ Check your inbox at ${recipientEmail} for the test email.\n`);

  } catch (error) {
    console.error('❌ Error connecting to Resend API:');
    console.error(error.message);
    console.log('\nPossible causes:');
    console.log('- Network connectivity issue');
    console.log('- Invalid RESEND_API_KEY');
    console.log('- Resend API service temporarily unavailable\n');
    process.exit(1);
  }
}

// Run the test
testResendAPI().catch(console.error);
