
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
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="overflow-visible"
        {...({
            initial: "hidden",
            animate: "visible"
        } as any)}
      >
        {/* Circle Ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#D4AF37" // Accent Gold
          strokeWidth="1.5"
          {...({
              variants: {
                hidden: { pathLength: 0, opacity: 0, rotate: -90 },
                visible: { 
                  pathLength: 1, 
                  opacity: 1, 
                  rotate: 0,
                  transition: { duration: 1, ease: [0.22, 1, 0.36, 1], delay: delay } 
                }
              }
          } as any)}
        />
        
        {/* Checkmark */}
        <motion.path
          d="M32 52 L46 66 L68 36"
          fill="none"
          stroke="#D4AF37" // Accent Gold
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          {...({
              variants: {
                hidden: { pathLength: 0, opacity: 0 },
                visible: { 
                  pathLength: 1, 
                  opacity: 1, 
                  transition: { duration: 0.6, ease: "easeOut", delay: delay + 0.4 } 
                }
              }
          } as any)}
        />
      </motion.svg>
    </div>
  );
};
