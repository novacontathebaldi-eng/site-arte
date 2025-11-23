
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useUIStore, useAuthStore } from '../../store';
import { useLanguage } from '../../hooks/useLanguage';
import { signInWithEmail, signUpWithEmail } from '../../lib/firebase/auth';
import { calculatePasswordStrength, cn } from '../../lib/utils';
import { registerClientToBrevo } from '../../app/actions/registerClient';
import { SuccessCheck } from '../ui/SuccessCheck';

// Updated Input Component for Glass Look
const GlassInput = ({ label, type, value, onChange, icon: Icon, error }: any) => (
  <div className="relative mb-4 group">
    <div className="relative flex items-center bg-white/50 dark:bg-black/40 border border-white/20 dark:border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-accent/50 focus-within:border-accent/50 transition-all shadow-inner">
      <div className="pl-4 text-gray-500 dark:text-gray-400">
        <Icon size={20} />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent border-none outline-none py-4 px-3 text-primary dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium"
        placeholder={label}
        autoComplete="off"
      />
    </div>
    {error && (
        <motion.p 
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-xs mt-1 ml-2 font-medium"
        >
            {error}
        </motion.p>
    )}
  </div>
);

export const AuthModal: React.FC = () => {
  const { isAuthOpen, closeAuthModal, authView, openAuthModal, toggleDashboard } = useUIStore();
  const { loginWithGoogle, setUser } = useAuthStore();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const onSuccess = () => {
    closeAuthModal();
    // Delay slightly to allow modal closing animation to start before dashboard enters
    setTimeout(() => {
        toggleDashboard();
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (authView === 'login') {
        const userCred = await signInWithEmail(email, password);
        if (userCred) {
             setUser({
                uid: userCred.uid,
                email: userCred.email || '',
                displayName: userCred.displayName || 'User',
                role: 'user'
             });
             onSuccess();
        }
      } else {
        // Register Logic
        const userCred = await signUpWithEmail(email, password, name);
        if (userCred) {
             setUser({
                uid: userCred.uid,
                email: userCred.email || '',
                displayName: name,
                role: 'user'
             });
             
            await registerClientToBrevo(email, name);
            
            // Show Success Animation before closing
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onSuccess();
            }, 2000);
        }
      }
    } catch (err: any) {
        console.error(err);
        let msg = 'Ocorreu um erro.';
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') msg = 'Email ou senha incorretos.';
        if (err.code === 'auth/email-already-in-use') msg = 'Este email já está em uso.';
        if (err.code === 'auth/weak-password') msg = 'A senha é muito fraca (min 6 caracteres).';
        setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
        await loginWithGoogle();
        onSuccess();
    } catch (e) {
        setError("Falha ao conectar com Google.");
    }
  };

  const passwordStrength = calculatePasswordStrength(password);

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <>
          {/* Enhanced Backdrop */}
          <motion.div
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-md"
            onClick={closeAuthModal}
            {...({
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 }
            } as any)}
          />
          
          <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              className="w-full max-w-[420px] bg-white/70 dark:bg-black/60 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-[2.5rem] overflow-hidden pointer-events-auto relative"
              {...({
                  initial: { scale: 0.9, opacity: 0, y: 30 },
                  animate: { scale: 1, opacity: 1, y: 0 },
                  exit: { scale: 0.9, opacity: 0, y: 30 },
                  transition: { type: "spring", damping: 25, stiffness: 300 }
              } as any)}
            >
                {/* Close Button */}
                <button 
                    onClick={closeAuthModal}
                    className="absolute top-6 right-6 p-2 rounded-full bg-white/20 dark:bg-black/20 text-gray-500 dark:text-gray-300 hover:bg-white/40 hover:text-primary dark:hover:text-white transition-all z-20"
                >
                    <X size={18} />
                </button>

                {showSuccess ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center min-h-[500px]">
                        <SuccessCheck size={100} className="mb-8" />
                        <motion.h3 
                            className="text-2xl font-serif text-primary dark:text-white mb-3"
                            {...({
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                transition: { delay: 0.5 }
                            } as any)}
                        >
                            Bem-vindo(a)
                        </motion.h3>
                        <motion.p 
                            className="text-sm text-gray-500 font-medium uppercase tracking-widest"
                            {...({
                                initial: { opacity: 0 },
                                animate: { opacity: 1 },
                                transition: { delay: 0.7 }
                            } as any)}
                        >
                            Conta criada com sucesso.
                        </motion.p>
                    </div>
                ) : (
                    <div className="p-8 md:p-10">
                        {/* Title Section */}
                        <div className="text-center mb-8 mt-4">
                            <h2 className="font-serif text-3xl text-primary dark:text-white mb-2">
                                Melissa Pelussi
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest font-medium">
                                Área do Cliente
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-gray-100 dark:bg-white/5 p-1 rounded-2xl mb-8 relative">
                            {/* Sliding Indicator */}
                            <motion.div 
                                className="absolute top-1 bottom-1 bg-white dark:bg-white/10 rounded-xl shadow-sm z-0"
                                layoutId="authTabBackground"
                                initial={false}
                                animate={{
                                    left: authView === 'login' ? '4px' : '50%',
                                    width: 'calc(50% - 4px)',
                                    x: authView === 'login' ? 0 : 0
                                }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                            
                            <button 
                                onClick={() => openAuthModal('login')}
                                className={cn(
                                    "flex-1 py-3 text-xs uppercase tracking-widest font-bold transition-colors relative z-10 rounded-xl",
                                    authView === 'login' ? "text-primary dark:text-white" : "text-gray-400 dark:text-gray-500"
                                )}
                            >
                                Login
                            </button>
                            <button 
                                onClick={() => openAuthModal('register')}
                                className={cn(
                                    "flex-1 py-3 text-xs uppercase tracking-widest font-bold transition-colors relative z-10 rounded-xl",
                                    authView === 'register' ? "text-primary dark:text-white" : "text-gray-400 dark:text-gray-500"
                                )}
                            >
                                Criar Conta
                            </button>
                        </div>

                        {/* Form Content */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={authView}
                                    {...({
                                        initial: { opacity: 0, x: 20 },
                                        animate: { opacity: 1, x: 0 },
                                        exit: { opacity: 0, x: -20 },
                                        transition: { duration: 0.2 }
                                    } as any)}
                                >
                                    {authView === 'register' && (
                                        <GlassInput 
                                            label="Nome Completo"
                                            type="text"
                                            icon={User}
                                            value={name}
                                            onChange={(e: any) => setName(e.target.value)}
                                        />
                                    )}
                                    
                                    <GlassInput 
                                        label="Email"
                                        type="email"
                                        icon={Mail}
                                        value={email}
                                        onChange={(e: any) => setEmail(e.target.value)}
                                    />
                                    
                                    <div className="mb-2">
                                        <GlassInput 
                                            label="Senha"
                                            type="password"
                                            icon={Lock}
                                            value={password}
                                            onChange={(e: any) => setPassword(e.target.value)}
                                        />
                                        {authView === 'register' && password.length > 0 && (
                                            <div className="h-1.5 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                                                <motion.div 
                                                    className={cn(
                                                        "h-full rounded-full",
                                                        passwordStrength < 50 ? "bg-red-500" : passwordStrength < 100 ? "bg-yellow-500" : "bg-green-500"
                                                    )}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${passwordStrength}%` }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>

                            {error && (
                                <motion.div 
                                    className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 rounded-xl border border-red-500/20"
                                    {...({
                                        initial: { opacity: 0, y: -10 },
                                        animate: { opacity: 1, y: 0 }
                                    } as any)}
                                >
                                    <AlertCircle size={14} />
                                    {error}
                                </motion.div>
                            )}

                            <button
                                disabled={isLoading}
                                className="w-full bg-accent text-white py-4 font-bold uppercase tracking-[0.2em] text-xs rounded-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-accent/20 mt-4"
                            >
                                {isLoading ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        {authView === 'login' ? 'Entrar' : 'Registrar-se'}
                                        <ArrowRight size={16} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="relative flex items-center gap-4 my-8">
                            <div className="flex-1 h-[1px] bg-gray-200 dark:bg-white/10"></div>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-medium">Ou continue com</span>
                            <div className="flex-1 h-[1px] bg-gray-200 dark:bg-white/10"></div>
                        </div>

                        {/* Google Button - Glass Style */}
                        <button
                            onClick={handleGoogleLogin}
                            className="w-full py-3.5 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-3 text-sm font-medium hover:bg-white hover:shadow-md dark:hover:bg-white/10 transition-all group"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            <span className="text-gray-700 dark:text-gray-200">Google</span>
                        </button>
                        
                        {authView === 'login' && (
                            <div className="mt-6 text-center">
                                <button className="text-xs text-gray-400 hover:text-accent transition-colors font-medium">
                                    Esqueceu sua senha?
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
