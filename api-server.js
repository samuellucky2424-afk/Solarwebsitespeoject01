/**
 * Local Development Email API Server
 * Run this alongside your Vite dev server to test emails locally
 * 
 * Usage:
 * 1. Add RESEND_API_KEY to your .env file
 * 2. Run: node api-server.js
 * 3. In another terminal: npm run dev
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@greenlifesolarsolution.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'infogreenlifetechnology@gmail.com';

console.log('\n🚀 Starting Email API Server...\n');

if (!RESEND_API_KEY) {
  console.error('❌ ERROR: RESEND_API_KEY not found in .env file');
  console.error('📝 Please add the following to your .env file:');
  console.error('   RESEND_API_KEY=re_your_api_key_here');
  console.error('   RESEND_FROM_EMAIL=noreply@greenlifesolarsolution.com');
  console.error('   ADMIN_EMAIL=infogreenlifetechnology@gmail.com\n');
  process.exit(1);
}

console.log('✅ Configuration loaded:');
console.log(`   From Email: ${RESEND_FROM_EMAIL}`);
console.log(`   Admin Email: ${ADMIN_EMAIL}`);
console.log(`   API Key: ${RESEND_API_KEY.substring(0, 10)}...`);
console.log('');

app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, replyTo, tags } = req.body;

    console.log(`📧 Incoming email request: ${subject} → ${to}`);

    if (!to || !subject || !html) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields: to, subject, html',
      });
    }

    const emailPayload = {
      from: RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    };

    if (replyTo) emailPayload.replyTo = replyTo;
    if (tags) {
      emailPayload.tags = Object.entries(tags).map(([name, value]) => ({
        name,
        value: String(value),
      }));
    }

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
      console.error('❌ Resend API error:', data);
      return res.status(response.status).json({
        error: data.message || 'Failed to send email',
        details: data,
      });
    }

    console.log(`✅ Email sent successfully! ID: ${data.id}\n`);
    
    res.json({
      success: true,
      id: data.id,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'email-api',
    configured: !!RESEND_API_KEY 
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Email API server running on http://localhost:${PORT}`);
  console.log(`📬 Endpoint: http://localhost:${PORT}/api/send-email`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health\n`);
  console.log('Ready to receive email requests!\n');
});
