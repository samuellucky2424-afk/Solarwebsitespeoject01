import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { visitorName, visitorEmail, message, conversationId } = await request.json();

    if (!visitorName || !visitorEmail || !message || !conversationId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'infogreenlifetechnology@gmail.com';
    const chatLink = `${process.env.VITE_APP_URL || 'https://greenlifesolar.com'}/#/admin/dashboard?view=live-chat&conversation=${conversationId}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d6e3d; border-bottom: 2px solid #fbbf24; padding-bottom: 10px;">
          💬 New Live Chat Message
        </h2>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>From:</strong> ${visitorName}</p>
          <p><strong>Email:</strong> <a href="mailto:${visitorEmail}">${visitorEmail}</a></p>
          <p><strong>Conversation ID:</strong> ${conversationId}</p>
        </div>

        <div style="background-color: #fff8e1; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0;">
          <p><strong>Message:</strong></p>
          <p style="margin: 10px 0; color: #333;">${message.replace(/\n/g, '<br>')}</p>
        </div>

        <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <a href="${chatLink}" style="background-color: #0d6e3d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
            View Conversation →
          </a>
        </div>

        <div style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p>This is an automated notification from Greenlife Solar Live Chat Support.</p>
          <p>Reply to this message from the admin dashboard to continue the conversation.</p>
        </div>
      </div>
    `;

    const response = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@greenlifesolar.com',
      to: adminEmail,
      subject: `🔔 New Chat Message from ${visitorName}`,
      html: emailHtml
    });

    if (response.error) {
      console.error('Email sending error:', response.error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email notification' }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, messageId: response.data?.id }),
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
