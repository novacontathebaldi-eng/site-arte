'use server';

import { GoogleGenAI, FunctionDeclaration, Tool, SchemaType } from "@google/genai";
import { getCollection } from "../lib/firebase/firestore";
import { registerClientToBrevo } from "./registerClient";
import { Product } from "../types";

const API_KEY = process.env.GEMINI_API_KEY;

// --- 1. TOOL DEFINITIONS ---

const searchProductsTool: FunctionDeclaration = {
  name: "searchProducts",
  description: "Search for artworks in the catalog based on keywords, category, or price range. Use this when the user asks for suggestions or specific art.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: { type: SchemaType.STRING, description: "Keywords like 'abstract', 'blue', 'gold', 'calm'" },
      category: { type: SchemaType.STRING, description: "Category filter (paintings, sculptures, digital, etc)" },
      maxPrice: { type: SchemaType.NUMBER, description: "Maximum price budget" }
    },
    required: ["query"]
  }
};

const subscribeNewsletterTool: FunctionDeclaration = {
  name: "subscribeNewsletter",
  description: "Subscribe the user to the newsletter/VIP list when they provide their email address.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      email: { type: SchemaType.STRING, description: "The user's email address" },
      name: { type: SchemaType.STRING, description: "The user's name (optional)" }
    },
    required: ["email"]
  }
};

const tools: Tool[] = [
  {
    functionDeclarations: [searchProductsTool, subscribeNewsletterTool]
  }
];

// --- 2. HELPER FUNCTIONS ---

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
): Promise<{ text: string, products?: Product[] }> {
  
  if (!API_KEY) {
    return { text: "Erro de configuração: API Key ausente." };
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  let foundProducts: Product[] = [];

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-2.0-flash', // Using latest efficient model
      tools: tools
    });

    const chat = model.startChat({
      history: history,
      systemInstruction: `You are 'Meeh Assistant', a luxury art concierge for Melissa Pelussi.
      tone: Sophisticated, warm, minimalist, professional.
      
      GOALS:
      1. Help users find art (Use 'searchProducts').
      2. Capture leads. If the user seems interested, gently suggest joining the 'VIP Circle' for private views. If they give an email, use 'subscribeNewsletter'.
      
      CONTEXT:
      - The artist is based in Luxembourg.
      - Ships worldwide.
      - Accepts Revolut and Cards.
      - Respond in the USER'S LANGUAGE (detect automatically).
      
      FORMATTING:
      - Keep responses short and elegant (max 3 sentences usually).
      - Use emojis sparingly but effectively (✨, 🎨, 🥂).
      `
    });

    // 1. Send User Message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const functionCalls = response.functionCalls();

    let finalText = "";

    // 2. Handle Tool Calls
    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        if (call.name === "searchProducts") {
          const searchResult = await executeProductSearch(call.args);
          foundProducts = searchResult.products;
          
          // Send result back to Gemini to generate natural text
          const nextResult = await chat.sendMessage([
            {
              functionResponse: {
                name: "searchProducts",
                response: { result: searchResult.info }
              }
            }
          ]);
          finalText = nextResult.response.text();
        } 
        else if (call.name === "subscribeNewsletter") {
          const args = call.args as any;
          await registerClientToBrevo(args.email, args.name || 'Art Lover');
          
          // List ID 5 is implied logic for this context, handled in registerClientToBrevo or we can update it
          // Assuming registerClientToBrevo handles default list or we update it.
          
          const nextResult = await chat.sendMessage([
             {
              functionResponse: {
                name: "subscribeNewsletter",
                response: { result: "Success. Email added to Brevo list." }
              }
            }
          ]);
          finalText = nextResult.response.text();
        }
      }
    } else {
      finalText = response.text();
    }

    return { 
      text: finalText || "Desculpe, não entendi.",
      products: foundProducts.length > 0 ? foundProducts : undefined
    };

  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "O assistente está momentaneamente indisponível. Tente recarregar." };
  }
}