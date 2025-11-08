import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../context/AuthContext';
import { GoogleGenAI } from '@google/genai';

// IMPORTANT: Ensure GEMINI_API_KEY is set in your environment variables.
const API_KEY = process.env.GEMINI_API_KEY;

// Define message type locally for this component
interface ChatMessage {
    text: string;
    sender: 'user' | 'bot';
}

const botProfilePic = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ctext y='.9em' font-size='90'%3e🎨%3c/text%3e%3c/svg%3e";
const defaultUserPic = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3ctext y='.9em' font-size='90'%3e👤%3c/text%3e%3c/svg%3e";

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t, language } = useTranslation();
  const { user } = useAuth();
  
  const lastElementRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevIsSending = useRef(isLoading);
  
  const ai = useMemo(() => (API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null), []);
  const userImageSrc = useMemo(() => user?.photoURL || defaultUserPic, [user]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ text: t('chatbot_greeting'), sender: 'bot' }]);
    }
  }, [isOpen, messages.length, t]);

  useEffect(() => {
    prevIsSending.current = isLoading;
  });

  useEffect(() => {
    if (lastElementRef.current) {
        lastElementRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const justFinishedReplying = prevIsSending.current && !isLoading;
    if (isOpen && justFinishedReplying) {
        inputRef.current?.focus();
    }
  }, [isOpen, isLoading]);


  const parseMessage = (text: string) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = text.split(boldRegex);
    return parts.map((part, index) =>
      index % 2 === 1 ? <strong key={index}>{part}</strong> : part
    );
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
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
      const systemInstruction = `You are a sophisticated and helpful Art Assistant for the e-commerce gallery of artist Melissa Pelussi (Meeh). Your primary role is to provide information about the art, the artist, and the gallery, encouraging users to explore the collection.

      **Current Language:** Respond exclusively in ${language}.
      **User Status:** The user is currently ${user ? `logged in as ${user.displayName || 'a valued customer'}` : 'browsing as a guest'}.

      **Your Core Directives:**
      1.  **Be Professional & Concise:** Maintain a polite and knowledgeable tone. Use bold text for emphasis: **example**.
      2.  **Stick to the Facts:** NEVER invent details about artworks, prices, availability, or artist information. If you don't know something, gracefully guide the user to the relevant page (e.g., "You can find all of Meeh's beautiful paintings in the **Catalog** section.").
      3.  **Guide, Don't Act:** You are an assistant, not an operator. DO NOT attempt to perform actions like adding items to a cart, creating orders, or modifying user data. Your function is to provide information and direct users.
      4.  **Respect Privacy:** If a logged-in user asks about their personal data (orders, addresses, wishlist), you MUST decline and direct them to their secure dashboard.
          - **Example Response:** "For your security and privacy, I cannot access your personal account details. You can view your complete order history in the **My Orders** section of your dashboard."

      **Site Navigation Knowledge:**
      -   **Catalog (\`/catalog\`):** The main place to see all artworks, with filters for categories like 'paintings', 'jewelry', etc.
      -   **About (\`/about\`):** Contains information about the artist, Meeh.
      -   **Contact (\`/contact\`):** For direct inquiries.
      -   **Dashboard (\`/dashboard\`):** For logged-in users to manage their account, orders, addresses, and wishlist.

      **Interaction Scenarios:**
      -   **Guest asks about wishlist:** "The wishlist is a wonderful way to save your favorite pieces! To use it, you'll need to **create an account** or **log in**."
      -   **User asks about shipping:** "You can find detailed information about our worldwide shipping and return policies on the **Shipping & Returns** page."`;
      
      const chatHistory = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [...chatHistory, { role: 'user', parts: [{ text: currentInput }] }],
        config: { systemInstruction }
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

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 left-5 z-[9998] w-16 h-16 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-opacity-90 transition-transform transform hover:scale-110"
        aria-label={t('chatbot_open_button_aria')}
      >
        {isOpen ? (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>

      <div 
            aria-hidden={!isOpen}
            className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-5 sm:w-full sm:max-w-sm h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl z-[9999] flex flex-col transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}`}
        >
          <header className="flex justify-between items-center p-4 bg-primary text-white rounded-t-2xl flex-shrink-0">
                <h2 className="text-lg font-bold flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.546-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t('chatbot_header_title')}
                </h2>
                <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white text-2xl" aria-label={t('chatbot_close_button_aria')}>&times;</button>
            </header>
          
          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => {
                const isLastMessage = index === messages.length - 1;
                return (
                    <div 
                        key={index} 
                        ref={isLastMessage ? lastElementRef : null}
                        className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {msg.sender === 'bot' && (
                            <img 
                                src={botProfilePic} 
                                alt={t('chatbot_bot_alt')}
                                className="w-8 h-8 rounded-full border-2 border-accent object-cover flex-shrink-0" 
                            />
                        )}
                        <div className={`whitespace-pre-wrap max-w-[80%] rounded-2xl px-4 py-2 ${msg.sender === 'user' ? 'bg-secondary text-primary rounded-br-none' : 'bg-surface text-gray-800 rounded-bl-none'}`}>
                           {parseMessage(msg.text)}
                        </div>
                        {msg.sender === 'user' && (
                            <img 
                               src={userImageSrc} 
                               alt={t('chatbot_user_alt')}
                               className="w-8 h-8 rounded-full border-2 border-secondary object-cover flex-shrink-0" 
                            />
                        )}
                    </div>
                );
            })}
            {isLoading && (
                <div ref={lastElementRef} className="flex items-end gap-2 justify-start">
                    <img 
                        src={botProfilePic} 
                        alt={t('chatbot_bot_alt')}
                        className="w-8 h-8 rounded-full border-2 border-accent object-cover flex-shrink-0" 
                    />
                    <div className="bg-surface text-gray-800 rounded-2xl rounded-bl-none px-4 py-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">{t('chatbot_typing')}</span>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                </div>
            )}
          </div>
          <form onSubmit={handleSend} className="p-4 border-t border-gray-200 flex items-center gap-2 flex-shrink-0">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={t('chatbot_placeholder')}
                    className="w-full px-4 py-2 border rounded-full focus:ring-2 focus:ring-secondary"
                    disabled={isLoading}
                />
                <button 
                    type="submit" 
                    disabled={!input.trim() || isLoading}
                    className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    aria-label={t('chatbot_send_button_aria')}
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path></svg>
                </button>
            </form>
        </div>
    </>
  );
};

export default Chatbot;