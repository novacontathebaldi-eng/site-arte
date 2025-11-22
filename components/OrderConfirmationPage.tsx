import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useRouter } from '../hooks/useRouter';
import { OrderDocument } from '../firebase-types';
import Spinner from './common/Spinner';
import Button from './common/Button';
import { useI18n } from '../hooks/useI18n';

const OrderConfirmationPage: React.FC = () => {
  const { queryParams } = useRouter();
  const [order, setOrder] = useState<OrderDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, language } = useI18n();

  useEffect(() => {
    const orderId = queryParams.get('id');
    if (orderId) {
      const fetchOrder = async () => {
        setLoading(true);
        const docRef = doc(db, 'orders', orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as OrderDocument);
        }
        setLoading(false);
      };
      fetchOrder();
    } else {
        setLoading(false);
    }
  }, [queryParams]);

  if (loading) {
    return <div className="flex justify-center p-12"><Spinner size="lg" /></div>;
  }

  if (!order) {
    return <div className="text-center p-12">Order not found.</div>;
  }

  const isPixPending = order.paymentMethod === 'pix' && order.paymentStatus === 'pending';

  return (
    <div className="bg-brand-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-serif font-bold text-brand-black">{t('order.confirmationTitle')}</h1>
          <p className="mt-2 text-lg text-brand-black/70">{t('order.confirmationSubtitle')}</p>
        </div>
        
        <div className="max-w-3xl mx-auto bg-gray-50 p-8 rounded-lg shadow-inner mt-8">
            <h2 className="text-xl font-bold font-serif mb-6">{t('order.details')} #{order.id.slice(0, 8).toUpperCase()}</h2>
            
            {isPixPending && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-r-lg" role="alert">
                    <p className="font-bold">{t('order.paymentPending')}</p>
                    <p>{t('order.paymentPendingInstructions')}</p>
                </div>
            )}
            
            {order.paymentMethod === 'pix' && order.pixQrCode && (
                 <div className="mt-4 text-center p-4 border rounded-md">
                    <p className="text-sm text-brand-black/70 mb-4">{t('checkout.pixInstructions')}</p>
                    <img src={order.pixQrCode} alt="PIX QR Code" className="w-48 h-48 mx-auto" />
                    <p className="text-xs font-mono break-all mt-2 bg-gray-200 p-2 rounded">{order.pixCopiaECola}</p>
                </div>
            )}
            
            {/* Item List */}
            <div className="divide-y divide-black/10 mt-6">
                {order.items.map(item => (
                    <div key={item.id} className="flex items-center py-4">
                        <img src={item.images[0]?.thumbnailUrl} alt={item.translations[language]?.title} className="w-16 h-16 rounded object-cover"/>
                        <div className="ml-4 flex-grow">
                            <p className="font-semibold">{item.translations[language]?.title}</p>
                            <p className="text-sm text-brand-black/60">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium">€{(item.price.amount * item.quantity / 100).toFixed(2)}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <Button as="a" href="#/dashboard/orders">View My Orders</Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;