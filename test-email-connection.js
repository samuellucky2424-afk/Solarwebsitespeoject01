/**
 * Quick Email Connection Test
 * Run this to verify your Resend API key works
 * 
 * Usage: node test-email-connection.js your-email@example.com
 */

import dotenv from 'dotenv';

dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL;

// Get recipient email from command line argument
const recipientEmail = process.argv[2];

if (!recipientEmail) {
  console.error('âŒ Please provide a recipient email address');
  console.error('Usage: node test-email-connection.js your-email@example.com');
  process.exit(1);
}

if (!RESEND_API_KEY) {
  console.error('âŒ RESEND_API_KEY not found in .env file');
  console.error('Please add: RESEND_API_KEY=re_your_api_key_here');
  process.exit(1);
}

if (!RESEND_FROM_EMAIL) {
  console.error('âŒ RESEND_FROM_EMAIL not found in .env file');
  console.error('Please add your verified sender address to RESEND_FROM_EMAIL');
  process.exit(1);
}

console.log('\nðŸ§ª Testing Email Connection...\n');
console.log(`From: ${RESEND_FROM_EMAIL}`);
console.log(`To: ${recipientEmail}`);
console.log(`API Key: ${RESEND_API_KEY.substring(0, 10)}...\n`);

const testEmail = {
  from: RESEND_FROM_EMAIL,
  to: recipientEmail,
  subject: 'Test Email - Greenlife Solar Solutions',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #0d1b0f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
        .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">âœ… Email Test Successful!</h1>
        </div>
        <div class="content">
          <div class="success">
            <strong>ðŸŽ‰ Congratulations!</strong><br>
            Your email configuration is working correctly.
          </div>
          
          <h2>What This Means:</h2>
          <ul>
            <li>âœ… Your Resend API key is valid</li>
            <li>âœ… Email sending is configured correctly</li>
            <li>âœ… Your application can now send notifications</li>
          </ul>
          
          <h2>Next Steps:</h2>
          <ol>
            <li>Start the local API server: <code>node api-server.js</code></li>
            <li>Start your dev server: <code>npm run dev</code></li>
            <li>Test email notifications in your application</li>
          </ol>
          
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>From: ${RESEND_FROM_EMAIL}</li>
            <li>To: ${recipientEmail}</li>
            <li>Time: ${new Date().toLocaleString()}</li>
          </ul>
        </div>
        <div class="footer">
          <p>Greenlife Solar Solutions - Email System Test</p>
          <p>This is an automated test email</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

async function sendTestEmail() {
  try {
    console.log('ðŸ“¤ Sending test email...\n');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(testEmail),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('âŒ Email sending failed!\n');
      console.error('Status:', response.status);
      console.error('Error:', data);
      
      if (response.status === 401) {
        console.error('\nðŸ’¡ Tip: Your API key might be invalid. Check:');
        console.error('   1. The key is correct in your .env file');
        console.error('   2. The key hasn\'t been revoked in Resend dashboard');
      } else if (response.status === 403) {
        console.error('\nðŸ’¡ Tip: Domain verification might be required. Check:');
        console.error('   1. Verify your domain at https://resend.com/domains');
        console.error('   2. Or use Resend\'s test domain for development');
      }
      
      process.exit(1);
    }

    console.log('âœ… Email sent successfully!\n');
    console.log('Email ID:', data.id);
    console.log('\nðŸ“¬ Check your inbox at:', recipientEmail);
    console.log('   (Don\'t forget to check spam/junk folder)\n');
    console.log('ðŸŽ‰ Your email configuration is working!\n');
    console.log('Next steps:');
    console.log('   1. Run: node api-server.js');
    console.log('   2. Run: npm run dev (in another terminal)');
    console.log('   3. Test email notifications in your app\n');
    
  } catch (error) {
    console.error('âŒ Connection error:', error.message);
    console.error('\nðŸ’¡ Possible issues:');
    console.error('   1. No internet connection');
    console.error('   2. Firewall blocking the request');
    console.error('   3. Resend API is down (check https://status.resend.com)\n');
    process.exit(1);
  }
}

sendTestEmail();
