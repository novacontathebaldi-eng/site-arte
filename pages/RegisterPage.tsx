import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
// FIX: Removed modular imports from 'firebase/auth' which caused an error.
// The v8 compatibility API is used instead.
import { auth } from '../lib/firebase';
import { syncUserToSupabase } from '../lib/syncUserToSupabase';
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
            // FIX: Switched to Firebase v8 compat API `auth.createUserWithEmailAndPassword()` to resolve module export errors.
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // FIX: Switched to Firebase v8 compat API `user.updateProfile()` to resolve module export errors.
            await userCredential.user!.updateProfile({
                displayName: fullName
            });

            try {
                // FIX: Switched to Firebase v8 compat API `user.sendEmailVerification()` to resolve module export errors.
                await userCredential.user!.sendEmailVerification();
                console.log('Verification email sent');
            } catch (emailError) {
                console.error('Error sending verification email:', emailError);
            }
            
            // We need to sync the user to Supabase with the updated profile info
            // The user object from the credential might not be updated immediately after updateProfile
            // It's safer to construct the object for syncing manually
            const userToSync = { 
                ...userCredential.user!,
                displayName: fullName 
            };
            await syncUserToSupabase(userToSync);
            
            showToast('Account created! Please check your email.', 'success');
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