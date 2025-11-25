
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
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
  
  // Logic for Firestore Sync moved to UserDataSync.tsx 
  // to prevent creating a listener for every ProductCard component instance.

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
