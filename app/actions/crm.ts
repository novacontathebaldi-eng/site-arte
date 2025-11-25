
'use server';

import { adminDb, adminAuth } from '../../lib/firebase/admin';

const BREVO_API_KEY = process.env.BREVO_API_KEY;

export async function banUser(userId: string) {
  try {
    await adminAuth.updateUser(userId, { disabled: true });
    await adminDb.collection('users').doc(userId).update({ 
        role: 'banned',
        updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    console.error("Ban Error:", error);
    return { success: false };
  }
}

export async function syncUserAttributesToBrevo(userId: string, attributes: { totalSpent: number, isVIP: boolean, lastOrderDate?: string }) {
  if (!BREVO_API_KEY) return { success: false };

  try {
    const userDoc = await adminDb.collection('users').doc(userId).get();
    if (!userDoc.exists) return { success: false };
    const userData = userDoc.data();

    if (!userData?.email) return { success: false };

    // Brevo Update Contact
    const response = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(userData.email)}`, {
        method: 'PUT',
        headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': BREVO_API_KEY,
        },
        body: JSON.stringify({
            attributes: {
                TOTAL_SPENT: attributes.totalSpent,
                CLIENT_TYPE: attributes.isVIP ? 'VIP' : 'REGULAR',
                LAST_ORDER: attributes.lastOrderDate || ''
            }
        })
    });

    if (!response.ok) {
        // If contact doesn't exist, try creating? For now just log error
        console.error("Brevo Sync Failed", await response.text());
        return { success: false };
    }

    return { success: true };

  } catch (error) {
    console.error("Sync Error:", error);
    return { success: false };
  }
}
