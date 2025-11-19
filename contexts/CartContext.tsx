import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { doc, setDoc, getDoc, collection, getDocs, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductDocument, CartItemDocument } from '../firebase-types';
import { useAuth } from '../hooks/useAuth';

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
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

const GUEST_CART_KEY = 'meeh_guest_cart';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [itemAddedCount, setItemAddedCount] = useState(0);
  const { user } = useAuth();

  const syncCartWithFirestore = useCallback(async (localCart: CartItem[]) => {
    if (!user) return;
    const batch = writeBatch(db);
    const cartCollectionRef = collection(db, 'users', user.uid, 'cart');
    
    // Clear remote cart first
    const existingCartSnap = await getDocs(cartCollectionRef);
    existingCartSnap.forEach(doc => batch.delete(doc.ref));

    // Add local items to remote cart
    localCart.forEach(item => {
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
    const localCartRaw = localStorage.getItem(GUEST_CART_KEY);
    const localCart: CartItem[] = localCartRaw ? JSON.parse(localCartRaw) : [];

    if (user) {
      // User is logged in
      if (localCart.length > 0) {
        // Guest cart exists, merge it with Firestore cart
        syncCartWithFirestore(localCart).then(() => {
          localStorage.removeItem(GUEST_CART_KEY);
          loadCartFromFirestore();
        });
      } else {
        // No guest cart, just load from Firestore
        loadCartFromFirestore();
      }
    } else {
      // User is logged out, load from local storage
      setCartItems(localCart);
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
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      let newItems;
      if (existingItem) {
        newItems = prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newItems = [...prevItems, { ...product, quantity }];
      }
      saveCart(newItems);
      return newItems;
    });
    setItemAddedCount(count => count + 1);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    const newItems = cartItems.filter(item => item.id !== productId);
    saveCart(newItems);
  };

  const updateQuantity = (productId: string, quantity: number) => {
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
  const subtotal = cartItems.reduce((total, item) => total + (item.price.amount * item.quantity), 0);
  
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
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};