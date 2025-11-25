
'use client';

import React, { useEffect, useMemo } from 'react';
import { useAuthStore, useCartStore, useWishlistStore } from '../../store';
import { db } from '../../lib/firebase/config';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { debounce } from '../../lib/utils';
import { CartItem } from '../../types';

export const UserDataSync: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    items: cartItems, 
    mergeCart, 
    total: cartTotal, 
    itemCount: cartCount 
  } = useCartStore();
  const { 
    items: wishlistItems, 
    setItems: setWishlistItems 
  } = useWishlistStore();

  // --- WISHLIST SYNC ---
  
  // 1. Fetch Wishlist on Login
  useEffect(() => {
    if (!user) return;

    const fetchWishlist = async () => {
        try {
            const docRef = doc(db, 'users', user.uid, 'wishlist', 'active');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data() as { items?: string[] } | undefined;
                // Only update if data is different to avoid loops
                if (data?.items && JSON.stringify(data.items) !== JSON.stringify(wishlistItems)) {
                    setWishlistItems(data.items);
                }
            }
        } catch (e) {
            console.error("[Sync] Fetch wishlist error", e);
        }
    };
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  // 2. Save Wishlist on Change (Debounced)
  const debouncedSaveWishlist = useMemo(
      () => debounce(async (uid: string, items: string[]) => {
          try {
              const docRef = doc(db, 'users', uid, 'wishlist', 'active');
              await setDoc(docRef, { items }, { merge: true });
          } catch (e) {
              console.error("[Sync] Save wishlist error", e);
          }
      }, 2000),
      []
  );

  useEffect(() => {
      if (user) {
          debouncedSaveWishlist(user.uid, wishlistItems);
      }
  }, [wishlistItems, user, debouncedSaveWishlist]);


  // --- CART SYNC ---

  // 1. Real-time Cart Sync & Merge
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'users', user.uid, 'cart', 'active');
    
    // Listen to cloud changes
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.items) {
             // Optional: Intelligent merge strategy could go here
             // For now, we assume local changes are pushed, and we assume 
             // this listener is mostly for cross-device sync. 
             // To prevent loops, we could check timestamps or deep equality.
        }
      }
    }, (error) => {
        console.error("[Sync] Cart listener error", error);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Save Cart on Change (Debounced)
  const debouncedSaveCart = useMemo(
      () => debounce(async (uid: string, items: CartItem[], total: number, count: number) => {
          try {
              const docRef = doc(db, 'users', uid, 'cart', 'active');
              await setDoc(docRef, {
                  items,
                  updatedAt: new Date().toISOString(),
                  total,
                  itemCount: count
              }, { merge: true });
          } catch (error) {
              console.error("[Sync] Failed to save cart:", error);
          }
      }, 1500),
      []
  );

  useEffect(() => {
    if (user) {
        debouncedSaveCart(user.uid, cartItems, cartTotal(), cartCount());
    }
  }, [cartItems, user, cartTotal, cartCount, debouncedSaveCart]);

  return null; // This component renders nothing, just handles logic
};
