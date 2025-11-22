import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
             {/* Overlay */}
             <Dialog.Overlay asChild>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" 
                />
             </Dialog.Overlay>
            
            {/* Content */}
            <Dialog.Content asChild>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className={cn(
                            "pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-lg bg-white p-6 shadow-2xl dark:bg-[#1a1a1a] dark:border dark:border-white/10 focus:outline-none",
                            className
                        )}
                    >
                        <div className="flex items-center justify-between mb-6">
                            {title && (
                                <Dialog.Title className="text-lg font-serif font-bold text-primary dark:text-white">
                                    {title}
                                </Dialog.Title>
                            )}
                            <Dialog.Close asChild>
                                <button
                                    className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                                    aria-label="Close"
                                >
                                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </Dialog.Close>
                        </div>
                        
                        <div className="text-primary dark:text-gray-200">
                            {children}
                        </div>
                    </motion.div>
                </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
};