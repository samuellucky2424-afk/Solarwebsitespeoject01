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
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; background-color: #f9fafb; padding: 20px;">
        <div style="max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 2px solid #059669; padding-bottom: 20px;">
                <div>
                    <img src="https://greenlifesolarsolution.com/logo.png" alt="Greenlife Solar Solutions" style="width: 150px; height: auto;">
                </div>
                <div style="text-align: right; font-size: 14px; color: #6b7280;">
                    <div style="font-size: 24px; font-weight: bold; color: #059669; margin-bottom: 5px;">${sender?.companyName || 'Greenlife Solar Solutions'}</div>
                    <div>${sender?.companyAddress || 'Nigeria'}</div>
                    <div>${sender?.companyEmail || 'info@greenlifesolarsolution.com'}</div>
                    <div>${sender?.companyPhone || ''}</div>
                </div>
            </div>
            
            <div style="margin-bottom: 40px; overflow: hidden;">
                <div style="float: left; width: 45%;">
                    <h3 style="color: #059669; text-transform: uppercase; font-size: 16px; margin-bottom: 10px;">Bill To</h3>
                    <p style="margin: 5px 0;"><strong>${receiver?.customerName || ''}</strong></p>
                    <p style="margin: 5px 0;">${receiver?.customerAddress || ''}</p>
                    <p style="margin: 5px 0;">${receiver?.customerEmail || ''}</p>
                    <p style="margin: 5px 0;">${receiver?.customerPhone || ''}</p>
                </div>
                <div style="float: right; width: 45%; text-align: right;">
                    <div style="font-size: 32px; font-weight: 300; letter-spacing: 2px; margin-bottom: 10px;">INVOICE</div>
                    <table style="display: inline-block; text-align: right; border-collapse: collapse;">
                        <tr><th style="padding: 5px 15px; color: #6b7280; font-weight: normal;">Invoice #</th><td style="padding: 5px 15px; font-weight: 600;">${meta?.invoiceId || ''}</td></tr>
                        <tr><th style="padding: 5px 15px; color: #6b7280; font-weight: normal;">Date</th><td style="padding: 5px 15px; font-weight: 600;">${meta?.issueDate || ''}</td></tr>
                        <tr><th style="padding: 5px 15px; color: #6b7280; font-weight: normal;">Due Date</th><td style="padding: 5px 15px; font-weight: 600;">${meta?.dueDate || ''}</td></tr>
                    </table>
                </div>
            </div>
            <div style="clear: both;"></div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
                <thead>
                    <tr>
                        <th style="background-color: #059669; color: white; padding: 12px 15px; text-align: left; text-transform: uppercase; font-size: 14px;">Item Description</th>
                        <th style="background-color: #059669; color: white; padding: 12px 15px; text-align: center; text-transform: uppercase; font-size: 14px;">Qty</th>
                        <th style="background-color: #059669; color: white; padding: 12px 15px; text-align: right; text-transform: uppercase; font-size: 14px;">Price</th>
                        <th style="background-color: #059669; color: white; padding: 12px 15px; text-align: right; text-transform: uppercase; font-size: 14px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${items?.map((item: any) => `
                    <tr>
                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                            <strong>${item.name}</strong><br>
                            <span style="color: #6b7280; font-size: 12px;">${item.description || ''}</span>
                        </td>
                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right;">₦${item.price?.toLocaleString()}</td>
                        <td style="padding: 15px; border-bottom: 1px solid #e5e7eb; text-align: right;">₦${item.total?.toLocaleString()}</td>
                    </tr>
                    `).join('') || ''}
                </tbody>
            </table>
            
            <div style="text-align: right;">
                <table style="width: 300px; display: inline-block;">
                    <tr>
                        <td style="padding: 10px 15px; text-align: right; font-size: 24px; font-weight: bold; color: #059669; border-top: 2px solid #e5e7eb;">Amount Due:</td>
                        <td style="padding: 10px 15px; text-align: right; font-size: 24px; font-weight: bold; color: #059669; border-top: 2px solid #e5e7eb;">₦${totalAmount?.toLocaleString() || 0}</td>
                    </tr>
                </table>
            </div>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: center;">
                ${terms ? `<p><strong>Terms and Conditions:</strong> ${terms}</p>` : ''}
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
