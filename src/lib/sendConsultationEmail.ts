import { QuoteRecommendation } from '../../data/consultationQuotes';
import { generateAdminEmailHTML, generateCustomerEmailHTML } from './emailTemplates';
import { sanitizeEmailHeaderValue, sanitizeEmailHtmlList, sanitizeEmailHtmlText } from './emailSanitizers';
import { sendEmailRequest } from './sendEmailRequest';

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
  adminEmail?: string;
  sendCustomerConfirmation?: boolean;
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
    const safeCustomerName = sanitizeEmailHeaderValue(params.customerName, 120);
    const safeCustomerEmail = sanitizeEmailHeaderValue(params.customerEmail, 160);

    const emailData = {
      ...params,
      customerName: sanitizeEmailHtmlText(safeCustomerName, 120),
      customerEmail: sanitizeEmailHtmlText(safeCustomerEmail, 160),
      customerPhone: sanitizeEmailHtmlText(params.customerPhone, 40),
      propertyAddress: sanitizeEmailHtmlText(params.propertyAddress, 400),
      roofType: sanitizeEmailHtmlText(params.roofType, 80),
      housingType: sanitizeEmailHtmlText(params.housingType, 80),
      fridgeType: sanitizeEmailHtmlText(params.fridgeType, 60),
      acType: sanitizeEmailHtmlText(params.acType, 60),
      washingMachineType: sanitizeEmailHtmlText(params.washingMachineType, 80),
      washingMachineSize: sanitizeEmailHtmlText(params.washingMachineSize, 80),
      additionalAppliances: sanitizeEmailHtmlList(params.additionalAppliances, 20, 80),
      selectedQuote: {
        ...params.selectedQuote,
        quote: {
          ...params.selectedQuote.quote,
          title: sanitizeEmailHtmlText(params.selectedQuote.quote.title, 160),
          tagline: sanitizeEmailHtmlText(params.selectedQuote.quote.tagline, 200),
          inverter: sanitizeEmailHtmlText(params.selectedQuote.quote.inverter, 120),
          battery: sanitizeEmailHtmlText(params.selectedQuote.quote.battery, 120),
          panels: sanitizeEmailHtmlText(params.selectedQuote.quote.panels, 120),
          loadText: sanitizeEmailHtmlText(params.selectedQuote.quote.loadText, 240),
          recommendedProperty: sanitizeEmailHtmlText(params.selectedQuote.quote.recommendedProperty, 120),
        },
        notes: sanitizeEmailHtmlList(params.selectedQuote.notes, 20, 200),
      },
      submissionDate,
    };

    const adminHTML = generateAdminEmailHTML(emailData);
    const customerHTML = generateCustomerEmailHTML(emailData);

    const adminEmailResponse = await sendEmailRequest({
      ...(params.adminEmail ? { to: params.adminEmail } : { useAdminEmail: true }),
      subject: `New Consultation Request - ${safeCustomerName}`,
      html: adminHTML,
      replyTo: safeCustomerEmail,
      tags: {
        category: 'consultation',
        type: 'admin-notification',
        customerEmail: safeCustomerEmail,
      },
    });

    if (!adminEmailResponse.success) {
      console.error('Failed to send admin email:', adminEmailResponse.error);
      return {
        success: false,
        error: 'Failed to send admin notification',
      };
    }

    if (params.sendCustomerConfirmation === false) {
      return {
        success: true,
        adminEmailId: adminEmailResponse.id,
      };
    }

    const customerEmailResponse = await sendEmailRequest({
      to: safeCustomerEmail,
      subject: 'Your Solar Consultation Request - Greenlife Solar',
      html: customerHTML,
      tags: {
        category: 'consultation',
        type: 'customer-confirmation',
        customerEmail: safeCustomerEmail,
      },
    });

    if (!customerEmailResponse.success) {
      console.error('Failed to send customer email:', customerEmailResponse.error);
      return {
        success: true,
        adminEmailId: adminEmailResponse.id,
        error: 'Admin email sent but customer confirmation failed',
      };
    }

    return {
      success: true,
      adminEmailId: adminEmailResponse.id,
      customerEmailId: customerEmailResponse.id,
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
    //   from: 'Greenlife Solar <YOUR_VERIFIED_SENDER_ADDRESS>',
    //   to: params.adminEmail,
    //   subject: `New Consultation Request - ${params.customerName}`,
    //   html: adminHTML,
    //   tags: {
    //     category: 'consultation',
    //     type: 'admin-notification',
    //   },
    // });

    // const customerEmail = await resend.emails.send({
    //   from: 'Greenlife Solar <YOUR_VERIFIED_SENDER_ADDRESS>',
    //   to: params.customerEmail,
    //   subject: 'Your Solar Consultation Request - Greenlife Solar',
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
