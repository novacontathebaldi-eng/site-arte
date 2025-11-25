
import { useWishlistStore } from '../store/wishlistStore';

export const useWishlist = () => {
  const { items, toggleItem, hasItem } = useWishlistStore();
  
  // Logic moved to UserDataSync.tsx to prevent multiple listeners
  
  return {
    items,
    toggleWishlist: toggleItem,
    isInWishlist: hasItem
  };
};
