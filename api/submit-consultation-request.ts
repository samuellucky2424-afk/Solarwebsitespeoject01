import { createClient } from '@supabase/supabase-js';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+()\-\s]{7,25}$/;

type ConsultationNotificationStatus = 'sent' | 'skipped' | 'failed';

function getClientIp(req: any) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'unknown';
}

function validateOrigin(req: any) {
  const origin = String(req.headers.origin || '').trim();
  const host = String(req.headers.host || '').trim();
  const appUrl = String(process.env.APP_URL || '').trim();

  const allowedOrigins = new Set<string>([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:5000',
    'http://127.0.0.1:5000',
  ]);

  if (appUrl) {
    allowedOrigins.add(appUrl.replace(/\/$/, ''));
  }

  if (host) {
    allowedOrigins.add(`https://${host}`);
    allowedOrigins.add(`http://${host}`);
  }

  return !!origin && allowedOrigins.has(origin.replace(/\/$/, ''));
}

function enforceRateLimit(key: string) {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (existing.count >= MAX_REQUESTS) {
    return false;
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  return true;
}

function normalizeText(value: unknown, maxLength: number) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function normalizeMultilineText(value: unknown, maxLength: number) {
  return String(value || '')
    .replace(/\r\n/g, '\n')
    .trim()
    .slice(0, maxLength);
}

function buildSafeMetadata(input: unknown) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {};
  }

  const source = input as Record<string, unknown>;
  const safeMetadata: Record<string, unknown> = {};

  const stringFields: Array<[string, number]> = [
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

function escapeHtml(value: unknown) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatNairaHtml(value: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    return 'Not provided';
  }

  return `&#8358;${amount.toLocaleString()}`;
}

