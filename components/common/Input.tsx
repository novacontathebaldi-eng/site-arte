import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, className, ...props }) => {
  const baseClasses = "w-full px-3 py-2 border border-brand-black/20 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold/50 focus:border-brand-gold/50 transition-shadow bg-transparent dark:border-white/20 dark:text-brand-white dark:placeholder-white/50";
  
  return (
    <div>
      {label && <label className="block text-sm font-medium text-brand-black/80 dark:text-brand-white/80 mb-1" htmlFor={id}>{label}</label>}
      <input
        id={id}
        className={`${baseClasses} ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
