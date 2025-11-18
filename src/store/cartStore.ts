import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Cart, CartItem } from '@/types';
import { toast } from 'react-toastify';

interface CartState {
  cart: Cart;
  isLoading: boolean;
  itemCount: number;
  addItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  syncCart: () => Promise<void>;
  loadCart: () => Promise<void>;
}

const createEmptyCart = (): Cart => ({
  items: [],
  updatedAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
});

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: createEmptyCart(),
      isLoading: false,
      itemCount: 0,

      loadCart: async () => {
        const user = auth.currentUser;
        
        if (user) {
          // Load from Firestore
          try {
            const cartDoc = await getDoc(doc(db, 'carts', user.uid));
            if (cartDoc.exists()) {
              const cartData = cartDoc.data() as Cart;
              set({ 
                cart: cartData,
                itemCount: cartData.items.reduce((sum, item) => sum + item.quantity, 0)
              });
            }
          } catch (error) {
            console.error('Error loading cart from Firestore:', error);
          }
        }
      },

      syncCart: async () => {
        const user = auth.currentUser;
        const { cart } = get();
        
        if (user) {
          try {
            await setDoc(doc(db, 'carts', user.uid), {
              ...cart,
              updatedAt: new Date()
            });
          } catch (error) {
            console.error('Error syncing cart:', error);
          }
        }
      },

      addItem: async (productId: string, quantity: number) => {
        set({ isLoading: true });
        
        try {
          const { cart } = get();
          const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
          
          let newItems: CartItem[];
          
          if (existingItemIndex >= 0) {
            // Update existing item
            newItems = [...cart.items];
            newItems[existingItemIndex].quantity += quantity;
          } else {
            // Add new item
            const newItem: CartItem = {
              productId,
              quantity,
              addedAt: new Date()
            };
            newItems = [...cart.items, newItem];
          }
          
          const newCart: Cart = {
            ...cart,
            items: newItems,
            updatedAt: new Date()
          };
          
          const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          
          set({ 
            cart: newCart,
            itemCount: newItemCount,
            isLoading: false
          });
          
          // Sync with Firestore if user is logged in
          await get().syncCart();
          
          toast.success('Item added to cart');
        } catch (error) {
          set({ isLoading: false });
          console.error('Error adding item to cart:', error);
          toast.error('Failed to add item to cart');
        }
      },

      removeItem: async (productId: string) => {
        set({ isLoading: true });
        
        try {
          const { cart } = get();
          const newItems = cart.items.filter(item => item.productId !== productId);
          
          const newCart: Cart = {
            ...cart,
            items: newItems,
            updatedAt: new Date()
          };
          
          const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          
          set({ 
            cart: newCart,
            itemCount: newItemCount,
            isLoading: false
          });
          
          // Sync with Firestore if user is logged in
          await get().syncCart();
          
          toast.success('Item removed from cart');
        } catch (error) {
          set({ isLoading: false });
          console.error('Error removing item from cart:', error);
          toast.error('Failed to remove item from cart');
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        set({ isLoading: true });
        
        try {
          const { cart } = get();
          const newItems = cart.items.map(item => 
            item.productId === productId 
              ? { ...item, quantity }
              : item
          );
          
          const newCart: Cart = {
            ...cart,
            items: newItems,
            updatedAt: new Date()
          };
          
          const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
          
          set({ 
            cart: newCart,
            itemCount: newItemCount,
            isLoading: false
          });
          
          // Sync with Firestore if user is logged in
          await get().syncCart();
        } catch (error) {
          set({ isLoading: false });
          console.error('Error updating cart quantity:', error);
        }
      },

      clearCart: async () => {
        set({ isLoading: true });
        
        try {
          const newCart = createEmptyCart();
          
          set({ 
            cart: newCart,
            itemCount: 0,
            isLoading: false
          });
          
          // Sync with Firestore if user is logged in
          await get().syncCart();
          
          toast.success('Cart cleared');
        } catch (error) {
          set({ isLoading: false });
          console.error('Error clearing cart:', error);
          toast.error('Failed to clear cart');
        }
      },

      getTotal: () => {
        const { cart } = get();
        // This would normally calculate the total based on product prices
        // For now, return 0 as we need product data
        return 0;
      }
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        cart: state.cart,
        itemCount: state.itemCount
      })
    }
  )
);