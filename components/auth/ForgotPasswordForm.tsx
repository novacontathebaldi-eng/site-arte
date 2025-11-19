import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';

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
      <p className="text-center text-sm text-stone-600 mb-6">{t('auth.passwordResetInstructions')}</p>
      
      {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
      {message && <p className="text-green-600 text-sm mb-4 text-center">{message}</p>}

      {!message && (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-stone-700 mb-1" htmlFor="email-reset">{t('auth.email')}</label>
            <input type="email" id="email-reset" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-stone-500" />
          </div>
          <button type="submit" className="w-full bg-stone-800 text-white py-2 rounded-md hover:bg-stone-900 transition-colors">{t('auth.sendResetLink')}</button>
        </form>
      )}

      <p className="mt-6 text-center text-sm">
        <button onClick={onBackToLoginClick} className="font-semibold text-stone-700 hover:underline">{t('auth.backToLogin')}</button>
      </p>
    </div>
  );
};

export default ForgotPasswordForm;
