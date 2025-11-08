import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { GoogleGenAI } from '@google/genai';

// IMPORTANT: Ensure NEXT_PUBLIC_GEMINI_API_KEY is set in your Vercel environment variables.
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ text: string, sender: 'user' | 'bot' }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const chatContentRef = useRef<HTMLDivElement>(null);
  
  const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ text: t('chatbot_greeting'), sender: 'bot' }]);
    }
  }, [isOpen, messages.length, t]);

  useEffect(() => {
    chatContentRef.current?.scrollTo(0, chatContentRef.current.scrollHeight);
  }, [messages]);

  const parseAndRender = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = text.split(boldRegex);
    return parts.map((part, index) =>
      index % 2 === 1 ? <strong key={index}>{part}</strong> : part
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    if (!ai) {
        setMessages(prev => [...prev, { text: "Gemini API key not configured.", sender: 'bot' }]);
        setIsLoading(false);
        return;
    }

    try {
      const systemInstruction = `You are a helpful, friendly, and professional art gallery assistant for the e-commerce website of artist Melissa Pelussi (also known as Meeh). Your main goal is to assist users and encourage them to explore the artwork.

      **Core Rules:**
      - Respond ONLY in this language: ${language}.
      - Be polite, concise, and professional. Use bold text with double asterisks (**text**) for emphasis.
      - NEVER invent information about artworks, prices, or availability. If you don't know, guide the user to the relevant page (e.g., "You can see all available paintings in the catalog.").
      - DO NOT attempt to perform actions like creating an order, adding to cart, or modifying user data. Your role is to guide, not to act.

      **Context about the Gallery:**
      - Artist: Melissa Pelussi (Meeh), based in Luxembourg.
      - Art Categories: The gallery features 'paintings', 'jewelry', 'digital art', and 'prints'.
      - General Info: You can answer questions about shipping policies, return policies, and contact information by directing users to the respective pages (/shipping, /contact).

      **User-Specific Instructions:**
      - The user is currently **${user ? `logged in as ${user.displayName || 'a customer'}` : 'not logged in'}**.
      - **If the user IS LOGGED IN** and asks about their orders, wishlist, or addresses:
          - Respond that for privacy and security reasons, you cannot access their personal account details.
          - Guide them to their dashboard. For example: "I can't check your order status directly for security reasons, but you can find all the details on your dashboard under 'My Orders'." or "You can manage your saved addresses in the 'My Addresses' section of your dashboard."
      - **If the user IS NOT LOGGED IN** and asks about account-specific features:
          - Gently inform them that this feature requires an account and guide them to the login or registration page. For example: "The wishlist is a great feature for saving your favorite pieces! You'll need to log in or create an account to use it."

      **Example Interaction:**
      - User: "Do you have any abstract paintings?"
      - You: "Yes, we have a beautiful collection of paintings. You can explore all of them in the **catalog** and filter by the 'Paintings' category to find the perfect piece."
      - User (logged in): "What's the status of my last order?"
      - You: "For your privacy, I can't view your specific order details. You can see the most up-to-date status of all your purchases in the **My Orders** section of your dashboard."`;
      
      const chatHistory = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [...chatHistory, { role: 'user', parts: [{ text: currentInput }] }],
        config: {
            systemInstruction
        }
      });

      const botMessage = { text: response.text, sender: 'bot' as const };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Gemini API error:", error);
      const errorMessage = { text: t('auth_error_generic'), sender: 'bot' as const };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 left-5 z-50 w-16 h-16 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-opacity-90 transition-transform transform hover:scale-110"
        aria-label="Open Chatbot"
      >
        {isOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 left-5 z-50 w-full max-w-sm h-[60vh] bg-white rounded-lg shadow-2xl flex flex-col border border-border-color animate-fade-in-up">
          <header className="p-4 bg-surface border-b border-border-color rounded-t-lg flex justify-between items-center">
            <h3 className="font-serif font-semibold text-lg text-primary">{t('chatbot_title')}</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </header>
          <div ref={chatContentRef} className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-secondary text-primary' : 'bg-surface text-text-primary'}`}>
                  <p className="text-sm">{parseAndRender(msg.text)}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="px-4 py-2 rounded-lg bg-surface text-text-primary">
                      <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                      </div>
                  </div>
              </div>
            )}
          </div>
          <footer className="p-4 border-t border-border-color">
            <div className="flex">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('chatbot_placeholder')}
                className="flex-grow px-3 py-2 bg-white border border-border-color rounded-l-md focus:outline-none focus:ring-1 focus:ring-secondary"
                disabled={isLoading}
              />
              <button onClick={handleSend} className="bg-primary text-white font-bold px-4 py-2 rounded-r-md hover:bg-opacity-90 disabled:bg-gray-400" disabled={isLoading || !input.trim()}>
                {t('chatbot_send')}
              </button>
            </div>
          </footer>
        </div>
      )}
    </>
  );
};

export default Chatbot;