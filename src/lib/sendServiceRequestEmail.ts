import { 
  generateServiceRequestAdminEmailHTML, 
  generateServiceRequestCustomerEmailHTML,
  ServiceRequestEmailData 
} from './emailTemplates';

/**
 * Send service request notification emails to both admin and customer
 */
export async function sendServiceRequestEmails(
  data: ServiceRequestEmailData,
  adminEmail: string = 'samuellucky2424@gmail.com'
): Promise<{ success: boolean; adminEmailId?: string; customerEmailId?: string; error?: string }> {
  try {
    // Generate both emails
    const adminHTML = generateServiceRequestAdminEmailHTML(data);
    const customerHTML = generateServiceRequestCustomerEmailHTML(data);

    // Send admin notification email
    const adminResponse = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: adminEmail,
        subject: `🔧 New Service Request - ${data.requestType} from ${data.customerName}`,
        html: adminHTML,
        replyTo: data.customerEmail,
        tags: {
          category: 'service-request',
          type: 'admin-notification',
          requestType: data.requestType,
        },
      }),
    });

    if (!adminResponse.ok) {
      const errorText = await adminResponse.text();
      console.error('Failed to send admin notification email:', errorText);
      return { success: false, error: 'Failed to send admin notification' };
    }

    const adminData = await adminResponse.json();
    const adminEmailId = adminData.id;

    // Send customer confirmation email
    const customerResponse = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: data.customerEmail,
        subject: `✓ Service Request Received - ${data.requestType}`,
        html: customerHTML,
        replyTo: adminEmail,
        tags: {
          category: 'service-request',
          type: 'customer-confirmation',
          requestType: data.requestType,
        },
      }),
    });

    if (!customerResponse.ok) {
      const errorText = await customerResponse.text();
      console.error('Failed to send customer confirmation email:', errorText);
      // Don't fail the entire operation if customer email fails
      // Admin notification was already sent successfully
      return { 
        success: true, 
        adminEmailId,
        error: 'Admin notification sent, but customer email failed to send' 
      };
    }

    const customerData = await customerResponse.json();
    const customerEmailId = customerData.id;

    return { 
      success: true, 
      adminEmailId,
      customerEmailId
    };
  } catch (error) {
    console.error('Error sending service request emails:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
