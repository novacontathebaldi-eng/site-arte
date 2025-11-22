import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

// Override children to strictly be ReactNode to avoid conflicts when rendering inside standard HTML tags
export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, icon, children, fullWidth, disabled, ...props }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center rounded transition-all font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none relative overflow-hidden";
    
    const variants = {
      primary: "bg-accent text-white hover:bg-[#b59328] focus:ring-accent shadow-lg hover:shadow-xl",
      secondary: "bg-primary text-white hover:bg-gray-800 dark:bg-white dark:text-primary dark:hover:bg-gray-200 focus:ring-primary shadow-md",
      tertiary: "border border-gray-300 text-primary hover:bg-gray-50 dark:border-white/20 dark:text-white dark:hover:bg-white/5",
      ghost: "text-primary hover:bg-gray-100 dark:text-white dark:hover:bg-white/5",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const sizes = {
      sm: "h-9 px-3 text-xs uppercase tracking-widest",
      md: "h-11 px-6 text-sm uppercase tracking-widest",
      lg: "h-14 px-8 text-base uppercase tracking-widest",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.98 }}
        className={cn(
            baseStyles, 
            variants[variant], 
            sizes[size], 
            fullWidth && "w-full",
            className
        )}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin absolute" />}
        <span className={cn("flex items-center gap-2", isLoading && "opacity-0")}>
            {icon && <span>{icon}</span>}
            {children}
        </span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";