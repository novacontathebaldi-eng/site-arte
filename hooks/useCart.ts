import { useCartStore } from '../store/cartStore';

// Este hook customizado, `useCart`, simplifica o acesso ao estado global do carrinho via Zustand.
export const useCart = () => {
  const { items, itemCount, total, ...actions } = useCartStore();

  // Retorna uma estrutura compatível com a API do Context anterior
  // para minimizar a necessidade de refatoração imediata nos componentes.
  return {
    state: {
      items,
      itemCount,
      total,
    },
    ...actions,
  };
};
