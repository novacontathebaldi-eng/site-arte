
'use server';

import { adminDb } from '../../lib/firebase/admin';
import { OrderStatus } from '../../types/order';

const BREVO_API_KEY = process.env.BREVO_API_KEY;

// Helper to send transactional email via Brevo SMTP
async function sendTransactionalEmail(to: string, name: string, subject: string, htmlContent: string) {
  if (!BREVO_API_KEY) return { success: false, error: 'API Key missing' };

  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "Melissa Pelussi Art", email: "contact@melissapelussi.com" },
        to: [{ email: to, name: name }],
        subject: subject,
        htmlContent: htmlContent
      }),
    });

    if (!res.ok) throw new Error('Brevo SMTP Failed');
    return { success: true };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false };
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  try {
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();
    
    if (!orderSnap.exists) return { success: false, message: 'Pedido não encontrado' };
    
    const orderData = orderSnap.data();
    await orderRef.update({ 
      status, 
      updatedAt: new Date().toISOString() 
    });

    // Automations based on Status
    if (status === OrderStatus.PAID) {
       // Logic to reserve stock handled elsewhere usually, but could be here
    }

    if (status === OrderStatus.DELIVERED && orderData?.customerEmail) {
       await sendTransactionalEmail(
         orderData.customerEmail,
         orderData.customerName || 'Cliente',
         'Sua obra de arte foi entregue',
         `<html><body><h1>Sua obra chegou!</h1><p>Esperamos que você ame sua nova aquisição da Melissa Pelussi Art.</p></body></html>`
       );
    }

    return { success: true };
  } catch (error) {
    console.error("Order Update Error:", error);
    return { success: false, message: 'Erro ao atualizar pedido' };
  }
}

export async function updateOrderTracking(orderId: string, carrier: string, code: string) {
  try {
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();
    
    if (!orderSnap.exists) return { success: false };
    
    const orderData = orderSnap.data();
    
    // Update Firestore
    await orderRef.update({
      status: OrderStatus.SHIPPED,
      tracking: {
        carrier,
        code,
        sentAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString()
    });

    // Send Email
    if (orderData?.customerEmail) {
      await sendTransactionalEmail(
        orderData.customerEmail,
        orderData.customerName || 'Cliente',
        'Sua obra está a caminho! 🚚',
        `<html>
           <body>
             <h1>Boas notícias!</h1>
             <p>Seu pedido <strong>#${orderId.slice(0,8)}</strong> foi enviado.</p>
             <p>Transportadora: ${carrier}</p>
             <p>Código de Rastreio: <strong>${code}</strong></p>
             <br/>
             <p>Obrigado por colecionar Melissa Pelussi.</p>
           </body>
         </html>`
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Tracking Update Error:", error);
    return { success: false };
  }
}

export async function sendOrderEmail(orderId: string, subject: string, content: string) {
    try {
        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderSnap = await orderRef.get();
        if (!orderSnap.exists) return { success: false };
        const data = orderSnap.data();

        if (data?.customerEmail) {
            await sendTransactionalEmail(
                data.customerEmail,
                data.customerName || 'Cliente',
                subject,
                `<html><body>${content.replace(/\n/g, '<br/>')}</body></html>`
            );
            return { success: true };
        }
        return { success: false, message: 'Email do cliente não encontrado' };
    } catch (e) {
        return { success: false, message: 'Erro ao enviar' };
    }
}
