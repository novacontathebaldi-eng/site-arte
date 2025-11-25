'use client';

import React, { useEffect, useRef } from 'react';
import { useAuthStore, useCartStore, useWishlistStore } from '../../store';
import { db } from '../../lib/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const UserDataSync: React.FC = () => {
  const { user } = useAuthStore();
  const { items: cartItems, mergeCart, total: cartTotal, itemCount: cartCount } = useCartStore();
  const { items: wishlistItems, setItems: setWishlistItems } = useWishlistStore();
  
  // Refs for debouncing saves
  const cartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wishlistTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- WISHLIST SYNC ---
  useEffect(() => {
    if (!user) return;

    // 1. Initial Fetch
    const fetchWishlist = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'wishlist', 'active');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.items && Array.isArray(data.items)) {
             const current = useWishlistStore.getState().items;
             // Compare sorted arrays to avoid unnecessary updates
             const sortedCurrent = [...current].sort();
             const sortedNew = [...data.items].sort();
             if (JSON.stringify(sortedCurrent) !== JSON.stringify(sortedNew)) {
                setWishlistItems(data.items);
             }
          }
        }
      } catch (e) {
        console.error("[Sync] Wishlist fetch error", e);
      }
    };
    fetchWishlist();
  }, [user, setWishlistItems]);

  useEffect(() => {
    if (!user) return;

    // 2. Debounced Save
    if (wishlistTimeoutRef.current) clearTimeout(wishlistTimeoutRef.current);
    
    wishlistTimeoutRef.current = setTimeout(async () => {
        try {
            await setDoc(doc(db, 'users', user.uid, 'wishlist', 'active'), { 
                items: wishlistItems,
                updatedAt: new Date().toISOString() 
            }, { merge: true });
        } catch(e) { console.error("[Sync] Wishlist save error", e); }
    }, 2000);

    return () => {
        if (wishlistTimeoutRef.current) clearTimeout(wishlistTimeoutRef.current);
    };
  }, [wishlistItems, user]);

  // --- CART SYNC ---
  useEffect(() => {
    if (!user) return;

    // 1. Initial Fetch
    const fetchCart = async () => {
      try {
        const docRef = doc(db, 'users', user.uid, 'cart', 'active');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.items && Array.isArray(data.items)) {
             mergeCart(data.items);
          }
        }
      } catch (e) {
        console.error("[Sync] Cart fetch error", e);
      }
    };
    fetchCart();
  }, [user, mergeCart]);

  useEffect(() => {
    if (!user) return;

    // 2. Debounced Save
    if (cartTimeoutRef.current) clearTimeout(cartTimeoutRef.current);

    cartTimeoutRef.current = setTimeout(async () => {
        try {
            await setDoc(doc(db, 'users', user.uid, 'cart', 'active'), { 
                items: cartItems,
                total: cartTotal(),
                itemCount: cartCount(),
                updatedAt: new Date().toISOString()
            }, { merge: true });
        } catch(e) { console.error("[Sync] Cart save error", e); }
    }, 2000);

    return () => {
        if (cartTimeoutRef.current) clearTimeout(cartTimeoutRef.current);
    };
  }, [cartItems, user, cartTotal, cartCount]);

  return null;
};