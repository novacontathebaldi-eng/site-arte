import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { collection, doc, setDoc, deleteDoc, onSnapshot, Unsubscribe, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductDocument, WishlistItemDocument } from '../firebase-types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

interface WishlistContextType {
  wishlistItems: ProductDocument[];
  addToWishlist: (product: ProductDocument) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<ProductDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, openAuthModal } = useAuth();
  const { addToast } = useToast();
  
  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    setLoading(true);
    if (user) {
      const wishlistColRef = collection(db, 'users', user.uid, 'wishlist');
      unsubscribe = onSnapshot(wishlistColRef, (snapshot) => {
        const items = snapshot.docs.map(doc => {
            const data = doc.data() as WishlistItemDocument;
            return {
                ...data.productSnapshot,
                id: doc.id,
            } as ProductDocument
        });
        setWishlistItems(items);
        setLoading(false);
      }, (error) => {
          console.error("Wishlist snapshot error:", error);
          setLoading(false);
      });
    } else {
      setWishlistItems([]);
      setLoading(false);
    }
    return () => unsubscribe && unsubscribe();
  }, [user]);

  const addToWishlist = async (product: ProductDocument) => {
    if (!user) {
      addToast('Please log in to save items to your wishlist.', 'info');
      openAuthModal();
      return;
    }
    try {
      const wishlistItemRef = doc(db, 'users', user.uid, 'wishlist', product.id);
      const itemData: WishlistItemDocument = {
        productId: product.id,
        addedAt: serverTimestamp() as any,
        productSnapshot: {
          translations: product.translations,
          price: product.price,
          images: product.images ? product.images.slice(0,1) : [],
          category: product.category,
        }
      }
      await setDoc(wishlistItemRef, itemData);
    } catch (error) {
      console.error("Error adding to wishlist: ", error);
      addToast('Failed to add to wishlist.', 'error');
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    try {
      const wishlistItemRef = doc(db, 'users', user.uid, 'wishlist', productId);
      await deleteDoc(wishlistItemRef);
    } catch (error) {
      console.error("Error removing from wishlist: ", error);
      addToast('Failed to remove from wishlist.', 'error');
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistItems.some(item => item.id === productId);
  };
  
  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loading,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};