import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";

// Hardcoded API Key as requested
const API_KEY = "AIzaSyAIoPE0x2aafoV6aHCw-btQoHVIhkj6dtY";

// Initialize Gemini
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: API_KEY });
};

export const generateChatResponse = async (
  message: string, 
  history: { role: 'user' | 'model', parts: { text: string }[] }[]
): Promise<string> => {
  const ai = getAiClient();
  
  try {
    const chat: Chat = ai.chats.create({
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
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text || "Desculpe, não consegui processar sua resposta.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, o assistente está temporariamente indisponível. Tente novamente mais tarde.";
  }
};