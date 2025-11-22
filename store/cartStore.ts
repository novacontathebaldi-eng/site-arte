import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, ProductCategory } from '../types';

interface FlyAnimationState {
  isActive: boolean;
  startRect: DOMRect | null;
  image: string;
}

interface CartState {
  items: CartItem[];
  flyAnimation: FlyAnimationState;
  
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  mergeCart: (remoteItems: CartItem[]) => void;
  total: () => number;
  itemCount: () => number;
  
  // Animation Actions
  triggerFlyAnimation: (rect: DOMRect, image: string) => void;
  resetFlyAnimation: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      flyAnimation: { isActive: false, startRect: null, image: '' },

      addItem: (product) => set((state) => {
        const existing = state.items.find((i) => i.id === product.id);
        
        // Logic for Unique Items (Paintings/Sculptures)
        const isUnique = product.category === ProductCategory.PAINTINGS || product.category === ProductCategory.SCULPTURES;

        if (existing) {
          // If it's unique, do not increase quantity
          if (isUnique) return { items: state.items };

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
            // Check if item is unique before allowing quantity increase
            const isUnique = i.category === ProductCategory.PAINTINGS || i.category === ProductCategory.SCULPTURES;
            if (isUnique && delta > 0) return i;

            const newQty = Math.max(1, i.quantity + delta);
            return { ...i, quantity: newQty };
          }
          return i;
        })
      })),

      clearCart: () => set({ items: [] }),

      mergeCart: (remoteItems) => set((state) => {
        const currentItems = [...state.items];
        
        remoteItems.forEach(rItem => {
            const existingIndex = currentItems.findIndex(c => c.id === rItem.id);
            
            if (existingIndex > -1) {
                // Conflict resolution: Use remote quantity logic or max
                // For unique items, quantity is always 1
                const isUnique = rItem.category === ProductCategory.PAINTINGS || rItem.category === ProductCategory.SCULPTURES;
                if (isUnique) {
                    currentItems[existingIndex].quantity = 1;
                } else {
                    currentItems[existingIndex].quantity = Math.max(currentItems[existingIndex].quantity, rItem.quantity);
                }
            } else {
                currentItems.push(rItem);
            }
        });
        return { items: currentItems };
      }),

      total: () => get().items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      triggerFlyAnimation: (rect, image) => set({
        flyAnimation: { isActive: true, startRect: rect, image }
      }),
      
      resetFlyAnimation: () => set({
        flyAnimation: { isActive: false, startRect: null, image: '' }
      })
    }),
    { name: 'cart-storage' }
  )
);