function buildConsultationAdminEmailHtml(input: {
  customer: string;
  email: string;
  phone: string;
  address: string;
  title: string;
  description: string;
  packageId: string;
  metadata: Record<string, unknown>;
  requestId: string | null;
}) {
  const additionalAppliances = Array.isArray(input.metadata.additionalAppliances)
    ? input.metadata.additionalAppliances.map((item) => escapeHtml(item)).join(', ')
    : '';

  const metadataRows = [
    ['Roof Type', input.metadata.roofType],
    ['Housing Type', input.metadata.housingType],
    ['Bedrooms', input.metadata.bedroomCount],
    ['Fans', input.metadata.fans],
    ['TVs', input.metadata.tvs],
    ['Fridges', input.metadata.fridges],
    ['AC Units', input.metadata.acCount],
    ['Washing Machines', input.metadata.washingMachineCount],
    ['Selected Package', input.metadata.quoteTitle],
    ['Package Tagline', input.metadata.quoteTagline],
    ['Package Price', formatNairaHtml(input.metadata.quotePrice)],
    ['Inverter', input.metadata.inverter],
    ['Battery', input.metadata.battery],
    ['Panels', input.metadata.panels],
    ['Load Profile', input.metadata.loadText],
    ['Package ID', input.packageId || 'Not provided'],
    ['Additional Appliances', additionalAppliances || 'None'],
  ];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #243224; background: #f5f7fa; padding: 20px; }
    .container { max-width: 720px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08); }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 28px 24px; }
    .content { padding: 28px 24px; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 16px; margin: 0 0 12px; color: #0d1b0f; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .card { background: #f8fcf8; border: 1px solid #e7f3e8; border-radius: 8px; padding: 12px; }
    .label { font-size: 11px; text-transform: uppercase; color: #4c9a52; font-weight: 700; margin-bottom: 4px; }
    .value { font-size: 14px; color: #243224; }
    .details { background: #fffbea; border-left: 4px solid #f0b429; border-radius: 8px; padding: 16px; white-space: pre-wrap; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 10px 0; border-bottom: 1px solid #eef4ef; vertical-align: top; font-size: 14px; }
    td:first-child { width: 180px; color: #4c9a52; font-weight: 700; }
    .footer { background: #f8fcf8; padding: 18px 24px; font-size: 12px; color: #667085; border-top: 1px solid #e7f3e8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">New Consultation Request</h1>
      <p style="margin: 8px 0 0; opacity: 0.92;">A public visitor submitted a solar consultation form.</p>
    </div>
    <div class="content">
      <div class="section">
        <h2>Customer Details</h2>
        <div class="grid">
          <div class="card">
            <div class="label">Customer</div>
            <div class="value">${escapeHtml(input.customer)}</div>
          </div>
          <div class="card">
            <div class="label">Request ID</div>
            <div class="value">${escapeHtml(input.requestId || 'Pending')}</div>
          </div>
          <div class="card">
            <div class="label">Email</div>
            <div class="value"><a href="mailto:${escapeHtml(input.email)}">${escapeHtml(input.email)}</a></div>
          </div>
          <div class="card">
            <div class="label">Phone</div>
            <div class="value"><a href="tel:${escapeHtml(input.phone)}">${escapeHtml(input.phone)}</a></div>
          </div>
          <div class="card" style="grid-column: 1 / -1;">
            <div class="label">Address</div>
            <div class="value">${escapeHtml(input.address)}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Request Summary</h2>
        <table>
          <tbody>
            <tr>
              <td>Title</td>
              <td>${escapeHtml(input.title)}</td>
            </tr>
            ${metadataRows.map(([label, value]) => `
              <tr>
                <td>${escapeHtml(label)}</td>
                <td>${typeof value === 'string' && value.includes('&#8358;') ? value : escapeHtml(value || 'Not provided')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Customer Notes</h2>
        <div class="details">${escapeHtml(input.description)}</div>
      </div>
    </div>
    <div class="footer">
      Greenlife Solar Solutions consultation notification. Reply directly to ${escapeHtml(input.email)} to follow up.
    </div>
  </div>
</body>
</html>
  `;
}

async function sendConsultationAdminNotification(input: {
  customer: string;
  email: string;
  phone: string;
  address: string;
  title: string;
  description: string;
  packageId: string;
  metadata: Record<string, unknown>;
  requestId: string | null;
}): Promise<ConsultationNotificationStatus> {
  const resendApiKey = String(process.env.RESEND_API_KEY || '').trim();
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim();
  const resendFromEmail = String(process.env.RESEND_FROM_EMAIL || '').trim();

  if (!resendApiKey || !adminEmail || !resendFromEmail) {
    return 'skipped';
  }

  const html = buildConsultationAdminEmailHtml(input);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: adminEmail,
        subject: `New Consultation Request - ${input.customer}`,
        html,
        replyTo: input.email,
        tags: [
          { name: 'category', value: 'consultation' },
          { name: 'type', value: 'admin-notification' },
          { name: 'source', value: 'public-form' },
        ],
      }),
    });

    if (!response.ok) {
      const responseData = await response.json().catch(() => null);
      console.warn('Consultation admin email failed:', response.status, responseData);
      return 'failed';
    }

    return 'sent';
  } catch (error) {
    console.warn('Consultation admin email exception:', error);
    return 'failed';
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Invalid request origin' });
  }

  const ip = getClientIp(req);
  if (!enforceRateLimit(`consultation:${ip}`)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    const requestBody = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : (req.body || {});

    const {
      title,
      customer,
      email,
      phone,
      address,
      description,
      packageId,
      metadata,
    } = requestBody;

    const normalizedCustomer = normalizeText(customer, 120);
    const normalizedEmail = String(email || '').trim().slice(0, 160);
    const normalizedPhone = normalizeText(phone, 40);
    const normalizedAddress = normalizeText(address, 400);
    const normalizedTitle = normalizeText(title, 200);
    const normalizedDescription = normalizeMultilineText(description, 10000);
    const normalizedPackageId = normalizeText(packageId, 120);
    const safeMetadata = buildSafeMetadata(metadata);

    if (!normalizedCustomer || !normalizedEmail || !normalizedPhone || !normalizedAddress || !normalizedTitle || !normalizedDescription) {
      return res.status(400).json({ error: 'Missing required consultation fields' });
    }

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (!PHONE_REGEX.test(normalizedPhone)) {
      return res.status(400).json({ error: 'Invalid phone number' });
    }

    const supabaseUrl = String(process.env.SUPABASE_URL || '').trim();
    const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

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
      console.error('Consultation request insert failed:', error);
      return res.status(500).json({ error: 'Failed to save consultation request' });
    }

    const notificationStatus = await sendConsultationAdminNotification({
      customer: normalizedCustomer,
      email: normalizedEmail,
      phone: normalizedPhone,
      address: normalizedAddress,
      title: normalizedTitle,
      description: normalizedDescription,
      packageId: normalizedPackageId,
      metadata: safeMetadata,
      requestId: data?.id ?? null,
    });

    return res.status(200).json({
      success: true,
      id: data?.id ?? null,
      notificationStatus,
    });
  } catch (error) {
    console.error('submit-consultation-request error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
