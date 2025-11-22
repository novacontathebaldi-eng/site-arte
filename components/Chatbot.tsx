import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { useUIStore } from '../store';
import { generateChatResponse } from '../geminiService';
import { ChatMessage } from '../types';
import { useLanguage } from '../hooks/useLanguage';

export const Chatbot: React.FC = () => {
  const { isChatOpen, toggleChat } = useUIStore();
  const { t, language } = useLanguage();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset/Update Welcome message when language changes if user hasn't interacted
  useEffect(() => {
    if (!hasInteracted) {
        setMessages([{ 
            id: 'welcome', 
            role: 'model', 
            text: t('chat.welcome'), 
            timestamp: Date.now() 
        }]);
    }
  }, [language, hasInteracted, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    setHasInteracted(true); // User has now interacted, stop auto-updating welcome msg

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: inputValue,
        timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Convert history for context
    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const responseText = await generateChatResponse(userMsg.text, history);

    const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  }

  return (
    <>
      {/* Floating Button */}
      <motion.button
        // Alterado: dark:bg-accent para manter consistência e visibilidade, em vez de branco
        className="fixed bottom-8 left-8 z-40 w-16 h-16 bg-primary text-white dark:bg-accent dark:text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-accent hover:brightness-110 transition-all"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleChat}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <MessageCircle size={28} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleChat}
            />
            
            {/* Sidebar */}
            <motion.div
              className="fixed top-0 left-0 h-full w-full sm:w-[400px] bg-white dark:bg-[#1a1a1a] z-50 shadow-2xl flex flex-col border-r border-gray-200 dark:border-white/10"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-accent/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shadow-md">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h3 className="font-serif font-bold text-lg text-primary dark:text-white">{t('chat.assistant_name')}</h3>
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">● {t('chat.online')}</span>
                    </div>
                </div>
                <button onClick={toggleChat} className="text-gray-500 hover:text-primary dark:hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-light dark:bg-[#121212]">
                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                                ? 'bg-accent text-white rounded-br-none' 
                                : 'bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-white/5'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="bg-white dark:bg-[#252525] p-4 rounded-2xl rounded-bl-none flex gap-2 items-center border border-gray-100 dark:border-white/5 shadow-sm">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75" />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150" />
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#1a1a1a]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('chat.placeholder')}
                        className="flex-1 bg-gray-100 dark:bg-white/5 border-transparent border focus:border-accent rounded-full px-4 py-3 text-sm focus:ring-0 outline-none dark:text-white transition-all"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isLoading || !inputValue.trim()}
                        className="w-12 h-12 bg-primary dark:bg-white text-white dark:text-primary rounded-full flex items-center justify-center hover:bg-accent dark:hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-md"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};