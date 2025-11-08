import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
                        <div key={order.id} className="p-4 border border-border-color rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start flex-wrap gap-2">
                                <div>
                                    <p className="font-semibold text-primary">{t('order_number')} {order.orderNumber}</p>
                                    <p className="text-sm text-text-secondary">{t('date')}: {new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className={`capitalize text-sm font-medium px-2 py-1 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="mt-4 border-t pt-4">
                               <p className="text-sm text-text-secondary mb-2">
                                   {order.items.length} item(s)
                               </p>
                                <div className="flex -space-x-4">
                                    {order.items.slice(0, 5).map((item, index) => (
                                        <img key={index} src={item.productSnapshot.image} alt={item.productSnapshot.title} className="w-12 h-12 object-cover rounded-full border-2 border-white"/>
                                    ))}
                                    {order.items.length > 5 && <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold">+{order.items.length - 5}</div>}
                                </div>
                            </div>
                             <div className="flex justify-between items-center mt-4">
                                <div className="font-bold">
                                    {t('total')}: €{order.pricing.total.toFixed(2)}
                                </div>
                                <Link to={`/dashboard/orders/${order.id}`} className="text-secondary font-semibold hover:underline">
                                    {t('view_order_details')}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardOrdersPage;