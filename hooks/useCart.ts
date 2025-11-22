import { useEffect, useRef } from 'react';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { debounce } from '../lib/utils';
import { CartItem } from '../types';

export const useCart = () => {
  const { items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, mergeCart } = useCartStore();
  const { toggleCart, isCartOpen } = useUIStore();
  const { user } = useAuthStore();
  
  // Ref to avoid circular dependency effects or sync loops
  const isInitialLoad = useRef(true);

  // 1. Fetch Cart from Firestore on Login
  useEffect(() => {
    const fetchRemoteCart = async () => {
      if (!user) return;
      
      try {
        const docRef = doc(db, 'users', user.uid, 'cart', 'active');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.items && Array.isArray(data.items)) {
            mergeCart(data.items as CartItem[]);
          }
        }
      } catch (error) {
        console.error("Failed to sync cart from cloud:", error);
      }
    };

    if (user) {
      fetchRemoteCart();
    }
  }, [user, mergeCart]);

  // 2. Save Cart to Firestore on Change (Debounced)
  useEffect(() => {
    // Skip first render to avoid overwriting cloud data with empty local state immediately upon login
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    const saveToCloud = async () => {
      if (!user) return;
      
      try {
        const docRef = doc(db, 'users', user.uid, 'cart', 'active');
        await setDoc(docRef, {
          items: items,
          updatedAt: new Date().toISOString(),
          total: total(),
          itemCount: itemCount()
        }, { merge: true });
      } catch (error) {
        console.error("Failed to save cart to cloud:", error);
      }
    };

    const debouncedSave = debounce(saveToCloud, 1000);
    
    if (user && items) {
       debouncedSave();
    }

  }, [items, user, total, itemCount]);

  const addToCart = (product: any) => {
    addItem(product);
    if (!isCartOpen) toggleCart();
  };

  return {
    items,
    addToCart,
    removeItem,
    updateQuantity,
    clearCart,
    total: total(),
    itemCount: itemCount(),
    isOpen: isCartOpen,
    toggleCart
  };
};