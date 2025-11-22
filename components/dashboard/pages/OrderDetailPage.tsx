import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { OrderDocument } from '../../../firebase-types';
import Spinner from '../../common/Spinner';
import { useI18n } from '../../../hooks/useI18n';
import Button from '../../common/Button';
import { useToast } from '../../../hooks/useToast';

interface OrderDetailPageProps {
    orderId: string;
}

const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ orderId }) => {
    const [order, setOrder] = useState<OrderDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
    const { t, language } = useI18n();
    const { addToast } = useToast();

    const fetchOrder = useCallback(async () => {
        if (!orderId) return;
        setLoading(true);
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setOrder({ id: docSnap.id, ...docSnap.data() } as OrderDocument);
        }
        setLoading(false);
    }, [orderId]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleCompletePayment = async () => {
        if (!order) return;
        setIsUpdatingPayment(true);
        try {
            const orderRef = doc(db, 'orders', order.id);
            await updateDoc(orderRef, {
                paymentStatus: 'paid',
                status: 'confirmed',
                updatedAt: serverTimestamp(),
                statusHistory: arrayUnion({
                    status: 'confirmed',
                    timestamp: serverTimestamp(),
                    note: 'Payment completed by customer.',
                }),
            });
            addToast(t('checkout.paymentUpdateSuccess'), 'success');
            fetchOrder(); // Re-fetch to show updated status
        } catch (error) {
            console.error("Error updating payment status:", error);
            addToast(t('checkout.paymentUpdateError'), 'error');
        } finally {
            setIsUpdatingPayment(false);
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    if (!order) {
        return <div>Order not found.</div>;
    }
    
    const isPaymentPending = order.paymentStatus === 'pending';

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold mb-2">Order #{order.orderNumber}</h1>
            <p className="text-sm text-brand-black/60 mb-6">Placed on {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</p>

            {isPaymentPending && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 mb-6 rounded-r-lg" role="alert">
                    <p className="font-bold">{t('order.paymentPending')}</p>
                    <p>{t('order.paymentPendingInstructions')}</p>
                    <Button onClick={handleCompletePayment} disabled={isUpdatingPayment} className="mt-4">
                        {isUpdatingPayment ? <Spinner size="sm" /> : t('checkout.completePayment')}
                    </Button>
                </div>
            )}
            
            <div className="divide-y divide-black/10">
                {order.items.map(item => (
                    <div key={item.productId} className="flex items-center py-4">
                        <img src={item.snapshot.imageUrl} alt={item.snapshot.title} className="w-16 h-16 rounded object-cover"/>
                        <div className="ml-4 flex-grow">
                            <p className="font-semibold">{item.snapshot.title}</p>
                            <p className="text-sm text-brand-black/60">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">€{(item.snapshot.price * item.quantity / 100).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            
             <div className="mt-6 border-t pt-6 space-y-2 text-sm text-right">
                <p>Subtotal: €{(order.pricing.subtotal / 100).toFixed(2)}</p>
                <p>Shipping: €{(order.pricing.shipping / 100).toFixed(2)}</p>
                <p className="font-bold text-base">Total: €{(order.pricing.total / 100).toFixed(2)}</p>
            </div>
        </div>
    );
};

export default OrderDetailPage;