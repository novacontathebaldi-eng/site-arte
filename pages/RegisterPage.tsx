import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../hooks/useToast';
import { useTranslation } from '../hooks/useTranslation';
import { ROUTES } from '../constants';

const RegisterPage: React.FC = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [fullName, setFullName] = useState('');
const [loading, setLoading] = useState(false);
const navigate = useNavigate();
const location = useLocation();
const { showToast } = useToast();
const { t } = useTranslation();

const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

const handleRegister = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);

try {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: fullName,
      },
      emailRedirectTo: window.location.origin
    }
  });

  if (error) throw error;
  
  showToast(t('toast.registerSuccess'), 'success');
  navigate(from, { replace: true });
} catch (error: any) {
  showToast(error.message, 'error');
} finally {
  setLoading(false);
}
};

return (
    <div className="flex justify-center items-center py-12 px-4">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center">{t('auth.registerTitle')}</h2>
            <form onSubmit={handleRegister} className="space-y-4">
                <Input
                    id="fullName"
                    label={t('auth.fullName')}
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
                <Input
                    id="email"
                    label={t('auth.email')}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <Input
                    id="password"
                    label={t('auth.password')}
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? `${t('auth.loading')}...` : t('auth.register')}
                </Button>
            </form>
            <p className="text-center text-sm">
                {t('auth.alreadyHaveAccount')}{' '}
                <Link to={ROUTES.LOGIN} className="font-medium text-secondary hover:underline">
                    {t('auth.login')}
                </Link>
            </p>
        </div>
    </div>
);
};

export default RegisterPage;
