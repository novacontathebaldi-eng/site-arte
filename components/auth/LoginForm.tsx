import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import GoogleIcon from '../icons/GoogleIcon';

interface LoginFormProps {
  onSignupLinkClick: () => void;
  onForgotPasswordClick: () => void;
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSignupLinkClick, onForgotPasswordClick, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await loginWithEmail(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">{t('auth.loginTitle')}</h2>
      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="email">{t('auth.email')}</label>
          <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500" />
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-baseline">
            <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="password">{t('auth.password')}</label>
            <button type="button" onClick={onForgotPasswordClick} className="text-sm text-stone-600 hover:underline">{t('auth.forgotPassword')}</button>
          </div>
          <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500" />
        </div>
        <button type="submit" className="w-full bg-stone-800 text-white py-2 rounded-md hover:bg-stone-900 transition-colors">{t('auth.loginButton')}</button>
      </form>
      <div className="flex items-center my-6">
          <div className="flex-grow border-t border-stone-300"></div>
          <span className="flex-shrink mx-4 text-stone-500 text-sm">{t('auth.orContinueWith')}</span>
          <div className="flex-grow border-t border-stone-300"></div>
      </div>
      <button onClick={handleGoogleLogin} className="w-full flex justify-center items-center gap-2 border border-stone-300 py-2 rounded-md hover:bg-stone-100 transition-colors">
          <GoogleIcon className="w-5 h-5" />
          Google
      </button>
      <p className="mt-6 text-center text-sm">
        {t('auth.dontHaveAccount')} <button onClick={onSignupLinkClick} className="font-semibold text-stone-700 hover:underline">{t('auth.createOne')}</button>
      </p>
    </div>
  );
};

export default LoginForm;
