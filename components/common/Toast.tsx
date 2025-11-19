import React from 'react';
import { useToast } from '../../hooks/useToast';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const typeClasses = {
  success: 'bg-green-100 border-green-500 text-green-700',
  error: 'bg-red-100 border-red-500 text-red-700',
  info: 'bg-blue-100 border-blue-500 text-blue-700',
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onDismiss]);

  return (
    <div className={`relative w-full max-w-sm p-4 border-l-4 rounded-r-lg shadow-lg ${typeClasses[toast.type]}`} role="alert">
      <div className="flex items-center">
        <p className="font-bold">{toast.type.charAt(0).toUpperCase() + toast.type.slice(1)}</p>
      </div>
      <p className="text-sm">{toast.message}</p>
       <button onClick={() => onDismiss(toast.id)} className="absolute top-1 right-1 text-xl font-bold">&times;</button>
    </div>
  );
};


export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-5 right-5 z-[100] space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};