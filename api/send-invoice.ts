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
    const { sender, receiver, meta, items, terms, totalAmount, imageData } = requestBody;
    
    if (!receiver || !receiver.customerEmail) {
        return res.status(400).json({ error: 'Missing receiver email' });
    }

    if (!imageData) {
        return res.status(400).json({ error: 'Missing invoice image data' });
    }
    
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    const resendFromEmail = process.env.RESEND_FROM_EMAIL?.trim() || 'invoices@greenlifesolarsolution.com';

    if (!resendApiKey) {
        return res.status(500).json({ error: 'Email service not configured' });
    }

    // 1. Process Image and Upload to Supabase Storage
    const supabaseUrl = String(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
    const anonKey = String(process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
    const authHeader = String(req.headers.authorization || '').trim();

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    let imageUrl = null;
    const base64Data = imageData.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const fileName = `invoice_${meta?.invoiceId}_${Date.now()}.png`;

    try {
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('invoices')
            .upload(fileName, buffer, {
                contentType: 'image/png',
                upsert: false
            });

        if (!uploadError && uploadData) {
            imageUrl = supabase.storage.from('invoices').getPublicUrl(fileName).data.publicUrl;
        }
    } catch (err) {
        console.warn('Failed to upload invoice image to storage:', err);
    }

    // 2. Insert Record into Invoices Table
    try {
        const { error: insertError } = await supabase
            .from('invoices')
            .insert({
                invoice_number: meta?.invoiceId || '',
                customer_name: receiver?.customerName || '',
                customer_email: receiver?.customerEmail || '',
                total_amount: totalAmount || 0,
                issue_date: meta?.issueDate || new Date().toISOString(),
                due_date: meta?.dueDate || new Date().toISOString(),
                image_url: imageUrl,
                meta: meta,
                items: items
            });
            
        if (insertError) {
            console.error('Insert error details:', insertError);
            throw new Error(insertError.message);
        }
    } catch (err) {
        console.warn('Failed to insert invoice record:', err);
    }
    
    // 3. Send Email via Resend
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Invoice from ${sender?.companyName || 'Greenlife Solar Solutions'}</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; background-color: #f9fafb; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: center;">
            <img src="https://greenlifesolarsolution.com/logo.png" alt="Logo" style="width: 140px; margin-bottom: 20px;">
            <h2 style="color: #059669; font-size: 24px; margin-bottom: 10px;">Thank You For Your Business!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px;">
                Dear ${receiver?.customerName || 'Valued Customer'},<br><br>
                We sincerely appreciate you choosing ${sender?.companyName || 'Greenlife Solar Solutions'}. 
                Please find your official invoice <strong>#${meta?.invoiceId || ''}</strong> attached to this email.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-bottom: 30px;">
                <p style="margin: 0; font-weight: 600; color: #111827;">Amount Due: ₦${totalAmount?.toLocaleString(undefined, {minimumFractionDigits: 2}) || 0}</p>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">Due by: ${meta?.dueDate || ''}</p>
            </div>
            
            <p style="font-size: 14px; color: #9ca3af; margin-bottom: 0;">
                If you have any questions, please contact us at ${sender?.companyEmail || 'info@greenlifesolarsolution.com'}.
            </p>
        </div>
    </body>
    </html>
    `;

    const emailPayload: any = {
      from: resendFromEmail,
      to: receiver.customerEmail,
      subject: `Invoice ${meta?.invoiceId || ''} from ${sender?.companyName || 'Greenlife Solar Solutions'}`,
      html: html,
      attachments: [
        {
            filename: `Invoice_${meta?.invoiceId || 'Document'}.png`,
            content: base64Data
        }
      ]
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
