import { QuoteRecommendation } from '../../data/consultationQuotes';
import { getSupportEmail } from '../../config/supabaseClient';

const SUPPORT_PHONE = '0903 657 0294';

const getSupportFooterLineHtml = () => {
  const supportEmail = getSupportEmail();
  return supportEmail
    ? `<p>Phone: ${SUPPORT_PHONE} | Email: ${supportEmail}</p>`
    : `<p>Phone: ${SUPPORT_PHONE}</p>`;
};

const getSupportContactDetailsHtml = () => {
  const supportEmail = getSupportEmail();
  return supportEmail
    ? `
          <p style="font-size: 14px;">
            <strong>Phone:</strong> <a href="tel:${SUPPORT_PHONE}">${SUPPORT_PHONE}</a><br>
            <strong>Email:</strong> <a href="mailto:${supportEmail}">${supportEmail}</a>
          </p>
        `
    : `
          <p style="font-size: 14px;">
            <strong>Phone:</strong> <a href="tel:${SUPPORT_PHONE}">${SUPPORT_PHONE}</a>
          </p>
        `;
};

const getSupportBoxHtml = () => {
  const supportEmail = getSupportEmail();
  return supportEmail
    ? `<p><strong>Email:</strong> ${supportEmail}</p>`
    : '';
};

interface ConsultationEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyAddress: string;
  roofType: string;
  housingType: string;
  bedroomCount: number;
  fans: number;
  tvs: number;
  fridges: number;
  fridgeType: string;
  acCount: number;
  acType: string;
  washingMachineCount: number;
  washingMachineType: string;
  washingMachineSize: string;
  additionalAppliances: string[];
  selectedQuote: QuoteRecommendation;
  submissionDate: string;
  adminEmail?: string;
}

