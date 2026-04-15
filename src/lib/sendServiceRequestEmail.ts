import {
  generateServiceRequestAdminEmailHTML,
  generateServiceRequestCustomerEmailHTML,
  ServiceRequestEmailData,
} from './emailTemplates';
import { sanitizeEmailHeaderValue, sanitizeEmailHtmlText } from './emailSanitizers';
import { sendEmailRequest } from './sendEmailRequest';

/**
 * Send service request notification emails to both admin and customer
 */
export async function sendServiceRequestEmails(
  data: ServiceRequestEmailData,
  adminEmail?: string
): Promise<{ success: boolean; adminEmailId?: string; customerEmailId?: string; error?: string }> {
  try {
    const safeCustomerName = sanitizeEmailHeaderValue(data.customerName, 120);
    const safeCustomerEmail = sanitizeEmailHeaderValue(data.customerEmail, 160);
    const safeRequestType = sanitizeEmailHeaderValue(data.requestType, 80) as ServiceRequestEmailData['requestType'];
    const safeData: ServiceRequestEmailData = {
      ...data,
      requestType: safeRequestType,
      customerName: sanitizeEmailHtmlText(safeCustomerName, 120),
      customerEmail: sanitizeEmailHtmlText(safeCustomerEmail, 160),
      customerPhone: sanitizeEmailHtmlText(data.customerPhone, 40),
      address: sanitizeEmailHtmlText(data.address, 400),
      time: data.time ? sanitizeEmailHtmlText(data.time, 40) : undefined,
      issueType: data.issueType ? sanitizeEmailHtmlText(data.issueType, 120) : undefined,
      description: sanitizeEmailHtmlText(data.description, 3000),
    };

    const adminHTML = generateServiceRequestAdminEmailHTML(safeData);
    const customerHTML = generateServiceRequestCustomerEmailHTML(safeData);

    const adminResult = await sendEmailRequest({
      ...(adminEmail ? { to: adminEmail } : { useAdminEmail: true }),
      subject: `New Service Request - ${safeRequestType} from ${safeCustomerName}`,
      html: adminHTML,
      replyTo: safeCustomerEmail,
      tags: {
        category: 'service-request',
        type: 'admin-notification',
        requestType: safeRequestType,
      },
    });

    if (!adminResult.success) {
      console.error('Failed to send admin notification email:', adminResult.error);
      return { success: false, error: 'Failed to send admin notification' };
    }

    const customerResult = await sendEmailRequest({
      to: safeCustomerEmail,
      subject: `Service Request Received - ${safeRequestType}`,
      html: customerHTML,
      ...(adminEmail ? { replyTo: adminEmail } : {}),
      tags: {
        category: 'service-request',
        type: 'customer-confirmation',
        requestType: safeRequestType,
      },
    });

    if (!customerResult.success) {
      console.error('Failed to send customer confirmation email:', customerResult.error);
      return {
        success: true,
        adminEmailId: adminResult.id,
        error: 'Admin notification sent, but customer email failed to send',
      };
    }

    return {
      success: true,
      adminEmailId: adminResult.id,
      customerEmailId: customerResult.id,
    };
  } catch (error) {
    console.error('Error sending service request emails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
