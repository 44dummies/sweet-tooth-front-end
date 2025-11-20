
import { serve } from 'https:
import { createClient } from 'https:

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const ADMIN_EMAIL = 'muindidamian@gmail.com';

serve(async (req) => {
  try {
    const { orderId, customerName, customerEmail, customerPhone, totalAmount, items } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (customerEmail) {
      const customerEmailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .item { padding: 10px 0; border-bottom: 1px solid #eee; }
    .total { font-size: 24px; font-weight: bold; color: #667eea; margin-top: 20px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎂 Sweet Tooth Bakery</h1>
      <p>Thank You for Your Order!</p>
    </div>
    <div class="content">
      <h2>Hello ${customerName}!</h2>
      <p>We've received your order and we're excited to start baking for you!</p>
      
      <div class="order-details">
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${orderId.substring(0, 8)}</p>
        ${items.map((item: any) => `
          <div class="item">
            <strong>${item.title}</strong><br>
            Quantity: ${item.quantity} × Ksh ${item.price.toLocaleString()}<br>
            Subtotal: Ksh ${(item.quantity * item.price).toLocaleString()}
          </div>
        `).join('')}
        <div class="total">
          Total: Ksh ${totalAmount.toLocaleString()}
        </div>
      </div>

      <p><strong>What's Next?</strong></p>
      <ul>
        <li>We'll start preparing your order</li>
        <li>You'll receive updates via WhatsApp</li>
        <li>Contact us anytime at +254728922703</li>
      </ul>

      <p>Thank you for choosing Sweet Tooth Bakery!</p>
    </div>
    <div class="footer">
      <p>Sweet Tooth Bakery | 160 Mwihoko Road, Nairobi, Kenya</p>
      <p>+254728922703 | muindidamian@gmail.com</p>
    </div>
  </div>
</body>
</html>`;

      const customerEmailResponse = await fetch('https:
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Sweet Tooth Bakery <orders@sweettooth.co.ke>',
          to: [customerEmail],
          subject: `Order Confirmation #${orderId.substring(0, 8)} - Sweet Tooth Bakery`,
          html: customerEmailHtml,
        }),
      });

      await supabase.from('notifications').insert([{
        order_id: orderId,
        type: 'EMAIL',
        recipient: customerEmail,
        message: `Order confirmation sent to ${customerEmail}`,
        status: customerEmailResponse.ok ? 'SENT' : 'FAILED',
        sent_at: new Date().toISOString(),
      }]);
    }

    const adminEmailHtml = `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif;">
  <h2>🔔 New Order Received!</h2>
  <p><strong>Order ID:</strong> ${orderId.substring(0, 8)}</p>
  <p><strong>Customer:</strong> ${customerName}</p>
  <p><strong>Phone:</strong> ${customerPhone}</p>
  <p><strong>Email:</strong> ${customerEmail || 'Not provided'}</p>
  <p><strong>Total Amount:</strong> Ksh ${totalAmount.toLocaleString()}</p>
  
  <h3>Items:</h3>
  <ul>
    ${items.map((item: any) => `
      <li>${item.title} - Qty: ${item.quantity} - Ksh ${(item.quantity * item.price).toLocaleString()}</li>
    `).join('')}
  </ul>
  
  <p><a href="https:
</body>
</html>`;

    await fetch('https:
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Sweet Tooth Orders <orders@sweettooth.co.ke>',
        to: [ADMIN_EMAIL],
        subject: `New Order #${orderId.substring(0, 8)} - Ksh ${totalAmount.toLocaleString()}`,
        html: adminEmailHtml,
      }),
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Emails sent' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
