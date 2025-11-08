import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOrderById } from '../../services/orderService';
import { Order } from '../../types';
import Spinner from '../../components/Spinner';
import { useTranslation } from '../../hooks/useTranslation';

const DashboardOrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { user } = useAuth();
    const { t } = useTranslation();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (user && orderId) {
                setLoading(true);
                const fetchedOrder = await getOrderById(orderId, user.uid);
                setOrder(fetchedOrder);
                setLoading(false);
            }
        };
        fetchOrder();
    }, [user, orderId]);

    if (loading) return <Spinner />;

    if (!order) {
        return (
            <div>
                <h1 className="text-3xl font-serif mb-6">{t('order_details')}</h1>
                <p>{t('order_not_found')}</p>
                 <Link to="/dashboard/orders" className="text-secondary hover:underline mt-4 inline-block">&larr; {t('my_orders')}</Link>
            </div>
        );
    }

    return (
        <div>
            <Link to="/dashboard/orders" className="text-secondary hover:underline mb-4 inline-block">&larr; {t('my_orders')}</Link>
            <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-serif">{t('order_details')}</h1>
                <span className={`capitalize text-sm font-medium px-3 py-1.5 rounded-full ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                </span>
            </div>
            <p className="text-sm text-text-secondary mb-6">{t('order_number')} {order.orderNumber} &bull; {t('date')}: {new Date(order.createdAt).toLocaleDateString()}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold font-serif mb-4">{t('order_items')}</h2>
                    <div className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 border rounded-md">
                                <img src={item.productSnapshot.image} alt={item.productSnapshot.title} className="w-20 h-20 object-cover rounded"/>
                                <div className="flex-grow">
                                    <p className="font-semibold">{item.productSnapshot.title}</p>
                                    <p className="text-sm text-text-secondary">{item.quantity} x €{item.productSnapshot.price.toFixed(2)}</p>
                                </div>
                                <p className="font-semibold">€{item.subtotal.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="bg-surface p-6 rounded-lg shadow-sm">
                         <h2 className="text-xl font-semibold font-serif mb-4">{t('shipped_to')}</h2>
                         <div className="text-sm space-y-1">
                             <p className="font-bold">{order.shippingAddress.recipientName}</p>
                             <p>{order.shippingAddress.addressLine1}</p>
                             {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                             <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                             <p>{order.shippingAddress.country}</p>
                             <p>{order.shippingAddress.phone}</p>
                         </div>
                    </div>
                    <div className="bg-surface p-6 rounded-lg shadow-sm mt-6">
                         <h2 className="text-xl font-semibold font-serif mb-4">{t('order_summary')}</h2>
                         <div className="space-y-2 text-sm">
                            <div className="flex justify-between"><span>{t('subtotal')}</span><span>€{order.pricing.subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>{t('shipping')}</span><span>€{order.pricing.shipping.toFixed(2)}</span></div>
                            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span>{t('total')}</span><span>€{order.pricing.total.toFixed(2)}</span></div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOrderDetailPage;