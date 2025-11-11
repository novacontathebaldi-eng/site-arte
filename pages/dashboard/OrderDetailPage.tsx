
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { Order, OrderStatus } from '../../types';
import { getOrderById } from '../../services/api';
import { ROUTES } from '../../constants';
import Badge from '../../components/ui/Badge';
import { CheckCircleIcon, PackageIcon } from '../../components/ui/icons';

// FIX: Correctly map OrderStatus to badge variants
const statusVariantMapping: Record<OrderStatus, 'success' | 'warning' | 'error' | 'info' | 'neutral'> = {
    delivered: 'success',
    shipped: 'info',
    processing: 'warning',
    paid: 'neutral',
    created: 'neutral',
    canceled: 'error',
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

    const formatDate = (date: any) => {
        // FIX: Handle Firestore timestamp object
        if (!date?.seconds) return '...';
        return new Date(date.seconds * 1000).toLocaleString(language, {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const formatCurrency = (amountInCents: number) => {
        // FIX: Convert cents to currency unit
        return new Intl.NumberFormat(language + '-LU', { style: 'currency', currency: 'EUR' }).format(amountInCents / 100);
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
    
    // FIX: Use valid OrderStatus values for the stepper
    const stepperSteps: OrderStatus[] = ['paid', 'processing', 'shipped', 'delivered'];
    const currentStepIndex = stepperSteps.findIndex(step => order.timeline.some(t => t.status === step));

    return (
        <div className="space-y-6">
             <Link to={ROUTES.DASHBOARD_ORDERS} className="text-sm text-secondary hover:underline mb-4 inline-block">
                &larr; {t('dashboard.backToOrders')}
            </Link>
             <div className="bg-white p-6 rounded-lg shadow-md">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-primary">{t('dashboard.orderDetailTitle')} #{order.orderNumber}</h1>
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
                        {/* FIX: Use correct translation keys for order statuses */}
                        {stepperSteps.map(step => <span key={step} className="w-1/4 text-center">{t(`orderStatus.${step}`)}</span>)}
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div>
                        <h2 className="font-bold mb-2">{t('dashboard.shippingAddress')}</h2>
                        <div className="text-sm text-text-secondary">
                            {/* FIX: Use 'name' instead of 'recipientName' */}
                            <p>{order.shippingAddress.name}</p>
                            {/* FIX: Use 'line1' instead of 'addressLine1' */}
                            <p>{order.shippingAddress.line1}</p>
                            <p>{order.shippingAddress.postalCode} {order.shippingAddress.city}</p>
                            <p>{order.shippingAddress.country}</p>
                        </div>
                    </div>
                    <div>
                        <h2 className="font-bold mb-2">{t('dashboard.orderSummary')}</h2>
                        <div className="text-sm space-y-1">
                            {/* FIX: Use 'totals' object and '...Cents' properties */}
                            <div className="flex justify-between"><span>{t('cart.subtotal')}:</span><span>{formatCurrency(order.totals.subtotalCents)}</span></div>
                            <div className="flex justify-between"><span>{t('cart.shipping')}:</span><span>{formatCurrency(order.totals.shippingCents)}</span></div>
                            <div className="flex justify-between font-bold border-t mt-2 pt-2"><span>{t('cart.total')}:</span><span>{formatCurrency(order.totals.totalCents)}</span></div>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="font-bold mb-4">{t('dashboard.items')} ({order.items.length})</h2>
                    <div className="space-y-4">
                        {order.items.map(item => (
                             <div key={item.productId} className="flex items-center p-2 border rounded-md">
                                {/* FIX: Use item.image_thumb and item.title instead of productSnapshot */}
                                <img src={item.image_thumb} alt={item.title} className="w-16 h-16 object-cover rounded"/>
                                <div className="flex-grow ml-4">
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-sm text-text-secondary">{item.qty} x {formatCurrency(item.priceCents)}</p>
                                </div>
                                {/* FIX: Calculate subtotal from item price and quantity */}
                                <p className="font-semibold">{formatCurrency(item.priceCents * item.qty)}</p>
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