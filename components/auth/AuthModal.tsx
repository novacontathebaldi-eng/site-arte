import React, { useState } from 'react';
import Modal from '../common/Modal';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ForgotPasswordForm from './ForgotPasswordForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthView = 'login' | 'signup' | 'forgotPassword';

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<AuthView>('login');

  const renderView = () => {
    switch (view) {
      case 'signup':
        return <SignupForm onLoginLinkClick={() => setView('login')} onSuccess={onClose} />;
      case 'forgotPassword':
        return <ForgotPasswordForm onBackToLoginClick={() => setView('login')} />;
      case 'login':
      default:
        return <LoginForm onSignupLinkClick={() => setView('signup')} onForgotPasswordClick={() => setView('forgotPassword')} onSuccess={onClose} />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {renderView()}
    </Modal>
  );
};

export default AuthModal;