export function generateAdminEmailHTML(data: ConsultationEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%); }
    .email-wrapper { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .header p { font-size: 14px; opacity: 0.9; }
    .content { padding: 40px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 18px; font-weight: 600; color: #0d1b0f; margin-bottom: 15px; border-bottom: 3px solid #4c9a52; padding-bottom: 10px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .info-item { background: #f8fcf8; padding: 15px; border-radius: 8px; }
    .info-label { font-size: 12px; color: #4c9a52; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; }
    .info-value { font-size: 14px; color: #0d1b0f; font-weight: 500; }
    .quote-card { background: linear-gradient(135deg, #f8fcf8 0%, #f0f5f1 100%); border-left: 4px solid #4c9a52; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .quote-title { font-size: 18px; font-weight: 600; color: #0d1b0f; margin-bottom: 10px; }
    .quote-price { font-size: 24px; font-weight: 700; color: #4c9a52; margin: 10px 0; }
    .quote-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
    .quote-detail { font-size: 13px; }
    .quote-detail strong { color: #0d1b0f; }
    .appliance-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .appliance-item { background: white; border: 1px solid #e7f3e8; padding: 12px; border-radius: 6px; font-size: 13px; }
    .appliance-item strong { color: #0d1b0f; }
    .appliance-item em { color: #4c9a52; }
    .action-section { background: #f8fcf8; padding: 20px; border-radius: 8px; text-align: center; margin-top: 30px; }
    .action-button { display: inline-block; background: #4c9a52; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 10px 5px; }
    .action-button:hover { background: #0d1b0f; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e7f3e8; }
    .footer p { margin-bottom: 5px; }
    .badge { display: inline-block; background: #4c9a52; color: white; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-right: 5px; margin-bottom: 5px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #4c9a52; color: white; padding: 12px; text-align: left; font-weight: 600; }
    td { padding: 12px; border-bottom: 1px solid #e7f3e8; }
    tr:nth-child(even) { background: #f8fcf8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>📋 New Consultation Request</h1>
        <p>A customer has submitted their solar consultation form</p>
      </div>

      <div class="content">
        <!-- Customer Information -->
        <div class="section">
          <h2 class="section-title">👤 Customer Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Full Name</div>
              <div class="info-value">${data.customerName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email Address</div>
              <div class="info-value"><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></div>
            </div>
            <div class="info-item">
              <div class="info-label">Phone Number</div>
              <div class="info-value"><a href="tel:${data.customerPhone}">${data.customerPhone}</a></div>
            </div>
            <div class="info-item">
              <div class="info-label">Submission Date</div>
              <div class="info-value">${new Date(data.submissionDate).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <!-- Property Details -->
        <div class="section">
          <h2 class="section-title">🏠 Property Details</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Property Address</div>
              <div class="info-value">${data.propertyAddress}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Roof Type</div>
              <div class="info-value">${data.roofType}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Housing Type</div>
              <div class="info-value">${data.housingType}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Number of Bedrooms</div>
              <div class="info-value">${data.bedroomCount}</div>
            </div>
          </div>
        </div>

        <!-- Appliance Configuration -->
        <div class="section">
          <h2 class="section-title">⚡ Appliance Configuration</h2>
          <div class="appliance-grid">
            <div class="appliance-item">
              <strong>Fans:</strong> <em>${data.fans}</em>
            </div>
            <div class="appliance-item">
              <strong>TVs:</strong> <em>${data.tvs}</em>
            </div>
            <div class="appliance-item">
              <strong>Fridges:</strong> <em>${data.fridges} (${data.fridgeType})</em>
            </div>
            <div class="appliance-item">
              <strong>Air Conditioners:</strong> <em>${data.acCount} (${data.acType})</em>
            </div>
            <div class="appliance-item">
              <strong>Washing Machines:</strong> <em>${data.washingMachineCount}</em>
            </div>
            <div class="appliance-item">
              <strong>Type/Size:</strong> <em>${data.washingMachineType} / ${data.washingMachineSize}</em>
            </div>
          </div>
          ${data.additionalAppliances.length > 0 ? `
            <div style="margin-top: 15px;">
              <strong style="color: #0d1b0f;">Additional Appliances:</strong>
              <div style="margin-top: 8px;">
                ${data.additionalAppliances.map(appliance => `<span class="badge">${appliance}</span>`).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Selected Quote Package -->
        <div class="section">
          <h2 class="section-title">💡 Selected Solar Package</h2>
          <div class="quote-card">
            <div class="quote-title">${data.selectedQuote.quote.title}</div>
            <p style="color: #4c9a52; font-size: 14px; margin-bottom: 10px;">${data.selectedQuote.quote.tagline}</p>
            <div class="quote-price">₦${data.selectedQuote.quote.price.toLocaleString()}</div>
            
            <div class="quote-details">
              <div class="quote-detail">
                <strong>Inverter:</strong> ${data.selectedQuote.quote.inverter}
              </div>
              <div class="quote-detail">
                <strong>Battery:</strong> ${data.selectedQuote.quote.battery}
              </div>
              <div class="quote-detail">
                <strong>Panels:</strong> ${data.selectedQuote.quote.panels}
              </div>
              <div class="quote-detail">
                <strong>Recommended for:</strong> ${data.selectedQuote.quote.recommendedProperty}
              </div>
            </div>
            
            <div style="background: white; padding: 12px; border-radius: 6px; margin-top: 15px;">
              <strong style="color: #0d1b0f;">Load Coverage:</strong>
              <p style="font-size: 13px; margin-top: 5px; color: #666;">${data.selectedQuote.quote.loadText}</p>
            </div>

            ${data.selectedQuote.notes.length > 0 ? `
              <div style="background: #fffbea; border-left: 3px solid #ffc107; padding: 12px; border-radius: 6px; margin-top: 15px;">
                <strong style="color: #995400;">Notes:</strong>
                <ul style="margin-top: 8px; padding-left: 20px; font-size: 13px; color: #666;">
                  ${data.selectedQuote.notes.map((note: string) => `<li>${note}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #cfe7d1;">
              <span style="font-size: 12px; color: #4c9a52; font-weight: 600;">Match Score: ${data.selectedQuote.score}/100</span>
              ${data.selectedQuote.isStrongMatch ? '<span class="badge" style="background: #28a745; margin-left: 10px;">Strong Match</span>' : ''}
            </div>
          </div>
        </div>

        <!-- Action Section -->
        <div class="action-section">
          <h3 style="color: #0d1b0f; margin-bottom: 15px;">Next Steps</h3>
          <p style="font-size: 13px; color: #666; margin-bottom: 15px;">Review this consultation request and follow up with the customer to provide a quote and discuss their solar solution.</p>
          <a href="mailto:${data.customerEmail}?subject=Your Greenlife Solar Consultation Request" class="action-button">📧 Reply to Customer</a>
          <a href="#" class="action-button">📊 View Dashboard</a>
        </div>
      </div>

      <div class="footer">
        <p><strong>Greenlife Solar Solutions Limited</strong></p>
        <p>Total Plaza, 78 Old Lagos-Asaba Rd, Boji Boji, Agbor, Delta</p>
        ${getSupportFooterLineHtml()}
        <p style="margin-top: 10px; color: #999;">This is an automated email. Please do not reply directly to this address.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateCustomerEmailHTML(data: ConsultationEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #f5f7fa 0%, #fff 100%); }
    .email-wrapper { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { font-size: 24px; margin-bottom: 10px; }
    .content { padding: 40px; }
    .greeting { font-size: 16px; color: #0d1b0f; margin-bottom: 20px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 16px; font-weight: 600; color: #0d1b0f; margin-bottom: 12px; }
    .quote-summary { background: linear-gradient(135deg, #f8fcf8 0%, #f0f5f1 100%); border-left: 4px solid #4c9a52; padding: 20px; border-radius: 8px; margin: 15px 0; }
    .quote-summary h3 { color: #0d1b0f; font-size: 16px; margin-bottom: 10px; }
    .quote-summary p { color: #666; font-size: 14px; margin-bottom: 8px; }
    .quote-price { font-size: 20px; font-weight: 700; color: #4c9a52; margin: 10px 0; }
    .highlight { background: #fffbea; border-left: 3px solid #4c9a52; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .highlight p { font-size: 14px; color: #0d1b0f; }
    .steps { background: #f8fcf8; padding: 20px; border-radius: 8px; }
    .steps-list { margin-left: 20px; }
    .steps-list li { margin-bottom: 10px; font-size: 14px; color: #666; }
    .steps-list strong { color: #0d1b0f; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e7f3e8; }
    .button { display: inline-block; background: #4c9a52; color: white; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 15px 0; }
    .button:hover { background: #0d1b0f; }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>✅ Consultation Request Received!</h1>
      </div>

      <div class="content">
        <div class="greeting">
          Dear ${data.customerName.split(' ')[0]},
        </div>

        <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
          Thank you for submitting your solar consultation request with Greenlife Solar Solutions. We have successfully received your information and are excited to help you explore the perfect solar solution for your needs.
        </p>

        <div class="section">
          <h2 class="section-title">📋 Your Selected Package</h2>
          <div class="quote-summary">
            <h3>${data.selectedQuote.quote.title}</h3>
            <p><em>${data.selectedQuote.quote.tagline}</em></p>
            <div class="quote-price">₦${data.selectedQuote.quote.price.toLocaleString()}</div>
            <p><strong>Load Coverage:</strong> ${data.selectedQuote.quote.loadText}</p>
            <p><strong>Recommended for:</strong> ${data.selectedQuote.quote.recommendedProperty}</p>
          </div>
        </div>

        <div class="highlight">
          <p>
            <strong>What's Next?</strong> Our engineering team is reviewing your application and will contact you within 24 hours to discuss your requirements and provide you with a detailed proposal.
          </p>
        </div>

        <div class="section">
          <h2 class="section-title">📞 We're Here to Help</h2>
          <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
            If you have any questions or would like to discuss your consultation further, please don't hesitate to reach out:
          </p>
          ${getSupportContactDetailsHtml()}
        </div>

        <div class="steps">
          <strong style="color: #0d1b0f; display: block; margin-bottom: 12px;">Our Process:</strong>
          <ol class="steps-list">
            <li><strong>Application Review</strong> - Our team reviews your consultation (24 hours)</li>
            <li><strong>Initial Contact</strong> - We contact you to discuss your needs</li>
            <li><strong>Detailed Proposal</strong> - Receive a customized solar solution</li>
            <li><strong>Installation</strong> - Once approved, we schedule your installation</li>
            <li><strong>Monitoring</strong> - Enjoy your solar system with ongoing support</li>
          </ol>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="https://greenlifesolarsolution.com" class="button">Visit Our Website</a>
        </div>

        <p style="font-size: 13px; color: #999; text-align: center; margin-top: 30px;">
          We appreciate your trust in Greenlife Solar Solutions. We look forward to helping you transition to clean, renewable energy!
        </p>
      </div>

      <div class="footer">
        <p><strong>Greenlife Solar Solutions Limited</strong></p>
        <p>📍 Total Plaza, 78 Old Lagos-Asaba Rd, Agbor, Delta</p>
        ${getSupportFooterLineHtml()}
        <p style="margin-top: 10px;">© 2026 Greenlife Solar Solutions. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// -------------------------------------------------------------
// UPGRADE REQUEST TEMPLATES
// -------------------------------------------------------------
export interface UpgradeEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyAddress: string;
  upgradeType: string;
  specifications: string;
  description: string;
  submissionDate: string;
}

export function generateUpgradeAdminEmailHTML(data: UpgradeEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: #1a351c; color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px; }
    .info-box { background: #f8fcf8; border-left: 4px solid #4c9a52; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    .label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: bold; }
    .value { font-size: 15px; font-weight: 500; margin-bottom: 15px; }
    .specs { white-space: pre-wrap; background: #fff; border: 1px solid #e7f3e8; padding: 15px; border-radius: 8px; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 24px;">⬆️ System Upgrade Request</h1>
    </div>
    <div class="content">
      <div class="info-box">
        <div class="label">Customer</div>
        <div class="value">${data.customerName}</div>
        
        <div class="label">Contact</div>
        <div class="value"><a href="mailto:${data.customerEmail}">${data.customerEmail}</a> | ${data.customerPhone}</div>
        
        <div class="label">Address</div>
        <div class="value">${data.propertyAddress}</div>
        
        <div class="label">Date Requested</div>
        <div class="value">${new Date(data.submissionDate).toLocaleString()}</div>
      </div>

      <h3 style="color: #1a351c; margin-top: 25px;">Upgrade Details: ${data.upgradeType}</h3>
      <div class="specs">
        <strong>Specifications:</strong><br/>
        ${data.specifications}
        
        <br/><br/>
        <strong>Customer Notes:</strong><br/>
        ${data.description || 'None provided'}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateUpgradeCustomerEmailHTML(data: UpgradeEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: #1a351c; color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px; }
    .success-box { background: #f8fcf8; border-left: 4px solid #4c9a52; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    .details-box { background: #fff; border: 1px solid #e7f3e8; padding: 15px; border-radius: 8px; font-size: 14px; }
    .label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: bold; margin-top: 10px; }
    .value { font-size: 15px; font-weight: 500; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 24px;">Upgrade Request Received</h1>
    </div>
    <div class="content">
      <div class="success-box">
        <p style="margin: 0 0 8px 0;"><strong>Hi ${data.customerName},</strong></p>
        <p style="margin: 0;">We received your ${data.upgradeType.toLowerCase()} upgrade request. Our team will review it and contact you shortly.</p>
      </div>

      <div class="details-box">
        <div class="label">Upgrade Type</div>
        <div class="value">${data.upgradeType}</div>

        <div class="label">Address</div>
        <div class="value">${data.propertyAddress}</div>

        <div class="label">Submitted</div>
        <div class="value">${new Date(data.submissionDate).toLocaleString()}</div>

        <div class="label">Requested Specifications</div>
        <div class="value">${data.specifications}</div>

        <div class="label">Additional Notes</div>
        <div class="value">${data.description || 'None provided'}</div>
      </div>

      <p style="margin-top: 24px; font-size: 14px; color: #555;">
        If you need to add anything else, just reply to this email and our team will follow up.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// -------------------------------------------------------------
// PRODUCT ORDER TEMPLATES
// -------------------------------------------------------------
export interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderId: string;
  transactionRef: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  totalAmount: number;
  orderDate: string;
}

export function generateOrderAdminEmailHTML(data: OrderEmailData): string {
  const itemsHtml = data.items.map(item => 
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₦${item.price.toLocaleString()}</td>
    </tr>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: #0d1b0f; color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f8fcf8; padding: 10px; text-align: left; font-size: 13px; color: #666; border-bottom: 2px solid #e7f3e8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 24px;">🛒 New Paid Order</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Order #${data.orderId}</p>
    </div>
    <div class="content">
      <p><strong>Customer:</strong> ${data.customerName}</p>
      <p><strong>Email:</strong> ${data.customerEmail} | <strong>Phone:</strong> ${data.customerPhone}</p>
      <p><strong>Transaction Ref:</strong> ${data.transactionRef}</p>
      <p><strong>Date:</strong> ${new Date(data.orderDate).toLocaleString()}</p>
      
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold; border-top: 2px solid #333;">Total Amount:</td>
            <td style="padding: 15px 10px; text-align: right; font-weight: bold; border-top: 2px solid #333; color: #4c9a52;">₦${data.totalAmount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateOrderCustomerEmailHTML(data: OrderEmailData): string {
  const itemsHtml = data.items.map(item => 
    `<tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₦${item.price.toLocaleString()}</td>
    </tr>`
  ).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: #4c9a52; color: white; padding: 30px 20px; text-align: center; }
    .content { padding: 30px; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { background: #f8fcf8; padding: 10px; text-align: left; font-size: 13px; color: #666; border-bottom: 2px solid #e7f3e8; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #e7f3e8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin:0; font-size: 24px;">Thank You For Your Order!</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Greenlife Solar Solutions</p>
    </div>
    <div class="content">
      <p>Dear ${data.customerName.split(' ')[0]},</p>
      <p>We've successfully received your payment and are currently processing your order <strong>#${data.orderId}</strong>.</p>
      
      <div style="background: #f0f5f1; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1a351c;">Order Summary</h3>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr>
              <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold; border-top: 2px solid #333;">Total Paid:</td>
              <td style="padding: 15px 10px; text-align: right; font-weight: bold; border-top: 2px solid #333; color: #4c9a52;">₦${data.totalAmount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <p>If you have any questions about this order, reply to this email or call our support line.</p>
    </div>
    <div class="footer">
      <p>Greenlife Solar Solutions Limited</p>
      ${getSupportFooterLineHtml()}
    </div>
  </div>
</body>
</html>
  `;
}

// -------------------------------------------------------------
// SERVICE REQUEST TEMPLATES (Maintenance, Survey, Package)
// -------------------------------------------------------------
export interface ServiceRequestEmailData {
  requestId: string;
  requestType: 'Maintenance Request' | 'Site Survey Request' | 'Package Request';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  date: string;
  time?: string;
  issueType?: string;
  description: string;
  priority: 'Normal' | 'High' | 'Urgent';
}

export function generateServiceRequestAdminEmailHTML(data: ServiceRequestEmailData): string {
  const priorityColor = data.priority === 'Urgent' ? '#dc3545' : data.priority === 'High' ? '#ff9800' : '#17a2b8';
  const priorityBgColor = data.priority === 'Urgent' ? '#f8d7da' : data.priority === 'High' ? '#fff3cd' : '#d1ecf1';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; }
    .container { max-width: 700px; margin: 0 auto; padding: 20px; }
    .email-wrapper { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header p { opacity: 0.9; font-size: 14px; }
    .priority-badge { display: inline-block; background: ${priorityBgColor}; color: ${priorityColor}; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-top: 10px; }
    .content { padding: 25px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 14px; font-weight: 700; color: #0d1b0f; margin-bottom: 12px; border-bottom: 2px solid #4c9a52; padding-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .info-item { background: #f8fcf8; padding: 12px; border-radius: 6px; border-left: 3px solid #4c9a52; }
    .info-label { font-size: 11px; color: #666; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
    .info-value { font-size: 13px; color: #0d1b0f; font-weight: 500; }
    .info-value a { color: #4c9a52; text-decoration: none; }
    .description-box { background: #f8fcf8; padding: 15px; border-radius: 6px; border: 1px solid #e7f3e8; }
    .description-box strong { color: #0d1b0f; display: block; margin-bottom: 8px; }
    .description-box p { font-size: 13px; color: #666; line-height: 1.5; white-space: pre-wrap; }
    .action-section { background: #f8fcf8; padding: 20px; border-radius: 6px; text-align: center; margin-top: 25px; border-left: 4px solid #4c9a52; }
    .action-button { display: inline-block; background: #4c9a52; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-weight: 600; margin: 8px 5px; font-size: 13px; }
    .action-button:hover { background: #0d1b0f; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e7f3e8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>🔧 New Service Request</h1>
        <p>${data.requestType}</p>
        <div class="priority-badge">${data.priority} Priority</div>
      </div>

      <div class="content">
        <!-- Customer Information -->
        <div class="section">
          <h2 class="section-title">👤 Customer Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Name</div>
              <div class="info-value">${data.customerName}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Request ID</div>
              <div class="info-value">${data.requestId}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value"><a href="mailto:${data.customerEmail}">${data.customerEmail}</a></div>
            </div>
            <div class="info-item">
              <div class="info-label">Phone</div>
              <div class="info-value"><a href="tel:${data.customerPhone}">${data.customerPhone}</a></div>
            </div>
            <div class="info-item" style="grid-column: 1 / -1;">
              <div class="info-label">Service Address</div>
              <div class="info-value">${data.address}</div>
            </div>
          </div>
        </div>

        <!-- Request Details -->
        <div class="section">
          <h2 class="section-title">📋 Request Details</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Request Type</div>
              <div class="info-value">${data.requestType}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Submitted</div>
              <div class="info-value">${new Date(data.date).toLocaleString()}</div>
            </div>
            ${data.time ? `
              <div class="info-item">
                <div class="info-label">Preferred Time</div>
                <div class="info-value">${data.time}</div>
              </div>
            ` : ''}
            ${data.issueType ? `
              <div class="info-item">
                <div class="info-label">Issue Type</div>
                <div class="info-value">${data.issueType}</div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Description -->
        <div class="section">
          <h2 class="section-title">📝 Description</h2>
          <div class="description-box">
            <p>${data.description}</p>
          </div>
        </div>

        <!-- Action Section -->
        <div class="action-section">
          <h3 style="color: #0d1b0f; margin-bottom: 12px; font-size: 14px;">Next Steps</h3>
          <p style="font-size: 12px; color: #666; margin-bottom: 15px;">Please contact the customer to confirm the service appointment and provide more details.</p>
          <a href="mailto:${data.customerEmail}?subject=Re: Your Service Request" class="action-button">📧 Reply to Customer</a>
          <a href="#" class="action-button">📊 View Dashboard</a>
        </div>
      </div>

      <div class="footer">
        <p><strong>Greenlife Solar Solutions Limited</strong></p>
        <p>Total Plaza, 78 Old Lagos-Asaba Rd, Agbor, Delta</p>
        ${getSupportFooterLineHtml()}
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

export function generateServiceRequestCustomerEmailHTML(data: ServiceRequestEmailData): string {
  const requestTypeIcon = data.requestType === 'Maintenance Request' ? '🔧' : 
                           data.requestType === 'Site Survey Request' ? '📍' : '📦';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: #f5f7fa; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .email-wrapper { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #0d1b0f 0%, #1a351c 100%); color: white; padding: 30px 20px; text-align: center; }
    .header h1 { font-size: 22px; margin-bottom: 8px; }
    .header p { opacity: 0.9; font-size: 14px; }
    .content { padding: 25px; }
    .success-box { background: #e8f5e9; border-left: 4px solid #28a745; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
    .success-box h3 { color: #1b5e20; font-size: 14px; margin-bottom: 8px; font-weight: 700; }
    .success-box p { font-size: 13px; color: #2e7d32; line-height: 1.5; }
    .section { margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: 700; color: #0d1b0f; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-box { background: #f8fcf8; padding: 12px; border-radius: 6px; border-left: 3px solid #4c9a52; margin-bottom: 10px; }
    .info-box strong { color: #0d1b0f; }
    .info-box p { font-size: 13px; color: #666; margin-top: 4px; }
    .highlight-box { background: #fffbea; border-left: 3px solid #ffc107; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .highlight-box p { font-size: 13px; color: #856404; line-height: 1.5; margin: 0; }
    .support-box { background: #e3f2fd; border-left: 3px solid #2196F3; padding: 15px; border-radius: 6px; margin-top: 20px; }
    .support-box h4 { color: #1565c0; font-size: 13px; margin-bottom: 8px; font-weight: 700; }
    .support-box p { font-size: 12px; color: #0d47a1; margin-bottom: 6px; }
    .support-box p:last-child { margin-bottom: 0; }
    .footer { background: #f8fcf8; padding: 20px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #e7f3e8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="email-wrapper">
      <div class="header">
        <h1>✅ ${requestTypeIcon} Request Received</h1>
        <p>Thank you for submitting your service request</p>
      </div>

      <div class="content">
        <!-- Success Message -->
        <div class="success-box">
          <h3>Your request has been received!</h3>
          <p>We have successfully received your ${data.requestType.toLowerCase()} and our team is reviewing it. We will get back to you shortly to confirm the details and schedule the service.</p>
        </div>

        <!-- Request Summary -->
        <div class="section">
          <h2 class="section-title">📋 Request Summary</h2>
          <div class="info-box">
            <strong>Request ID:</strong>
            <p>${data.requestId}</p>
          </div>
          <div class="info-box">
            <strong>Type:</strong>
            <p>${data.requestType}</p>
          </div>
          <div class="info-box">
            <strong>Service Address:</strong>
            <p>${data.address}</p>
          </div>
          <div class="info-box">
            <strong>Submitted On:</strong>
            <p>${new Date(data.date).toLocaleString()}</p>
          </div>
        </div>

        <!-- What's Next -->
        <div class="highlight-box">
          <p><strong>What's Next?</strong> Our team is processing your request and will contact you within 24 hours at <strong>${data.customerPhone}</strong> to confirm the appointment and provide you with more details about the service.</p>
        </div>

        <!-- Support Section -->
        <div class="support-box">
          <h4>📞 Have Questions?</h4>
          ${getSupportBoxHtml()}
          <p><strong>Phone:</strong> ${SUPPORT_PHONE}</p>
          <p>Feel free to reach out if you need to reschedule or have any questions about your request.</p>
        </div>

        <p style="font-size: 12px; color: #999; text-align: center; margin-top: 25px;">
          We appreciate your trust in Greenlife Solar Solutions. Our team is committed to providing you with excellent service!
        </p>
      </div>

      <div class="footer">
        <p><strong>Greenlife Solar Solutions Limited</strong></p>
        <p>Total Plaza, 78 Old Lagos-Asaba Rd, Agbor, Delta</p>
        <p>© 2026 Greenlife Solar Solutions. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

