
'use server';

import { BrevoContact, ChatConfig, ChatFeedback, KnowledgeBaseItem } from '../../types/admin';
import { adminDb, adminAuth } from '../../lib/firebase/admin';
import { unstable_noStore as noStore } from 'next/cache';

interface BrevoStats {
  subscribers: number; 
  clients: number;     
  campaigns: number;
}

// EXPORTADO PARA USO NO FALLBACK
export const DEFAULT_SYSTEM_PROMPT = `Você é o Meeh Assistant, o concierge virtual da Galeria Melissa Pelussi Art. Sua missão é vender arte com elegância.
- Tom: Sofisticado, acolhedor e profissional.
- Idioma: Detecte o idioma do usuário (PT/EN/FR/DE) e responda no mesmo.
- Contexto: Você tem acesso ao catálogo. Se perguntarem preço, busque nos dados fornecidos.
- Venda: Se o cliente mostrar interesse, sugira 'Adicionar ao Carrinho' ou pergunte se quer receber novidades (Newsletter).

DETALHES DA ARTISTA:
Melissa Pelussi (Meeh) é uma artista contemporânea baseada em Luxemburgo. Seu estilo mistura expressionismo abstrato com arte digital.

REGRAS:
- Nunca invente preços. Use a ferramenta de busca se precisar.
- Seja conciso e prestativo.`;

// --- BREVO ACTIONS ---

export async function getBrevoStats(): Promise<BrevoStats> {
  const apiKey = process.env.BREVO_API_KEY;
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

    return {
        subscribers: listData.uniqueSubscribers || 0,
        clients: clientListData.uniqueSubscribers || 0,
        campaigns: 12 
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
        // ADMIN SDK: Lista todos os usuários sem restrição de regras
        const usersSnap = await adminDb.collection('users').get();
        
        for (const doc of usersSnap.docs) {
            const user = doc.data();
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
                    if (response.ok || response.status === 400) { 
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
    noStore(); // Opt out of static caching
    try {
        const docSnap = await adminDb.collection('chatbot_settings').doc('config').get();
        
        if (docSnap.exists) {
            const data = docSnap.data() as any;
            // Validação e Fallback
            return {
                useCustomPrompt: data.useCustomPrompt ?? false, // Default OFF for safety
                systemPrompt: data.systemPrompt || DEFAULT_SYSTEM_PROMPT,
                modelTemperature: data.modelTemperature ?? 0.7,
                rateLimit: {
                    maxMessages: data.rateLimit?.maxMessages ?? 20,
                    windowMinutes: data.rateLimit?.windowMinutes ?? 5
                },
                starters: data.starters || []
            };
        }
        
        // If config doesn't exist, create it with defaults immediately
        const defaultConfig: ChatConfig = {
            useCustomPrompt: false,
            systemPrompt: DEFAULT_SYSTEM_PROMPT,
            modelTemperature: 0.7,
            rateLimit: { maxMessages: 20, windowMinutes: 5 },
            starters: [
                { id: '1', label: '🎨 Sugira Obras', text: 'Pode me sugerir obras abstratas?', order: 1 },
                { id: '2', label: '📦 Meus Pedidos', text: 'Gostaria de saber o status do meu pedido.', order: 2 },
                { id: '3', label: '✈️ Frete', text: 'Como funciona o envio internacional?', order: 3 },
            ]
        };

        await adminDb.collection('chatbot_settings').doc('config').set(defaultConfig);
        return defaultConfig;

    } catch (e) {
        console.error("Error fetching chat config:", e);
        return {
            useCustomPrompt: false,
            systemPrompt: DEFAULT_SYSTEM_PROMPT,
            modelTemperature: 0.7,
            rateLimit: { maxMessages: 20, windowMinutes: 5 },
            starters: []
        };
    }
}

export async function updateChatConfig(config: ChatConfig) {
    try {
        await adminDb.collection('chatbot_settings').doc('config').set(config, { merge: true });
        return { success: true };
    } catch (e) {
        console.error("Error updating chat config:", e);
        return { success: false };
    }
}

export async function getChatFeedback(): Promise<ChatFeedback[]> {
    try {
        const snapshot = await adminDb.collection('chat_feedback')
            .where('feedback', '==', 'dislike')
            .get();

        let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatFeedback));
        
        items = items.filter(i => i.resolved === false);
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return items;
    } catch (e) {
        console.error("Error fetching feedback:", e);
        return [];
    }
}

export async function resolveFeedback(feedbackId: string, solution?: KnowledgeBaseItem) {
    try {
        await adminDb.collection('chat_feedback').doc(feedbackId).update({ resolved: true });

        if (solution) {
            await adminDb.collection('chatbot_knowledge_base').add({
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
        const snapshot = await adminDb.collection('chatbot_knowledge_base').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as KnowledgeBaseItem));
    } catch(e) {
        return [];
    }
}

export async function logAudit(action: string, details: string, userEmail: string) {
    try {
        await adminDb.collection('admin_audit_logs').add({
            action,
            details,
            user: userEmail,
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        console.error("Audit Log Fail", e);
    }
}
