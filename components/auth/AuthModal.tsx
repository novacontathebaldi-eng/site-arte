
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useUIStore, useAuthStore } from '../../store';
import { useLanguage } from '../../hooks/useLanguage';
import { signInWithEmail, signUpWithEmail } from '../../lib/firebase/auth';
import { calculatePasswordStrength, cn } from '../../lib/utils';
import { registerClientToBrevo } from '../../app/actions/registerClient';
import { SuccessCheck } from '../ui/SuccessCheck';

const FloatingInput = ({ label, type, value, onChange, icon: Icon, error }: any) => (
  <div className="relative mb-6 group">
    <div className="relative flex items-center">
      <Icon size={18} className="text-gray-400 absolute left-0 transition-colors group-focus-within:text-accent" />
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent border-none outline-none py-3 pl-8 text-primary dark:text-white placeholder-transparent peer"
        placeholder={label}
        autoComplete="off"
      />
      <label 
        className={cn(
          "absolute left-8 text-gray-400 text-sm transition-all duration-300 pointer-events-none",
          "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base",
          "peer-focus:-top-3 peer-focus:text-xs peer-focus:text-accent",
          "peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-accent"
        )}
      >
        {label}
      </label>
    </div>
    
    {/* Animated Bottom Border */}
    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gray-300 dark:bg-white/20">
      <div className="absolute bottom-0 left-1/2 w-0 h-[2px] bg-accent transition-all duration-500 group-focus-within:w-full group-focus-within:left-0" />
    </div>
    
    {error && <p className="text-red-500 text-xs mt-1 absolute -bottom-5 right-0">{error}</p>}
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
    }, 150);
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
          <motion.div
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-md"
            onClick={closeAuthModal}
            {...({
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 }
            } as any)}
          />
          
          <div className="fixed inset-0 z-[90] flex items-center justify-center pointer-events-none p-4">
            <motion.div
              className="w-full max-w-md bg-white/80 dark:bg-[#1a1a1a]/90 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-2xl rounded-sm overflow-hidden pointer-events-auto relative"
              {...({
                  initial: { scale: 0.9, opacity: 0, y: 20 },
                  animate: { scale: 1, opacity: 1, y: 0 },
                  exit: { scale: 0.9, opacity: 0, y: 20 },
                  transition: { type: "spring", damping: 25, stiffness: 300 }
              } as any)}
            >
                {/* Close Button */}
                <button 
                    onClick={closeAuthModal}
                    className="absolute top-4 right-4 text-gray-400 hover:text-primary dark:hover:text-white transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {showSuccess ? (
                    <div className="p-16 flex flex-col items-center justify-center text-center">
                        <SuccessCheck size={100} className="mb-6" />
                        <motion.h3 
                            className="text-2xl font-serif text-primary dark:text-white mb-2"
                            {...({
                                initial: { opacity: 0, y: 10 },
                                animate: { opacity: 1, y: 0 },
                                transition: { delay: 0.5 }
                            } as any)}
                        >
                            Bem-vindo(a)
                        </motion.h3>
                        <motion.p 
                            className="text-sm text-gray-500 uppercase tracking-widest"
                            {...({
                                initial: { opacity: 0 },
                                animate: { opacity: 1 },
                                transition: { delay: 0.7 }
                            } as any)}
                        >
                            Sua conta foi criada com sucesso.
                        </motion.p>
                    </div>
                ) : (
                    <>
                        {/* Header Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-white/10">
                            <button 
                                onClick={() => openAuthModal('login')}
                                className={cn(
                                    "flex-1 py-6 text-sm uppercase tracking-widest font-bold transition-colors relative",
                                    authView === 'login' ? "text-accent" : "text-gray-400 hover:text-primary dark:hover:text-white"
                                )}
                            >
                                Login
                                {authView === 'login' && (
                                    <motion.div 
                                        {...({ layoutId: "authTab" } as any)}
                                        className="absolute bottom-0 left-0 w-full h-[2px] bg-accent" 
                                    />
                                )}
                            </button>
                            <button 
                                onClick={() => openAuthModal('register')}
                                className={cn(
                                    "flex-1 py-6 text-sm uppercase tracking-widest font-bold transition-colors relative",
                                    authView === 'register' ? "text-accent" : "text-gray-400 hover:text-primary dark:hover:text-white"
                                )}
                            >
                                Criar Conta
                                {authView === 'register' && (
                                    <motion.div 
                                        {...({ layoutId: "authTab" } as any)}
                                        className="absolute bottom-0 left-0 w-full h-[2px] bg-accent" 
                                    />
                                )}
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 md:p-10">
                            {/* Google Login Button */}
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full py-3 bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 rounded-sm flex items-center justify-center gap-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/20 transition-colors mb-6 group"
                            >
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                                <span className="text-gray-700 dark:text-white">Continuar com Google</span>
                            </button>

                            <div className="relative flex items-center gap-4 mb-6">
                                <div className="flex-1 h-[1px] bg-gray-200 dark:bg-white/10"></div>
                                <span className="text-xs text-gray-400 uppercase">Ou com email</span>
                                <div className="flex-1 h-[1px] bg-gray-200 dark:bg-white/10"></div>
                            </div>

                            <form onSubmit={handleSubmit}>
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
                                            <FloatingInput 
                                                label="Nome Completo"
                                                type="text"
                                                icon={User}
                                                value={name}
                                                onChange={(e: any) => setName(e.target.value)}
                                            />
                                        )}
                                        
                                        <FloatingInput 
                                            label="Email"
                                            type="email"
                                            icon={Mail}
                                            value={email}
                                            onChange={(e: any) => setEmail(e.target.value)}
                                        />
                                        
                                        <div className="mb-6">
                                            <FloatingInput 
                                                label="Senha"
                                                type="password"
                                                icon={Lock}
                                                value={password}
                                                onChange={(e: any) => setPassword(e.target.value)}
                                            />
                                            {authView === 'register' && password.length > 0 && (
                                                <div className="h-1 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden mt-2">
                                                    <div 
                                                        className={cn(
                                                            "h-full transition-all duration-500",
                                                            passwordStrength < 50 ? "bg-red-500" : passwordStrength < 100 ? "bg-yellow-500" : "bg-green-500"
                                                        )}
                                                        style={{ width: `${passwordStrength}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>

                                {error && (
                                    <motion.div 
                                        className="flex items-center gap-2 text-red-500 text-xs bg-red-500/10 p-3 rounded mb-4"
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
                                    className="w-full bg-primary dark:bg-white text-white dark:text-primary py-4 font-bold uppercase tracking-[0.2em] text-xs hover:bg-accent dark:hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-lg mt-2"
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
                            
                            {authView === 'login' && (
                                <div className="mt-6 text-center">
                                    <button className="text-xs text-gray-500 hover:text-accent transition-colors">
                                        Esqueceu sua senha?
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
