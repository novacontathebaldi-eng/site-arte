import { create } from 'zustand';
import { SupabaseProduct, CartStoreState, SupabaseCartItem } from '../types';
import { persist } from 'zustand/middleware';

// Helper function to calculate totals
const calculateTotals = (items: SupabaseCartItem[]) => {
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);
  return { itemCount, total };
};

export const useCartStore = create<CartStoreState>()(
  persist(
    (set) => ({
      items: [],
      itemCount: 0,
      total: 0,

      addItem: (product, quantity) =>
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) => item.id === product.id
          );
          let newItems = [...state.items];

          if (existingItemIndex > -1) {
            // Item exists, update quantity
            const existingItem = newItems[existingItemIndex];
            const newQuantity = existingItem.quantity + quantity;
            // TODO: check against product stock when available in SupabaseProduct
            existingItem.quantity = newQuantity;
            existingItem.subtotal = existingItem.unit_price * newQuantity;
          } else {
            // Item does not exist, add it
            newItems.push({
              id: product.id,
              product,
              quantity,
              unit_price: product.price,
              subtotal: product.price * quantity,
            });
          }

          const { itemCount, total } = calculateTotals(newItems);
          return { items: newItems, itemCount, total };
        }),

      removeItem: (productId) =>
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== productId);
          const { itemCount, total } = calculateTotals(newItems);
          return { items: newItems, itemCount, total };
        }),

      updateQuantity: (productId, newQuantity) =>
        set((state) => {
          if (newQuantity <= 0) {
            // If quantity is 0 or less, remove the item
            const newItems = state.items.filter((item) => item.id !== productId);
            const { itemCount, total } = calculateTotals(newItems);
            return { items: newItems, itemCount, total };
          }

          const newItems = state.items.map((item) => {
            if (item.id === productId) {
              // TODO: check against product stock
              return {
                ...item,
                quantity: newQuantity,
                subtotal: item.unit_price * newQuantity,
              };
            }
            return item;
          });

          const { itemCount, total } = calculateTotals(newItems);
          return { items: newItems, itemCount, total };
        }),

      clearCart: () => set({ items: [], itemCount: 0, total: 0 }),
    }),
    {
      name: 'cart-storage', 
    }
  )
);
