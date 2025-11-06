import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import { useAuth } from '../hooks/useAuth';

// Esta página é protegida e só pode ser acessada por usuários logados.
// O processo de checkout completo (endereço, pagamento, etc.) será construído aqui.
const CheckoutPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl md:text-5xl font-heading font-bold text-center mb-8">
        {t('checkout.title')}
      </h1>
      <div className="max-w-3xl mx-auto text-center text-text-secondary bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-primary mb-4">Olá, {user?.displayName || user?.email}!</h2>
        <p className="mb-6">
            Esta é a área de finalização de compra. A implementação do formulário de endereço e do pagamento seguro com Stripe será o próximo passo.
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
