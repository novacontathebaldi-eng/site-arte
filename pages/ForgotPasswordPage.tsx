import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useTranslation } from '../hooks/useTranslation';
import { ROUTES } from '../constants';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const { forgotPassword } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation();
    
    const validate = () => {
        if (!email) {
            setError(t('auth.emailRequired'));
            return false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setError(t('auth.emailInvalid'));
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await forgotPassword(email);
            showToast(t('toast.passwordResetSent'), 'success');
        } catch (error: any) {
            showToast(t('auth.errorResetPassword'), 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-white to-surface py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-6 md:p-8 rounded-xl shadow-lg animate-fade-in-up">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">{t('auth.resetPasswordTitle')}</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">{t('auth.resetPasswordInstructions')}</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                    {/* FIX: Removed 'label' prop from Input and added an explicit <label> with a wrapper div. */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
                    </div>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                        {isSubmitting ? t('auth.loading') : t('auth.sendResetLink')}
                    </Button>
                </form>
                <p className="text-center text-sm">
                    <Link to={ROUTES.LOGIN} className="font-medium text-secondary hover:text-secondary/80">
                        {t('auth.backToLogin')}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
