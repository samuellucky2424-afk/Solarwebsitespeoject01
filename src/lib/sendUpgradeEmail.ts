import {
  generateUpgradeAdminEmailHTML,
  generateUpgradeCustomerEmailHTML,
  UpgradeEmailData
} from './emailTemplates';
import { sanitizeEmailHeaderValue, sanitizeEmailHtmlText } from './emailSanitizers';
import { sendEmailRequest } from './sendEmailRequest';

/**
 * Send an email notification to the Admin when a system upgrade is requested.
 */
export async function sendUpgradeEmail(
  data: UpgradeEmailData,
  adminEmail?: string
): Promise<{ success: boolean; adminEmailId?: string; customerEmailId?: string; error?: string }> {
  try {
    const safeCustomerName = sanitizeEmailHeaderValue(data.customerName, 120);
    const safeCustomerEmail = sanitizeEmailHeaderValue(data.customerEmail, 160);
    const safeData: UpgradeEmailData = {
      ...data,
      customerName: sanitizeEmailHtmlText(safeCustomerName, 120),
      customerEmail: sanitizeEmailHtmlText(safeCustomerEmail, 160),
      customerPhone: sanitizeEmailHtmlText(data.customerPhone, 40),
      propertyAddress: sanitizeEmailHtmlText(data.propertyAddress, 400),
      upgradeType: sanitizeEmailHtmlText(data.upgradeType, 80),
      specifications: sanitizeEmailHtmlText(data.specifications, 2000),
      description: sanitizeEmailHtmlText(data.description, 3000),
    };

    const adminHTML = generateUpgradeAdminEmailHTML(safeData);
    const customerHTML = generateUpgradeCustomerEmailHTML(safeData);

    const [adminResponse, customerResponse] = await Promise.all([
      sendEmailRequest({
        ...(adminEmail ? { to: adminEmail } : { useAdminEmail: true }),
        subject: `New System Upgrade Request - ${safeCustomerName}`,
        html: adminHTML,
        replyTo: safeCustomerEmail,
        tags: {
          category: 'upgrade',
          type: 'admin-notification',
        },
      }),
      sendEmailRequest({
        to: safeCustomerEmail,
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
