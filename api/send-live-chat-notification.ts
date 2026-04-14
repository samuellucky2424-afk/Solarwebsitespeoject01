export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
      fallbackMode,
      notificationType,
    } = payload;

    if (!visitorName || !visitorEmail || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return res.status(500).json({ error: 'Email service not configured' });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'infogreenlifetechnology@gmail.com';
    const chatLink = conversationId
      ? `${process.env.VITE_APP_URL || 'https://greenlifesolar.com'}/#/admin/dashboard?view=live-chat&conversation=${conversationId}`
      : null;
    const isInitialInquiry = notificationType !== 'follow-up';
    const heading = fallbackMode
      ? 'New Support Message'
      : isInitialInquiry
        ? 'New Live Chat Inquiry'
        : 'Live Chat Follow-up';
    const subject = fallbackMode
      ? `Support Message from ${visitorName}`
      : isInitialInquiry
        ? `New Live Chat Inquiry from ${visitorName}`
        : `Live Chat Follow-up from ${visitorName}`;
    const introText = fallbackMode
      ? 'A visitor left a support message because live chat is currently using email fallback.'
      : isInitialInquiry
        ? 'A visitor has completed the contact step and sent their first chat message.'
        : 'A visitor sent an additional live chat message.';

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0d6e3d; border-bottom: 2px solid #fbbf24; padding-bottom: 10px;">
          ${heading}
        </h2>

        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 16px 0 20px;">
          ${introText}
        </p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>From:</strong> ${visitorName}</p>
          <p><strong>Email:</strong> <a href="mailto:${visitorEmail}">${visitorEmail}</a></p>
          ${visitorPhone ? `<p><strong>Phone:</strong> ${visitorPhone}</p>` : ''}
          ${conversationId ? `<p><strong>Conversation ID:</strong> ${conversationId}</p>` : ''}
          <p><strong>Received:</strong> ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
        </div>

        <div style="background-color: #fff8e1; border-left: 4px solid #fbbf24; padding: 15px; margin: 20px 0;">
          <p><strong>${isInitialInquiry ? 'First visitor message:' : 'Message:'}</strong></p>
          <p style="margin: 10px 0; color: #333;">${String(message).replace(/\n/g, '<br>')}</p>
        </div>

        ${!fallbackMode && chatLink ? `
          <div style="background-color: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <a href="${chatLink}" style="background-color: #0d6e3d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              View Conversation
            </a>
          </div>
        ` : ''}

        <div style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
          <p>This is an automated notification from Greenlife Solar support.</p>
          <p>${fallbackMode ? 'Reply directly to the customer by email or phone.' : 'Reply from the admin dashboard to continue the conversation.'}</p>
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
        from: process.env.RESEND_FROM_EMAIL || 'noreply@greenlifesolar.com',
        to: adminEmail,
        subject,
        html: emailHtml,
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
