import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';
import { ROUTES } from '../constants';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { MailIcon } from '../components/ui/icons';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState('');

    const { forgotPassword } = useAuth();
    const { t } = useTranslation();

    const validateEmail = (value: string) => {
        if (!value) return t('auth.emailRequired');
        if (!/\S+@\S+\.\S+/.test(value)) return t('auth.emailInvalid');
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailError = validateEmail(email);
        if (emailError) {
            setError(emailError);
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await forgotPassword(email);
            setEmailSent(true);
        } catch (error: any) {
            const errorMessages: Record<string, string> = {
                'auth/user-not-found': t('auth.errorUserNotFound'),
                'auth/invalid-email': t('auth.emailInvalid'),
                'auth/too-many-requests': t('auth.errorTooManyRequests'),
            };
            const message = errorMessages[error.code] || t('auth.errorResetPassword');
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-white to-surface py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-6 md:p-8 rounded-xl shadow-lg animate-fade-in-up">
                {emailSent ? (
                    <div className="text-center">
                        <MailIcon className="w-16 h-16 mx-auto text-accent" />
                        <h2 className="mt-6 text-2xl font-extrabold text-gray-900">
                            {t('toast.passwordResetSent')}
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            {t('auth.checkInboxAndSpam')}
                        </p>
                        <div className="mt-6">
                            <Link to={ROUTES.LOGIN}>
                                <Button variant="primary" className="w-full">
                                    {t('auth.backToLogin')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div>
                            <h2 className="text-center text-3xl font-extrabold text-gray-900">{t('auth.resetPasswordTitle')}</h2>
                            <p className="mt-2 text-center text-sm text-gray-600">{t('auth.resetPasswordInstructions')}</p>
                        </div>
                        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={e => {
                                        setEmail(e.target.value);
                                        if (error) setError('');
                                    }}
                                    placeholder={t('auth.email')}
                                    className={error ? 'border-red-500' : ''}
                                />
                                {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
                            </div>
                            <Button type="submit" variant="primary" disabled={isSubmitting || !email}>
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('auth.sending')}
                                    </span>
                                ) : (
                                    t('auth.sendResetLink')
                                )}
                            </Button>
                        </form>
                        <p className="text-center text-sm">
                            <Link to={ROUTES.LOGIN} className="font-medium text-secondary hover:text-secondary/80">
                                {t('auth.rememberedPassword')}
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
