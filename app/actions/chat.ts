'use server';

import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { registerClientToBrevo } from "./registerClient";
import { Product } from "@/types";
import { getChatConfig, getKnowledgeBase } from "./admin";
import { adminDb } from "@/lib/firebase/admin";
import { headers } from "next/headers";

// --- 1. TOOL DEFINITIONS ---

const searchProductsTool: FunctionDeclaration = {
  name: "searchProducts",
  description: "Search for artworks in the catalog based on keywords, category, or price range. Use this when the user asks for suggestions or specific art.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: "Keywords like 'abstract', 'blue', 'gold', 'calm'" },
      category: { type: Type.STRING, description: "Category filter (paintings, sculptures, digital, etc)" },
      maxPrice: { type: Type.NUMBER, description: "Maximum price budget" }
    },
    required: ["query"]
  }
};

const subscribeNewsletterTool: FunctionDeclaration = {
  name: "subscribeNewsletter",
  description: "Subscribe the user to the newsletter/VIP list when they provide their email address.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      email: { type: Type.STRING, description: "The user's email address" },
      name: { type: Type.STRING, description: "The user's name (optional)" }
    },
    required: ["email"]
  }
};

// --- 2. HELPER FUNCTIONS ---

async function checkRateLimit(ip: string): Promise<boolean> {
    try {
        const config = await getChatConfig();
        const { maxMessages, windowMinutes } = config.rateLimit || { maxMessages: 20, windowMinutes: 5 };
        
        if (maxMessages === 0) return true; // Unlimited

        const now = new Date();
        const windowStart = new Date(now.getTime() - windowMinutes * 60000);

        // Usando Admin SDK syntax
        const snapshot = await adminDb.collection('chat_logs')
            .where('ip', '==', ip)
            .where('timestamp', '>=', windowStart.toISOString())
            .get();

        return snapshot.size < maxMessages;
    } catch (error) {
        console.error("Rate limit check failed, allowing by default", error);
        return true; 
    }
}

async function executeProductSearch(args: any): Promise<{ info: string, products: Product[] }> {
  try {
    // Busca produtos usando Admin SDK
    const snapshot = await adminDb.collection('products').get();
    const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    
    let filtered = allProducts.filter(p => p.status !== 'sold');

    if (args.category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === args.category.toLowerCase());
    }

    if (args.maxPrice) {
      filtered = filtered.filter(p => p.price <= args.maxPrice);
    }

    if (args.query) {
      const q = args.query.toLowerCase();
      filtered = filtered.filter(p => {
        const combinedText = Object.values(p.translations || {})
          .map((t: any) => `${t.title} ${t.description} ${t.tags?.join(' ')}`)
          .join(' ')
          .toLowerCase();
        return combinedText.includes(q);
      });
    }

    const topResults = filtered.slice(0, 5);
    
    const contextString = topResults.map(p => 
      `- ID: ${p.id}, Title: ${p.translations['fr']?.title}, Price: €${p.price}, Category: ${p.category}, Image: ${p.images[0]}`
    ).join('\n');

    return { 
      info: topResults.length > 0 ? `Found ${topResults.length} artworks:\n${contextString}` : "No artworks found matching criteria.",
      products: topResults 
    };
  } catch (e) {
    console.error("Search Error", e);
    return { info: "Error searching database.", products: [] };
  }
}

// --- 3. MAIN ACTION ---

export async function generateChatResponse(
  message: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[],
  userInfo?: { name?: string, id?: string }
): Promise<{ text: string, products?: Product[], messageId?: string }> {
  
  if (!process.env.GEMINI_API_KEY) {
    return { text: "Erro: API Key não configurada no servidor." };
  }

  try {
    // 1. Rate Limiting
    const headersList = await headers();
    const ip = headersList.get('x-forwarded-for') || 'unknown';
    
    const allowed = await checkRateLimit(ip);
    if (!allowed) {
        return { text: "Limite de mensagens excedido. Por favor, aguarde alguns minutos." };
    }

    // 2. Config & Knowledge Base
    const chatConfig = await getChatConfig();
    const knowledgeBase = await getKnowledgeBase();
    
    const kbContext = knowledgeBase.map(kb => `Correct Fact: When asked "${kb.question}", the answer is "${kb.answer}"`).join('\n');
    
    const userContext = userInfo?.name 
        ? `User Name: ${userInfo.name}. Treat them as a known client.` 
        : `User is a guest. Try to get their name and email politely later.`;

    const systemInstruction = `
      ${chatConfig.systemPrompt}
      
      CONTEXT:
      ${userContext}

      KNOWLEDGE BASE UPDATES:
      ${kbContext}

      INSTRUCTIONS:
      - Always be helpful and elegant.
      - If you suggest products using the tool, be brief in text and let the UI show the cards.
      - Never hallucinate prices.
    `;

    // 3. Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        temperature: chatConfig.modelTemperature,
        tools: [{ functionDeclarations: [searchProductsTool, subscribeNewsletterTool] }]
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts.map(p => ({ text: p.text }))
      }))
    });

    // 4. Generate Content
    const result = await chat.sendMessage({ message: message });
    
    let finalText = "";
    let foundProducts: Product[] = [];
    
    // 5. Handle Tool Calls
    const toolCalls = result.functionCalls || [];

    if (toolCalls.length > 0) {
      const responseParts: any[] = [];
      
      for (const call of toolCalls) {
        if (!call) continue;

        if (call.name === "searchProducts") {
          const searchResult = await executeProductSearch(call.args);
          foundProducts = searchResult.products;
          responseParts.push({
             functionResponse: {
                id: call.id,
                name: call.name,
                response: { result: searchResult.info }
             }
          });
        } 
        else if (call.name === "subscribeNewsletter") {
          const args = call.args as any;
          await registerClientToBrevo(args.email, args.name || 'Art Lover');
          responseParts.push({
             functionResponse: {
                id: call.id,
                name: call.name,
                response: { result: "Success. Email added to Brevo list." }
             }
          });
        }
      }

      // Send tool results back
      const nextResult = await chat.sendMessage({
          message: responseParts
      });
      
      finalText = nextResult.text || "";
    } else {
      finalText = result.text || "";
    }

    // 6. Log Interaction using Admin SDK
    const logRef = await adminDb.collection('chat_logs').add({
        ip,
        userId: userInfo?.id || 'guest',
        userMessage: message,
        aiResponse: finalText,
        timestamp: new Date().toISOString()
    });

    return { 
      text: finalText,
      products: foundProducts.length > 0 ? foundProducts : undefined,
      messageId: logRef.id 
    };

  } catch (error: any) {
    console.error("Gemini Critical Error:", error);
    return { text: `O assistente está indisponível no momento. (Erro: ${error.message || 'Internal'})` };
  }
}

export async function submitChatFeedback(messageId: string, userMessage: string, aiResponse: string, feedback: 'like' | 'dislike') {
    try {
        await adminDb.collection('chat_feedback').add({
            messageId,
            userMessage,
            aiResponse,
            feedback,
            resolved: false,
            timestamp: new Date().toISOString()
        });
        return { success: true };
    } catch (e) {
        console.error("Feedback Error", e);
        return { success: false };
    }
}