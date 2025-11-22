
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Check } from 'lucide-react';
import { subscribeToNewsletter } from '../../actions/newsletter';

export const Newsletter: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);

    try {
      // Chamada direta da Server Action
      const result = await subscribeToNewsletter(null, formData);
      
      if (result.success) {
        setIsSuccess(true);
        setSuccessMessage(result.message || "Welcome.");
        setName('');
        setEmail('');
      } else {
        setErrorMessage(result.message || "Something went wrong.");
      }
    } catch (err) {
      setErrorMessage("Connection error.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full bg-transparent border-b border-gray-300 dark:border-white/20 py-4 text-xl md:text-2xl font-serif text-primary dark:text-white placeholder:text-gray-300 dark:placeholder:text-white/20 outline-none transition-all focus:border-accent";

  return (
    <section className="py-32 bg-light dark:bg-black relative overflow-hidden">
        {/* Background subtle decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

        <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-4xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-16 text-center md:text-left"
                >
                    <h2 className="font-serif text-4xl md:text-6xl text-primary dark:text-white mb-4">
                        The Collector's Circle
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg font-light tracking-wide">
                        Exclusive access to new releases, private viewings, and the artist's journey.
                    </p>
                </motion.div>

                <div className="min-h-[200px]">
                    <AnimatePresence mode="wait">
                        {isSuccess ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-10 text-center border border-accent/20 bg-accent/5 rounded-lg"
                            >
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                                    className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center mb-6 shadow-lg"
                                >
                                    <Check size={32} />
                                </motion.div>
                                <h3 className="font-serif text-3xl text-primary dark:text-white mb-2">
                                    Merci.
                                </h3>
                                <p className="text-accent uppercase tracking-widest text-sm">
                                    {successMessage}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.form
                                key="form"
                                onSubmit={handleSubmit}
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-end"
                            >
                                <div className="md:col-span-5 group relative">
                                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-accent transition-colors">
                                        Your Name
                                    </label>
                                    <input 
                                        type="text" 
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Jean-Michel" 
                                        className={inputClasses}
                                    />
                                    <motion.div 
                                        className="absolute bottom-0 left-0 h-[1px] bg-accent w-0 group-focus-within:w-full transition-all duration-700 ease-out"
                                    />
                                </div>

                                <div className="md:col-span-5 group relative">
                                    <label className="block text-xs uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-accent transition-colors">
                                        Your Email
                                    </label>
                                    <input 
                                        type="email" 
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="art@collector.com" 
                                        className={inputClasses}
                                    />
                                    <motion.div 
                                        className="absolute bottom-0 left-0 h-[1px] bg-accent w-0 group-focus-within:w-full transition-all duration-700 ease-out"
                                    />
                                </div>

                                <div className="md:col-span-2 pb-2">
                                    <motion.button
                                        type="submit"
                                        disabled={isLoading}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-16 h-16 rounded-full bg-primary dark:bg-white text-white dark:text-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:bg-accent dark:hover:bg-gray-200 transition-colors ml-auto"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <ArrowRight size={24} />
                                        )}
                                    </motion.button>
                                </div>
                            </motion.form>
                        )}
                    </AnimatePresence>
                    
                    {errorMessage && (
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 text-red-500 text-sm uppercase tracking-wide"
                        >
                            {errorMessage}
                        </motion.p>
                    )}
                </div>
            </div>
        </div>
    </section>
  );
};
