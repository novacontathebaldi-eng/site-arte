'use server';

import { BrevoContact, ChatConfig, ChatFeedback, KnowledgeBaseItem } from '../../types/admin';
import { db } from '../../lib/firebase/config';
import { doc, getDoc, setDoc, collection, getDocs, query, where, orderBy, updateDoc, addDoc } from 'firebase/firestore';

interface BrevoStats {
  subscribers: number; // Lista 5 (ou env)
  clients: number;     // Lista 7 (ou env)
  campaigns: number;
}

// --- BREVO ACTIONS ---

export async function getBrevoStats(): Promise<BrevoStats> {
  const apiKey = process.env.BREVO_API_KEY;
  // Listas especificadas: Newsletter (Ex: 5), Clientes (Ex: 7)
  const newsletterListId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : 5;
  const clientListId = process.env.BREVO_WELCOME_LIST_ID ? Number(process.env.BREVO_WELCOME_LIST_ID) : 7;

  if (!apiKey) return { subscribers: 0, clients: 0, campaigns: 0 };

  try {
    const headers = { 'accept': 'application/json', 'api-key': apiKey };

    // Fetch Newsletter List Stats
    const listRes = await fetch(`https://api.brevo.com/v3/contacts/lists/${newsletterListId}`, { headers });
    const listData = await listRes.json();

    // Fetch Client List Stats
    const clientListRes = await fetch(`https://api.brevo.com/v3/contacts/lists/${clientListId}`, { headers });
    const clientListData = await clientListRes.json();

    // Get Campaigns count (Opcional, mockado para performance se não crítico)
    // const campaignsRes = await fetch(`https://api.brevo.com/v3/emailCampaigns?limit=1`, { headers });
    // const campaignsData = await campaignsRes.json();

    return {
        subscribers: listData.uniqueSubscribers || 0,
        clients: clientListData.uniqueSubscribers || 0,
        campaigns: 12 // Mock fixo para performance, ou implementar chamada real se necessário
    };
  } catch (error) {
    console.error("Brevo Stats Error:", error);
    return { subscribers: 0, clients: 0, campaigns: 0 };
  }
}

export async function getBrevoContacts(limit: number = 50, offset: number = 0): Promise<BrevoContact[]> {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return [];

    try {
        const response = await fetch(`https://api.brevo.com/v3/contacts?limit=${limit}&offset=${offset}&sort=desc`, {
            headers: { 'accept': 'application/json', 'api-key': apiKey }
        });
        const data = await response.json();
        return data.contacts || [];
    } catch (e) {
        console.error("Brevo Contacts Error", e);
        return [];
    }
}

export async function syncFirestoreToBrevo(): Promise<{ added: number, errors: number }> {
    const apiKey = process.env.BREVO_API_KEY;
    const clientListId = process.env.BREVO_WELCOME_LIST_ID ? Number(process.env.BREVO_WELCOME_LIST_ID) : 7;
    
    if (!apiKey) return { added: 0, errors: 1 };

    let added = 0;
    let errors = 0;

    try {
        // 1. Get all users from Firestore
        const usersSnap = await getDocs(collection(db, 'users'));
        const users = usersSnap.docs.map(d => d.data());

        // 2. Iterate and add to Brevo
        for (const user of users) {
            if (user.email) {
                try {
                    const response = await fetch('https://api.brevo.com/v3/contacts', {
                        method: 'POST',
                        headers: {
                            'accept': 'application/json',
                            'content-type': 'application/json',
                            'api-key': apiKey,
                        },
                        body: JSON.stringify({
                            email: user.email,
                            attributes: {
                                NOME: user.displayName || 'Cliente',
                                FIRSTNAME: (user.displayName || '').split(' ')[0],
                                ROLE: 'USER_SYNC'
                            },
                            listIds: [clientListId],
                            updateEnabled: true
                        }),
                    });
                    if (response.ok || response.status === 400) { // 400 is often duplicate, which is fine
                        added++;
                    } else {
                        errors++;
                    }
                } catch (e) {
                    errors++;
                }
            }
        }
    } catch (e) {
        console.error("Sync Error", e);
        return { added, errors };
    }
    return { added, errors };
}

// --- CHATBOT ADMIN ACTIONS ---

export async function getChatConfig(): Promise<ChatConfig> {
    try {
        const docRef = doc(db, 'chatbot_settings', 'config');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            // Merge defaults to ensure type safety if DB is incomplete
            return {
                systemPrompt: data.systemPrompt || "You are 'Meeh Assistant'.",
                modelTemperature: data.modelTemperature || 0.7,
                rateLimit: {
                    maxMessages: data.rateLimit?.maxMessages || 20,
                    windowMinutes: data.rateLimit?.windowMinutes || 5
                },
                starters: data.starters || []
            };
        }
        
        // Default Init
        return {
            systemPrompt: "You are 'Meeh Assistant', a luxury art concierge for Melissa Pelussi. Your tone is elegant, helpful, and concise.",
            modelTemperature: 0.7,
            rateLimit: { maxMessages: 20, windowMinutes: 5 },
            starters: [
                { id: '1', label: '🎨 Sugira Obras', text: 'Pode me sugerir obras abstratas?', order: 1 },
                { id: '2', label: '📦 Meus Pedidos', text: 'Gostaria de saber o status do meu pedido.', order: 2 },
            ]
        };
    } catch (e) {
        console.error("Error fetching chat config:", e);
        return {
            systemPrompt: "Error loading config.",
            modelTemperature: 0.5,
            rateLimit: { maxMessages: 10, windowMinutes: 5 },
            starters: []
        };
    }
}

export async function updateChatConfig(config: ChatConfig) {
    try {
        const docRef = doc(db, 'chatbot_settings', 'config');
        await setDoc(docRef, config, { merge: true });
        return { success: true };
    } catch (e) {
        console.error("Error updating chat config:", e);
        return { success: false };
    }
}

export async function getChatFeedback(): Promise<ChatFeedback[]> {
    try {
        const q = query(
            collection(db, 'chat_feedback'), 
            where('feedback', '==', 'dislike'),
            where('resolved', '==', false),
            orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatFeedback));
    } catch (e) {
        console.error("Error fetching feedback:", e);
        return [];
    }
}

export async function resolveFeedback(feedbackId: string, solution?: KnowledgeBaseItem) {
    try {
        // 1. Mark feedback as resolved
        await updateDoc(doc(db, 'chat_feedback', feedbackId), { resolved: true });

        // 2. If a solution (KB Item) was provided, add it to Knowledge Base
        if (solution) {
            // Add to specific collection for RAG/Injection
            await addDoc(collection(db, 'chatbot_knowledge_base'), {
                ...solution,
                createdAt: new Date().toISOString()
            });
        }
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: String(e) };
    }
}

export async function getKnowledgeBase(): Promise<KnowledgeBaseItem[]> {
    try {
        const snapshot = await getDocs(collection(db, 'chatbot_knowledge_base'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KnowledgeBaseItem));
    } catch(e) {
        return [];
    }
}

export async function logAudit(action: string, details: string, userEmail: string) {
    try {
        await addDoc(collection(db, 'admin_audit_logs'), {
            action,
            details,
            user: userEmail,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        console.error("Audit Log Fail", e);
    }
}