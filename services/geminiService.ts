
import { GoogleGenAI } from "@google/genai";
import { Message, UserProfile } from '../types';

// FIX: API key is hardcoded as requested to fix the environment issue.
const ai = new GoogleGenAI({ apiKey: "AIzaSyAIoPE0x2aafoV6aHCw-btQoHVIhkj6dtY" });

// Mock data that would typically be fetched from a database (Firestore).
const mockProducts = [
  { id: 'p1', name: 'Golden Hour', category: 'paintings', price: 1200.00, status: 'available' },
  { id: 'p2', name: 'Azure Dreams', category: 'paintings', price: 1500.00, status: 'available' },
  { id: 'p3', name: 'Crimson Tide', category: 'digital', price: 800.00, status: 'sold' },
  { id: 'p4', name: 'Emerald Whisper', category: 'jewelry', price: 2200.00, status: 'available' },
];

const mockShippingInfo = `
- Luxembourg: 1-2 days, Standard: Free, Express: €15
- EU: 3-7 days, Standard: €25, Express: €45
- Brazil: 10-20 days, Standard: €80, Express: €150
`;

const generateSystemPrompt = (user: UserProfile | null, language: string): string => {
  return `You are an AI assistant for Melissa Pelussi Art, an online art gallery selling original paintings, jewelry, digital art, and prints by contemporary artist Melissa Pelussi (Meeh), based in Luxembourg.

CONTEXT:
- Artist: Melissa Pelussi (known as Meeh)
- Location: Luxembourg
- Languages: French, English, German, Portuguese
- Currency: EUR (€)
- Website: pelussi.th3lab.me

YOUR ROLE:
- Assist customers with product inquiries.
- Provide information about shipping, payment, and policies.
- Help customers track their orders (if logged in).
- Answer questions about the artist and her work.
- Suggest products based on customer preferences.
- Be friendly, professional, and helpful.
- Provide direct links to products when relevant in markdown format, e.g., [Product Name](/products/product-slug).

${user ? `
USER INFORMATION:
- Name: ${user.displayName}
- Email: ${user.email}
- Note: The user is logged in. You can offer personalized assistance like checking order status (mock response).
` : 'User is not logged in. Suggest they log in for personalized assistance like order tracking.'}

AVAILABLE INFORMATION:
PRODUCT CATALOG: ${JSON.stringify(mockProducts)}
SHIPPING INFORMATION: ${mockShippingInfo}
POLICIES: 14-day return policy for EU customers. Commissioned pieces are non-returnable. A certificate of authenticity is included with all original artworks.

GUIDELINES:
- Always be polite and professional.
- Keep responses concise but informative.
- If asked about specific products, provide names, prices, and status.
- If a user asks to track an order, and they are logged in, provide a mock status like "Your order #MP1234 has been shipped and is expected to arrive in 3-5 business days."
- If a question is beyond your knowledge, suggest contacting support directly at support@melissapelussi.art.
- Always respond in the user's preferred language: ${language}.
- Use appropriate currency formatting for prices (e.g., €1,200.00).
`;
};


export const sendMessageToGemini = async (
  newMessage: string,
  history: Message[],
  user: UserProfile | null,
  language: string
): Promise<string> => {
  try {
    const systemInstruction = generateSystemPrompt(user, language);
    
    // Convert our message format to Gemini's format, excluding the initial greeting
    const contents = history.slice(1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
    // Add the new user message
    contents.push({ role: 'user', parts: [{ text: newMessage }] });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later.";
  }
};