import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { syncUserToSupabase } from '../lib/syncUserToSupabase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../hooks/useToast';
import { useTranslation } from '../hooks/useTranslation';
import { ROUTES } from '../constants';
import { GoogleIcon } from '../components/ui/icons';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const { t } = useTranslation();

    const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await syncUserToSupabase(userCredential.user);
            showToast(t('toast.loginSuccess'), 'success');
            navigate(from, { replace: true });
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const userCredential = await signInWithPopup(auth, provider);
            await syncUserToSupabase(userCredential.user);
            showToast(t('toast.loginSuccess'), 'success');
            navigate(from, { replace: true });
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    return (
        <div className="flex justify-center items-center py-12 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center">{t('auth.loginTitle')}</h1>
                <form onSubmit={handleLogin} className="space-y-6">
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
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <div className="text-right">
                        <Link to={ROUTES.FORGOT_PASSWORD} className="text-sm text-secondary hover:underline">{t('auth.forgotPassword')}</Link>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? `${t('auth.loading')}...` : t('auth.login')}
                    </Button>
                </form>
                <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t"></span></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">{t('auth.or')}</span></div>
                </div>
                <Button onClick={handleGoogleLogin} variant="secondary" className="w-full flex justify-center items-center gap-2">
                    <GoogleIcon className="w-5 h-5" />
                    {t('auth.loginWithGoogle')}
                </Button>
                <p className="text-center text-sm">
                    {t('auth.dontHaveAccount')}{' '}
                    <Link to={ROUTES.REGISTER} className="font-medium text-secondary hover:underline">
                        {t('auth.register')}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
