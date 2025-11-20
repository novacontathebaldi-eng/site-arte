import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import Button from '../common/Button';
import Input from '../common/Input';

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input type="text" id="displayName" label={t('auth.displayName')} value={displayName} onChange={e => setDisplayName(e.target.value)} required />
        <Input type="email" id="email-signup" label={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} required />
        <Input type="password" id="password-signup" label={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} required />
        <Input type="password" id="confirmPassword" label={t('auth.confirmPassword')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
        
        <Button type="submit" variant="primary" className="w-full">{t('auth.signupButton')}</Button>
      </form>
      <p className="mt-6 text-center text-sm">
        {t('auth.alreadyHaveAccount')} <button onClick={onLoginLinkClick} className="font-semibold text-brand-black dark:text-brand-white hover:underline">{t('auth.loginHere')}</button>
      </p>
    </div>
  );
};

export default SignupForm;
