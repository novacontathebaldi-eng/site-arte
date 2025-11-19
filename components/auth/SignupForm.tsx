import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';

interface SignupFormProps {
  onLoginLinkClick: () => void;
  onSuccess: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onLoginLinkClick, onSuccess }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { signupWithEmail } = useAuth();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError('');
    try {
      await signupWithEmail(displayName, email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">{t('auth.signupTitle')}</h2>
      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="displayName">{t('auth.displayName')}</label>
          <input type="text" id="displayName" value={displayName} onChange={e => setDisplayName(e.target.value)} required className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="email-signup">{t('auth.email')}</label>
          <input type="email" id="email-signup" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="password-signup">{t('auth.password')}</label>
          <input type="password" id="password-signup" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
          <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500" />
        </div>
        <button type="submit" className="w-full bg-stone-800 text-white py-2 rounded-md hover:bg-stone-900 transition-colors">{t('auth.signupButton')}</button>
      </form>
      <p className="mt-6 text-center text-sm">
        {t('auth.alreadyHaveAccount')} <button onClick={onLoginLinkClick} className="font-semibold text-stone-700 hover:underline">{t('auth.loginHere')}</button>
      </p>
    </div>
  );
};

export default SignupForm;
