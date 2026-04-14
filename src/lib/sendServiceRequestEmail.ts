import {
  generateServiceRequestAdminEmailHTML,
  generateServiceRequestCustomerEmailHTML,
  ServiceRequestEmailData,
} from './emailTemplates';
import { sendEmailRequest } from './sendEmailRequest';

/**
 * Send service request notification emails to both admin and customer
 */
export async function sendServiceRequestEmails(
  data: ServiceRequestEmailData,
  adminEmail?: string
): Promise<{ success: boolean; adminEmailId?: string; customerEmailId?: string; error?: string }> {
  try {
    const adminHTML = generateServiceRequestAdminEmailHTML(data);
    const customerHTML = generateServiceRequestCustomerEmailHTML(data);

    const adminResult = await sendEmailRequest({
      ...(adminEmail ? { to: adminEmail } : { useAdminEmail: true }),
      subject: `New Service Request - ${data.requestType} from ${data.customerName}`,
      html: adminHTML,
      replyTo: data.customerEmail,
      tags: {
        category: 'service-request',
        type: 'admin-notification',
        requestType: data.requestType,
      },
    });

    if (!adminResult.success) {
      console.error('Failed to send admin notification email:', adminResult.error);
      return { success: false, error: 'Failed to send admin notification' };
    }

    const customerResult = await sendEmailRequest({
      to: data.customerEmail,
      subject: `Service Request Received - ${data.requestType}`,
      html: customerHTML,
      ...(adminEmail ? { replyTo: adminEmail } : {}),
      tags: {
        category: 'service-request',
        type: 'customer-confirmation',
        requestType: data.requestType,
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
