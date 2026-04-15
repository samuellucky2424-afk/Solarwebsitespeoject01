import { createClient } from '@supabase/supabase-js';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitEntry>();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const AUTHENTICATED_LIMIT = 20;
const ADMIN_NOTIFICATION_LIMIT = 8;

function getClientIp(req: any) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }

  return req.socket?.remoteAddress || 'unknown';
}

function enforceRateLimit(key: string, limit: number) {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (existing.count >= limit) {
    return false;
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  return true;
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
  ]);

  if (appUrl) {
    allowedOrigins.add(appUrl.replace(/\/$/, ''));
  }

  if (host) {
    allowedOrigins.add(`https://${host}`);
    allowedOrigins.add(`http://${host}`);
  }

  if (!origin) {
    return false;
  }

  return allowedOrigins.has(origin.replace(/\/$/, ''));
}

async function getAuthenticatedUser(req: any) {
  const authHeader = String(req.headers.authorization || '').trim();
  const supabaseUrl = String(process.env.SUPABASE_URL || '').trim();
  const anonKey = String(process.env.SUPABASE_ANON_KEY || '').trim();

  if (!authHeader || !supabaseUrl || !anonKey) {
    return null;
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return null;
  }

  return data.user;
}

function normalizeRecipient(to: unknown) {
  if (Array.isArray(to)) {
    return to.length === 1 ? String(to[0] || '').trim() : '';
  }

  return String(to || '').trim();
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Invalid request origin' });
  }

  try {
    const requestBody =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : (req.body || {});

    const { to, subject, html, replyTo, tags, useAdminEmail } = requestBody;
    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim();
    const resendApiKey = process.env.RESEND_API_KEY?.trim();

    if (!resendApiKey || !resendFromEmail) {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const resolvedTo = useAdminEmail ? adminEmail : normalizeRecipient(to);
    const normalizedReplyTo = String(replyTo || '').trim();
    const normalizedSubject = String(subject || '').trim();
    const normalizedHtml = typeof html === 'string' ? html : '';

    if (!resolvedTo || !normalizedSubject || !normalizedHtml) {
      return res.status(400).json({
        error: 'Missing required fields: recipient, subject, html',
      });
    }

    if (!EMAIL_REGEX.test(resolvedTo)) {
      return res.status(400).json({ error: 'Invalid recipient email address' });
    }

    if (normalizedReplyTo && !EMAIL_REGEX.test(normalizedReplyTo)) {
      return res.status(400).json({ error: 'Invalid reply-to email address' });
    }

    if (normalizedSubject.length > 200) {
      return res.status(400).json({ error: 'Subject is too long' });
    }

    if (normalizedHtml.length > 250000) {
      return res.status(400).json({ error: 'Email body is too large' });
    }

    const authenticatedUser = await getAuthenticatedUser(req);

    if (!authenticatedUser) {
      return res.status(401).json({ error: 'Authentication is required for email delivery' });
    }

    const ip = getClientIp(req);

    if (useAdminEmail) {
      if (!adminEmail) {
        return res.status(500).json({ error: 'Admin email is not configured' });
      }

      if (normalizeRecipient(to)) {
        return res.status(400).json({ error: 'Admin email requests cannot override the recipient' });
      }

      if (!enforceRateLimit(`admin-email:${authenticatedUser.id}:${ip}`, ADMIN_NOTIFICATION_LIMIT)) {
        return res.status(429).json({ error: 'Too many email requests. Please try again later.' });
      }
    } else {
      if (!authenticatedUser.email || authenticatedUser.email.trim().toLowerCase() !== resolvedTo.toLowerCase()) {
        return res.status(403).json({ error: 'You can only send email to your own account address' });
      }

      if (!enforceRateLimit(`user-email:${authenticatedUser.id}`, AUTHENTICATED_LIMIT)) {
        return res.status(429).json({ error: 'Too many email requests. Please try again later.' });
      }
    }

    const emailPayload: any = {
      from: resendFromEmail,
      to: resolvedTo,
      subject: normalizedSubject,
      html: normalizedHtml,
    };

    if (normalizedReplyTo) {
      emailPayload.replyTo = normalizedReplyTo;
    }

    if (tags && typeof tags === 'object' && !Array.isArray(tags)) {
      emailPayload.tags = Object.entries(tags).slice(0, 10).map(([name, value]) => ({
        name: String(name).slice(0, 64),
        value: String(value ?? '').slice(0, 128),
      }));
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return res.status(response.status).json({
        error: data.message || 'Failed to send email',
      });
    }

    return res.status(200).json({
      success: true,
      id: data.id,
      to: resolvedTo,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error in send-email endpoint:', error);
    return res.status(500).json({
      error: 'Internal server error',
    });
  }
}
