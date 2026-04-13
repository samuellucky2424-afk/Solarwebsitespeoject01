import { generateUpgradeAdminEmailHTML, UpgradeEmailData } from './emailTemplates';

/**
 * Send an email notification to the Admin when a system upgrade is requested.
 */
export async function sendUpgradeEmail(
  data: UpgradeEmailData,
  adminEmail: string = 'infogreenlifetechnology@gmail.com'
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminHTML = generateUpgradeAdminEmailHTML(data);

    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: adminEmail,
        subject: `⬆️ New System Upgrade Request - ${data.customerName}`,
        html: adminHTML,
        replyTo: data.customerEmail,
        tags: {
          category: 'upgrade',
          type: 'admin-notification',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send upgrade email:', errorText);
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
