import {
  generateOrderAdminEmailHTML,
  generateOrderCustomerEmailHTML,
  OrderEmailData,
} from './emailTemplates';
import { sendEmailRequest } from './sendEmailRequest';

/**
 * Send order confirmation emails to BOTH the customer and the Admin.
 */
export async function sendOrderEmails(
  data: OrderEmailData,
  adminEmail?: string
): Promise<{ success: boolean; adminError?: string; customerError?: string }> {
  try {
    const adminHTML = generateOrderAdminEmailHTML(data);
    const customerHTML = generateOrderCustomerEmailHTML(data);

    const [adminResult, customerResult] = await Promise.all([
      sendEmailRequest({
        ...(adminEmail ? { to: adminEmail } : { useAdminEmail: true }),
        subject: `New Order Placed (#${data.orderId}) - ${data.customerName}`,
        html: adminHTML,
        replyTo: data.customerEmail,
        tags: { category: 'order', type: 'admin-notification' },
      }),
      sendEmailRequest({
        to: data.customerEmail,
        subject: `Order Confirmation (#${data.orderId}) - Greenlife Solar`,
        html: customerHTML,
        tags: { category: 'order', type: 'customer-confirmation' },
      }),
    ]);

    if (!adminResult.success) {
      const adminError = adminResult.error || 'Unknown admin email error';
      console.error('Admin order email failed:', adminError);

      if (!customerResult.success) {
        const customerError = customerResult.error || 'Unknown customer email error';
        console.error('Customer order email failed:', customerError);
        return { success: false, adminError, customerError };
      }

      return { success: false, adminError };
    }

    if (!customerResult.success) {
      const customerError = customerResult.error || 'Unknown customer email error';
      console.error('Customer order email failed:', customerError);
      return { success: false, customerError };
    }

    return { success: true };
  } catch (error) {
    console.error('Fatal error sending order emails:', error);
    return {
      success: false,
      adminError: 'System fatal error',
      customerError: 'System fatal error',
    };
  }
}
