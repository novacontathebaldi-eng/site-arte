
import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatIcon, BotIcon, CloseIcon, SendIcon, TypingIndicator } from './icons';
import { useI18n } from '../hooks/useI18n';
import { useAuth } from '../hooks/useAuth';

const Chatbot: React.FC = () => {
  const { t, language } = useI18n();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize with a greeting message whenever the component mounts or language changes.
    setMessages([
        {
          role: 'assistant',
          content: t('chatbot.greeting'),
          timestamp: new Date(),
        },
    ]);
  }, [t]);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);
  
  const processMessage = async (messageText: string, currentMessages: Message[]) => {
      if (!messageText.trim()) return;
  
      const userMessage: Message = {
        role: 'user',
        content: messageText,
        timestamp: new Date(),
      };
  
      const newMessages = [...currentMessages, userMessage];
      setMessages(newMessages);
      setInput('');
      setIsTyping(true);
  
      try {
        const botResponse = await sendMessageToGemini(messageText, newMessages, user, language);
        const botMessage: Message = {
          role: 'assistant',
          content: botResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } catch (error) {
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
  };

  const handleSendMessage = () => {
    processMessage(input, messages);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    processMessage(suggestion, messages);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9998] w-16 h-16 bg-primary rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        aria-label="Open chatbot"
      >
        <ChatIcon />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[9999] w-[90vw] max-w-md h-[70vh] max-h-[600px] bg-white rounded-lg shadow-2xl flex flex-col font-sans animate-fade-in-up">
          <header className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-3">
              <BotIcon className="w-6 h-6" />
              <span className="font-semibold text-lg">Melissa Pelussi Assistant</span>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat">
              <CloseIcon className="w-6 h-6 hover:opacity-80" />
            </button>
          </header>

          <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center"><BotIcon className="w-5 h-5 text-white" /></div>}
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-secondary text-primary rounded-br-none'
                      : 'bg-white text-base-text rounded-bl-none'
                  }`}
                >
                  <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }}></p>
                  <span className={`text-xs block mt-1 ${msg.role === 'user' ? 'text-primary/70 text-right' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start gap-3">
                 <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center"><BotIcon className="w-5 h-5 text-white" /></div>
                <div className="bg-white px-4 py-3 rounded-lg rounded-bl-none shadow-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}
             {messages.length <= 1 && (
                <div className="text-center text-gray-500 pt-4">
                  <div className="mt-2 space-x-2 space-y-2">
                    <button onClick={() => handleSuggestionClick(t('chatbot.suggestion.artworks'))} className="text-xs border border-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">{t('chatbot.suggestion.artworks')}</button>
                    <button onClick={() => handleSuggestionClick(t('chatbot.suggestion.shipping'))} className="text-xs border border-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">{t('chatbot.suggestion.shipping')}</button>
                    {user && <button onClick={() => handleSuggestionClick(t('chatbot.suggestion.track'))} className="text-xs border border-gray-300 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">{t('chatbot.suggestion.track')}</button>}
                  </div>
                </div>
              )}
            <div ref={messagesEndRef} />
          </main>

          <footer className="border-t bg-white p-4">
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={t('chatbot.placeholder')}
                className="flex-1 border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-secondary/50"
                rows={1}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="bg-primary text-white w-10 h-10 flex items-center justify-center rounded-lg hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </div>
          </footer>
        </div>
      )}
      {/* FIX: Replaced non-standard <style jsx> with a standard <style> tag. */}
      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(1rem);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Chatbot;
