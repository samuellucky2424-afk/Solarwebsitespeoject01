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
const RESEND_FROM_EMAIL = envVars.RESEND_FROM_EMAIL;

// Get recipient email from command line argument
const recipientEmail = process.argv[2];

async function testResendAPI() {
  console.log('ðŸ§ª Testing Resend API Email Functionality');
  console.log('==========================================\n');

  // Check if API key is set
  if (!RESEND_API_KEY) {
    console.error('âŒ RESEND_API_KEY is not set in .env file');
    console.log('\nTo set up Resend:');
    console.log('1. Go to https://resend.com/api-keys');
    console.log('2. Create an API key');
    console.log('3. Add RESEND_API_KEY to your .env file\n');
    process.exit(1);
  }

  console.log(`âœ“ RESEND_API_KEY is configured`);
  console.log(`âœ“ From Email: ${RESEND_FROM_EMAIL}`);
  console.log(`âœ“ Test Recipient: ${recipientEmail}\n`);

  if (!RESEND_FROM_EMAIL) {
    console.error('âŒ RESEND_FROM_EMAIL is not set in .env file');
    console.log('Add your verified sender address to RESEND_FROM_EMAIL before testing.\n');
    process.exit(1);
  }

  if (!recipientEmail) {
    console.error('âŒ Please provide a recipient email address');
    console.log('Usage: node test-resend.js your-test@email.com\n');
    process.exit(1);
  }

  const emailPayload = {
    from: RESEND_FROM_EMAIL,
    to: recipientEmail,
    subject: 'Test Email from Resend API',
    html: `
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">ðŸŽ‰ Resend API Test Email</h2>
            <p>Hello,</p>
            <p>This is a test email to verify that the Resend API is working correctly with your application.</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Sent at: ${new Date().toISOString()}</li>
              <li>From: ${RESEND_FROM_EMAIL}</li>
              <li>To: ${recipientEmail}</li>
            </ul>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p>If you're reading this, the Resend API is working! ðŸš€</p>
            <p style="color: #666; font-size: 12px;">This is an automated test email.</p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    console.log('ðŸ“¤ Sending test email...\n');

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
      console.error('âŒ Email Send Failed');
      console.error(`Status: ${response.status}`);
      console.error(`Error:`, data);

      if (data.message === 'Unauthorized') {
        console.log('\nâš ï¸  API key appears to be invalid. Please verify:');
        console.log('1. The RESEND_API_KEY in your .env file is correct');
        console.log('2. The key hasn\'t been revoked in your Resend dashboard');
      }
      process.exit(1);
    }

    console.log('âœ… Email Sent Successfully!');
    console.log(`\nðŸ“§ Email ID: ${data.id}`);
    console.log(`\nâœ“ The Resend API is working correctly!`);
    console.log(`âœ“ Check your inbox at ${recipientEmail} for the test email.\n`);

  } catch (error) {
    console.error('âŒ Error connecting to Resend API:');
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
