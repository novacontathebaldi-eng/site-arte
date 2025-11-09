
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { ROUTES } from '../constants';

// Esta é a página de erro 404, mostrada quando o usuário acessa uma URL que não existe.
const NotFoundPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center" style={{minHeight: 'calc(100vh - 200px)'}}>
      <div className="text-center">
        <h1 className="text-9xl font-bold text-secondary font-heading">404</h1>
        <h2 className="text-3xl font-bold text-primary mt-4">{t('notFound.title')}</h2>
        <p className="text-text-secondary mt-2">{t('notFound.message')}</p>
        <Link 
          to={ROUTES.HOME} 
          className="mt-8 inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-80 transition-colors duration-300"
        >
          {t('notFound.goHome')}
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
