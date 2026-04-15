import {
  generateOrderAdminEmailHTML,
  generateOrderCustomerEmailHTML,
  OrderEmailData,
} from './emailTemplates';
import { sanitizeEmailHeaderValue, sanitizeEmailHtmlText } from './emailSanitizers';
import { sendEmailRequest } from './sendEmailRequest';

/**
 * Send order confirmation emails to BOTH the customer and the Admin.
 */
export async function sendOrderEmails(
  data: OrderEmailData,
  adminEmail?: string
): Promise<{ success: boolean; adminError?: string; customerError?: string }> {
  try {
    const safeCustomerName = sanitizeEmailHeaderValue(data.customerName, 120);
    const safeCustomerEmail = sanitizeEmailHeaderValue(data.customerEmail, 160);
    const safeOrderId = sanitizeEmailHeaderValue(data.orderId, 80);
    const safeData: OrderEmailData = {
      ...data,
      customerName: sanitizeEmailHtmlText(safeCustomerName, 120),
      customerEmail: sanitizeEmailHtmlText(safeCustomerEmail, 160),
      customerPhone: sanitizeEmailHtmlText(data.customerPhone, 40),
      orderId: sanitizeEmailHtmlText(safeOrderId, 80),
      transactionRef: sanitizeEmailHtmlText(data.transactionRef, 120),
      items: data.items.map((item) => ({
        ...item,
        name: sanitizeEmailHtmlText(item.name, 160),
      })),
    };

    const adminHTML = generateOrderAdminEmailHTML(safeData);
    const customerHTML = generateOrderCustomerEmailHTML(safeData);

    const [adminResult, customerResult] = await Promise.all([
      sendEmailRequest({
        ...(adminEmail ? { to: adminEmail } : { useAdminEmail: true }),
        subject: `New Order Placed (#${safeOrderId}) - ${safeCustomerName}`,
        html: adminHTML,
        replyTo: safeCustomerEmail,
        tags: { category: 'order', type: 'admin-notification' },
      }),
      sendEmailRequest({
        to: safeCustomerEmail,
        subject: `Order Confirmation (#${safeOrderId}) - Greenlife Solar`,
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
