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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { text: input, sender: 'user' as const };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (!ai) {
        setMessages(prev => [...prev, { text: "Gemini API key not configured.", sender: 'bot' }]);
        setIsLoading(false);
        return;
    }

    try {
      const systemInstruction = `You are a helpful and friendly art gallery assistant for the e-commerce website of artist Melissa Pelussi (Meeh). Your goal is to assist users.
      - The current user's language is ${language}. Respond in this language.
      - The user is currently ${user ? `logged in as ${user.displayName}` : 'not logged in'}.
      - If the user is logged in, you can offer to help with their orders or profile, but you cannot access their data directly. You should direct them to their dashboard. For example: "I can't check your order status directly, but you can see all your orders in your dashboard."
      - If the user is not logged in, you can answer general questions about the artist, artwork categories (paintings, jewelry, digital art, prints), shipping, and contact information.
      - Be concise and helpful.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: input }] }],
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
          <header className="p-4 bg-surface border-b border-border-color rounded-t-lg">
            <h3 className="font-serif font-semibold text-lg text-primary">{t('chatbot_title')}</h3>
          </header>
          <div ref={chatContentRef} className="flex-grow p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-secondary text-primary' : 'bg-surface text-text-primary'}`}>
                  <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }}></p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                  <div className="px-4 py-2 rounded-lg bg-surface text-text-primary">
                      <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
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
              <button onClick={handleSend} className="bg-primary text-white font-bold px-4 py-2 rounded-r-md hover:bg-opacity-90 disabled:bg-gray-400" disabled={isLoading}>
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
