import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useTranslation } from '../hooks/useTranslation';
import { useDebounce } from '../hooks/useDebounce';
import { auth } from '../lib/firebase';
import { ROUTES } from '../constants';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { GoogleIcon, EyeIcon, EyeOffIcon, CheckCircleIcon } from '../components/ui/icons';

// Componente para o Indicador de Força da Senha
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
    const { t } = useTranslation();
    const calculateStrength = (password: string): number => {
        if (!password) return 0;
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    };

    const strength = calculateStrength(password);
    
    // 0-2 = fraca (1 barra), 3-4 = média (3 barras), 5 = forte (4 barras)
    const level = strength <= 2 ? 1 : strength <= 4 ? 2 : 3;
    const barCount = strength === 0 ? 0 : strength <= 2 ? 1 : strength <= 4 ? 3 : 4;

    const colors = { 1: 'bg-red-500', 2: 'bg-amber-500', 3: 'bg-green-500' };
    const textColors = { 1: 'text-red-500', 2: 'text-amber-500', 3: 'text-green-500' };
    const labels = { 1: t('auth.weak'), 2: t('auth.medium'), 3: t('auth.strong') };

    if (!password) return null;

    return (
        <div className="mt-2">
            <div className="flex gap-1.5 mb-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${ i < barCount ? colors[level] : 'bg-gray-200' }`} />
                ))}
            </div>
            <p className={`text-xs text-right ${textColors[level]}`}>{labels[level]}</p>
        </div>
    );
};


const RegisterPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { register, googleLogin, user } = useAuth();
    const { showToast } = useToast();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});
    
    const [isCheckingEmail, setIsCheckingEmail] = useState(false);
    const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const debouncedEmail = useDebounce(email, 500);

    useEffect(() => {
        if (user) navigate(ROUTES.HOME, { replace: true });
    }, [user, navigate]);

    useEffect(() => {
        const checkEmail = async () => {
            if (debouncedEmail && /\S+@\S+\.\S+/.test(debouncedEmail)) {
                setIsCheckingEmail(true);
                setIsEmailAvailable(null);
                try {
                    const methods = await auth.fetchSignInMethodsForEmail(debouncedEmail);
                    setIsEmailAvailable(methods.length === 0);
                } catch (error) {
                    setIsEmailAvailable(false);
                } finally {
                    setIsCheckingEmail(false);
                }
            } else {
                 setIsEmailAvailable(null);
            }
        };
        checkEmail();
    }, [debouncedEmail]);

    const validate = useMemo(() => {
        const newErrors: Record<string, string> = {};
        if (touched.fullName && fullName.length < 3) newErrors.fullName = t('auth.fullNameMinLength');
        
        if (touched.email && !email) newErrors.email = t('auth.emailRequired');
        else if (touched.email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = t('auth.emailInvalid');
        else if (isEmailAvailable === false) newErrors.email = t('auth.emailExists');

        if (touched.password && password.length < 6) newErrors.password = t('auth.passwordMinLength');
        if (touched.confirmPassword && password !== confirmPassword) newErrors.confirmPassword = t('auth.passwordMismatch');

        if (touched.terms && !termsAccepted) newErrors.terms = t('auth.termsRequired');

        return newErrors;
    }, [fullName, email, password, confirmPassword, termsAccepted, touched, t, isEmailAvailable]);
    
    useEffect(() => {
        setErrors(validate);
    }, [validate]);

    const handleBlur = (field: string) => setTouched(prev => ({ ...prev, [field]: true }));
    
    const isFormValid = 
        fullName.length >= 3 &&
        /\S+@\S+\.\S+/.test(email) &&
        isEmailAvailable === true &&
        password.length >= 6 &&
        password === confirmPassword &&
        termsAccepted;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setTouched({ fullName: true, email: true, password: true, confirmPassword: true, terms: true });
        if (!isFormValid) return;

        setIsSubmitting(true);
        try {
            await register(email, password, fullName);
            showToast(t('toast.registerSuccess'), 'success');
            // Redirection is handled by the useEffect watching the user state
        } catch (error: any) {
            const message = error.code === 'auth/email-already-in-use' ? t('auth.errorEmailInUse') : t('auth.errorRegister');
            showToast(message, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleGoogleLogin = async () => {
        setIsGoogleLoading(true);
        try {
            await googleLogin();
            showToast(t('toast.loginSuccess'), 'success');
            navigate(ROUTES.HOME, { replace: true });
        } catch (error: any) {
            showToast(t('auth.errorGoogleLogin'), 'error');
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-white to-surface py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-6 md:p-8 rounded-xl shadow-lg animate-fade-in-up">
                <div><h2 className="text-center text-3xl font-extrabold text-gray-900">{t('auth.registerTitle')}</h2></div>
                <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.fullName')}</label>
                        <Input id="fullName" value={fullName} onChange={e => setFullName(e.target.value)} onBlur={() => handleBlur('fullName')} required className={touched.fullName && errors.fullName ? 'border-red-500' : ''} />
                        {touched.fullName && errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.email')}</label>
                        <div className="relative">
                            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} onBlur={() => handleBlur('email')} required className={touched.email && errors.email ? 'border-red-500' : (isEmailAvailable ? 'border-green-500' : '')} />
                            {isCheckingEmail && <svg className="animate-spin h-5 w-5 text-gray-400 absolute right-3 top-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>}
                        </div>
                        {touched.email && errors.email ? <p className="text-sm text-red-600 mt-1">{errors.email}</p> : isEmailAvailable ? <p className="text-sm text-green-600 mt-1">{t('auth.emailAvailable')}</p> : null}
                    </div>
                    
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.password')}</label>
                        <div className="relative">
                            <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onBlur={() => handleBlur('password')} required className={touched.password && errors.password ? 'border-red-500' : ''} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center"><EyeIcon className="h-5 w-5 text-gray-400"/></button>
                        </div>
                        {touched.password && errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                        <PasswordStrengthIndicator password={password} />
                    </div>
                    
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">{t('auth.confirmPassword')}</label>
                         <div className="relative">
                            <Input id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} onBlur={() => handleBlur('confirmPassword')} required className={touched.confirmPassword && errors.confirmPassword ? 'border-red-500' : (confirmPassword && password === confirmPassword ? 'border-green-500' : '')} />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-10 pr-3 flex items-center"><EyeIcon className="h-5 w-5 text-gray-400"/></button>
                            {confirmPassword && password === confirmPassword && !errors.confirmPassword && <CheckCircleIcon className="h-5 w-5 text-green-500 absolute right-3 top-3.5"/>}
                        </div>
                        {touched.confirmPassword && errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
                    </div>

                    <div>
                        <div className="flex items-start">
                            <input id="terms" name="terms" type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} onBlur={() => handleBlur('terms')} className="h-4 w-4 text-secondary focus:ring-secondary/50 border-gray-300 rounded mt-0.5" />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                                {t('auth.termsAccept')}{' '}
                                <Link to="/terms" className="font-medium text-secondary hover:underline">{t('auth.termsOfUse')}</Link>{' '}
                                {t('auth.and')}{' '}
                                <Link to="/privacy" className="font-medium text-secondary hover:underline">{t('auth.privacyPolicy')}</Link>.
                            </label>
                        </div>
                         {touched.terms && errors.terms && <p className="text-sm text-red-600 mt-1">{errors.terms}</p>}
                    </div>

                    <Button type="submit" variant="primary" disabled={isSubmitting || !isFormValid}>
                         {isSubmitting ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : t('auth.register')}
                    </Button>
                </form>

                 <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300" /></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">{t('auth.or')}</span></div>
                </div>
        
                <Button variant="secondary" onClick={handleGoogleLogin} disabled={isGoogleLoading} className="w-full flex justify-center items-center gap-3">
                    {isGoogleLoading ? <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <><GoogleIcon className="w-5 h-5" /> {t('auth.loginWithGoogle')}</>}
                </Button>

                <p className="mt-6 text-center text-sm text-gray-600">{t('auth.alreadyHaveAccount')}{' '}
                    <Link to={ROUTES.LOGIN} className="font-medium text-secondary hover:text-secondary/80">{t('auth.login')}</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
