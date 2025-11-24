import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles, ThumbsUp, ThumbsDown, Copy, Minimize2 } from 'lucide-react';
import { useUIStore } from '../store';
import { generateChatResponse, submitChatFeedback } from '../app/actions/chat';
import { ChatMessage, Product } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { useCart } from '../hooks/useCart';
import { formatPrice, cn } from '../lib/utils';
import { ProductModal } from './catalog/ProductModal';
import { getChatConfig } from '../app/actions/admin';
import { ChatStarter } from '../types/admin';

// --- SUB-COMPONENTS ---

const ProductCarousel = ({ products, onSelect }: { products: Product[], onSelect: (p: Product) => void }) => (
  <div className="flex gap-3 overflow-x-auto py-3 px-1 snap-x no-scrollbar">
    {products.map((p) => (
      <div 
        key={p.id} 
        className="min-w-[140px] w-[140px] bg-white dark:bg-[#252525] rounded-lg border border-gray-200 dark:border-white/10 overflow-hidden snap-center flex-shrink-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
        onClick={() => onSelect(p)}
      >
        <div className="aspect-square relative overflow-hidden">
            <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
        </div>
        <div className="p-2">
            <h4 className="text-xs font-serif font-bold truncate text-primary dark:text-white">{p.translations['fr']?.title || 'Art'}</h4>
            <p className="text-[10px] text-accent font-medium">{formatPrice(p.price)}</p>
        </div>
        <button className="w-full py-1.5 bg-gray-100 dark:bg-white/5 text-[10px] font-bold uppercase hover:bg-accent hover:text-white transition-colors">
            Ver Obra
        </button>
      </div>
    ))}
  </div>
);

const PromptChips = ({ starters, onSelect }: { starters: ChatStarter[], onSelect: (text: string) => void }) => {
    return (
        <div className="flex gap-2 overflow-x-auto py-2 px-4 no-scrollbar">
            {starters.sort((a,b) => a.order - b.order).map((s) => (
                <button
                    key={s.id}
                    onClick={() => onSelect(s.text)}
                    className="whitespace-nowrap px-4 py-2 rounded-full bg-white dark:bg-[#252525] border border-gray-200 dark:border-white/10 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-accent hover:text-white hover:border-accent transition-all shadow-sm"
                >
                    {s.label}
                </button>
            ))}
        </div>
    );
};

