import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { doc, setDoc, getDoc, collection, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductDocument, CartItemDocument } from '../firebase-types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useI18n } from '../hooks/useI18n';

export interface CartItem extends ProductDocument {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: ProductDocument, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;
  totalItems: number;
  subtotal: number;
  itemAddedCount: number;
  loading: boolean;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'meeh_guest_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [itemAddedCount, setItemAddedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToast } = useToast();
  const { t } = useI18n();

  const syncCartWithFirestore = useCallback(async (localCart: CartItem[]) => {
    if (!user) return;
    const batch = writeBatch(db);
    const cartCollectionRef = collection(db, 'users', user.uid, 'cart');
    
    // Clear remote cart first
    const existingCartSnap = await getDocs(cartCollectionRef);
    existingCartSnap.forEach(doc => batch.delete(doc.ref));

    // Add local items to remote cart
    localCart.forEach(item => {
        if (!item.price) return; // Do not sync items without a price
        const docRef = doc(cartCollectionRef, item.id);
        const cartItemData: CartItemDocument = {
            productId: item.id,
            quantity: item.quantity,
            addedAt: new Date() as any, // Firestore will convert to Timestamp
            productSnapshot: { // Store a lightweight snapshot
                translations: item.translations,
                price: item.price,
                images: item.images,
            }
        };
        batch.set(docRef, cartItemData);
    });

    await batch.commit();
  }, [user]);

  const loadCartFromFirestore = useCallback(async () => {
    if (!user) return;
    const cartCollectionRef = collection(db, 'users', user.uid, 'cart');
    const querySnapshot = await getDocs(cartCollectionRef);
    const firestoreCartItems: CartItem[] = [];

    for (const doc of querySnapshot.docs) {
      const cartItemData = doc.data() as CartItemDocument;
      const productDocRef = doc(db, 'products', cartItemData.productId);
      const productSnap = await getDoc(productDocRef);
      if (productSnap.exists()) {
        firestoreCartItems.push({
          ...(productSnap.data() as ProductDocument),
          id: productSnap.id,
          quantity: cartItemData.quantity,
        });
      }
    }
    setCartItems(firestoreCartItems);
  }, [user]);
  
  // Effect to handle user login/logout and cart synchronization
  useEffect(() => {
    setLoading(true);
    const localCartRaw = localStorage.getItem(GUEST_CART_KEY);
    const localCart: CartItem[] = localCartRaw ? JSON.parse(localCartRaw) : [];

    if (user) {
        const processUserCart = async () => {
            if (localCart.length > 0) {
                await syncCartWithFirestore(localCart);
                localStorage.removeItem(GUEST_CART_KEY);
            }
            await loadCartFromFirestore();
            setLoading(false);
        };
        processUserCart();
    } else {
        setCartItems(localCart);
        setLoading(false);
    }
  }, [user, loadCartFromFirestore, syncCartWithFirestore]);


  const saveCart = (items: CartItem[]) => {
    if (user) {
      // Save to Firestore (can be optimized to not save on every change)
      syncCartWithFirestore(items);
    } else {
      // Save to local storage for guests
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    }
    setCartItems(items);
  };
  
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const addToCart = (product: ProductDocument, quantity: number) => {
    // Data validation guard
    if (!product.price || typeof product.price.amount !== 'number') {
        addToast('This product is currently unavailable for purchase.', 'error');
        return;
    }

    // Check if the item is unique and already in cart
    if (product.stock === 1 && cartItems.some(item => item.id === product.id)) {
        addToast(t('cart.uniqueItemError'), 'info');
        setIsCartOpen(true); // Still open the cart to show it's there
        return;
    }

    setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        let newItems;
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (newQuantity > product.stock) {
                addToast(t('cart.stockError'), "error");
                return prevItems;
            }
            newItems = prevItems.map(item =>
                item.id === product.id ? { ...item, quantity: newQuantity } : item
            );
        } else {
            if (quantity > product.stock) {
                addToast(t('cart.stockError'), "error");
                return prevItems;
            }
            newItems = [...prevItems, { ...product, quantity }];
        }
        
        saveCart(newItems);
        // Only trigger animations/open cart if a change was actually made
        if (newItems !== prevItems) {
            setItemAddedCount(c => c + 1);
            setIsCartOpen(true);
        }
        return newItems;
    });
};

  const removeFromCart = (productId: string) => {
    const newItems = cartItems.filter(item => item.id !== productId);
    saveCart(newItems);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const itemToUpdate = cartItems.find(item => item.id === productId);
    if (!itemToUpdate) return;
    
    if (quantity > itemToUpdate.stock) {
        addToast(t('cart.stockError'), "error");
        return;
    }

    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      const newItems = cartItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      saveCart(newItems);
    }
  };
  
  const clearCart = () => {
    saveCart([]);
  };

  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => {
    if (item.price && typeof item.price.amount === 'number') {
      return total + item.price.amount * item.quantity;
    }
    return total;
  }, 0);
  
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    toggleCart,
    totalItems,
    subtotal,
    itemAddedCount,
    loading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};