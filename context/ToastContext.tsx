import React, { createContext, useState, useCallback } from 'react';
import { Toast, ToastType } from '../types';

// Este arquivo cria um sistema para exibir pequenas notificações (toasts)
// na tela, como "Item adicionado ao carrinho!".

// 1. Define o que o nosso Contexto vai fornecer.
interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

// 2. O Provedor do Contexto.
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Função para remover uma notificação.
  const removeToast = useCallback((id: number) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  // Função para mostrar uma nova notificação.
  // useCallback é uma otimização para garantir que esta função não seja recriada a cada renderização.
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(currentToasts => [...currentToasts, { id, message, type }]);

    // A notificação desaparecerá automaticamente após 5 segundos.
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);
  
  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};
