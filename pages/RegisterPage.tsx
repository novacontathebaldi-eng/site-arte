

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, firestore, googleProvider } from '../lib/firebase';
import { useTranslation } from '../hooks/useTranslation';
import { useToast } from '../hooks/useToast';
import { ROUTES } from '../constants';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { GoogleIcon } from '../components/ui/icons';
import { useAuth } from '../hooks/useAuth';
import { UserProfile } from '../types';

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
    const { t } = useTranslation();
    const strength = useMemo(() => {
        let score = 0;
        if (password.length > 7) score++;
        if (password.match(/[a-z]/)) score++;
        if (password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^a-zA-Z0-9]/)) score++;
        return score;
    }, [password]);

    const strengthLabel = [t('auth.weak'), t('auth.weak'), t('auth.medium'), t('auth.medium'), t('auth.strong'), t('auth.strong')];
    const strengthColor = ['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-yellow-500', 'bg-green-500', 'bg-green-500'];

    return (
        <div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${strengthColor[strength]}`} style={{ width: `${(strength / 5) * 100}%` }}></div>
            </div>
            <p className="text-xs text-right mt-1">{strengthLabel[strength]}</p>
        </div>
    );
};


const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (user) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Create user profile in Firestore
        const newUserProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: fullName,
            role: 'user',
            language: 'fr',
            emailVerified: firebaseUser.emailVerified,
            createdAt: serverTimestamp(),
        };
        await setDoc(doc(firestore, 'users', firebaseUser.uid), newUserProfile);
        
        // Send verification email in background
        sendEmailVerification(firebaseUser).catch(console.error);

        // The onAuthStateChange listener in AuthContext will handle the new session.
        showToast(t('toast.registerSuccess'), 'success');
        navigate(ROUTES.DASHBOARD, { replace: true });

    } catch (err: any) {
      setError(err.message || t('toast.error'));
      showToast(err.message || t('toast.error'), 'error');
    } finally {
      setIsLoading(false);
    }
  };

   const handleGoogleLogin = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
        showToast(t('toast.loginSuccess'), 'success');
        navigate(ROUTES.DASHBOARD, { replace: true });
    } catch (error) {
        showToast(t('toast.error'), 'error');
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">{t('auth.registerTitle')}</h1>
        <form onSubmit={handleRegister} className="space-y-6">
          <Input id="fullName" type="text" label={t('auth.fullName')} value={fullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)} required />
          <Input id="email" type="email" label={t('auth.email')} value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} required />
          <div>
            <Input id="password" type="password" label={t('auth.password')} value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} required />
            <PasswordStrengthMeter password={password} />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? `${t('auth.loading')}...` : t('auth.register')}
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
          {t('auth.alreadyHaveAccount')} <Link to={ROUTES.LOGIN} className="font-medium text-secondary hover:underline">{t('auth.login')}</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;