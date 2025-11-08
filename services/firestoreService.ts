import { collection, getDocs, query, where, limit, getDoc, doc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, Address } from '../types';

const productsCollection = collection(db, 'products');

const mapDocToProduct = (doc: any): Product => {
    const data = doc.data();
    // Bridge the gap between potential old data structures in Firestore and the new strict types
    const images = data.images || [];
    const cover_thumb = data.cover_thumb || (images.length > 0 ? images[0].thumbnail : '');
    const cover_original = data.cover_original || (images.length > 0 ? images[0].url : '');
    const gallery = data.gallery || images.map((img: any) => ({ original: img.url, thumb: img.thumbnail }));
    const priceCents = data.priceCents ?? (data.price?.amount ? data.price.amount * 100 : 0);

    return {
        ...data,
        id: doc.id,
        priceCents,
        cover_thumb,
        cover_original,
        gallery,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        publishedAt: data.publishedAt?.toDate(),
    } as Product;
}

export const getProducts = async (filters?: { category?: string }): Promise<Product[]> => {
  try {
    let q = query(productsCollection, where("publishedAt", "!=", null));
    
    if (filters?.category && filters.category !== 'all_categories') {
        const categoryKey = filters.category.endsWith('s') ? filters.category.slice(0, -1) : filters.category;
        q = query(q, where("category", "==", categoryKey));
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDocToProduct);
  } catch (error) {
    console.error("Error fetching products: ", error);
    return [];
  }
};

export const getProductsByIds = async (ids: string[]): Promise<Product[]> => {
    if (ids.length === 0) {
        return [];
    }
    try {
        const q = query(productsCollection, where('__name__', 'in', ids));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(mapDocToProduct);
    } catch (error) {
        console.error("Error fetching products by ids: ", error);
        return [];
    }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const q = query(productsCollection, where("featured", "==", true), where("publishedAt", "!=", null), limit(6));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(mapDocToProduct);
  } catch (error) {
    console.error("Error fetching featured products: ", error);
    return [];
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
    try {
        const q = query(productsCollection, where("slug", "==", slug), limit(1));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            return undefined;
        }
        return mapDocToProduct(querySnapshot.docs[0]);
    } catch (error) {
        console.error("Error fetching product by slug: ", error);
        return undefined;
    }
};

// --- Address Management ---

const getAddressesCollection = (userId: string) => collection(db, `users/${userId}/addresses`);

export const getAddresses = async (userId: string): Promise<Address[]> => {
    try {
        const addressesRef = getAddressesCollection(userId);
        const querySnapshot = await getDocs(addressesRef);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return { 
                id: doc.id,
                userId: userId,
                name: data.recipientName || data.name,
                line1: data.addressLine1 || data.line1,
                ...data
            } as Address
        });
    } catch (error) {
        console.error("Error fetching addresses:", error);
        return [];
    }
};

export const addAddress = async (userId: string, addressData: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string | null> => {
    try {
        const addressesRef = getAddressesCollection(userId);
        if (addressData.isDefault) {
            // Unset other defaults
            const batch = writeBatch(db);
            const q = query(addressesRef, where("isDefault", "==", true));
            const defaultsSnapshot = await getDocs(q);
            defaultsSnapshot.forEach(doc => {
                batch.update(doc.ref, { isDefault: false });
            });
            await batch.commit();
        }
        const docRef = await addDoc(addressesRef, {...addressData, userId});
        return docRef.id;
    } catch (error) {
        console.error("Error adding address:", error);
        return null;
    }
};

export const updateAddress = async (userId: string, addressId: string, addressData: Partial<Omit<Address, 'id' | 'userId'>>): Promise<boolean> => {
    try {
        const addressRef = doc(db, `users/${userId}/addresses`, addressId);
        await updateDoc(addressRef, addressData);
        return true;
    } catch (error) {
        console.error("Error updating address:", error);
        return false;
    }
};


export const deleteAddress = async (userId: string, addressId: string): Promise<boolean> => {
    try {
        const addressRef = doc(db, `users/${userId}/addresses`, addressId);
        await deleteDoc(addressRef);
        return true;
    } catch (error) {
        console.error("Error deleting address:", error);
        return false;
    }
};