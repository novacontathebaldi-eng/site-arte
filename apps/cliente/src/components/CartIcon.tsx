import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { ROUTES } from '../constants';
import { ShoppingBagIcon } from '@shared/components/ui/icons';

// Este componente é o ícone do carrinho que fica no cabeçalho.
const CartIcon: React.FC = () => {
  const { state } = useCart();

  // Calcula o número total de itens no carrinho.
  // O 'reduce' soma as quantidades de todos os itens.
  const totalItems = state.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link to={ROUTES.CART} className="relative p-2 text-text-primary hover:text-secondary transition-colors">
      <ShoppingBagIcon className="w-6 h-6" />
      {totalItems > 0 && (
        <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-secondary text-white text-xs flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;