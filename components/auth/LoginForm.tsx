import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import GoogleIcon from '../icons/GoogleIcon';
import Button from '../common/Button';
import Input from '../common/Input';

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input type="email" id="email" label={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} required />
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <label className="block text-sm font-medium text-brand-black/80 dark:text-brand-white/80" htmlFor="password">{t('auth.password')}</label>
                <button type="button" onClick={onForgotPasswordClick} className="text-sm text-brand-black/70 dark:text-brand-white/70 hover:underline">{t('auth.forgotPassword')}</button>
            </div>
            <Input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" variant="primary" className="w-full">{t('auth.loginButton')}</Button>
      </form>
      <div className="flex items-center my-6">
          <div className="flex-grow border-t border-black/10 dark:border-white/10"></div>
          <span className="flex-shrink mx-4 text-brand-black/50 dark:text-brand-white/50 text-sm">{t('auth.orContinueWith')}</span>
          <div className="flex-grow border-t border-black/10 dark:border-white/10"></div>
      </div>
      <Button onClick={handleGoogleLogin} variant="tertiary" className="w-full">
          <GoogleIcon className="w-5 h-5" />
          Google
      </Button>
      <p className="mt-6 text-center text-sm">
        {t('auth.dontHaveAccount')} <button onClick={onSignupLinkClick} className="font-semibold text-brand-black dark:text-brand-white hover:underline">{t('auth.createOne')}</button>
      </p>
    </div>
  );
};

export default LoginForm;
