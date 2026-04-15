import { createClient } from '@supabase/supabase-js';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rateLimitStore = new Map<string, RateLimitEntry>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 10;
const CONVERSATION_NOTIFICATION_LIMIT = 1;

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

function enforceRateLimit(key: string, limit: number = MAX_REQUESTS) {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (existing.count >= limit) {
    return false;
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  return true;
}

function escapeHtml(value: unknown) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeComparisonValue(value: unknown) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function normalizePhone(value: unknown) {
  return String(value || '').replace(/\D/g, '');
}

async function validateStoredConversation(input: {
  conversationId: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  message: string;
}) {
  const supabaseUrl = String(process.env.SUPABASE_URL || '').trim();
  const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return { valid: false, error: 'Live chat notification service is not configured' };
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const conversationResult = await supabase
    .from('live_chat_conversations')
    .select('id, visitor_name, visitor_email, visitor_phone')
    .eq('id', input.conversationId)
    .maybeSingle();

  if (conversationResult.error || !conversationResult.data) {
    return { valid: false, error: 'Conversation could not be verified' };
  }

  const conversation = conversationResult.data;
  const detailsMatch =
    normalizeComparisonValue(conversation.visitor_name) === normalizeComparisonValue(input.visitorName) &&
    normalizeComparisonValue(conversation.visitor_email) === normalizeComparisonValue(input.visitorEmail) &&
    normalizePhone(conversation.visitor_phone) === normalizePhone(input.visitorPhone);

  if (!detailsMatch) {
    return { valid: false, error: 'Conversation details did not match the saved visitor details' };
  }

  const firstVisitorMessageResult = await supabase
    .from('live_chat_messages')
    .select('message')
    .eq('conversation_id', input.conversationId)
    .eq('sender_type', 'visitor')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (firstVisitorMessageResult.error || !firstVisitorMessageResult.data) {
    return { valid: false, error: 'Conversation message could not be verified' };
  }

  const storedMessage = normalizeComparisonValue(firstVisitorMessageResult.data.message);
  if (storedMessage !== normalizeComparisonValue(input.message)) {
    return { valid: false, error: 'The notification message did not match the saved chat message' };
  }

  return { valid: true };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!validateOrigin(req)) {
    return res.status(403).json({ error: 'Invalid request origin' });
  }

  const ip = getClientIp(req);
  if (!enforceRateLimit(`live-chat-notification:${ip}`)) {
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  try {
    const payload = typeof req.body === 'string'
      ? JSON.parse(req.body)
      : (req.body || {});

    const {
      visitorName,
      visitorEmail,
      visitorPhone,
      message,
      conversationId,
      notificationType,
    } = payload;

    const rawVisitorName = String(visitorName || '').trim().slice(0, 120);
    const rawVisitorEmail = String(visitorEmail || '').trim().slice(0, 160);
    const rawVisitorPhone = String(visitorPhone || '').trim().slice(0, 40);
    const rawConversationId = String(conversationId || '').trim().slice(0, 80);
    const rawMessage = String(message || '').trim().slice(0, 5000);

    const safeVisitorName = escapeHtml(rawVisitorName);
    const safeVisitorEmail = escapeHtml(rawVisitorEmail);
    const safeVisitorPhone = escapeHtml(rawVisitorPhone);
    const safeConversationId = escapeHtml(rawConversationId);
    const safeMessage = escapeHtml(rawMessage).replace(/\n/g, '<br>');

    if (!rawVisitorName || !rawVisitorEmail || !rawMessage || !rawConversationId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!EMAIL_REGEX.test(rawVisitorEmail)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    if (notificationType !== 'initial-inquiry') {
      return res.status(400).json({ error: 'Only initial live chat inquiries can trigger notifications' });
    }

    const validation = await validateStoredConversation({
      conversationId: rawConversationId,
      visitorName: rawVisitorName,
      visitorEmail: rawVisitorEmail,
      visitorPhone: rawVisitorPhone,
      message: rawMessage,
    });

    if (!validation.valid) {
      return res.status(403).json({ error: validation.error || 'Conversation validation failed' });
    }

    if (!enforceRateLimit(`live-chat-notification:${safeConversationId}`, CONVERSATION_NOTIFICATION_LIMIT)) {
      return res.status(429).json({ error: 'This conversation has already triggered a notification.' });
    }

    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim();

    if (!resendApiKey || !adminEmail || !resendFromEmail) {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const appUrl = process.env.APP_URL || 'https://greenlifesolarsolution.com';
    const chatLink = `${appUrl}/#/admin/dashboard?view=live-chat&conversation=${encodeURIComponent(safeConversationId)}`;
    const heading = 'New Live Chat Inquiry';
    const subject = `New Live Chat Inquiry from ${safeVisitorName}`;
    const introText = 'A visitor has saved their first live chat message and is waiting for a response.';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d6e3d; border-bottom: 2px solid #fbbf24; padding-bottom: 10px;">
          ${heading}
        </h2>

        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 16px 0 20px;">
          ${introText}
        </p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>From:</strong> ${safeVisitorName}</p>
          <p><strong>Email:</strong> <a href="mailto:${safeVisitorEmail}">${safeVisitorEmail}</a></p>
          ${safeVisitorPhone ? `<p><strong>Phone:</strong> ${safeVisitorPhone}</p>` : ''}
          <p><strong>Conversation ID:</strong> ${safeConversationId}</p>
          <p><strong>Received:</strong> ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>

        <div style="background-color: #fff8e1; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0;">
          <p><strong>First visitor message:</strong></p>
          <p style="margin: 10px 0; color: #333;">${safeMessage}</p>
        </div>

        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <a href="${chatLink}" style="background-color: #0d6e3d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            View Conversation
          </a>
        </div>

        <div style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p>This is an automated notification from Greenlife Solar support.</p>
          <p>Reply from the admin dashboard or contact the visitor directly by email or phone.</p>
        </div>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: adminEmail,
        subject,
        html: emailHtml,
        replyTo: safeVisitorEmail,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Email sending error:', responseData);
      return res.status(response.status).json({
        error: responseData?.message || 'Failed to send email notification',
      });
    }

    return res.status(200).json({
      success: true,
      messageId: responseData?.id || null,
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
