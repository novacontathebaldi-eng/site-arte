
import { useEffect, useRef } from 'react';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { db } from '../lib/firebase/config';
import { doc, onSnapshot, setDoc, collection } from 'firebase/firestore';
import { debounce } from '../lib/utils';
import { Product } from '../types';

export const useCart = () => {
  const { 
    items, 
    addItem, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    total, 
    itemCount, 
    triggerFlyAnimation
  } = useCartStore();
  
  const { toggleCart, isCartOpen } = useUIStore();
  const { user } = useAuthStore();
  
  const isMerging = useRef(false);

  // 1. Real-time Sync & Magic Merge on Login
  useEffect(() => {
    if (!user) return;

    // Modular Syntax: db.collection('users').doc(uid).collection('cart').doc('active')
    // Becomes: doc(db, 'users', uid, 'cart', 'active')
    const docRef = doc(db, 'users', user.uid, 'cart', 'active');

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && !isMerging.current) {
        // const data = docSnap.data();
        // Handle remote update logic if needed
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 2. "Magic Merge" Logic
  useEffect(() => {
    const performMerge = async () => {
        if (!user) return;
        
        isMerging.current = true;

        if (items.length > 0) {
            try {
                const docRef = doc(db, 'users', user.uid, 'cart', 'active');
                await setDoc(docRef, {
                    items: items,
                    updatedAt: new Date().toISOString(),
                    total: total(),
                    itemCount: itemCount()
                }, { merge: true });
            } catch (e) {
                console.error("Merge error", e);
            }
        }
        
        isMerging.current = false;
    };

    performMerge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // 3. Save Cart to Firestore on Change (Debounced)
  useEffect(() => {
    if (!user) return;

    const saveToCloud = async () => {
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
    debouncedSave();

  }, [items, user, total, itemCount]);

  const addToCart = (product: Product, startRect?: DOMRect | null) => {
    addItem(product);
    
    if (startRect && product.images[0]) {
        const imageUrl = typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url;
        triggerFlyAnimation(startRect, imageUrl);
    } else {
        if (!isCartOpen) toggleCart();
    }
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
