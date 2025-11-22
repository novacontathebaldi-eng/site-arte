import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useAuth } from '../../../hooks/useAuth';
import { OrderDocument } from '../../../firebase-types';
import Spinner from '../../common/Spinner';
import { useI18n } from '../../../hooks/useI18n';
import Button from '../../common/Button';

const OrdersListPage: React.FC = () => {
    const [orders, setOrders] = useState<OrderDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const { t } = useI18n();

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        const q = query(
            collection(db, "orders"), 
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userOrders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderDocument));
            setOrders(userOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-serif font-bold mb-6">{t('dashboard.orders.title')}</h1>
            {orders.length === 0 ? (
                <p>{t('dashboard.orders.empty')}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-black/5 dark:bg-white/5">
                            <tr>
                                <th className="p-3">{t('dashboard.orders.order')}</th>
                                <th className="p-3">{t('dashboard.orders.date')}</th>
                                <th className="p-3">{t('dashboard.orders.status')}</th>
                                <th className="p-3">{t('dashboard.orders.total')}</th>
                                <th className="p-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="border-b border-black/10 dark:border-white/10">
                                    <td className="p-3 font-medium">#{order.id.slice(0, 8)}</td>
                                    <td className="p-3">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</td>
                                    <td className="p-3 capitalize">{order.status}</td>
                                    <td className="p-3">€{(order.pricing.total / 100).toFixed(2)}</td>
                                    <td className="p-3 text-right">
                                        <Button as="a" href={`#/dashboard/orders/${order.id}`} size="sm" variant="tertiary">{t('dashboard.orders.view')}</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrdersListPage;
