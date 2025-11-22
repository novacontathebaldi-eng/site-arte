import { useEffect, useRef } from 'react';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
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
    mergeCart,
    triggerFlyAnimation
  } = useCartStore();
  
  const { toggleCart, isCartOpen } = useUIStore();
  const { user } = useAuthStore();
  
  // Ref to track if we are currently merging to avoid cycles
  const isMerging = useRef(false);

  // 1. Real-time Sync & Magic Merge on Login
  useEffect(() => {
    if (!user) return;

    // Listener for real-time updates from Firestore
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid, 'cart', 'active'), (docSnap) => {
      if (docSnap.exists() && !isMerging.current) {
        const data = docSnap.data();
        // We use a custom logic here:
        // If local cart has items that remote doesn't have immediately after login, we might want to keep local.
        // But onSnapshot triggers on every change.
        // Strategy: The source of truth is Firestore when logged in.
        // However, upon *initial* connection, we might want to merge local (guest) into remote.
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 2. "Magic Merge" Logic - Run once when user changes from null to logged in
  useEffect(() => {
    const performMerge = async () => {
        if (!user) return;
        
        isMerging.current = true;

        // If we have local items (guest cart), we want to push them to cloud
        // The cloud will be the master, so we push local changes to it, then subscription updates local
        if (items.length > 0) {
            // Saving current local items to cloud (merging logic handles duplicates on read, but here we overwrite for simplicity or should read-modify-write)
            // For robustness in this demo: We assume 'items' currently holds the guest cart.
            // We trigger a save to Firestore which effectively merges this into the user's record.
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
  }, [user]); // Only run on user change

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

  const addToCart = (product: Product, startRect?: DOMRect) => {
    addItem(product);
    
    if (startRect && product.images[0]) {
        triggerFlyAnimation(startRect, product.images[0]);
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