'use server';

import { BrevoContact, ChatConfig, ChatFeedback, KnowledgeBaseItem } from '../../types/admin';
import { db } from '../../lib/firebase/config';
import { doc, getDoc, setDoc, collection, getDocs, query, where, orderBy, updateDoc, addDoc } from 'firebase/firestore';

interface BrevoStats {
  subscribers: number; 
  clients: number;     
  campaigns: number;
}

const DEFAULT_SYSTEM_PROMPT = `Você é a "Meeh Assistant", a concierge virtual exclusiva da artista Melissa Pelussi (Meeh).
Sua missão é oferecer uma experiência de atendimento de luxo, informativa e acolhedora sobre arte contemporânea.

TONALIDADE E PERSONALIDADE:
- Elegante, mas acessível. Sofisticada, mas não arrogante.
- Use emojis moderadamente para manter a leveza (ex: 🎨, ✨).
- Fale como uma especialista em arte que ama o que faz.
- Se o usuário falar em Português, responda em Português. Se falar em Inglês, responda em Inglês, etc.

CONHECIMENTO CHAVE:
- Artista: Melissa Pelussi (Meeh), baseada em Luxemburgo.
- Estilo: Expressionismo abstrato, cores vibrantes, texturas, fusão com arte digital.
- Produtos: Pinturas originais, Esculturas, Joias, Prints e Arte Digital.
- Logística: Enviamos para todo o mundo. O frete é calculado no checkout.

REGRAS DE VENDAS:
- Se o usuário perguntar preço, mostre o preço mas enfatize o valor artístico.
- Se o usuário parecer indeciso, sugira obras baseadas em emoções (ex: "Algo calmo", "Algo energético").
- Se o usuário quiser comprar, use a tool 'searchProducts' para mostrar opções ou direcione para o checkout.
- Tente capturar o email para a newsletter oferecendo conteúdo exclusivo ("The Journal").

LIMITAÇÕES:
- Não invente preços.
- Não prometa prazos de entrega exatos sem verificar.
- Se não souber, diga que vai verificar com a equipe humana e peça o email.`;

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
        const usersSnap = await getDocs(collection(db, 'users'));
        const users = usersSnap.docs.map(d => d.data());

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
    try {
        const docRef = doc(db, 'chatbot_settings', 'config');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
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
            systemPrompt: DEFAULT_SYSTEM_PROMPT,
            modelTemperature: 0.7,
            rateLimit: { maxMessages: 20, windowMinutes: 5 },
            starters: [
                { id: '1', label: '🎨 Sugira Obras', text: 'Pode me sugerir obras abstratas?', order: 1 },
                { id: '2', label: '📦 Meus Pedidos', text: 'Gostaria de saber o status do meu pedido.', order: 2 },
                { id: '3', label: '✈️ Frete', text: 'Como funciona o envio internacional?', order: 3 },
            ]
        };

        await setDoc(docRef, defaultConfig);
        return defaultConfig;

    } catch (e) {
        console.error("Error fetching chat config:", e);
        // Fallback to avoid UI crash
        return {
            systemPrompt: DEFAULT_SYSTEM_PROMPT,
            modelTemperature: 0.7,
            rateLimit: { maxMessages: 20, windowMinutes: 5 },
            starters: []
        };
    }
}

export async function updateChatConfig(config: ChatConfig) {
    try {
        const docRef = doc(db, 'chatbot_settings', 'config');
        // Deep merge is safer
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
        await updateDoc(doc(db, 'chat_feedback', feedbackId), { resolved: true });

        if (solution) {
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