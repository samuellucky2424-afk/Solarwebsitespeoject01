/**
 * Low Stock Alert Email Template & Functions
 * Table-based design with sharp edges and mobile optimization
 */

interface LowStockAlertData {
  productId: string;
  productName: string;
  brand: string;
  currentStock: number;
  lowStockThreshold: number;
  alertDate: string;
  category: string;
  price: number;
}

export function generateLowStockAdminEmailHTML(data: LowStockAlertData): string {
  const stockStatus = data.currentStock === 0 ? 'OUT OF STOCK' : 'LOW STOCK';
  const alertBg = data.currentStock === 0 ? '#ffcccc' : '#ffffcc';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; line-height: 1.4; color: #333; background: #f5f5f5; }
    table { border-collapse: collapse; width: 100%; }
    td { padding: 0; }
    .container { width: 100%; background: #f5f5f5; }
    .wrapper { width: 100%; max-width: 700px; margin: 0 auto; background: white; }
    .header { width: 100%; background: #0d1b0f; color: white; padding: 20px; text-align: center; }
    .header-title { font-size: 20px; font-weight: bold; margin: 0; padding: 0; }
    .header-subtitle { font-size: 12px; margin: 5px 0 0 0; padding: 0; opacity: 0.9; }
    .content { padding: 20px; }
    .alert-banner { background: ${alertBg}; border-top: 3px solid #0d1b0f; padding: 15px; margin-bottom: 15px; width: 100%; }
    .alert-title { font-size: 13px; font-weight: bold; color: #0d1b0f; margin-bottom: 8px; }
    .alert-text { font-size: 11px; color: #333; line-height: 1.4; }
    .product-table { width: 100%; border: 1px solid #ddd; margin-bottom: 15px; }
    .product-table td { border: 1px solid #ddd; padding: 10px; font-size: 11px; }
    .product-label { background: #f8f8f8; font-weight: bold; color: #0d1b0f; width: 35%; }
    .product-value { color: #333; }
    .stock-alert { background: ${alertBg}; border: 1px solid #ddd; padding: 12px; margin-bottom: 15px; width: 100%; }
    .stock-label { font-size: 10px; font-weight: bold; color: #0d1b0f; text-transform: uppercase; margin-bottom: 6px; }
    .stock-value { font-size: 16px; font-weight: bold; color: #0d1b0f; }
    .action-buttons { width: 100%; text-align: center; margin: 20px 0; padding: 20px 0; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd; }
    .btn { display: inline-block; padding: 8px 15px; margin: 5px; font-size: 11px; font-weight: bold; text-decoration: none; color: white; background: #4c9a52; border: none; }
    .btn.danger { background: #cc0000; }
    .info-section { background: #f0f0f0; padding: 15px; margin-top: 15px; width: 100%; }
    .info-section p { font-size: 11px; color: #333; margin-bottom: 6px; line-height: 1.4; }
    .footer { background: #f8f8f8; padding: 15px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <table class="container">
    <tr>
      <td>
        <table class="wrapper">
          <!-- Header -->
          <tr>
            <td class="header">
              <p class="header-title">Inventory Alert</p>
              <p class="header-subtitle">Product Stock Status Notification</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="content">
              <!-- Alert Banner -->
              <table class="alert-banner">
                <tr>
                  <td>
                    <div class="alert-title">${stockStatus}: ${data.productName}</div>
                    <div class="alert-text">
                      ${data.currentStock === 0 
                        ? 'This product has run out of stock and has been automatically removed from the product catalog.'
                        : `This product is running low on inventory. Only ${data.currentStock} units remaining. Restock soon to avoid stockout.`
                      }
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Product Details Table -->
              <table class="product-table">
                <tr>
                  <td class="product-label">Product Name</td>
                  <td class="product-value">${data.productName}</td>
                </tr>
                <tr>
                  <td class="product-label">Brand</td>
                  <td class="product-value">${data.brand}</td>
                </tr>
                <tr>
                  <td class="product-label">Product ID</td>
                  <td class="product-value">${data.productId}</td>
                </tr>
                <tr>
                  <td class="product-label">Category</td>
                  <td class="product-value">${data.category}</td>
                </tr>
                <tr>
                  <td class="product-label">Price</td>
                  <td class="product-value">₦${data.price.toLocaleString()}</td>
                </tr>
                <tr>
                  <td class="product-label">Threshold Level</td>
                  <td class="product-value">${data.lowStockThreshold} units</td>
                </tr>
              </table>

              <!-- Stock Alert -->
              <table class="stock-alert">
                <tr>
                  <td>
                    <div class="stock-label">Current Stock Level</div>
                    <div class="stock-value">${data.currentStock} units</div>
                    ${data.currentStock > 0 ? `<p style="margin-top: 6px; font-size: 11px; color: #333;">Estimated stockout in ${Math.ceil(data.currentStock / 5)} days (at 5 units/day)</p>` : ''}
                  </td>
                </tr>
              </table>

              <!-- Action Buttons -->
              <table class="action-buttons">
                <tr>
                  <td style="padding: 10px 0; text-align: center;">
                    ${data.currentStock === 0 
                      ? `<a href="#" class="btn danger">RESTORE PRODUCT</a>`
                      : `<a href="#" class="btn">RESTOCK NOW</a>`
                    }
                    <a href="#" class="btn">VIEW INVENTORY</a>
                  </td>
                </tr>
              </table>

              <!-- Info Section -->
              <table class="info-section">
                <tr>
                  <td>
                    <p><strong>Alert Date:</strong> ${new Date(data.alertDate).toLocaleString()}</p>
                    <p>This is an automated alert. Products are automatically flagged when stock falls below threshold and removed when stock reaches zero.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer">
              <p>Greenlife Solar Solutions Limited</p>
              <p>Automatic Inventory Management System</p>
              <p>© 2026 All rights reserved</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Send low stock alert email to admin
 */
export async function sendLowStockAlert(
  data: LowStockAlertData,
  adminEmail: string = 'samuellucky2424@gmail.com'
): Promise<{ success: boolean; emailId?: string; error?: string }> {
  try {
    const emailHTML = generateLowStockAdminEmailHTML(data);

    // Use local API server in development, production endpoint in production
    const apiUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:3001/api/send-email'  // Local development
      : '/api/send-email';  // Production (Vercel)

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: adminEmail,
        subject: `${data.currentStock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}: ${data.productName}`,
        html: emailHTML,
        tags: {
          category: 'inventory',
          type: data.currentStock === 0 ? 'out-of-stock' : 'low-stock',
          productId: data.productId,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send low stock alert:', errorText);
      return { success: false, error: 'Failed to send alert email' };
    }

    const emailData = await response.json();
    return { success: true, emailId: emailData.id };
  } catch (error) {
    console.error('Error sending low stock alert:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check inventory levels after a purchase
 * Returns true if alert was sent, false if stock is still above threshold
 */
export async function checkInventoryLevel(
  product: any,
  lowStockThreshold: number = 3,
  adminEmail: string = 'samuellucky2424@gmail.com'
): Promise<{ alertSent: boolean; outOfStock: boolean }> {
  const currentStock = product.stock || 0;

  // If out of stock, trigger removal and send alert
  if (currentStock === 0) {
    console.log(`[INVENTORY] Product "${product.name}" is OUT OF STOCK - should be removed from catalog`);
    
    await sendLowStockAlert(
      {
        productId: product.id,
        productName: product.name,
        brand: product.brand || 'Unknown',
        currentStock: 0,
        lowStockThreshold,
        alertDate: new Date().toISOString(),
        category: product.category || 'Solar Equipment',
        price: product.price || 0,
      },
      adminEmail
    );

    return { alertSent: true, outOfStock: true };
  }

  // If low stock, send alert
  if (currentStock > 0 && currentStock <= lowStockThreshold) {
    console.log(`[INVENTORY] Product "${product.name}" is LOW STOCK - ${currentStock} units remaining`);
    
    await sendLowStockAlert(
      {
        productId: product.id,
        productName: product.name,
        brand: product.brand || 'Unknown',
        currentStock,
        lowStockThreshold,
        alertDate: new Date().toISOString(),
        category: product.category || 'Solar Equipment',
        price: product.price || 0,
      },
      adminEmail
    );

    return { alertSent: true, outOfStock: false };
  }

  // Stock is above threshold
  return { alertSent: false, outOfStock: false };
}
