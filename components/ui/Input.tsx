import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  // O label foi removido para ser controlado pela página/componente pai,
  // permitindo maior flexibilidade no layout do formulário.
}

const Input: React.FC<InputProps> = ({ id, className, ...props }) => {
  // Classes base alinhadas com as especificações de design:
  // h-12, px-4, text-base, bordas e foco aprimorados, transição suave.
  const baseClasses = "appearance-none block w-full px-4 h-12 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary text-base transition-colors duration-200";
  
  return (
    <input
      id={id}
      {...props}
      // Combina as classes base com quaisquer classes personalizadas passadas via props.
      className={`${baseClasses} ${className}`}
    />
  );
};

export default Input;