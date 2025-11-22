import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  items: string[]; // Stores Product IDs
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  clearWishlist: () => void;
  hasItem: (productId: string) => boolean;
  setItems: (items: string[]) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (id) => set((state) => {
        if (state.items.includes(id)) return state;
        return { items: [...state.items, id] };
      }),
      removeItem: (id) => set((state) => ({ 
        items: state.items.filter((itemId) => itemId !== id) 
      })),
      toggleItem: (id) => set((state) => {
        if (state.items.includes(id)) {
            return { items: state.items.filter((itemId) => itemId !== id) };
        }
        return { items: [...state.items, id] };
      }),
      clearWishlist: () => set({ items: [] }),
      hasItem: (id) => get().items.includes(id),
      setItems: (items) => set({ items }),
    }),
    { name: 'wishlist-storage' }
  )
);