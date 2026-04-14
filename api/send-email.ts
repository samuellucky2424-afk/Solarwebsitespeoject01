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
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html, replyTo, tags } = req.body;

    // Validate required fields
    if (!to || !subject || !html) {
      return res.status(400).json({
        error: 'Missing required fields: to, subject, html',
      });
    }

    // Get Resend API key from environment variables
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY environment variable not set');
      return res.status(500).json({
        error: 'Email service not configured',
      });
    }

    // Prepare email payload for Resend
    const emailPayload: any = {
      from: process.env.RESEND_FROM_EMAIL || 'noreply@greenlifesolarsolution.com',
      to,
      subject,
      html,
    };

    // Add optional fields
    if (replyTo) {
      emailPayload.replyTo = replyTo;
    }

    if (tags) {
      emailPayload.tags = Object.entries(tags).map(([name, value]) => ({
        name,
        value: String(value),
      }));
    }

    // Send email via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    const data = await response.json();

    // Check for errors
    if (!response.ok) {
      console.error('Resend API error:', data);
      return res.status(response.status).json({
        error: data.message || 'Failed to send email',
        details: data,
      });
    }

    // Success response
    return res.status(200).json({
      success: true,
      id: data.id,
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

/**
 * Alternative implementation using the Resend SDK
 * Uncomment this if you prefer using the SDK instead
 */

/*
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, subject, html, replyTo, tags } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        error: 'Missing required fields: to, subject, html',
      });
    }

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@greenlifesolarsolution.com',
      to,
      subject,
      html,
      ...(replyTo && { replyTo }),
      ...(tags && { tags }),
    });

    if (response.error) {
      console.error('Resend error:', response.error);
      return res.status(400).json({
        error: response.error.message,
      });
    }

    return res.status(200).json({
      success: true,
      id: response.data?.id,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
*/
