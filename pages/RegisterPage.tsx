import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '../lib/firebase';
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
    const { showToast } = useToast();
    const { t } = useTranslation();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            await updateProfile(userCredential.user, {
                displayName: fullName
            });

            try {
                await sendEmailVerification(userCredential.user);
                console.log('E-mail de verificação enviado');
            } catch (emailError) {
                console.error('Erro ao enviar e-mail:', emailError);
            }
            
            showToast(t('toast.registerSuccess'), 'info');
            navigate(ROUTES.DASHBOARD);
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
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                    <Input
                        id="email"
                        label={t('auth.email')}
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        id="password"
                        label={t('auth.password')}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? t('auth.loading') : t('auth.register')}
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
