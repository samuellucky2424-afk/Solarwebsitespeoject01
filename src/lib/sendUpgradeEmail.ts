import { generateUpgradeAdminEmailHTML, UpgradeEmailData } from './emailTemplates';
import { DEFAULT_ADMIN_EMAIL, sendEmailRequest } from './sendEmailRequest';

/**
 * Send an email notification to the Admin when a system upgrade is requested.
 */
export async function sendUpgradeEmail(
  data: UpgradeEmailData,
  adminEmail: string = DEFAULT_ADMIN_EMAIL
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminHTML = generateUpgradeAdminEmailHTML(data);

    const response = await sendEmailRequest({
      to: adminEmail,
      subject: `New System Upgrade Request - ${data.customerName}`,
      html: adminHTML,
      replyTo: data.customerEmail,
      tags: {
        category: 'upgrade',
        type: 'admin-notification',
      },
    });

    if (!response.success) {
      console.error('Failed to send upgrade email:', response.error);
      return { success: false, error: 'Failed to send admin notification' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending upgrade email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