export const Chatbot: React.FC = () => {
  const { isChatOpen, toggleChat } = useUIStore();
  const { t, language } = useLanguage();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [starters, setStarters] = useState<ChatStarter[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load Config (Starters)
  useEffect(() => {
    const loadConfig = async () => {
        try {
            const config = await getChatConfig();
            setStarters(config.starters || []);
        } catch (e) {
            console.error("Failed to load chat config");
        }
    };
    if (isChatOpen) loadConfig();
  }, [isChatOpen]);

  // Initial Welcome
  useEffect(() => {
    if (!hasInteracted && messages.length === 0) {
        setMessages([{ 
            id: 'welcome', 
            role: 'model', 
            text: t('chat.welcome'), 
            timestamp: Date.now() 
        }]);
    }
  }, [language, hasInteracted, t, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    if (isChatOpen) {
        setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [messages, isChatOpen]);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;

    setHasInteracted(true);
    setInputValue('');

    const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        text: text,
        timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const response = await generateChatResponse(text, history);

        const botMsg: ChatMessage = {
            id: response.messageId || (Date.now() + 1).toString(), // Capture server log ID
            role: 'model',
            text: response.text,
            products: response.products,
            timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMsg]);

    } catch (error) {
        console.error(error);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'model',
            text: "Ocorreu um erro ao conectar com o assistente. Tente novamente.",
            timestamp: Date.now()
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleFeedback = async (msg: ChatMessage, type: 'like' | 'dislike') => {
      // Find the user message before this bot message
      const msgIndex = messages.findIndex(m => m.id === msg.id);
      const userMsg = messages[msgIndex - 1];
      
      // Update UI state
      setMessages(prev => prev.map(m => 
          m.id === msg.id ? { ...m, feedback: type } : m
      ));

      // Send to server
      if (userMsg && msg.id) {
          await submitChatFeedback(msg.id, userMsg.text, msg.text, type);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <>
      {/* Floating Button (Bottom Left) */}
      <motion.button
        className="fixed bottom-8 left-8 z-[90] w-14 h-14 bg-white dark:bg-[#1a1a1a] text-primary dark:text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center border border-white/20 hover:scale-105 transition-transform group"
        onClick={toggleChat}
        {...({
            initial: { scale: 0 },
            animate: { scale: 1 },
            whileTap: { scale: 0.9 }
        } as any)}
      >
        {isChatOpen ? <Minimize2 size={24} /> : <MessageCircle size={24} className="group-hover:text-accent transition-colors" />}
        {!isChatOpen && messages.length > 1 && (
             <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </motion.button>

      {/* Pop-over Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="fixed bottom-24 left-4 md:left-8 w-[calc(100vw-32px)] md:w-[380px] h-[600px] max-h-[80vh] bg-white/90 dark:bg-[#1a1a1a]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-white/10 z-[90] flex flex-col overflow-hidden"
            {...({
                initial: { opacity: 0, scale: 0.9, y: 20, transformOrigin: "bottom left" },
                animate: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.9, y: 20 }
            } as any)}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-[#b59328] rounded-full flex items-center justify-center shadow-lg">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-serif font-bold text-sm text-primary dark:text-white">Meeh Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] text-gray-500 font-medium tracking-wide">Online</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={toggleChat} 
                    className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                    <X size={18} className="text-gray-500" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 dark:bg-black/20">
                {messages.map((msg) => (
                    <motion.div 
                        key={msg.id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                        {/* Bubble */}
                        <div className={cn(
                            "max-w-[85%] p-3.5 text-sm leading-relaxed shadow-sm relative group",
                            msg.role === 'user' 
                                ? "bg-primary dark:bg-white text-white dark:text-black rounded-2xl rounded-tr-sm" 
                                : "bg-white dark:bg-[#252525] text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-white/5"
                        )}>
                            {msg.text}

                            {/* Interactions Footer (Only for bot) */}
                            {msg.role === 'model' && (
                                <div className={cn(
                                    "absolute -bottom-6 left-0 flex gap-2 pt-1 px-1 transition-opacity",
                                    msg.feedback ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                )}>
                                    <button 
                                        onClick={() => handleFeedback(msg, 'like')}
                                        className={cn("transition-colors", msg.feedback === 'like' ? "text-green-500" : "text-gray-400 hover:text-green-500")}
                                        title="Útil"
                                    >
                                        <ThumbsUp size={12}/>
                                    </button>
                                    <button 
                                        onClick={() => handleFeedback(msg, 'dislike')}
                                        className={cn("transition-colors", msg.feedback === 'dislike' ? "text-red-500" : "text-gray-400 hover:text-red-500")}
                                        title="Não útil"
                                    >
                                        <ThumbsDown size={12}/>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Product Carousel */}
                        {msg.products && msg.products.length > 0 && (
                            <div className="w-full mt-2 ml-1">
                                <ProductCarousel products={msg.products} onSelect={setSelectedProduct} />
                            </div>
                        )}
                        
                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </motion.div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="bg-white dark:bg-[#252525] p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center border border-gray-100 dark:border-white/5">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-100" />
                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-200" />
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-[#1a1a1a] border-t border-gray-100 dark:border-white/5">
                {/* Dynamic Prompt Starters */}
                {!isLoading && messages.length < 3 && starters.length > 0 && (
                    <div className="mb-3">
                         <PromptChips starters={starters} onSelect={handleSend} />
                    </div>
                )}

                <div className="relative flex items-center">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('chat.placeholder')}
                        className="w-full bg-gray-100 dark:bg-black/40 border border-transparent focus:border-accent rounded-full pl-5 pr-12 py-3.5 text-sm focus:ring-0 outline-none transition-all placeholder-gray-400"
                    />
                    <button 
                        onClick={() => handleSend()}
                        disabled={isLoading || !inputValue.trim()}
                        className="absolute right-2 p-2 bg-accent text-white rounded-full hover:brightness-110 disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-white/10 transition-all shadow-md"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProductModal 
        product={selectedProduct} 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
      />
    </>
  );
};
