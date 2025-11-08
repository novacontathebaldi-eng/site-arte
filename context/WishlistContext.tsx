import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import * as wishlistService from '../services/wishlistService';
import { serverTimestamp } from 'firebase/firestore';

interface WishlistContextType {
  wishlist: string[]; // array of product IDs
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        setLoading(true);
        const userWishlist = await wishlistService.getWishlist(user.uid);
        setWishlist(userWishlist);
        setLoading(false);
      } else {
        // Clear wishlist on logout
        setWishlist([]);
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const addToWishlist = async (productId: string) => {
    if (!user) return;
    setWishlist(prev => [...prev, productId]); // Optimistic update
    await wishlistService.addToWishlist(user.uid, productId);
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;
    setWishlist(prev => prev.filter(id => id !== productId)); // Optimistic update
    await wishlistService.removeFromWishlist(user.uid, productId);
  };

  const isInWishlist = (productId: string) => {
    return wishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};