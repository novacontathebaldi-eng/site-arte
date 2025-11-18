import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
// FIX: Imported the TypingIndicator component to resolve reference error.
import { CloseIcon, GoogleIcon, EyeIcon, EyeOffIcon, TypingIndicator } from './icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signUp, logIn, signInWithGoogle } = useAuth();
  const { t } = useI18n();
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (e) {
      setError(t('auth.error.generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLoginView) {
        await logIn(email, password);
      } else {
        await signUp(name, email, password);
      }
      onClose();
    } catch (e) {
      // FIX: Removed FirebaseError as it's no longer exported in recent Firebase versions. Type error as object with code property.
      const error = e as { code: string };
      if (error.code === 'auth/email-already-in-use') {
        setError(t('auth.error.emailInUse'));
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setError(t('auth.error.invalidCredentials'));
      } else {
        setError(t('auth.error.generic'));
      }
    } finally {
      setLoading(false);
    }
  };
  
  const getPasswordStrength = () => {
      if (password.length === 0) return null;
      if (password.length < 6) return { label: t('auth.passwordStrength.weak'), color: 'bg-red-500', width: 'w-1/3' };
      if (password.length < 10) return { label: t('auth.passwordStrength.medium'), color: 'bg-yellow-500', width: 'w-2/3' };
      return { label: t('auth.passwordStrength.strong'), color: 'bg-green-500', width: 'w-full' };
  };

  const strength = getPasswordStrength();


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in-fast">
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-md relative animate-scale-in"
        role="dialog"
        aria-modal="true"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <CloseIcon />
        </button>
        <div className="p-8">
          <h2 className="text-3xl font-serif text-center mb-6">
            {isLoginView ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h2>

          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="name">{t('auth.nameLabel')}</label>
                <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="email">{t('auth.emailLabel')}</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="password">{t('auth.passwordLabel')}</label>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm" />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
               {!isLoginView && strength && (
                <div className="mt-2">
                    <div className="h-2 w-full bg-gray-200 rounded">
                        <div className={`h-2 rounded ${strength.color} ${strength.width} transition-all`}></div>
                    </div>
                    <p className={`text-xs mt-1 ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</p>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
              {loading ? <TypingIndicator /> : (isLoginView ? t('auth.loginButton') : t('auth.registerButton'))}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('auth.or')}</span>
              </div>
            </div>

            <div className="mt-6">
              <button onClick={handleGoogleSignIn} disabled={loading} className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50">
                <GoogleIcon />
                <span className="ml-3">{t('auth.loginWithGoogle')}</span>
              </button>
            </div>
          </div>
          
           <div className="mt-6 text-center text-sm">
             <button onClick={() => { setIsLoginView(!isLoginView); setError('')}} className="font-medium text-secondary hover:text-secondary/80">
                {isLoginView ? t('auth.switchToRegister') : t('auth.switchToLogin')}
             </button>
           </div>

        </div>
      </div>
      <style>{`
          @keyframes fade-in-fast { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in-fast { animation: fade-in-fast 0.2s ease-out; }
          @keyframes scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
          .animate-scale-in { animation: scale-in 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default AuthModal;