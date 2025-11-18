'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Truck, 
  Package, 
  Calendar,
  Download,
  Home,
  ShoppingBag
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/types';

export default function OrderConfirmationPage() {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const router = useRouter();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId as string));
        if (orderDoc.exists()) {
          setOrder({
            id: orderDoc.id,
            ...orderDoc.data()
          } as Order);
        }
      } catch (error) {
        console.error('Error loading order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">
            {t('order-not-found')}
          </h2>
          <p className="text-gray-500 mb-8">
            {t('order-not-found-message')}
          </p>
          <button
            onClick={() => router.push('/catalog')}
            className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            {t('continue-shopping')}
          </button>
        </div>
      </div>
    );
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Animation */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary mb-4">
              {t('thank-you-for-your-order')}
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              {t('order-confirmation-message')}
            </p>
            <p className="text-sm text-gray-500">
              {t('confirmation-email-sent')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Details */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="font-heading text-xl font-semibold text-gray-900 mb-6">
                  {t('order-details')}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{t('order-number')}</h3>
                    <p className="text-lg font-semibold text-primary">#{order.orderNumber}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{t('order-date')}</h3>
                    <p className="text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{t('payment-status')}</h3>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {t('paid')}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">{t('estimated-delivery')}</h3>
                    <p className="text-gray-600">
                      {order.estimatedDelivery ? 
                        new Date(order.estimatedDelivery).toLocaleDateString() :
                        t('calculating')
                      }
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Order Items */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h2 className="font-heading text-xl font-semibold text-gray-900 mb-6">
                  {t('order-items')}
                </h2>

                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <img
                          src={item.productSnapshot.image}
                          alt={item.productSnapshot.title}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {item.productSnapshot.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {t('quantity')}: {item.quantity}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          €{item.subtotal.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          €{item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Shipping Address */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading text-xl font-semibold text-gray-900">
                    {t('shipping-address')}
                  </h2>
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="w-4 h-4 mr-1" />
                    {t('shipping-confirmed')}
                  </div>
                </div>

                <div className="text-gray-600">
                  <p className="font-medium text-gray-900">
                    {order.shippingAddress.recipientName}
                  </p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p className="mt-2">
                    <span className="text-gray-500">{t('phone')}:</span> {order.shippingAddress.phone}
                  </p>
                  <p>
                    <span className="text-gray-500">{t('email')}:</span> {order.shippingAddress.email}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Order Summary */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-sm p-6 sticky top-24"
              >
                <h2 className="font-heading text-xl font-semibold text-gray-900 mb-6">
                  {t('order-summary')}
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('subtotal')}</span>
                    <span>€{order.pricing.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('shipping')}</span>
                    <span>
                      {order.pricing.shipping === 0
                        ? t('free')
                        : `€${order.pricing.shipping.toFixed(2)}`
                      }
                    </span>
                  </div>
                  
                  {order.pricing.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{t('discount')}</span>
                      <span>-€{order.pricing.discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t('tax')}</span>
                    <span>€{order.pricing.tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>{t('total')}</span>
                      <span className="text-primary">
                        €{order.pricing.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Next Steps */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h3 className="font-medium text-gray-900 mb-4">{t('whats-next')}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">{t('processing')}</h4>
                      <p className="text-sm text-gray-600">
                        {t('processing-description')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Truck className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">{t('shipping')}</h4>
                      <p className="text-sm text-gray-600">
                        {t('shipping-description')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">{t('delivery')}</h4>
                      <p className="text-sm text-gray-600">
                        {t('delivery-description')}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.7 }}
                className="space-y-3"
              >
                <button
                  onClick={() => router.push('/dashboard/orders')}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
                >
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  {t('view-my-orders')}
                </button>
                
                <button
                  onClick={() => router.push('/catalog')}
                  className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:border-primary hover:text-primary transition-colors"
                >
                  <Home className="w-5 h-5 mr-2" />
                  {t('continue-shopping')}
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}