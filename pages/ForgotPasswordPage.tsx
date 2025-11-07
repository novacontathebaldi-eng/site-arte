import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// FIX: Removed modular import 'sendPasswordResetEmail' from 'firebase/auth' which caused an error.
// The v8 compatibility API is used instead.
import { auth } from '../lib/firebase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useToast } from '../hooks/useToast';
import { useTranslation } from '../hooks/useTranslation';
import { ROUTES } from '../constants';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();
    const { t } = useTranslation();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // FIX: Switched to Firebase v8 compat API `auth.sendPasswordResetEmail()` to resolve module export errors.
            await auth.sendPasswordResetEmail(email);
            showToast(t('toast.passwordResetSent'), 'success');
        } catch (error: any) {
            showToast(error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center py-12 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">{t('auth.resetPasswordTitle')}</h2>
                <p className="text-center text-sm text-gray-600">{t('auth.resetPasswordInstructions')}</p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <Input
                        id="email"
                        label={t('auth.email')}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? t('auth.loading') : t('auth.sendResetLink')}
                    </Button>
                </form>
                <p className="text-center text-sm">
                    <Link to={ROUTES.LOGIN} className="font-medium text-secondary hover:underline">
                        {t('auth.backToLogin')}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;