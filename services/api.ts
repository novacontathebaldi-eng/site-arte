
import { firestore } from '../lib/firebase';
import { collection, getDocs, getDoc, doc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { Product, Order, Address, AddressWithId, Wishlist, DashboardStats, CartItem } from '../types';

const API_DELAY = 0; // No more artificial delay

// Helper function to convert Firestore doc to a typed object with ID
const docToData = <T>(docSnap: any): T => {
    if (!docSnap.exists()) {
        throw new Error("Document does not exist");
    }
    const data = docSnap.data();
    return {
        ...data,
        id: docSnap.id,
    } as T;
};

const docsToData = <T>(querySnapshot: any): T[] => {
    return querySnapshot.docs.map((doc: any) => ({ ...doc.data(), id: doc.id })) as T[];
};


export const getProducts = async (): Promise<Product[]> => {
  const productsCol = collection(firestore, 'products');
  // Simple query for now, can be expanded with isActive etc.
  const q = query(productsCol, where("isActive", "==", true));
  const productSnapshot = await getDocs(q);
  return docsToData<Product>(productSnapshot);
};

export const getProductBySlug = async (slug: string): Promise<Product | undefined> => {
  const q = query(collection(firestore, "products"), where("slug", "==", slug), where("isActive", "==", true));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return undefined;
  }
  return docToData<Product>(querySnapshot.docs[0]);
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
    const q = query(collection(firestore, "products"), where("featured", "==", true), where("isActive", "==", true));
    const querySnapshot = await getDocs(q);
    return docsToData<Product>(querySnapshot);
};

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    const q = query(collection(firestore, "orders"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    return docsToData<Order>(querySnapshot);
};

export const getOrderById = async (orderId: string): Promise<Order | undefined> => {
    const orderDoc = await getDoc(doc(firestore, "orders", orderId));
    if (!orderDoc.exists()) {
        return undefined;
    }
    return docToData<Order>(orderDoc);
};

// --- Funções da API para Endereços ---

export const getAddresses = async (userId: string): Promise<AddressWithId[]> => {
  const q = query(collection(firestore, `users/${userId}/addresses`));
  const snapshot = await getDocs(q);
  return docsToData<AddressWithId>(snapshot);
};

export const addAddress = async (userId: string, address: Address): Promise<AddressWithId> => {
  const addressesCol = collection(firestore, `users/${userId}/addresses`);
  const docRef = await addDoc(addressesCol, {
      ...address,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
  });
  return { ...address, id: docRef.id };
};

export const updateAddress = async (userId: string, addressId: string, address: Address): Promise<void> => {
    // This is a simplified version. A real implementation should not update the entire doc.
    const addressDoc = doc(firestore, `users/${userId}/addresses`, addressId);
    await addDoc(addressDoc, { ...address, updatedAt: serverTimestamp() }, { merge: true });
};

export const deleteAddress = async (userId: string, addressId: string): Promise<void> => {
    const addressDoc = doc(firestore, `users/${userId}/addresses`, addressId);
    // await deleteDoc(addressDoc);
};

// --- Funções da API para Wishlist ---
export const getWishlist = async (userId: string): Promise<Wishlist> => {
    const wishlistDoc = await getDoc(doc(firestore, "wishlists", userId));
    if (!wishlistDoc.exists()) {
        return { userId, items: [] };
    }
    return wishlistDoc.data() as Wishlist;
};

export const updateWishlist = async (userId: string, wishlist: Wishlist): Promise<void> => {
    const wishlistDoc = doc(firestore, "wishlists", userId);
    // await setDoc(wishlistDoc, wishlist);
};


// --- Funções da API para Dashboard ---
export const getUserDashboardStats = async (userId: string): Promise<DashboardStats> => {
    // This should be implemented with more robust logic, maybe summary docs or functions
    const orders = await getOrdersByUserId(userId);
    const wishlist = await getWishlist(userId);
    
    const totalSpent = orders.reduce((acc, order) => acc + (order.totals.totalCents / 100), 0);

    return {
        totalOrders: orders.length,
        totalSpent: totalSpent,
        wishlistCount: wishlist.items.length
    };
}

// --- Funções da API para Checkout ---
export const placeOrder = async (userId: string, items: CartItem[], shippingAddress: Address): Promise<{ orderId: string }> => {
    // This is a simplified mock of creating an order. A real implementation would be more complex.
    const newOrderRef = await addDoc(collection(firestore, "orders"), {
        userId,
        // ... more order data
        createdAt: serverTimestamp()
    });
    return { orderId: newOrderRef.id };
};
