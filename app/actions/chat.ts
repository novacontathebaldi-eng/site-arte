'use server';

import { GoogleGenAI, Type, FunctionDeclaration, Tool } from "@google/genai";
import { getCollection, createDocument } from "@/lib/firebase/firestore";
import { registerClientToBrevo } from "./registerClient";
import { Product } from "@/types";
import { getChatConfig, getKnowledgeBase } from "./admin";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, Timestamp, addDoc } from "firebase/firestore";
import { headers } from "next/headers";

const API_KEY = process.env.GEMINI_API_KEY;

// --- 1. TOOL DEFINITIONS (UPDATED FOR @google/genai) ---

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
        // Configuração dinâmica do Admin
        const config = await getChatConfig();
        const { maxMessages, windowMinutes } = config.rateLimit || { maxMessages: 20, windowMinutes: 5 };
        
        // 0 significa ILIMITADO
        if (maxMessages === 0) return true;

        // Calculate the timestamp for X minutes ago
        const now = new Date();
        const windowStart = new Date(now.getTime() - windowMinutes * 60000);

        // Firestore query: log entries for this IP since windowStart
        const q = query(
            collection(db, 'chat_logs'),
            where('ip', '==', ip),
            where('timestamp', '>=', windowStart.toISOString())
        );

        const snapshot = await getDocs(q);
        return snapshot.size < maxMessages;
    } catch (error) {
        console.error("Rate limit check failed, allowing by default", error);
        return true; 
    }
}

async function executeProductSearch(args: any): Promise<{ info: string, products: Product[] }> {
  try {
    const allProducts = (await getCollection('products')) as Product[];
    
    // Filter Logic (Simple implementation for demo)
    let filtered = allProducts.filter(p => p.status !== 'sold'); // Only available items

    if (args.category) {
      filtered = filtered.filter(p => p.category.toLowerCase() === args.category.toLowerCase());
    }

    if (args.maxPrice) {
      filtered = filtered.filter(p => p.price <= args.maxPrice);
    }

    if (args.query) {
      const q = args.query.toLowerCase();
      filtered = filtered.filter(p => {
        // Search in all available translations
        const combinedText = Object.values(p.translations || {})
          .map((t: any) => `${t.title} ${t.description} ${t.tags?.join(' ')}`)
          .join(' ')
          .toLowerCase();
        return combinedText.includes(q);
      });
    }

    // Limit results for UI
    const topResults = filtered.slice(0, 5);
    
    // Create a context string for the AI to describe the products
    const contextString = topResults.map(p => 
      `- ID: ${p.id}, Title: ${p.translations['fr']?.title}, Price: €${p.price}, Category: ${p.category}`
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
  history: { role: 'user' | 'model', parts: { text: string }[] }[]
): Promise<{ text: string, products?: Product[], messageId?: string }> {
  
  if (!API_KEY) {
    return { text: "Erro de configuração: API Key ausente." };
  }

  // Rate Limiting
  const headersList = headers();
  const ip = headersList.get('x-forwarded-for') || 'unknown';
  
  const allowed = await checkRateLimit(ip);
  if (!allowed) {
      return { text: "Você enviou muitas mensagens em pouco tempo. Por favor, aguarde alguns minutos." };
  }

  // Load Config & Knowledge Base
  const chatConfig = await getChatConfig();
  const knowledgeBase = await getKnowledgeBase();
  
  // Prepare Knowledge Base Context Injection
  const kbContext = knowledgeBase.map(kb => `Q: ${kb.question}\nA: ${kb.answer}`).join('\n\n');
  
  const systemInstruction = `
    ${chatConfig.systemPrompt}
    
    --- KNOWLEDGE BASE (CORRECTIONS & FACTS) ---
    Use the following Q&A pairs to guide your answers if relevant to the user's query. Priority is High.
    ${kbContext}
    --------------------------------------------

    If products are found via tool, respond enthusiastically and ask if they want to see details.
  `;

  // --- NEW SDK IMPLEMENTATION ---
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  let foundProducts: Product[] = [];

  try {
    // Correct way to initialize Chat in @google/genai
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

    // 1. Send User Message
    const result = await chat.sendMessage({ message: message });
    
    let finalText = "";
    
    // 2. Handle Tool Calls (The new SDK returns functionCalls inside the response candidates)
    // We iterate manually or use the helper if available, but manual iteration is safer for complex logic
    const candidates = result.candidates;
    const firstCandidate = candidates?.[0];
    
    // Check for function calls in the response content parts
    const toolCalls: any[] = [];
    if (firstCandidate?.content?.parts) {
        for (const part of firstCandidate.content.parts) {
            if (part.functionCall) {
                toolCalls.push(part.functionCall);
            }
        }
    }

    if (toolCalls.length > 0) {
      // Execute tools
      const functionResponses = [];
      
      for (const call of toolCalls) {
        if (call.name === "searchProducts") {
          const searchResult = await executeProductSearch(call.args);
          foundProducts = searchResult.products;
          functionResponses.push({
             id: call.id,
             name: call.name,
             response: { result: searchResult.info }
          });
        } 
        else if (call.name === "subscribeNewsletter") {
          const args = call.args as any;
          await registerClientToBrevo(args.email, args.name || 'Art Lover');
          functionResponses.push({
             id: call.id,
             name: call.name,
             response: { result: "Success. Email added to Brevo list." }
          });
        }
      }

      // Send tool results back to model
      const nextResult = await chat.sendToolResponse({
          functionResponses: functionResponses
      });
      
      finalText = nextResult.text || "";

    } else {
      finalText = result.text || "";
    }

    // 3. Log Interaction
    const logRef = await addDoc(collection(db, 'chat_logs'), {
        ip,
        userMessage: message,
        aiResponse: finalText,
        timestamp: new Date().toISOString()
    });

    return { 
      text: finalText || "Desculpe, não consegui processar sua resposta.",
      products: foundProducts.length > 0 ? foundProducts : undefined,
      messageId: logRef.id // Return ID for feedback mapping
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "O assistente está momentaneamente indisponível (Erro interno)." };
  }
}

// Action to save feedback (Like/Dislike)
export async function submitChatFeedback(messageId: string, userMessage: string, aiResponse: string, feedback: 'like' | 'dislike') {
    try {
        await addDoc(collection(db, 'chat_feedback'), {
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
