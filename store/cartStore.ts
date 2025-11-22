import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  mergeCart: (remoteItems: CartItem[]) => void;
  total: () => number;
  itemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => set((state) => {
        const existing = state.items.find((i) => i.id === product.id);
        if (existing) {
          return {
            items: state.items.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { items: [...state.items, { ...product, quantity: 1 }] };
      }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, delta) => set((state) => ({
        items: state.items.map((i) => {
          if (i.id === id) {
            const newQty = Math.max(1, i.quantity + delta);
            return { ...i, quantity: newQty };
          }
          return i;
        })
      })),
      clearCart: () => set({ items: [] }),
      mergeCart: (remoteItems) => set((state) => {
        // Simple merge strategy: prefer remote if conflict, or append
        // Ideally we would sum quantities, but for simplicity we replace logic
        // Here we just append items that don't exist
        const currentItems = [...state.items];
        remoteItems.forEach(rItem => {
            const exists = currentItems.find(c => c.id === rItem.id);
            if (exists) {
                exists.quantity = Math.max(exists.quantity, rItem.quantity);
            } else {
                currentItems.push(rItem);
            }
        });
        return { items: currentItems };
      }),
      total: () => get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: 'cart-storage' }
  )
);