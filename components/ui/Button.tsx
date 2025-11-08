import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className, ...props }) => {
  const baseClasses = 'h-12 w-full flex justify-center items-center px-4 border rounded-md shadow-sm text-base font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'border-transparent text-white bg-primary hover:bg-primary/90 focus:ring-primary',
    secondary: 'border-gray-300 text-text-primary bg-white hover:bg-gray-50 focus:ring-secondary',
  };

  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;