import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Wishlist, WishlistItem } from '@/types';

interface WishlistState {
  wishlist: Wishlist;
  isLoading: boolean;
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  loadWishlist: () => Promise<void>;
  syncWishlist: () => Promise<void>;
}

const createEmptyWishlist = (): Wishlist => ({
  items: [],
  updatedAt: new Date()
});

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      wishlist: createEmptyWishlist(),
      isLoading: false,

      isInWishlist: (productId: string) => {
        const { wishlist } = get();
        return wishlist.items.some(item => item.productId === productId);
      },

      loadWishlist: async () => {
        const user = auth.currentUser;
        
        if (user) {
          try {
            const wishlistDoc = await getDoc(doc(db, 'wishlists', user.uid));
            if (wishlistDoc.exists()) {
              const wishlistData = wishlistDoc.data() as Wishlist;
              set({ wishlist: wishlistData });
            }
          } catch (error) {
            console.error('Error loading wishlist from Firestore:', error);
          }
        }
      },

      syncWishlist: async () => {
        const user = auth.currentUser;
        const { wishlist } = get();
        
        if (user) {
          try {
            await setDoc(doc(db, 'wishlists', user.uid), {
              ...wishlist,
              updatedAt: new Date()
            });
          } catch (error) {
            console.error('Error syncing wishlist:', error);
          }
        }
      },

      addToWishlist: async (productId: string) => {
        const { wishlist, isInWishlist } = get();
        
        if (isInWishlist(productId)) {
          return;
        }

        set({ isLoading: true });
        
        try {
          const newItem: WishlistItem = {
            productId,
            addedAt: new Date()
          };
          
          const newWishlist: Wishlist = {
            ...wishlist,
            items: [...wishlist.items, newItem],
            updatedAt: new Date()
          };
          
          set({ wishlist: newWishlist, isLoading: false });
          
          // Sync with Firestore if user is logged in
          await get().syncWishlist();
        } catch (error) {
          set({ isLoading: false });
          console.error('Error adding to wishlist:', error);
          throw error;
        }
      },

      removeFromWishlist: async (productId: string) => {
        const { wishlist } = get();
        
        set({ isLoading: true });
        
        try {
          const newItems = wishlist.items.filter(item => item.productId !== productId);
          
          const newWishlist: Wishlist = {
            ...wishlist,
            items: newItems,
            updatedAt: new Date()
          };
          
          set({ wishlist: newWishlist, isLoading: false });
          
          // Sync with Firestore if user is logged in
          await get().syncWishlist();
        } catch (error) {
          set({ isLoading: false });
          console.error('Error removing from wishlist:', error);
          throw error;
        }
      },

      clearWishlist: async () => {
        const newWishlist = createEmptyWishlist();
        
        set({ wishlist: newWishlist });
        
        // Sync with Firestore if user is logged in
        await get().syncWishlist();
      }
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({
        wishlist: state.wishlist
      })
    }
  )
);