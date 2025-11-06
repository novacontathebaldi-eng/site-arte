import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { Order, OrderStatus } from '../../types';
import { getOrderById } from '../../services/api';
import { ROUTES } from '../../constants';
import Badge from '../../components/ui/Badge';
import { CheckCircleIcon, PackageIcon } from '../../components/ui/icons';

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

const OrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { t, language } = useTranslation();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (orderId) {
                try {
                    setIsLoading(true);
                    const fetchedOrder = await getOrderById(orderId);
                    setOrder(fetchedOrder || null);
                } catch (error) {
                    console.error("Failed to fetch order:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchOrder();
    }, [orderId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString(language, {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language + '-LU', { style: 'currency', currency: 'EUR' }).format(amount);
    };

    if (isLoading) {
        return <div className="bg-white p-8 rounded-lg shadow-md animate-pulse h-96"></div>;
    }

    if (!order) {
        return (
             <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p>Pedido não encontrado.</p>
                <Link to={ROUTES.DASHBOARD_ORDERS} className="text-secondary hover:underline mt-4 inline-block">
                    &larr; {t('dashboard.backToOrders')}
                </Link>
            </div>
        );
    }
    
    const stepperSteps: OrderStatus[] = ['confirmed', 'preparing', 'shipped', 'delivered'];
    const currentStepIndex = stepperSteps.indexOf(order.status);

    return (
        <div className="space-y-6">
             <Link to={ROUTES.DASHBOARD_ORDERS} className="text-sm text-secondary hover:underline mb-4 inline-block">
                &larr; {t('dashboard.backToOrders')}
            </Link>
             <div className="bg-white p-6 rounded-lg shadow-md">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-primary">{t('dashboard.orderDetailTitle')} {order.orderNumber}</h1>
                        <p className="text-sm text-text-secondary">{t('dashboard.orderDate')}: {formatDate(order.createdAt)}</p>
                    </div>
                    <Badge variant={statusVariantMapping[order.status]} className="text-base">{t(`orderStatus.${order.status}`)}</Badge>
                </div>
                
                {/* Stepper / Timeline */}
                <div className="my-8">
                    <ol className="flex items-center w-full">
                        {stepperSteps.map((step, index) => (
                            <li key={step} className={`flex w-full items-center ${index < stepperSteps.length -1 ? "after:content-[''] after:w-full after:h-1 after:border-b after:border-4 after:inline-block" : ''} ${index <= currentStepIndex ? 'text-secondary after:border-secondary' : 'text-gray-400 after:border-gray-200'}`}>
                                <span className={`flex items-center justify-center w-10 h-10 rounded-full lg:h-12 lg:w-12 shrink-0 ${index <= currentStepIndex ? 'bg-secondary text-white' : 'bg-gray-200'}`}>
                                    {index <= currentStepIndex ? <CheckCircleIcon className="w-6 h-6" /> : <PackageIcon className="w-6 h-6" />}
                                </span>
                            </li>
                        ))}
                    </ol>
                     <div className="flex justify-between mt-2 text-xs text-text-secondary">
                        {stepperSteps.map(step => <span key={step} className="w-1/4 text-center">{t(`dashboard.${step}`)}</span>)}
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div>
                        <h2 className="font-bold mb-2">{t('dashboard.shippingAddress')}</h2>
                        <div className="text-sm text-text-secondary">
                            <p>{order.shippingAddress.recipientName}</p>
                            <p>{order.shippingAddress.addressLine1}</p>
                            <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                            <p>{order.shippingAddress.country}</p>
                        </div>
                    </div>
                    <div>
                        <h2 className="font-bold mb-2">{t('dashboard.orderSummary')}</h2>
                        <div className="text-sm space-y-1">
                            <div className="flex justify-between"><span>{t('cart.subtotal')}:</span><span>{formatCurrency(order.pricing.subtotal)}</span></div>
                            <div className="flex justify-between"><span>{t('cart.shipping')}:</span><span>{formatCurrency(order.pricing.shipping)}</span></div>
                            <div className="flex justify-between font-bold border-t mt-2 pt-2"><span>{t('cart.total')}:</span><span>{formatCurrency(order.pricing.total)}</span></div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="font-bold mb-4">{t('dashboard.items')} ({order.items.length})</h2>
                    <div className="space-y-4">
                        {order.items.map(item => (
                             <div key={item.productId} className="flex items-center p-2 border rounded-md">
                                <img src={item.productSnapshot.image} alt={item.productSnapshot.title} className="w-16 h-16 object-cover rounded"/>
                                <div className="flex-grow ml-4">
                                    <p className="font-semibold">{item.productSnapshot.title}</p>
                                    <p className="text-sm text-text-secondary">{item.quantity} x {formatCurrency(item.price)}</p>
                                </div>
                                <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                 <div className="mt-8 border-t pt-6 flex justify-end">
                     <button className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors">
                        {t('dashboard.downloadInvoice')}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default OrderDetailPage;
