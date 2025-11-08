import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CartItem, Address, Order, SupportedLanguage } from '../types';

const ordersCollection = collection(db, 'orders');

export const createOrder = async (
    userId: string, 
    cart: CartItem[], 
    shippingAddress: Address, 
    totals: { subtotalCents: number; shippingCents: number; totalCents: number; discountCents: number; taxCents: number },
    language: SupportedLanguage,
): Promise<string | null> => {
    try {
        const orderNumber = `ART-${new Date().getFullYear()}${Date.now().toString().slice(-6)}`;
        
        const orderData: Omit<Order, 'id'> = {
            number: orderNumber,
            userId,
            status: 'created',
            items: cart.map(item => ({
                productId: item.id,
                qty: item.quantity,
                priceCents: item.priceCents,
                currency: 'EUR',
                title: item.translations[language]?.title || item.translations.en.title,
                image_thumb: item.cover_thumb,
            })),
            shippingAddress: {
                name: shippingAddress.name,
                line1: shippingAddress.line1,
                line2: shippingAddress.line2 || '',
                city: shippingAddress.city,
                postalCode: shippingAddress.postalCode,
                country: shippingAddress.country,
                phone: shippingAddress.phone,
            },
            totals: {
                ...totals,
                currency: 'EUR',
            },
            timeline: [
                {
                    status: 'created',
                    at: serverTimestamp(),
                    by: userId
                }
            ],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(ordersCollection, orderData);
        return docRef.id;

    } catch (error) {
        console.error("Error creating order:", error);
        return null;
    }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
    try {
        const q = query(ordersCollection, where("userId", "==", userId), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: data.createdAt?.toDate(),
            } as Order;
        });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return [];
    }
};

export const getOrderById = async (orderId: string, userId: string): Promise<Order | null> => {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(orderRef);

        if (docSnap.exists() && docSnap.data().userId === userId) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                createdAt: data.createdAt?.toDate(),
            } as Order;
        } else {
            console.log("No such document or access denied!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
};