'use server';

import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export async function generateChatResponse(
  message: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[]
): Promise<string> {
  
  if (!API_KEY) {
    console.error("Gemini API Key is missing on the server.");
    return "Desculpe, estou passando por manutenção no momento. (Erro de Configuração)";
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are 'Meeh Assistant', the AI assistant for Melissa Pelussi's Art Store.
        You are helpful, polite, and knowledgeable about contemporary art.
        The artist is based in Luxembourg.
        
        IMPORTANT: The website supports 4 languages: French (Français), English, German (Deutsch), and Portuguese (Português).
        You MUST reply in the language the user is currently speaking to you.
        If the user asks about available languages, mention that the site is available in FR, EN, DE, and PT.
        
        Help users find products, understand shipping (worldwide), and art care.
        Answer briefly and elegantly.`,
      },
      history: history // Pass conversation history for context
    });

    // Send message to the model
    const response = await chat.sendMessage({ message });
    return response.text || "Desculpe, não consegui processar sua resposta.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, o assistente está temporariamente indisponível. Tente novamente mais tarde.";
  }
}