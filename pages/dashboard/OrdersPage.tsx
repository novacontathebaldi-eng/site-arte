
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';
import { Order, OrderStatus } from '../../types';
import { getOrdersByUserId } from '../../services/api';
import { ROUTES } from '../../constants';
import Badge from '../../components/ui/Badge';

const statusVariantMapping: Record<OrderStatus, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
    delivered: 'success',
    shipped: 'info',
    'in-transit': 'info',
    preparing: 'warning',
    confirmed: 'neutral',
    pending: 'neutral',
    cancelled: 'error',
    refunded: 'error',
};

const OrdersPage: React.FC = () => {
    const { t, language } = useTranslation();
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (user) {
                try {
                    setIsLoading(true);
                    const userOrders = await getOrdersByUserId(user.id);
                    setOrders(userOrders);
                } catch (error) {
                    console.error("Failed to fetch orders:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchOrders();
    }, [user]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language + '-LU', { style: 'currency', currency: 'EUR' }).format(amount);
    };
    
    if (isLoading) {
        return (
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-primary mb-4">{t('dashboard.ordersTitle')}</h1>
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-primary mb-6">{t('dashboard.ordersTitle')}</h1>
            {orders.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-text-secondary mb-4">{t('dashboard.noOrders')}</p>
                    <Link to={ROUTES.CATALOG} className="text-secondary font-semibold hover:underline">
                        {t('cart.browseCatalog')}
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    {/* Tabela para telas maiores */}
                    <table className="min-w-full divide-y divide-gray-200 hidden md:table">
                        <thead className="bg-surface">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{t('dashboard.orderNumber')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{t('dashboard.orderDate')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{t('dashboard.orderStatus')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">{t('dashboard.orderTotal')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-secondary uppercase tracking-wider"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">{order.orderNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{formatDate(order.createdAt)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Badge variant={statusVariantMapping[order.status]}>{t(`orderStatus.${order.status}`)}</Badge>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">{formatCurrency(order.pricing.total)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Link to={`/dashboard/orders/${order.id}`} className="text-secondary hover:underline">{t('dashboard.viewDetails')}</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* Cards para telas menores */}
                     <div className="space-y-4 md:hidden">
                        {orders.map(order => (
                            <div key={order.id} className="bg-surface p-4 rounded-lg shadow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-primary">{order.orderNumber}</p>
                                        <p className="text-sm text-text-secondary">{formatDate(order.createdAt)}</p>
                                    </div>
                                    <Badge variant={statusVariantMapping[order.status]}>{t(`orderStatus.${order.status}`)}</Badge>
                                </div>
                                <div className="mt-4 flex justify-between items-end">
                                    <div>
                                        <p className="text-sm text-text-secondary">{t('dashboard.orderTotal')}</p>
                                        <p className="font-semibold">{formatCurrency(order.pricing.total)}</p>
                                    </div>
                                    <Link to={`/dashboard/orders/${order.id}`} className="text-secondary font-semibold hover:underline text-sm">{t('dashboard.viewDetails')}</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;