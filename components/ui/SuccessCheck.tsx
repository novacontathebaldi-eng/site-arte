
import React from 'react';
import { motion } from 'framer-motion';

interface SuccessCheckProps {
  size?: number;
  className?: string;
  delay?: number;
}

export const SuccessCheck: React.FC<SuccessCheckProps> = ({ size = 80, className, delay = 0 }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} // Scale 0.9 para ser "leve" e elegante, não um "pop" cartunesco
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
            duration: 0.6, 
            ease: "easeOut",
            delay: delay 
        }}
      >
        <motion.svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className="overflow-visible"
        >
            {/* Circle Ring */}
            <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#D4AF37" // Luxury Gold
            strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0, rotate: -90 }}
            animate={{ pathLength: 1, opacity: 1, rotate: 0 }}
            transition={{ 
                duration: 0.8, 
                ease: "easeInOut",
                delay: delay + 0.1 
            }}
            />
            
            {/* Checkmark */}
            <motion.path
            d="M32 52 L46 66 L68 36"
            fill="none"
            stroke="#D4AF37" // Luxury Gold
            strokeWidth="2" // Traço fino
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ 
                duration: 0.8, 
                ease: "easeOut", 
                delay: delay + 0.5 // Sincronia perfeita com o círculo
            }}
            />
        </motion.svg>
      </motion.div>
    </div>
  );
};
