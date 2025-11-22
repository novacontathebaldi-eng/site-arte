import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { OrderDocument, OrderStatus } from '../../../firebase-types';
import Spinner from '../../common/Spinner';
import { useI18n } from '../../../hooks/useI18n';
import Button from '../../common/Button';
import Input from '../../common/Input';
import { useToast } from '../../../hooks/useToast';

interface OrderDetailAdminPageProps {
  orderId: string;
}

const OrderDetailAdminPage: React.FC<OrderDetailAdminPageProps> = ({ orderId }) => {
    const [order, setOrder] = useState<OrderDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<OrderStatus>('pending');
    const [carrier, setCarrier] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    
    const { t, language } = useI18n();
    const { addToast } = useToast();

    const fetchOrder = useCallback(async () => {
        setLoading(true);
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const orderData = { id: docSnap.id, ...docSnap.data() } as OrderDocument;
            setOrder(orderData);
            setStatus(orderData.status);
            setCarrier(orderData.tracking?.carrier || '');
            setTrackingNumber(orderData.tracking?.trackingNumber || '');
        }
        setLoading(false);
    }, [orderId]);

    useEffect(() => {
        if (orderId) {
            fetchOrder();
        }
    }, [orderId, fetchOrder]);
    
    const handleStatusUpdate = async () => {
        const docRef = doc(db, 'orders', orderId);
        try {
            await updateDoc(docRef, {
                status: status,
                statusHistory: arrayUnion({
                    status: status,
                    timestamp: serverTimestamp(),
                    note: 'Status updated by admin'
                })
            });
            addToast(t('admin.orders.statusUpdated'), 'success');
            fetchOrder();
        } catch (error) {
            addToast('Failed to update status', 'error');
        }
    };
    
    const handleTrackingUpdate = async () => {
        const docRef = doc(db, 'orders', orderId);
        try {
            await updateDoc(docRef, {
                'tracking.carrier': carrier,
                'tracking.trackingNumber': trackingNumber,
            });
            addToast(t('admin.orders.trackingAdded'), 'success');
            fetchOrder();
        } catch (error) {
             addToast('Failed to add tracking', 'error');
        }
    }
    
    const getPaymentStatusColor = (status: string) => {
        switch(status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': case 'failed': return 'bg-yellow-100 text-yellow-800';
            case 'refunded': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
    if (!order) return <p>Order not found.</p>;

    const Card: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-bold font-serif mb-4">{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card title={`${t('admin.orders.detailsTitle')} ${order.orderNumber}`}>
                     <div className="flex items-center gap-4 mb-4">
                        <div>
                            <span className="text-sm font-medium">Order Status:</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full font-medium capitalize bg-blue-100 text-blue-800`}>
                                {order.status}
                            </span>
                        </div>
                         <div>
                            <span className="text-sm font-medium">Payment Status:</span>
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full font-medium capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>
                                {order.paymentStatus}
                            </span>
                        </div>
                    </div>
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
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card title={t('admin.orders.shippingAddress')}>
                        <p>{order.shippingAddress.recipientName}</p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    </Card>
                    <Card title={t('admin.orders.billingAddress')}>
                        <p>{order.billingAddress.recipientName}</p>
                        <p>{order.billingAddress.addressLine1}</p>
                        <p>{order.billingAddress.city}, {order.billingAddress.postalCode}</p>
                    </Card>
                </div>
            </div>
            <div className="space-y-8">
                <Card title={t('admin.orders.customerInfo')}>
                    <p className="font-semibold">{order.shippingAddress.recipientName}</p>
                    <a href={`mailto:${order.user?.email}`} className="text-sm text-brand-gold hover:underline">{order.user?.email || 'No email provided'}</a>
                </Card>
                <Card title={t('admin.orders.updateStatus')}>
                    <select value={status} onChange={e => setStatus(e.target.value as OrderStatus)} className="w-full px-3 py-2 border border-brand-black/20 rounded-md">
                        {['pending', 'confirmed', 'preparing', 'shipped', 'in-transit', 'delivered', 'cancelled', 'refunded'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                    </select>
                    <Button onClick={handleStatusUpdate} className="w-full mt-3">Update</Button>
                </Card>
                 <Card title={t('admin.orders.addTracking')}>
                    <Input id="carrier" label={t('admin.orders.carrier')} value={carrier} onChange={e => setCarrier(e.target.value)} />
                    <Input id="trackingNumber" label={t('admin.orders.trackingNumber')} value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} className="mt-3"/>
                    <Button onClick={handleTrackingUpdate} className="w-full mt-3">{t('admin.orders.save')}</Button>
                </Card>
            </div>
        </div>
    );
};

export default OrderDetailAdminPage;