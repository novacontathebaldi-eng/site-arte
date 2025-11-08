import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Wishlist, WishlistItem } from '../types';

const getWishlistRef = (userId: string) => doc(db, 'wishlists', userId);

export const getWishlist = async (userId: string): Promise<string[]> => {
    try {
        const wishlistRef = getWishlistRef(userId);
        const docSnap = await getDoc(wishlistRef);
        if (docSnap.exists()) {
            const wishlistData = docSnap.data() as Wishlist;
            return wishlistData.items.map(item => item.productId);
        }
        return [];
    } catch (error) {
        console.error("Error fetching wishlist:", error);
        return [];
    }
};

export const addToWishlist = async (userId: string, productId: string): Promise<boolean> => {
    try {
        const wishlistRef = getWishlistRef(userId);
        const docSnap = await getDoc(wishlistRef);

        const newItem: WishlistItem = {
            productId,
            addedAt: serverTimestamp()
        };

        if (docSnap.exists()) {
            // Atomically add a new product ID to the "items" array field.
            await updateDoc(wishlistRef, {
                items: arrayUnion(newItem),
                updatedAt: serverTimestamp()
            });
        } else {
            // If the document doesn't exist, create it.
            await setDoc(wishlistRef, {
                items: [newItem],
                updatedAt: serverTimestamp()
            });
        }
        return true;
    } catch (error) {
        console.error("Error adding to wishlist:", error);
        return false;
    }
};

export const removeFromWishlist = async (userId: string, productId: string): Promise<boolean> => {
    try {
        const wishlistRef = getWishlistRef(userId);
        const docSnap = await getDoc(wishlistRef);
        
        if (docSnap.exists()) {
            const wishlistData = docSnap.data() as Wishlist;
            // Find the exact item object to remove
            const itemToRemove = wishlistData.items.find(item => item.productId === productId);
            if (itemToRemove) {
                 // Atomically remove an item from the "items" array field.
                await updateDoc(wishlistRef, {
                    items: arrayRemove(itemToRemove),
                    updatedAt: serverTimestamp()
                });
            }
        }
        return true;
    } catch (error) {
        console.error("Error removing from wishlist:", error);
        return false;
    }
};