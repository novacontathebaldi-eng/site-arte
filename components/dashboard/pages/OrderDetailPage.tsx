import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { OrderDocument } from '../../../firebase-types';
import Spinner from '../../common/Spinner';
import { useI18n } from '../../../hooks/useI18n';

interface OrderDetailPageProps {
    orderId: string;
}

const OrderDetailPage: React.FC<OrderDetailPageProps> = ({ orderId }) => {
    const [order, setOrder] = useState<OrderDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const { t, language } = useI18n();

    useEffect(() => {
        if (orderId) {
            const fetchOrder = async () => {
                setLoading(true);
                const docRef = doc(db, 'orders', orderId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() } as OrderDocument);
                }
                setLoading(false);
            };
            fetchOrder();
        } else {
            setLoading(false);
        }
    }, [orderId]);
    
    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    if (!order) {
        return <div>Order not found.</div>;
    }
    
    const isPixPending = order.paymentMethod === 'pix' && order.paymentStatus === 'pending';

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold mb-2">Order #{order.id.slice(0, 8)}</h1>
            <p className="text-sm text-brand-black/60 mb-6">Placed on {new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</p>

            {isPixPending && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-r-lg" role="alert">
                    <p className="font-bold">{t('order.paymentPending')}</p>
                    <p>{t('order.paymentPendingInstructions')}</p>
                     <div className="mt-4 text-center p-4 border rounded-md bg-white">
                        <p className="text-sm text-brand-black/70 mb-4">{t('checkout.pixInstructions')}</p>
                        <img src={order.pixQrCode} alt="PIX QR Code" className="w-48 h-48 mx-auto" />
                        <p className="text-xs font-mono break-all mt-2 bg-gray-200 p-2 rounded">{order.pixCopiaECola}</p>
                    </div>
                </div>
            )}
            
            <div className="divide-y divide-black/10">
                {order.items.map(item => (
                    <div key={item.id} className="flex items-center py-4">
                        <img src={item.images[0]?.thumbnailUrl} alt={item.translations[language]?.title} className="w-16 h-16 rounded object-cover"/>
                        <div className="ml-4 flex-grow">
                            <p className="font-semibold">{item.translations[language]?.title}</p>
                            <p className="text-sm text-brand-black/60">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">€{(item.price.amount * item.quantity / 100).toFixed(2)}</p>
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