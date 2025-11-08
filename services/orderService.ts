import { collection, addDoc, getDocs, query, where, serverTimestamp, orderBy, getDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CartItem, Address, Order } from '../types';
import { useTranslation } from '../hooks/useTranslation';

const ordersCollection = collection(db, 'orders');

export const createOrder = async (
    userId: string, 
    cart: CartItem[], 
    shippingAddress: Address, 
    pricing: { subtotal: number; shipping: number; total: number },
    language: string,
): Promise<string | null> => {
    try {
        const orderNumber = `#${Date.now().toString().slice(-6)}`;
        
        const orderData = {
            orderNumber,
            userId,
            status: 'pending',
            items: cart.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                subtotal: item.price.amount * item.quantity,
                productSnapshot: {
                    title: item.translations[language as keyof typeof item.translations]?.title || item.translations.en.title,
                    image: item.images[0].thumbnail,
                    price: item.price.amount,
                },
            })),
            shippingAddress: {
                recipientName: shippingAddress.recipientName,
                addressLine1: shippingAddress.addressLine1,
                addressLine2: shippingAddress.addressLine2 || '',
                city: shippingAddress.city,
                postalCode: shippingAddress.postalCode,
                country: shippingAddress.country,
                phone: shippingAddress.phone,
            },
            pricing,
            createdAt: serverTimestamp(),
            language,
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
            // Doc doesn't exist or doesn't belong to the user
            console.log("No such document or access denied!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
};