
import { serve } from 'https:
import { createClient } from 'https:

const WHATSAPP_API_URL = 'https:
const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_ID')!;
const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN')!;
const ADMIN_PHONE = '+254795436192';

serve(async (req) => {
  try {
    const { orderId, customerPhone, customerName, totalAmount } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const customerMessage = `Hello ${customerName}! 🎂

Thank you for your order at Sweet Tooth Bakery!

Order ID: ${orderId.substring(0, 8)}
Total: Ksh ${totalAmount.toLocaleString()}

We've received your order and will start preparing it shortly. You'll receive updates on your delivery.

For any questions, reply to this message or call us at +254728922703.

Sweet Tooth Bakery - Baking Happiness! 😊`;

    const customerResponse = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: customerPhone.replace(/\D/g, ''), 
        type: 'text',
        text: { body: customerMessage },
      }),
    });

    const adminMessage = `🔔 NEW ORDER RECEIVED!

Customer: ${customerName}
Phone: ${customerPhone}
Amount: Ksh ${totalAmount.toLocaleString()}
Order ID: ${orderId.substring(0, 8)}

View full details in admin dashboard.`;

    const adminResponse = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: ADMIN_PHONE.replace(/\D/g, ''),
        type: 'text',
        text: { body: adminMessage },
      }),
    });

    await supabase.from('notifications').insert([
      {
        order_id: orderId,
        type: 'WHATSAPP',
        recipient: customerPhone,
        message: customerMessage,
        status: customerResponse.ok ? 'SENT' : 'FAILED',
        sent_at: new Date().toISOString(),
      },
      {
        order_id: orderId,
        type: 'WHATSAPP',
        recipient: ADMIN_PHONE,
        message: adminMessage,
        status: adminResponse.ok ? 'SENT' : 'FAILED',
        sent_at: new Date().toISOString(),
      },
    ]);

    return new Response(
      JSON.stringify({ success: true, message: 'Notifications sent' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
