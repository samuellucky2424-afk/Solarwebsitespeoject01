import {
  generateUpgradeAdminEmailHTML,
  generateUpgradeCustomerEmailHTML,
  UpgradeEmailData
} from './emailTemplates';
import { sendEmailRequest } from './sendEmailRequest';

/**
 * Send an email notification to the Admin when a system upgrade is requested.
 */
export async function sendUpgradeEmail(
  data: UpgradeEmailData,
  adminEmail?: string
): Promise<{ success: boolean; adminEmailId?: string; customerEmailId?: string; error?: string }> {
  try {
    const adminHTML = generateUpgradeAdminEmailHTML(data);
    const customerHTML = generateUpgradeCustomerEmailHTML(data);

    const [adminResponse, customerResponse] = await Promise.all([
      sendEmailRequest({
        ...(adminEmail ? { to: adminEmail } : { useAdminEmail: true }),
        subject: `New System Upgrade Request - ${data.customerName}`,
        html: adminHTML,
        replyTo: data.customerEmail,
        tags: {
          category: 'upgrade',
          type: 'admin-notification',
        },
      }),
      sendEmailRequest({
        to: data.customerEmail,
        subject: 'Your Upgrade Request - Greenlife Solar',
        html: customerHTML,
        tags: {
          category: 'upgrade',
          type: 'customer-confirmation',
        },
      }),
    ]);

    if (!adminResponse.success) {
      console.error('Failed to send upgrade admin email:', adminResponse.error);
      return { success: false, error: 'Failed to send admin notification' };
    }

    if (!customerResponse.success) {
      console.error('Failed to send upgrade customer email:', customerResponse.error);
      return {
        success: true,
        adminEmailId: adminResponse.id,
        error: 'Admin notification sent, but customer confirmation failed',
      };
    }

    return {
      success: true,
      adminEmailId: adminResponse.id,
      customerEmailId: customerResponse.id,
    };
  } catch (error) {
    console.error('Error sending upgrade email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
