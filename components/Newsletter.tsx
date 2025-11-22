import React, { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { subscribeToNewsletter } from '../app/actions/newsletter';

// Componente de Partículas (Confete Minimalista)
const SuccessParticles = () => {
  const particles = Array.from({ length: 20 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-accent rounded-full"
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
            scale: 0,
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
};

const InputField: React.FC<{
  name: string;
  type: string;
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
}> = ({ name, type, placeholder, required, disabled }) => {
  return (
    <div className="relative group w-full">
      <input
        name={name}
        type={type}
        required={required}
        disabled={disabled}
        placeholder=" "
        className="peer w-full bg-transparent border-b border-gray-300 dark:border-white/20 py-4 text-2xl md:text-4xl font-serif text-primary dark:text-white focus:outline-none focus:border-transparent transition-all placeholder-transparent"
      />
      <label
        className="absolute left-0 top-4 text-xl md:text-2xl text-gray-400 dark:text-gray-500 transition-all duration-300 peer-focus:-top-4 peer-focus:text-xs peer-focus:text-accent peer-focus:font-bold peer-focus:tracking-widest peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-accent uppercase tracking-normal cursor-text"
      >
        {placeholder}
      </label>
      
      {/* Animated Line */}
      <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent transition-all duration-500 peer-focus:w-full peer-focus:h-[2px]" />
    </div>
  );
};

export const Newsletter: React.FC = () => {
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<{ success: boolean; message?: string } | null>(null);
  const [userName, setUserName] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    setUserName(name);

    startTransition(async () => {
      const result = await subscribeToNewsletter({ success: false }, formData);
      setState(result);
      if (result.success) {
        // Reset após 5 segundos para permitir nova interação se necessário
        setTimeout(() => setState(null), 10000);
      }
    });
  };

  return (
    <section className="relative py-32 md:py-48 bg-light dark:bg-black overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <AnimatePresence mode="wait">
          {state?.success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[400px] flex flex-col items-center justify-center text-center relative"
            >
              <SuccessParticles />
              <motion.h3 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-serif text-4xl md:text-6xl text-primary dark:text-white mb-4"
              >
                {t('newsletter.success.title')} <span className="text-accent italic">{userName}</span>.
              </motion.h3>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-500 uppercase tracking-widest text-sm"
              >
                {t('newsletter.success.msg')}
              </motion.p>
            </motion.div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {/* Header Text */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mb-16 md:mb-24"
              >
                <span className="block text-accent text-xs font-bold uppercase tracking-[0.3em] mb-4">
                  {t('newsletter.section_label')}
                </span>
                <h2 className="font-serif text-4xl md:text-6xl text-primary dark:text-white leading-tight mb-6">
                  {t('newsletter.title')}.
                </h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed text-lg">
                  {t('newsletter.desc')}
                </p>
              </motion.div>

              {/* Form */}
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 }}
                className="space-y-12 md:space-y-16"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
                  <InputField 
                    name="name" 
                    type="text" 
                    placeholder={t('newsletter.input.name')} 
                    required 
                    disabled={isPending}
                  />
                  <InputField 
                    name="email" 
                    type="email" 
                    placeholder={t('newsletter.input.email')} 
                    required 
                    disabled={isPending}
                  />
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-12">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider order-2 md:order-1">
                    {t('newsletter.disclaimer')}
                  </p>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isPending}
                    className="group relative order-1 md:order-2 px-8 py-4 bg-primary dark:bg-white text-white dark:text-black font-bold uppercase tracking-[0.2em] text-xs rounded-sm overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center gap-4">
                      {isPending ? t('newsletter.sending') : t('newsletter.button')}
                      {isPending ? <Loader2 className="animate-spin" size={16} /> : <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                    </span>
                    <div className="absolute inset-0 bg-accent transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0" />
                  </motion.button>
                </div>
                
                {state?.success === false && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs uppercase tracking-wider mt-4"
                  >
                    {state.message || t('newsletter.error')}
                  </motion.p>
                )}
              </motion.form>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};