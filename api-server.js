/**
 * Local development API server.
 * This is intentionally bound to localhost only and avoids logging secrets.
 */

import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const HOST = '127.0.0.1';
const PORT = 3001;

app.use(cors({
  origin: [
    'http://127.0.0.1:5000',
    'http://localhost:5000',
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
  ],
  methods: ['GET', 'POST'],
}));
app.use(express.json());

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL?.trim();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim();
const isEmailConfigured = Boolean(
  RESEND_API_KEY && RESEND_FROM_EMAIL && ADMIN_EMAIL,
);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+()\-\s]{7,25}$/;

function normalizeText(value, maxLength) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function normalizeMultilineText(value, maxLength) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLength);
}

function buildSafeConsultationMetadata(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  const source = input;
  const safeMetadata = {};

  const stringFields = [
    ['roofType', 80],
    ['housingType', 80],
    ['quoteTitle', 160],
    ['quoteTagline', 200],
    ['loadText', 160],
    ['inverter', 120],
    ['battery', 120],
    ['panels', 120],
  ];

  for (const [field, maxLength] of stringFields) {
    const normalized = normalizeText(source[field], maxLength);
    if (normalized) {
      safeMetadata[field] = normalized;
    }
  }

  const numericFields = [
    'bedroomCount',
    'fans',
    'tvs',
    'fridges',
    'acCount',
    'washingMachineCount',
    'quotePrice',
  ];

  for (const field of numericFields) {
    const value = Number(source[field]);
    if (Number.isFinite(value) && value >= 0) {
      safeMetadata[field] = value;
    }
  }

  if (Array.isArray(source.additionalAppliances)) {
    const items = source.additionalAppliances
      .map((item) => normalizeText(item, 80))
      .filter(Boolean)
      .slice(0, 20);

    if (items.length > 0) {
      safeMetadata.additionalAppliances = items;
    }
  }

  return safeMetadata;
}

if (!isEmailConfigured) {
  console.warn(
    'Email delivery is not configured. Set RESEND_API_KEY, RESEND_FROM_EMAIL, and ADMIN_EMAIL in .env to enable /api/send-email.',
  );
}

