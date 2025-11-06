import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';

// Esta é uma página placeholder para o "Checkout".
// O processo de checkout completo (endereço, pagamento, etc.) será construído aqui.
const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-8">
        {t('checkout.title')}
      </h1>
      <div className="max-w-3xl mx-auto text-center text-text-secondary bg-white p-8 rounded-lg shadow-md">
        <p className="mb-6">
          A implementação do sistema de autenticação de usuário e do checkout seguro com Stripe está em andamento.
        </p>
        <Link 
          to={ROUTES.CART} 
          className="text-secondary font-semibold hover:underline"
        >
          &larr; Voltar para o carrinho
        </Link>
      </div>
    </div>
  );
};

export default CheckoutPage;
