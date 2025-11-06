import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

// Esta é uma página placeholder para "Contato".
// O formulário de contato detalhado será implementado aqui.
const ContactPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-8">
        {t('contact.title')}
      </h1>
      <div className="max-w-3xl mx-auto text-center text-text-secondary">
        <p>
          O formulário de contato e as informações de contato serão adicionados aqui.
        </p>
      </div>
    </div>
  );
};

export default ContactPage;
