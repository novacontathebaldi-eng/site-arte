import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../hooks/useToast';
import { ROUTES } from '../constants';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
      });
      if (error) throw error;
      showToast(t('toast.passwordResetSent'), 'success');
    } catch (err: any) {
      showToast(err.message || t('toast.error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">{t('auth.resetPasswordTitle')}</h1>
        <p className="text-center text-sm text-text-secondary">{t('auth.resetPasswordInstructions')}</p>
        <form onSubmit={handleResetPassword} className="space-y-6">
          <Input id="email" type="email" label={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? `${t('auth.loading')}...` : t('auth.sendResetLink')}
          </Button>
        </form>
        <p className="text-center text-sm">
          <Link to={ROUTES.LOGIN} className="font-medium text-secondary hover:underline">{t('auth.backToLogin')}</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;