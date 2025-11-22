import { useEffect } from 'react';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { debounce } from '../lib/utils';

export const useWishlist = () => {
  const { items, toggleItem, hasItem, setItems } = useWishlistStore();
  const { user } = useAuthStore();

  // Sync on Load
  useEffect(() => {
    if (!user) return;

    const fetchWishlist = async () => {
        try {
            const docRef = doc(db, 'users', user.uid, 'wishlist', 'active');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setItems(docSnap.data().items || []);
            }
        } catch (e) {
            console.error("Fetch wishlist error", e);
        }
    };
    fetchWishlist();
  }, [user, setItems]);

  // Sync on Change
  useEffect(() => {
    if (!user) return;

    const saveWishlist = async () => {
        try {
            const docRef = doc(db, 'users', user.uid, 'wishlist', 'active');
            await setDoc(docRef, { items }, { merge: true });
        } catch (e) {
            console.error("Save wishlist error", e);
        }
    };

    const debouncedSave = debounce(saveWishlist, 1000);
    debouncedSave();
  }, [items, user]);

  return {
    items,
    toggleWishlist: toggleItem,
    isInWishlist: hasItem
  };
};