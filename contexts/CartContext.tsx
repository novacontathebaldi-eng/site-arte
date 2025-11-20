import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { doc, setDoc, getDoc, collection, getDocs, writeBatch, deleteDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ProductDocument, CartItemDocument } from '../firebase-types';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useI18n } from '../hooks/useI18n';

export interface CartItem extends ProductDocument {
  quantity: number;
}

interface GuestCart {
  items: CartItem[];
  lastUpdated: number;
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
const GUEST_CART_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const USER_CART_EXPIRATION = 30 * 24 * 60 * 60 * 1000; // 30 days

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
    
    // This function now acts as an "overwrite" which is what we want after a merge.
    const existingCartSnap = await getDocs(cartCollectionRef);
    existingCartSnap.forEach(doc => batch.delete(doc.ref));

    localCart.forEach(item => {
        if (!item.price) return;
        const docRef = doc(cartCollectionRef, item.id);
        const cartItemData: Partial<CartItemDocument> = {
            productId: item.id,
            quantity: item.quantity,
            addedAt: serverTimestamp(),
        };
        batch.set(docRef, cartItemData);
    });

    await batch.commit();
  }, [user]);

  // Effect to handle user login/logout and cart synchronization
  useEffect(() => {
    setLoading(true);

    if (user) {
        const processUserCart = async () => {
            // 1. Load guest cart from local storage
            const localCartRaw = localStorage.getItem(GUEST_CART_KEY);
            const guestCart: GuestCart | null = localCartRaw ? JSON.parse(localCartRaw) : null;
            const localItems: CartItem[] = guestCart?.items || [];

            // 2. Load remote cart from Firestore
            const cartCollectionRef = collection(db, 'users', user.uid, 'cart');
            const remoteSnapshot = await getDocs(cartCollectionRef);
            const remoteCartMap: Map<string, CartItem> = new Map();

            for (const remoteDoc of remoteSnapshot.docs) {
                const cartItemData = remoteDoc.data() as CartItemDocument;
                
                // Check for expiration
                const addedAt = cartItemData.addedAt;
                if (addedAt && typeof addedAt.toDate === 'function') { // Check if it's a valid Timestamp
                    const itemTimestamp = addedAt.toDate().getTime();
                    if(Date.now() - itemTimestamp > USER_CART_EXPIRATION) {
                        await deleteDoc(remoteDoc.ref);
                        continue; // Skip expired item
                    }
                }
                
                const productDocRef = doc(db, 'products', cartItemData.productId);
                const productSnap = await getDoc(productDocRef);
                if (productSnap.exists()) {
                    const productData = { ...(productSnap.data() as ProductDocument), id: productSnap.id };
                    remoteCartMap.set(productData.id, { ...productData, quantity: cartItemData.quantity });
                }
            }

            // 3. Merge guest cart into remote cart if guest cart exists
            if (localItems.length > 0) {
                localItems.forEach(localItem => {
                    const existingItem = remoteCartMap.get(localItem.id);
                    if (existingItem) {
                        const newQuantity = existingItem.quantity + localItem.quantity;
                        existingItem.quantity = Math.min(newQuantity, existingItem.stock);
                    } else {
                        remoteCartMap.set(localItem.id, localItem);
                    }
                });

                const mergedCart = Array.from(remoteCartMap.values());
                await syncCartWithFirestore(mergedCart); // Overwrite Firestore with merged cart
                setCartItems(mergedCart);
                localStorage.removeItem(GUEST_CART_KEY); // Clean up guest cart
            } else {
                setCartItems(Array.from(remoteCartMap.values()));
            }
            setLoading(false);
        };
        processUserCart();
    } else {
        // Guest user logic
        const localCartRaw = localStorage.getItem(GUEST_CART_KEY);
        if (localCartRaw) {
            const guestCart: GuestCart = JSON.parse(localCartRaw);
            if (Date.now() - guestCart.lastUpdated > GUEST_CART_EXPIRATION) {
                localStorage.removeItem(GUEST_CART_KEY);
                setCartItems([]);
            } else {
                setCartItems(guestCart.items);
            }
        } else {
            setCartItems([]);
        }
        setLoading(false);
    }
  }, [user, syncCartWithFirestore]);


  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    if (user) {
      syncCartWithFirestore(items);
    } else {
      const guestCart: GuestCart = { items, lastUpdated: Date.now() };
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart));
    }
  };
  
  const toggleCart = () => setIsCartOpen(prev => !prev);

  const addToCart = (product: ProductDocument, quantity: number) => {
    if (!product.price || typeof product.price.amount !== 'number') {
        addToast('This product is currently unavailable for purchase.', 'error');
        return;
    }
    if (product.stock === 1 && cartItems.some(item => item.id === product.id)) {
        addToast(t('cart.uniqueItemError'), 'info');
        setIsCartOpen(true);
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
        
        if (newItems !== prevItems) {
            saveCart(newItems);
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
  
  const clearCart = async () => {
    setCartItems([]);
    if (user) {
        const cartCollectionRef = collection(db, 'users', user.uid, 'cart');
        const existingCartSnap = await getDocs(cartCollectionRef);
        const batch = writeBatch(db);
        existingCartSnap.forEach(doc => batch.delete(doc.ref));
        await batch.commit();
    } else {
        localStorage.removeItem(GUEST_CART_KEY);
    }
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
