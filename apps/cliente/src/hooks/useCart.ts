import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

// Este hook customizado, `useCart`, simplifica o acesso ao contexto do carrinho.
export const useCart = () => {
  const context = useContext(CartContext);

  // Se um componente tentar usar este hook sem estar dentro de um CartProvider,
  // um erro será lançado. Isso ajuda a evitar bugs.
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  // Retorna o estado do carrinho e as funções para modificá-lo.
  // Em qualquer componente, basta fazer `const { state, addItem } = useCart();`
  return context;
};
