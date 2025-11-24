
import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react';
import { cn } from '../../lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* 
         POSICIONAMENTO: Topo Centralizado (App-like feel) 
         Z-INDEX: 200 para garantir que fique acima do Dashboard (z-100)
      */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 w-full max-w-sm px-4 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              className={cn(
                "pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-xl",
                // Luxury Styles: Glassmorphism refinado
                t.type === 'success' && "bg-white/90 dark:bg-[#1a1a1a]/90 border-green-500/30 text-green-700 dark:text-green-400 shadow-green-500/10",
                t.type === 'error' && "bg-white/90 dark:bg-[#1a1a1a]/90 border-red-500/30 text-red-700 dark:text-red-400 shadow-red-500/10",
                t.type === 'info' && "bg-white/90 dark:bg-[#1a1a1a]/90 border-accent/30 text-primary dark:text-accent shadow-accent/10"
              )}
              {...({
                  initial: { opacity: 0, y: -20, scale: 0.9 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
                  transition: { type: "spring", stiffness: 400, damping: 25 }
              } as any)}
            >
              <div className={cn(
                  "p-2 rounded-full",
                  t.type === 'success' ? "bg-green-100 dark:bg-green-500/20" : 
                  t.type === 'error' ? "bg-red-100 dark:bg-red-500/20" : 
                  "bg-gray-100 dark:bg-accent/20"
              )}>
                  {t.type === 'success' && <CheckCircle size={18} />}
                  {t.type === 'error' && <AlertCircle size={18} />}
                  {t.type === 'info' && <Info size={18} />}
              </div>
              
              <p className="text-sm font-semibold flex-1 text-primary dark:text-white tracking-wide">
                  {t.message}
              </p>
              
              <button 
                onClick={() => removeToast(t.id)} 
                className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-60 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
