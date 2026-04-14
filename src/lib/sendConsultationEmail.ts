import { QuoteRecommendation } from '../../data/consultationQuotes';
import { generateAdminEmailHTML, generateCustomerEmailHTML } from './emailTemplates';

export interface SendConsultationEmailParams {
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
  adminEmail: string;
}

/**
 * Send consultation request emails to both admin and customer
 * Uses the Resend API for email delivery
 */
export async function sendConsultationEmails(params: SendConsultationEmailParams): Promise<{
  success: boolean;
  adminEmailId?: string;
  customerEmailId?: string;
  error?: string;
}> {
  try {
    const submissionDate = new Date().toISOString();

    const emailData = {
      ...params,
      submissionDate,
    };

    // Generate HTML emails
    const adminHTML = generateAdminEmailHTML(emailData);
    const customerHTML = generateCustomerEmailHTML(emailData);

    // Send email to admin
    const adminEmailResponse = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: params.adminEmail,
        subject: `📋 New Consultation Request - ${params.customerName}`,
        html: adminHTML,
        replyTo: params.customerEmail,
        tags: {
          category: 'consultation',
          type: 'admin-notification',
          customerEmail: params.customerEmail,
        },
      }),
    });

    if (!adminEmailResponse.ok) {
      console.error('Failed to send admin email:', await adminEmailResponse.text());
      return {
        success: false,
        error: 'Failed to send admin notification',
      };
    }

    const adminData = await adminEmailResponse.json();

    // Send confirmation email to customer
    const customerEmailResponse = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: params.customerEmail,
        subject: '✅ Your Solar Consultation Request - Greenlife Solar',
        html: customerHTML,
        tags: {
          category: 'consultation',
          type: 'customer-confirmation',
          customerEmail: params.customerEmail,
        },
      }),
    });

    if (!customerEmailResponse.ok) {
      console.error('Failed to send customer email:', await customerEmailResponse.text());
      // Don't fail completely if customer email fails, admin got it
      return {
        success: true,
        adminEmailId: adminData.id,
        error: 'Admin email sent but customer confirmation failed',
      };
    }

    const customerData = await customerEmailResponse.json();

    return {
      success: true,
      adminEmailId: adminData.id,
      customerEmailId: customerData.id,
    };
  } catch (error) {
    console.error('Error sending consultation emails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Alternative: Send email directly via Resend client library
 * Use this if you prefer the Resend SDK over HTTP calls
 */
export async function sendConsultationEmailsViaResend(
  params: SendConsultationEmailParams
): Promise<{
  success: boolean;
  adminEmailId?: string;
  customerEmailId?: string;
  error?: string;
}> {
  try {
    // This function assumes you have installed resend package: npm install resend
    // Import this at the top of your file:
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);

    const submissionDate = new Date().toISOString();

    const emailData = {
      ...params,
      submissionDate,
    };

    const adminHTML = generateAdminEmailHTML(emailData);
    const customerHTML = generateCustomerEmailHTML(emailData);

    // Example using Resend SDK (uncomment when ready to use)
    // const adminEmail = await resend.emails.send({
    //   from: 'Greenlife Solar <noreply@greenlifesolarsolution.com>',
    //   to: params.adminEmail,
    //   subject: `📋 New Consultation Request - ${params.customerName}`,
    //   html: adminHTML,
    //   tags: {
    //     category: 'consultation',
    //     type: 'admin-notification',
    //   },
    // });

    // const customerEmail = await resend.emails.send({
    //   from: 'Greenlife Solar <noreply@greenlifesolarsolution.com>',
    //   to: params.customerEmail,
    //   subject: '✅ Your Solar Consultation Request - Greenlife Solar',
    //   html: customerHTML,
    //   tags: {
    //     category: 'consultation',
    //     type: 'customer-confirmation',
    //   },
    // });

    return {
      success: true,
      // adminEmailId: adminEmail.id,
      // customerEmailId: customerEmail.id,
    };
  } catch (error) {
    console.error('Error sending consultation emails via Resend:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