app.post('/api/send-email', async (req, res) => {
  try {
    if (!isEmailConfigured) {
      console.log('❌ Email service not configured');
      return res.status(503).json({
        error: 'Email service is not configured',
      });
    }

    const { to, subject, html, replyTo, tags, useAdminEmail } = req.body || {};
    const resolvedTo = useAdminEmail ? ADMIN_EMAIL : to;

    console.log('📧 Email request received:');
    console.log('  - To:', resolvedTo);
    console.log('  - Subject:', subject);
    console.log('  - UseAdminEmail:', useAdminEmail);
    console.log('  - Tags:', tags);

    if (!resolvedTo || !subject || !html) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        error: 'Missing required fields: recipient, subject, html',
      });
    }

    const emailPayload = {
      from: RESEND_FROM_EMAIL,
      to: resolvedTo,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
      ...(tags
        ? {
            tags: Object.entries(tags).map(([name, value]) => ({
              name,
              value: String(value),
            })),
          }
        : {}),
    };

    console.log('📤 Sending to Resend with payload:', JSON.stringify(emailPayload, null, 2).slice(0, 200) + '...');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await response.json();

    console.log('📬 Resend response status:', response.status);
    console.log('📬 Resend response data:', data);

    if (!response.ok) {
      console.log('❌ Email failed with status', response.status, ':', data.message);
      return res.status(response.status).json({
        error: data.message || 'Failed to send email',
      });
    }

    console.log('✅ Email sent successfully with ID:', data.id);
    return res.json({
      success: true,
      id: data.id,
      to: resolvedTo,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.log('❌ Error in send-email endpoint:', error instanceof Error ? error.message : error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

app.post('/api/submit-consultation-request', async (req, res) => {
  try {
    const {
      title,
      customer,
      email,
      phone,
      address,
      description,
      packageId,
      metadata,
    } = req.body || {};

    const normalizedCustomer = normalizeText(customer, 120);
    const normalizedEmail = String(email || '').trim().slice(0, 160);
    const normalizedPhone = normalizeText(phone, 40);
    const normalizedAddress = normalizeText(address, 400);
    const normalizedTitle = normalizeText(title, 200);
    const normalizedDescription = normalizeMultilineText(description, 10000);
    const normalizedPackageId = normalizeText(packageId, 120);
    const safeMetadata = buildSafeConsultationMetadata(metadata);

    if (!normalizedCustomer || !normalizedEmail || !normalizedPhone || !normalizedAddress || !normalizedTitle || !normalizedDescription) {
      return res.status(400).json({ error: 'Missing required consultation fields' });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!PHONE_REGEX.test(normalizedPhone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    const supabaseUrl = process.env.SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: 'Database is not configured' });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await supabase.from('greenlife_hub').insert([{
      type: 'request',
      title: normalizedTitle,
      status: 'New',
      description: normalizedDescription,
      user_id: null,
      address: {
        address: normalizedAddress,
        phone: normalizedPhone,
        email: normalizedEmail,
      },
      metadata: {
        type: 'Consultation Request',
        priority: 'Normal',
        customer: normalizedCustomer,
        packageId: normalizedPackageId || null,
        ...safeMetadata,
      },
    }]).select('id').single();

    if (error) {
      return res.status(500).json({ error: 'Failed to save consultation request' });
    }

    return res.json({ success: true, id: data?.id || null });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'local-api',
    configured: isEmailConfigured,
  });
});

app.post('/api/send-invoice', async (req, res) => {
  try {
    if (!isEmailConfigured) {
      return res.status(503).json({ error: 'Email service is not configured' });
    }

    const { to, customerName, items, totalAmount, invoiceId, issueDate, dueDate } = req.body || {};

    if (!to || !customerName || !items || !totalAmount || !invoiceId) {
      return res.status(400).json({ error: 'Missing required invoice fields' });
    }

    const invoiceHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
        <div style="border-bottom: 2px solid #4CAF50; padding-bottom: 20px; margin-bottom: 20px; text-align: center;">
          <h1 style="color: #4CAF50; margin: 0;">Greenlife Solar</h1>
          <p style="margin: 5px 0 0 0; color: #666;">Official Invoice</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
          <div>
            <h3 style="margin-top: 0;">Billed To:</h3>
            <p style="margin: 0;"><strong>${customerName}</strong></p>
            <p style="margin: 0;">${to}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0;"><strong>Invoice Number:</strong> ${invoiceId}</p>
            <p style="margin: 0;"><strong>Issue Date:</strong> ${issueDate}</p>
            <p style="margin: 0;"><strong>Due Date:</strong> ${dueDate}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: #f5f5f5; text-align: left;">
              <th style="padding: 12px; border-bottom: 1px solid #ddd;">Description</th>
              <th style="padding: 12px; border-bottom: 1px solid #ddd; text-align: center;">Qty</th>
              <th style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">Unit Price</th>
              <th style="padding: 12px; border-bottom: 1px solid #ddd; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₦${Number(item.price).toLocaleString()}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₦${(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 12px; text-align: right; font-weight: bold;">Grand Total:</td>
              <td style="padding: 12px; text-align: right; font-weight: bold; color: #4CAF50; font-size: 1.2em;">₦${Number(totalAmount).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; text-align: center;">
          <p style="margin: 0; font-size: 0.9em;">Please remit payment by the due date. Thank you for your business!</p>
          <p style="margin: 10px 0 0 0; font-size: 0.8em; color: #888;">If you have any questions, please reply to this email.</p>
        </div>
      </div>
    `;

    const emailPayload = {
      from: RESEND_FROM_EMAIL,
      to,
      subject: `Invoice ${invoiceId} from Greenlife Solar`,
      html: invoiceHtml,
      tags: [{ name: 'type', value: 'invoice' }]
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to send invoice');

    return res.json({ success: true, id: data.id });
  } catch (error) {
    console.error('Invoice error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Cart Reminder Job
const supabaseUrl = process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (supabaseUrl && serviceRoleKey && isEmailConfigured) {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  // Run every 15 minutes
  setInterval(async () => {
    try {
      console.log('🔄 Running cart reminder check...');
      
      // Get all cart_state records
      const { data: carts, error } = await supabase
        .from('greenlife_hub')
        .select('id, user_id, metadata, profiles:user_id(email, full_name)')
        .eq('type', 'cart_state');

      if (error || !carts) return;

      const now = new Date();
      
      for (const cart of carts) {
        if (!cart.metadata?.items || cart.metadata.items.length === 0) continue;
        if (!cart.profiles || !cart.profiles.email) continue;
        
        const lastUpdated = new Date(cart.metadata.last_updated || new Date());
        const hoursSinceUpdate = (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
        
        let remindersSent = cart.metadata.reminders_sent || 0;
        
        // Conditions: > 1 hour old, < 24 hours old, max 3 reminders, hasn't been reminded recently
        if (hoursSinceUpdate >= 1 && hoursSinceUpdate < 24 && remindersSent < 3) {
          
          // Check if we sent one recently (within last 4 hours)
          const lastReminderTime = cart.metadata.last_reminder_time ? new Date(cart.metadata.last_reminder_time) : null;
          if (lastReminderTime) {
             const hoursSinceLastReminder = (now.getTime() - lastReminderTime.getTime()) / (1000 * 60 * 60);
             if (hoursSinceLastReminder < 4) continue; // Wait at least 4 hours between reminders
          }

          console.log(`📧 Sending cart reminder ${remindersSent + 1} to ${cart.profiles.email}`);
          
          const itemsHtml = cart.metadata.items.map(item => `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₦${Number(item.price).toLocaleString()}</td>
            </tr>
          `).join('');

          const total = cart.metadata.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #4CAF50; text-align: center;">You left something behind!</h2>
              <p>Hi ${cart.profiles.full_name || 'there'},</p>
              <p>We noticed you added some items to your cart but haven't completed your purchase yet. Your solar products are waiting for you!</p>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead style="background-color: #f5f5f5;">
                  <tr>
                    <th style="padding: 10px; text-align: left;">Item</th>
                    <th style="padding: 10px; text-align: center;">Qty</th>
                    <th style="padding: 10px; text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
                    <td style="padding: 10px; text-align: right; font-weight: bold; color: #4CAF50;">₦${total.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:5173/checkout" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Return to Checkout</a>
              </div>
            </div>
          `;

          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${RESEND_API_KEY}`,
              },
              body: JSON.stringify({
                from: RESEND_FROM_EMAIL,
                to: cart.profiles.email,
                subject: "Forget something? Your cart is waiting 🛒",
                html: emailHtml,
                tags: [{ name: 'type', value: 'cart_reminder' }]
              }),
            });

            // Update cart metadata to track reminder
            await supabase.from('greenlife_hub').update({
              metadata: {
                ...cart.metadata,
                reminders_sent: remindersSent + 1,
                last_reminder_time: new Date().toISOString()
              }
            }).eq('id', cart.id);

          } catch (e) {
            console.error("Failed to send cart reminder", e);
          }
        }
      }
    } catch (e) {
      console.error('Error in cart reminder job', e);
    }
  }, 15 * 60 * 1000); // 15 mins
}

app.listen(PORT, HOST, () => {
  console.log(`Email API server running on http://${HOST}:${PORT}`);
});
