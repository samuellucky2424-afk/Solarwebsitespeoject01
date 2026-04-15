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
      return res.status(503).json({
        error: 'Email service is not configured',
      });
    }

    const { to, subject, html, replyTo, tags, useAdminEmail } = req.body || {};
    const resolvedTo = useAdminEmail ? ADMIN_EMAIL : to;

    if (!resolvedTo || !subject || !html) {
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
      return res.status(response.status).json({
        error: data.message || 'Failed to send email',
      });
    }

    return res.json({
      success: true,
      id: data.id,
      to: resolvedTo,
      message: 'Email sent successfully',
    });
  } catch (error) {
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

app.listen(PORT, HOST, () => {
  console.log(`Email API server running on http://${HOST}:${PORT}`);
});
