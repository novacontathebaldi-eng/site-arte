
import { useEffect } from 'react';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
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
            const docRef = db.collection('users').doc(user.uid).collection('wishlist').doc('active');
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                setItems(docSnap.data()?.items || []);
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
            const docRef = db.collection('users').doc(user.uid).collection('wishlist').doc('active');
            await docRef.set({ items }, { merge: true });
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
