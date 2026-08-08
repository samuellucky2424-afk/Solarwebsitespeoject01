import { createClient } from '@supabase/supabase-js';

async function getAuthenticatedUser(req: any) {
  const authHeader = String(req.headers.authorization || '').trim();
  const supabaseUrl = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = String(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();

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

export default async function handler(req: any, res: any) {
  // CORS setup for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    const requestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { sender, receiver, meta, items, terms, totalAmount } = requestBody;
    
    if (!receiver || !receiver.customerEmail) {
        return res.status(400).json({ error: 'Missing receiver email' });
    }
    
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    // Default fallback to greenlifesolarsolution.com if not specified in env
    const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim() || 'invoices@greenlifesolarsolution.com';

    if (!resendApiKey) {
        return res.status(500).json({ error: 'Email service not configured' });
    }
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Invoice ${meta?.invoiceId || 'Invoice'}</title>
    </head>
    <body style="font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #374151; background-color: #f9fafb; padding: 20px; line-height: 1.5; font-size: 14px;">
        <div style="max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #059669; padding-bottom: 20px;">
                <div>
                    <img src="https://greenlifesolarsolution.com/logo.png" alt="Greenlife Solar Solutions" style="width: 140px; height: auto;">
                </div>
                <div style="text-align: right; font-size: 13px; color: #6b7280;">
                    <div style="font-size: 18px; font-weight: 600; color: #059669; margin-bottom: 5px;">${sender?.companyName || 'Greenlife Solar Solutions'}</div>
                    <div>${sender?.companyAddress?.replace(/\n/g, '<br>') || 'Nigeria'}</div>
                    <div>${sender?.companyEmail || 'info@greenlifesolarsolution.com'}</div>
                    <div>${sender?.companyPhone || ''}</div>
                </div>
            </div>
            
            <table style="width: 100%; margin-bottom: 40px;" border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="width: 50%; vertical-align: top;">
                        <h3 style="color: #059669; text-transform: uppercase; font-size: 12px; font-weight: 600; margin-bottom: 10px; letter-spacing: 0.5px;">Bill To</h3>
                        <p style="margin: 3px 0; font-weight: 600; color: #111827;">${receiver?.customerName || ''}</p>
                        <p style="margin: 3px 0; color: #4b5563;">${receiver?.customerAddress?.replace(/\n/g, '<br>') || ''}</p>
                        <p style="margin: 3px 0; color: #4b5563;">${receiver?.customerEmail || ''}</p>
                        <p style="margin: 3px 0; color: #4b5563;">${receiver?.customerPhone || ''}</p>
                    </td>
                    <td style="width: 50%; vertical-align: top; text-align: right;">
                        <div style="font-size: 24px; font-weight: 500; letter-spacing: 1px; margin-bottom: 15px; color: #111827;">INVOICE</div>
                        <table style="display: inline-block; text-align: right; border-collapse: collapse; font-size: 13px;">
                            <tr><th style="padding: 4px 15px; color: #6b7280; font-weight: normal; text-align: right;">Invoice #</th><td style="padding: 4px 15px; font-weight: 500; color: #111827;">${meta?.invoiceId || ''}</td></tr>
                            <tr><th style="padding: 4px 15px; color: #6b7280; font-weight: normal; text-align: right;">Date</th><td style="padding: 4px 15px; font-weight: 500; color: #111827;">${meta?.issueDate || ''}</td></tr>
                            <tr><th style="padding: 4px 15px; color: #6b7280; font-weight: normal; text-align: right;">Due Date</th><td style="padding: 4px 15px; font-weight: 500; color: #111827;">${meta?.dueDate || ''}</td></tr>
                        </table>
                    </td>
                </tr>
            </table>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px; font-size: 13px;">
                <thead>
                    <tr>
                        <th style="background-color: #059669; color: white; padding: 10px 15px; text-align: left; text-transform: uppercase; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">Item Description</th>
                        <th style="background-color: #059669; color: white; padding: 10px 15px; text-align: center; text-transform: uppercase; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">Qty</th>
                        <th style="background-color: #059669; color: white; padding: 10px 15px; text-align: right; text-transform: uppercase; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">Price</th>
                        <th style="background-color: #059669; color: white; padding: 10px 15px; text-align: right; text-transform: uppercase; font-size: 11px; font-weight: 600; letter-spacing: 0.5px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items?.map((item: any) => `
                    <tr>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb;">
                            <div style="font-weight: 500; color: #111827;">${item.name}</div>
                            ${item.description ? `<div style="color: #6b7280; font-size: 12px; margin-top: 4px;">${item.description}</div>` : ''}
                        </td>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; text-align: center; color: #4b5563;">${item.quantity}</td>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #4b5563;">₦${item.price?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td style="padding: 12px 15px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 500; color: #111827;">₦${item.total?.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                    </tr>
                    `).join('') || ''}
                </tbody>
            </table>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                <tr>
                    <td style="width: 50%; vertical-align: top; padding-right: 20px;">
                        ${terms ? `
                        <div style="color: #6b7280; font-size: 12px;">
                            <strong style="color: #059669; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Terms & Conditions</strong><br>
                            <div style="margin-top: 6px; line-height: 1.6;">${terms.replace(/\n/g, '<br>')}</div>
                        </div>
                        ` : ''}
                    </td>
                    <td style="width: 50%; vertical-align: top; text-align: right;">
                        <table style="display: inline-block; width: 250px; text-align: right; border-collapse: collapse;">
                            <tr>
                                <td style="padding: 12px 15px; text-align: left; font-size: 16px; font-weight: 600; color: #111827; border-top: 2px solid #e5e7eb;">Amount Due:</td>
                                <td style="padding: 12px 15px; text-align: right; font-size: 18px; font-weight: 600; color: #059669; border-top: 2px solid #e5e7eb;">₦${totalAmount?.toLocaleString(undefined, {minimumFractionDigits: 2}) || 0}</td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; text-align: center;">
                <p>Thank you for choosing Greenlife Solar Solutions!</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const emailPayload = {
      from: resendFromEmail,
      to: receiver.customerEmail,
      subject: `Invoice ${meta?.invoiceId || ''} from Greenlife Solar Solutions`,
      html: html,
    };

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
        error: data.message || 'Failed to send invoice',
      });
    }

    return res.status(200).json({ success: true, message: 'Invoice sent successfully' });

  } catch (error) {
    console.error('Error in send-invoice endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
