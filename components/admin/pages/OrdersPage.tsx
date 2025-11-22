import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { OrderDocument } from '../../../firebase-types';
import Button from '../../common/Button';
import { useRouter } from '../../../hooks/useRouter';
import { useToast } from '../../../hooks/useToast';
import Spinner from '../../common/Spinner';
import { useI18n } from '../../../hooks/useI18n';

const OrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<OrderDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const { navigate } = useRouter();
    const { addToast } = useToast();
    const { t } = useI18n();

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderDocument));
                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching orders:", error);
                addToast("Failed to fetch orders", "error");
            }
            setLoading(false);
        };
        fetchOrders();
    }, [addToast]);
    
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'shipped':
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'pending':
            case 'confirmed':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
            case 'refunded':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch(status) {
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'pending':
            case 'failed':
                return 'bg-yellow-100 text-yellow-800';
            case 'refunded':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }


    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    return (
        <div className="bg-brand-white dark:bg-brand-black p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold font-serif mb-6">{t('admin.orders.title')}</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                     <thead className="bg-black/5 dark:bg-white/5">
                        <tr>
                            <th className="p-3">Order</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">{t('admin.orders.table.paymentStatus')}</th>
                            <th className="p-3 text-right">Total</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                     <tbody>
                        {orders.map(order => (
                            <tr key={order.id} className="border-b border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <td className="p-3 font-mono text-xs">{order.orderNumber}</td>
                                <td className="p-3 font-medium">{order.shippingAddress.recipientName}</td>
                                <td className="p-3">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                                 <td className="p-3">
                                    <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${getPaymentStatusColor(order.paymentStatus)}`}>
                                        {order.paymentStatus}
                                    </span>
                                </td>
                                <td className="p-3 text-right font-medium">€{(order.pricing.total / 100).toFixed(2)}</td>
                                <td className="p-3 text-right">
                                    <Button size="sm" variant="tertiary" onClick={() => navigate(`/admin/orders/${order.id}`)}>View</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdersPage;
