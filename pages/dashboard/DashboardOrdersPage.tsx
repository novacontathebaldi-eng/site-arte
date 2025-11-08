import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders } from '../../services/orderService';
import { Order } from '../../types';
import Spinner from '../../components/Spinner';
import { useTranslation } from '../../hooks/useTranslation';

const DashboardOrdersPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchOrders = async () => {
            setLoading(true);
            const userOrders = await getUserOrders(user.uid);
            setOrders(userOrders);
            setLoading(false);
        };
        fetchOrders();
    }, [user]);

    if (loading) return <Spinner />;

    return (
        <div>
            <h1 className="text-3xl font-serif mb-6">{t('my_orders')}</h1>
            {orders.length === 0 ? (
                <p>{t('no_orders_found')}</p>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="p-4 border border-border-color rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-primary">{t('order_number')} {order.orderNumber}</p>
                                    <p className="text-sm text-text-secondary">{t('date')}: {new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`capitalize text-sm font-medium px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="mt-4 border-t pt-4">
                                {order.items.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 mb-2">
                                        <img src={item.productSnapshot.image} alt={item.productSnapshot.title} className="w-16 h-16 object-cover rounded"/>
                                        <div>
                                            <p>{item.productSnapshot.title}</p>
                                            <p className="text-sm text-text-secondary">{item.quantity} x €{item.productSnapshot.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                             <div className="text-right font-bold mt-2">
                                {t('total')}: €{order.pricing.total.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardOrdersPage;
