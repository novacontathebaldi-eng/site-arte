import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../hooks/useToast';
import { ROUTES } from '../constants';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { GoogleIcon } from '../components/ui/icons';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      // FIX: In Supabase v2, `signInWithPassword` is used instead of `signIn`.
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      showToast(t('toast.loginSuccess'), 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(t('toast.error'));
      showToast(err.message || t('toast.error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleLogin = async () => {
    // FIX: In Supabase v2, `signInWithOAuth` is used for OAuth instead of `signIn`.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) {
        showToast(t('toast.error'), 'error');
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">{t('auth.loginTitle')}</h1>
        <form onSubmit={handleLogin} className="space-y-6">
          <Input id="email" type="email" label={t('auth.email')} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="password" type="password" label={t('auth.password')} value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="text-right">
            <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-secondary hover:underline">{t('auth.forgotPassword')}</Link>
          </div>
          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? `${t('auth.loading')}...` : t('auth.login')}
          </Button>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">{t('auth.or')}</span></div>
        </div>
        <Button variant="secondary" onClick={handleGoogleLogin} className="w-full flex justify-center items-center gap-2">
            <GoogleIcon className="w-5 h-5" /> {t('auth.loginWithGoogle')}
        </Button>
        <p className="text-center text-sm">
          {t('auth.dontHaveAccount')} <Link to={ROUTES.REGISTER} className="font-medium text-secondary hover:underline">{t('auth.register')}</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
