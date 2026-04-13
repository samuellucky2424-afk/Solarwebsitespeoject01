import { QuoteRecommendation } from '../data/consultationQuotes';

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
  adminEmail: string;
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
                  ${data.selectedQuote.notes.map(note => `<li>${note}</li>`).join('')}
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
        <p>📞 0903 657 0294 | 📧 infogreenlifetechnology@gmail.com</p>
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
          <p style="font-size: 14px;">
            <strong>Phone:</strong> <a href="tel:09036570294">0903 657 0294</a><br>
            <strong>Email:</strong> <a href="mailto:infogreenlifetechnology@gmail.com">infogreenlifetechnology@gmail.com</a>
          </p>
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
          <a href="https://greenlifesolar.com" class="button">Visit Our Website</a>
        </div>

        <p style="font-size: 13px; color: #999; text-align: center; margin-top: 30px;">
          We appreciate your trust in Greenlife Solar Solutions. We look forward to helping you transition to clean, renewable energy!
        </p>
      </div>

      <div class="footer">
        <p><strong>Greenlife Solar Solutions Limited</strong></p>
        <p>📍 Total Plaza, 78 Old Lagos-Asaba Rd, Agbor, Delta</p>
        <p>📞 0903 657 0294 | 📧 infogreenlifetechnology@gmail.com</p>
        <p style="margin-top: 10px;">© 2026 Greenlife Solar Solutions. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
