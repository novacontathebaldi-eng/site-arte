import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
    const { t } = useTranslation();
    const { register, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            await register(name, email, password);
        } catch (error) {
            // Error is handled by AuthContext
        } finally {
            setLoading(false);
        }
    };
    
    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            // Error handled in context
        }
    }


    return (
        <div className="flex items-center justify-center min-h-[70vh] bg-surface">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h1 className="text-3xl font-serif font-bold text-center text-primary">{t('create_your_account')}</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-text-secondary">{t('full_name')}</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-text-secondary">{t('email_address')}</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-text-secondary">{t('password')}</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
                        />
                    </div>
                     <div>
                        <label htmlFor="confirm-password" className="block text-sm font-medium text-text-secondary">{t('confirm_password')}</label>
                        <input
                            type="password"
                            id="confirm-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="mt-1 block w-full px-3 py-2 bg-white border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-secondary focus:border-secondary"
                        />
                    </div>
                    <div>
                        <button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-all duration-300 disabled:bg-gray-400">
                             {loading ? '...' : t('register')}
                        </button>
                    </div>
                </form>
                 <div className="relative flex items-center justify-center">
                    <span className="absolute inset-x-0 h-px bg-border-color"></span>
                    <span className="relative bg-white px-2 text-sm text-text-secondary">{t('or')}</span>
                </div>
                 <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-2 border border-border-color py-3 px-4 rounded-md hover:bg-surface transition-colors">
                     <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.317-11.28-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C41.389 36.091 44 30.651 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
                    {t('login_with_google')}
                </button>
                <p className="text-center text-sm text-text-secondary">
                    {t('already_have_account')} <Link to="/login" className="font-medium text-secondary hover:underline">{t('login')}</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
