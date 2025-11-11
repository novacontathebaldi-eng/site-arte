import React, { createContext, useReducer, useEffect } from 'react';
import { CartItem, CartState } from 'shared/types';

// Este arquivo é o coração do nosso sistema de carrinho de compras.
// Ele gerencia todos os itens, quantidades e lógicas relacionadas.

// 1. AÇÕES POSSÍVEIS: Define os "comandos" que podemos executar no carrinho.
type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartState }; // Usado para carregar do localStorage

// 2. O REDUCER: A função que executa os comandos e atualiza o estado.
// Pense nele como o "cérebro" que decide como o estado do carrinho muda.
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        // Se o item já existe, apenas atualiza a quantidade.
        const newQuantity = Math.min(existingItem.stock, existingItem.quantity + action.payload.quantity);
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id ? { ...item, quantity: newQuantity } : item
          ),
        };
      }
      // Se é um item novo, adiciona à lista.
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(item => item.id !== action.payload.id) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    case 'CLEAR_CART':
      return { items: [] };
    case 'SET_CART':
      return action.payload;
    default:
      return state;
  }
};

// 3. CONTEXTO: Define o que será compartilhado com os componentes da aplicação.
interface CartContextType {
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
};

// 4. O PROVEDOR: O componente que "abraça" a aplicação e fornece o contexto.
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // useEffect para carregar o carrinho do localStorage quando o site abre.
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        dispatch({ type: 'SET_CART', payload: JSON.parse(savedCart) });
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage', error);
      localStorage.removeItem('cart'); // Limpa o carrinho se estiver corrompido
    }
  }, []);

  // useEffect para salvar o carrinho no localStorage sempre que ele mudar.
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);
  
  // Funções "amigáveis" que os componentes usarão para interagir com o carrinho.
  const addItem = (item: CartItem) => dispatch({ type: 'ADD_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  const updateItemQuantity = (id: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateItemQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
