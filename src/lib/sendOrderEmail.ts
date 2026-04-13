import { 
  generateOrderAdminEmailHTML, 
  generateOrderCustomerEmailHTML, 
  OrderEmailData 
} from './emailTemplates';

/**
 * Send order confirmation emails to BOTH the customer and the Admin.
 */
export async function sendOrderEmails(
  data: OrderEmailData,
  adminEmail: string = 'infogreenlifetechnology@gmail.com'
): Promise<{ success: boolean; adminError?: string; customerError?: string }> {
  let adminSuccess = false;
  let customerSuccess = false;
  let adminError = '';
  let customerError = '';

  try {
    const adminHTML = generateOrderAdminEmailHTML(data);
    const customerHTML = generateOrderCustomerEmailHTML(data);

    // Promise.all to send both emails concurrently
    const [adminResponse, customerResponse] = await Promise.allSettled([
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: adminEmail,
          subject: `🛒 New Order Placed (#${data.orderId}) - ${data.customerName}`,
          html: adminHTML,
          replyTo: data.customerEmail,
          tags: { category: 'order', type: 'admin-notification' },
        }),
      }),
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: data.customerEmail,
          subject: `✅ Order Confirmation (#${data.orderId}) - Greenlife Solar`,
          html: customerHTML,
          tags: { category: 'order', type: 'customer-confirmation' },
        }),
      })
    ]);

    // Check Admin Response
    if (adminResponse.status === 'fulfilled' && adminResponse.value.ok) {
      adminSuccess = true;
    } else {
      adminError = adminResponse.status === 'rejected' 
        ? adminResponse.reason 
        : 'HTTP Error ' + adminResponse.value.status;
      console.error('Admin order email failed:', adminError);
    }

    // Check Customer Response
    if (customerResponse.status === 'fulfilled' && customerResponse.value.ok) {
      customerSuccess = true;
    } else {
      customerError = customerResponse.status === 'rejected' 
        ? customerResponse.reason 
        : 'HTTP Error ' + customerResponse.value.status;
      console.error('Customer order email failed:', customerError);
    }

    return { 
      success: adminSuccess && customerSuccess,
      adminError: adminSuccess ? undefined : adminError,
      customerError: customerSuccess ? undefined : customerError
    };

  } catch (error) {
    console.error('Fatal error sending order emails:', error);
    return {
      success: false,
      adminError: 'System fatal error',
      customerError: 'System fatal error',
    };
  }
}
