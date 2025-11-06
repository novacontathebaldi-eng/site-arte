import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './useToast';
import { useTranslation } from './useTranslation';
import { Wishlist } from '../types';
import { getWishlist as apiGetWishlist, updateWishlist as apiUpdateWishlist } from '../services/api';

export const useWishlist = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const { t } = useTranslation();
    const [wishlist, setWishlist] = useState<Wishlist>({ userId: '', items: [] });
    const [loading, setLoading] = useState(true);

    const fetchWishlist = useCallback(async () => {
        if (user) {
            try {
                setLoading(true);
                const userWishlist = await apiGetWishlist(user.uid);
                setWishlist(userWishlist);
            } catch (error) {
                console.error("Failed to fetch wishlist:", error);
            } finally {
                setLoading(false);
            }
        } else {
            setWishlist({ userId: '', items: [] });
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);

    const updateWishlist = async (updatedWishlist: Wishlist) => {
        if (user) {
            try {
                setWishlist(updatedWishlist); // Optimistic update
                await apiUpdateWishlist(user.uid, updatedWishlist);
            } catch (error) {
                console.error("Failed to update wishlist:", error);
                showToast(t('toast.error'), 'error');
                fetchWishlist(); // Revert on error
            }
        }
    };

    const addToWishlist = (productId: string) => {
        const itemExists = wishlist.items.some(item => item.productId === productId);
        if (!itemExists) {
            const updatedItems = [...wishlist.items, { productId, addedAt: new Date().toISOString() }];
            updateWishlist({ ...wishlist, items: updatedItems });
            showToast(t('toast.wishlistAdded'), 'success');
        }
    };

    const removeFromWishlist = (productId: string) => {
        const updatedItems = wishlist.items.filter(item => item.productId !== productId);
        updateWishlist({ ...wishlist, items: updatedItems });
        showToast(t('toast.wishlistRemoved'), 'info');
    };

    const isInWishlist = (productId: string): boolean => {
        return wishlist.items.some(item => item.productId === productId);
    };

    return { wishlist, loading, addToWishlist, removeFromWishlist, isInWishlist };
};
