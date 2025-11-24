
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Sparkles, ThumbsUp, ThumbsDown, Copy, Minimize2, ShoppingBag, Check } from 'lucide-react';
import { useUIStore, useAuthStore } from '../store';
import { generateChatResponse, submitChatFeedback } from '../app/actions/chat';
import { ChatMessage, Product } from '../types';
import { useLanguage } from '../hooks/useLanguage';
import { formatPrice, cn } from '../lib/utils';
import { ProductModal } from './catalog/ProductModal';
import { getChatConfig } from '../app/actions/admin';
import { ChatStarter } from '../types/admin';

// --- HELPERS ---

// Safe image URL getter to prevent [object Object] 404s
const getImageUrl = (img: any) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    if (img.url) return img.url;
    if (img.src) return img.src;
    return '';
};

// Typewriter Component Optimized
// React.memo impede que ele renderize novamente se as props (text, onComplete) não mudarem
const TypewriterText = React.memo(({ text, onComplete }: { text: string, onComplete?: () => void }) => {
    const [displayedText, setDisplayedText] = useState('');
    
    useEffect(() => {
        let i = 0;
        const speed = 15; // ms per char
        setDisplayedText(''); // Reset visual state on new text

        const interval = setInterval(() => {
            // Usando substring garante que pegamos o texto correto mesmo em closures
            const nextChar = text.substring(0, i + 1);
            setDisplayedText(nextChar);
            i++;

            if (i >= text.length) {
                clearInterval(interval);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(interval);
    }, [text, onComplete]); // Dependências controladas

    return <p className="whitespace-pre-wrap">{displayedText}</p>;
});

TypewriterText.displayName = 'TypewriterText';

// --- SUB-COMPONENTS ---

const ProductCarousel = ({ products, onSelect }: { products: Product[], onSelect: (p: Product) => void }) => (
  <div className="w-full mt-3 mb-2" data-lenis-prevent>
      <div className="flex gap-3 overflow-x-auto py-2 px-1 snap-x no-scrollbar pb-4 touch-pan-x">
        {products.map((p) => {
            const img = getImageUrl(p.images[0]);
            return (
              <div 
                key={p.id} 
                className="min-w-[160px] w-[160px] bg-white dark:bg-[#252525] rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden snap-center flex-shrink-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group flex flex-col"
                onClick={() => onSelect(p)}
              >
                <div className="aspect-[4/5] relative overflow-hidden bg-gray-100">
                    {img ? (
                        <img src={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">No Image</div>
                    )}
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                        <h4 className="text-xs font-serif font-bold truncate text-primary dark:text-white mb-1">{p.translations['fr']?.title || 'Art'}</h4>
                        <p className="text-[10px] text-gray-500">{p.category}</p>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                        <p className="text-xs text-accent font-bold">{formatPrice(p.price)}</p>
                        <div className="bg-gray-100 dark:bg-white/10 p-1.5 rounded-full text-primary dark:text-white">
                            <ShoppingBag size={12} />
                        </div>
                    </div>
                </div>
              </div>
            );
        })}
      </div>
  </div>
);

const PromptChips = ({ starters, onSelect }: { starters: ChatStarter[], onSelect: (text: string) => void }) => {
    return (
        <div className="flex flex-wrap gap-2 px-1">
            {starters.sort((a,b) => a.order - b.order).map((s) => (
                <button
                    key={s.id}
                    onClick={() => onSelect(s.text)}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#252525] border border-gray-200 dark:border-white/10 text-[11px] font-medium text-primary dark:text-gray-300 hover:bg-accent hover:text-white hover:border-accent transition-all shadow-sm"
                >
                    {s.label}
                </button>
            ))}
        </div>
    );
};

export const Chatbot: React.FC = () => {
  const { isChatOpen, toggleChat } = useUIStore();
  const { user } = useAuthStore();
  const { t, language } = useLanguage();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [starters, setStarters] = useState<ChatStarter[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load Config
  useEffect(() => {
    const loadConfig = async () => {
        if (!isChatOpen) return;
        try {
            const config = await getChatConfig();
            setStarters(config.starters || []);
        } catch (e) {
            console.error("Failed to load chat config");
        }
    };
    loadConfig();
  }, [isChatOpen]);

  // Initial Welcome (Instant, no typewriter for UX on reopen)
  useEffect(() => {
    if (isChatOpen && !hasInteracted && messages.length === 0) {
        setMessages([{ 
            id: 'welcome', 
            role: 'model', 
            text: t('chat.welcome'), 
            timestamp: Date.now() 
        }]);
    }
  }, [isChatOpen, hasInteracted, t, messages.length]);

  // Scroll to bottom - MEMOIZED to prevent Typewriter re-renders
  const scrollToBottom = useCallback(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen, scrollToBottom]);

  const handleSend = async (text: string = inputValue) => {
    if (!text.trim()) return;

    setHasInteracted(true);
    setInputValue('');

    // Optimistic User UI
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

        const response = await generateChatResponse(
            text, 
            history,
            user ? { name: user.displayName, id: user.uid } : undefined
        );

        const botMsg: ChatMessage = {
            id: response.messageId || (Date.now() + 1).toString(),
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
            text: "Desculpe, tive um problema técnico. Pode repetir?",
            timestamp: Date.now()
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleFeedback = async (msg: ChatMessage, type: 'like' | 'dislike') => {
      if (!msg.id) return;

      const msgIndex = messages.findIndex(m => m.id === msg.id);
      
      // Tenta pegar a mensagem do usuário anterior. Se for a primeira (welcome), usa um placeholder.
      const userMsg = msgIndex > 0 ? messages[msgIndex - 1] : null;
      const userText = userMsg ? userMsg.text : "[Início da Conversa / Boas-vindas]";
      
      // Update UI Optimistically
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, feedback: type } : m));

      // Send to Backend
      try {
        await submitChatFeedback(msg.id, userText, msg.text, type);
      } catch (e) {
        console.error("Falha ao enviar feedback", e);
      }
  };

  const handleCopy = (text: string, id: string) => {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-8 left-8 z-[90] w-14 h-14 bg-white/80 dark:bg-black/80 backdrop-blur-md text-primary dark:text-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center border border-white/20 hover:scale-105 transition-transform group"
        onClick={toggleChat}
        {...({
            whileHover: { scale: 1.05 },
            whileTap: { scale: 0.95 }
        } as any)}
      >
        {isChatOpen ? <Minimize2 size={24} /> : <MessageCircle size={24} className="group-hover:text-accent transition-colors" />}
        {!isChatOpen && messages.length > 1 && (
             <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse border-2 border-white dark:border-black" />
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            className="fixed bottom-24 left-4 md:left-8 w-[calc(100vw-32px)] md:w-[380px] h-[650px] max-h-[80vh] bg-white/95 dark:bg-[#121212]/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 z-[90] flex flex-col overflow-hidden"
            {...({
                initial: { opacity: 0, scale: 0.9, y: 50, transformOrigin: "bottom left" },
                animate: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.9, y: 50 },
                transition: { type: "spring", stiffness: 300, damping: 30 }
            } as any)}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-black/20 backdrop-blur-md absolute top-0 w-full z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-[#b59328] rounded-full flex items-center justify-center shadow-lg">
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-serif font-bold text-sm text-primary dark:text-white leading-none mb-1">Meeh Assistant</h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">Online</span>
                        </div>
                    </div>
                </div>
                <button 
                    onClick={toggleChat} 
                    className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors group"
                >
                    <X size={16} className="text-gray-500 dark:text-gray-400 group-hover:text-red-500" />
                </button>
            </div>

            {/* Messages Area - FIXED SCROLLING */}
            <div 
                className="flex-1 overflow-y-auto p-4 pt-20 pb-4 space-y-6 bg-gray-50/50 dark:bg-black/20 scroll-smooth overscroll-contain"
                data-lenis-prevent // CRITICAL: Tells Smooth Scroll to ignore this container
            >
                {messages.map((msg, idx) => {
                    const isLast = idx === messages.length - 1;
                    // Dont type welcome message
                    const shouldType = msg.role === 'model' && isLast && !msg.products && msg.id !== 'welcome';

                    return (
                        <motion.div 
                            key={msg.id} 
                            {...({
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 }
                            } as any)}
                            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div className={cn(
                                "max-w-[85%] p-3.5 text-sm leading-relaxed shadow-sm relative group transition-all",
                                msg.role === 'user' 
                                    ? "bg-primary dark:bg-white text-white dark:text-black rounded-2xl rounded-tr-sm" 
                                    : "bg-white dark:bg-[#1e1e1e] text-gray-800 dark:text-gray-200 rounded-2xl rounded-tl-sm border border-gray-100 dark:border-white/5"
                            )}>
                                {shouldType ? (
                                    <TypewriterText text={msg.text} onComplete={scrollToBottom} />
                                ) : (
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                )}
                            </div>

                            {/* Bot Actions Row (Outside Bubble) */}
                            {msg.role === 'model' && (
                                <div className="flex items-center gap-3 mt-1 ml-2 select-none">
                                    <span className="text-[10px] text-gray-400">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    
                                    {/* Actions - Always visible now, but subtle */}
                                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-full transition-all border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                                        <button 
                                            onClick={() => handleCopy(msg.text, msg.id)}
                                            className="text-gray-400 hover:text-accent transition-colors"
                                            title="Copiar mensagem"
                                        >
                                            {copiedId === msg.id ? <Check size={12} className="text-green-500" /> : <Copy size={12}/>}
                                        </button>
                                        <div className="w-px h-3 bg-gray-300 dark:bg-white/10" />
                                        <button 
                                            onClick={() => handleFeedback(msg, 'like')}
                                            className={cn("transition-colors", msg.feedback === 'like' ? "text-green-500" : "text-gray-400 hover:text-green-500")}
                                            title="Gostei"
                                        >
                                            <ThumbsUp size={12}/>
                                        </button>
                                        <button 
                                            onClick={() => handleFeedback(msg, 'dislike')}
                                            className={cn("transition-colors", msg.feedback === 'dislike' ? "text-red-500" : "text-gray-400 hover:text-red-500")}
                                            title="Não gostei"
                                        >
                                            <ThumbsDown size={12}/>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* User Timestamp */}
                            {msg.role === 'user' && (
                                <span className="text-[10px] text-gray-400 mt-1 mr-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            )}

                            {/* Product Carousel */}
                            {msg.products && msg.products.length > 0 && (
                                <ProductCarousel products={msg.products} onSelect={setSelectedProduct} />
                            )}
                        </motion.div>
                    );
                })}
                
                {isLoading && (
                    <div className="flex justify-start">
                         <div className="bg-white dark:bg-[#1e1e1e] px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-white/5 flex gap-1.5 items-center">
                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-75" />
                            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce delay-150" />
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-[#121212] border-t border-gray-100 dark:border-white/5 relative z-20">
                {/* Dynamic Prompt Starters */}
                {!isLoading && messages.length < 3 && starters.length > 0 && (
                    <div className="mb-3">
                         <PromptChips starters={starters} onSelect={handleSend} />
                    </div>
                )}

                <div className="relative flex items-center shadow-sm rounded-full bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-all">
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={t('chat.placeholder')}
                        className="w-full bg-transparent border-none pl-5 pr-12 py-3.5 text-sm focus:ring-0 outline-none placeholder-gray-400"
                    />
                    <button 
                        onClick={() => handleSend()}
                        disabled={isLoading || !inputValue.trim()}
                        className="absolute right-2 p-2 bg-accent text-white rounded-full hover:brightness-110 disabled:opacity-50 disabled:bg-gray-300 dark:disabled:bg-white/10 transition-all shadow-md active:scale-95"
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
