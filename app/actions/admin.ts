'use server';

import { BrevoContact, ChatConfig, ChatFeedback, KnowledgeBaseItem } from '../../types/admin';
import { db } from '../../lib/firebase/config';
import { doc, getDoc, setDoc, collection, getDocs, query, where, orderBy, updateDoc, addDoc } from 'firebase/firestore';

interface BrevoStats {
  subscribers: number;
  clients: number;
  campaigns: number;
}

// --- BREVO ACTIONS ---

export async function getBrevoStats(): Promise<BrevoStats> {
  const apiKey = process.env.BREVO_API_KEY;
  const newsletterListId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : 2;
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

    return {
        subscribers: listData.uniqueSubscribers || 0,
        clients: clientListData.uniqueSubscribers || 0,
        campaigns: 12 // Mock
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
        const response = await fetch(`https://api.brevo.com/v3/contacts?limit=${limit}&offset=${offset}`, {
            headers: { 'accept': 'application/json', 'api-key': apiKey }
        });
        const data = await response.json();
        return data.contacts || [];
    } catch (e) {
        console.error("Brevo Contacts Error", e);
        return [];
    }
}

// --- CHATBOT ADMIN ACTIONS ---

export async function getChatConfig(): Promise<ChatConfig> {
    try {
        const docRef = doc(db, 'chatbot_settings', 'config');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data() as ChatConfig;
        }
        
        // Defaults
        return {
            systemPrompt: "You are 'Meeh Assistant', a luxury art concierge for Melissa Pelussi.",
            modelTemperature: 0.7,
            rateLimit: { maxMessages: 20, windowMinutes: 5 },
            starters: [
                { id: '1', label: '🎨 Sugira Obras', text: 'Pode me sugerir obras abstratas?', order: 1 },
                { id: '2', label: '📦 Meus Pedidos', text: 'Gostaria de saber o status do meu pedido.', order: 2 },
            ]
        };
    } catch (e) {
        console.error(e);
        throw new Error("Failed to fetch chat config");
    }
}

export async function updateChatConfig(config: ChatConfig) {
    try {
        const docRef = doc(db, 'chatbot_settings', 'config');
        await setDoc(docRef, config, { merge: true });
        return { success: true };
    } catch (e) {
        console.error(e);
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
        console.error(e);
        return [];
    }
}

export async function resolveFeedback(feedbackId: string, solution?: KnowledgeBaseItem) {
    try {
        // 1. Mark feedback as resolved
        await updateDoc(doc(db, 'chat_feedback', feedbackId), { resolved: true });

        // 2. If a solution (KB Item) was provided, add it to Knowledge Base
        if (solution) {
            await addDoc(collection(db, 'chatbot_knowledge_base'), {
                ...solution,
                createdAt: new Date().toISOString()
            });
        }
        return { success: true };
    } catch (e) {
        return { success: false, error: e };
    }
}

export async function logAudit(action: string, details: string, userEmail: string) {
    console.log(`AUDIT [${new Date().toISOString()}] ${userEmail}: ${action} - ${details}`);
}