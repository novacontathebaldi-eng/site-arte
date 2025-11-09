import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';

// Hook customizado para facilitar o uso do sistema de notificações.
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
