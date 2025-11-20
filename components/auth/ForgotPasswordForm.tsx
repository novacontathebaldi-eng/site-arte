import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import Button from '../common/Button';
import Input from '../common/Input';

interface ForgotPasswordFormProps {
  onBackToLoginClick: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLoginClick }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { sendPasswordReset } = useAuth();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await sendPasswordReset(email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-2">{t('auth.passwordReset')}</h2>
      <p className="text-center text-sm text-brand-black/70 dark:text-brand-white/70 mb-6">{t('auth.passwordResetInstructions')}</p>
      
      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
      {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}

      {!message && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="email" id="email-reset" label={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} required />
          <Button type="submit" variant="primary" className="w-full">{t('auth.sendResetLink')}</Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm">
        <button onClick={onBackToLoginClick} className="font-semibold text-brand-black dark:text-brand-white hover:underline">{t('auth.backToLogin')}</button>
      </p>
    </div>
  );
};

export default ForgotPasswordForm;
