import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useTranslation } from '../hooks/useTranslation';
import { ROUTES } from '../constants';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { GoogleIcon, EyeIcon, EyeOffIcon } from '../components/ui/icons';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { login, googleLogin } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe');
    if (savedRememberMe !== null) {
      setRememberMe(JSON.parse(savedRememberMe));
    }
  }, []);

  const validateEmail = (value: string) => {
    if (!value) return t('auth.emailRequired');
    if (!/\S+@\S+\.\S+/.test(value)) return t('auth.emailInvalid');
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return t('auth.passwordRequired');
    return '';
  };

  const handleBlur = (field: 'email' | 'password') => {
    if (field === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(email) }));
    } else {
      setErrors(prev => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password, rememberMe);
      localStorage.setItem('rememberMe', JSON.stringify(rememberMe));
      showToast(t('toast.loginSuccess'), 'success');
      navigate(from, { replace: true });
    } catch (error: any) {
      const errorMessages: Record<string, string> = {
        'auth/user-not-found': t('auth.errorUserNotFound'),
        'auth/wrong-password': t('auth.errorWrongPassword'),
        'auth/too-many-requests': t('auth.errorTooManyRequests'),
        'auth/network-request-failed': t('auth.errorNetwork'),
      };
      const message = errorMessages[error.code] || t('auth.errorLogin');
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
      navigate(from, { replace: true });
    } catch (error: any) {
      const errorMessages: Record<string, string> = {
        'auth/popup-closed-by-user': t('auth.errorPopupClosed'),
        'auth/popup-blocked': t('auth.errorPopupBlocked'),
      };
      const message = errorMessages[error.code] || t('auth.errorGoogleLogin');
      showToast(message, 'error');
    } finally {
      setIsGoogleLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface via-white to-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 md:p-8 rounded-xl shadow-lg animate-fade-in-up">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            {t('auth.loginTitle')}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.email')}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`${errors.email ? 'border-red-500' : 'border-gray-300'} focus:border-secondary focus:ring-secondary/20`}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"> {errors.email} </p>}
          </div>

          <div>
            <label htmlFor="password"className="block text-sm font-medium text-gray-700 mb-2">
              {t('auth.password')}
            </label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                className={`${errors.password ? 'border-red-500' : 'border-gray-300'} focus:border-secondary focus:ring-secondary/20`}
                aria-invalid={!!errors.password}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-600 flex items-center gap-1"> {errors.password} </p>}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-secondary focus:ring-secondary/50 border-gray-300 rounded"/>
              <label htmlFor="remember-me" className="ml-2 block text-gray-700"> {t('auth.rememberMe')} </label>
            </div>
            <Link to={ROUTES.FORGOT_PASSWORD} className="font-medium text-secondary hover:text-secondary/80"> {t('auth.forgotPassword')} </Link>
          </div>

          <div>
            <Button type="submit" variant="primary" disabled={isSubmitting || !!errors.email || !!errors.password || !email || !password}>
              {isSubmitting ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : t('auth.login')}
            </Button>
          </div>
        </form>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-gray-300" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">{t('auth.or')}</span></div>
        </div>
        
        <Button variant="secondary" onClick={handleGoogleLogin} disabled={isGoogleLoading} className="w-full flex justify-center items-center gap-3">
             {isGoogleLoading ? <svg className="animate-spin h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <><GoogleIcon className="w-5 h-5" /> {t('auth.loginWithGoogle')}</>}
        </Button>

        <p className="mt-6 text-center text-sm text-gray-600">
          {t('auth.dontHaveAccount')}{' '}
          <Link to={ROUTES.REGISTER} className="font-medium text-secondary hover:text-secondary/80">
            {t('auth.register')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
