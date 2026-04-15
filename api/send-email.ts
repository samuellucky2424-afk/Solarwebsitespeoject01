/**
 * API Endpoint for sending emails via Resend
 * This should be deployed as a serverless function or backend route
 *
 * For development, set up a simple Node.js server that handles this route
 * For production, deploy to Vercel or similar platform
 *
 * Usage:
 * POST /api/send-email
 * Body:
 * {
 *   to: "recipient@example.com",
 *   subject: "Email Subject",
 *   html: "<html>...</html>",
 *   tags: { ... }
 * }
 */

// This is a Vercel serverless function example
// Place this file in: api/send-email.ts (for Vercel) or implement as your backend route

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const requestBody =
      typeof req.body === 'string'
        ? JSON.parse(req.body)
        : (req.body || {});

    const { to, subject, html, replyTo, tags, useAdminEmail } = requestBody;
    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim();

    const resolvedTo =
      useAdminEmail
        ? adminEmail
        : to;

    if (!resolvedTo || !subject || !html) {
      return res.status(400).json({
        error: 'Missing required fields: recipient, subject, html',
      });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY environment variable not set');
      return res.status(500).json({
        error: 'Email service not configured',
      });
    }

    if (useAdminEmail && !adminEmail) {
      console.error('ADMIN_EMAIL environment variable not set');
      return res.status(500).json({
        error: 'Admin email is not configured',
      });
    }

    if (!resendFromEmail) {
      console.error('RESEND_FROM_EMAIL environment variable not set');
      return res.status(500).json({
        error: 'Sender email is not configured',
      });
    }

    const emailPayload: any = {
      from: resendFromEmail,
      to: resolvedTo,
      subject,
      html,
    };

    if (replyTo) {
      emailPayload.replyTo = replyTo;
    }

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
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return res.status(response.status).json({
        error: data.message || 'Failed to send email',
        details: data,
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
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
