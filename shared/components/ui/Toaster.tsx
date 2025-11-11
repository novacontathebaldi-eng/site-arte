import React from 'react';
import { useToast } from 'shared/hooks/useToast';
import { ToastType } from 'shared/types';

// Ícones para cada tipo de notificação.
const icons: Record<ToastType, React.ReactNode> = {
  success: (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
  ),
  error: (
     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
  ),
  info: (
     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
  ),
};

const bgColors: Record<ToastType, string> = {
    success: 'bg-accent',
    error: 'bg-red-500',
    info: 'bg-primary',
}

// Este componente é o "container" que exibe as notificações na tela.
const Toaster: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-xs space-y-3">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${bgColors[toast.type]} text-white p-4 rounded-lg shadow-lg flex items-start space-x-3 animate-fade-in-right`}
        >
          <div className="flex-shrink-0">{icons[toast.type]}</div>
          <div className="flex-1">
            <p className="text-sm font-semibold">{toast.message}</p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="flex-shrink-0">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toaster;
