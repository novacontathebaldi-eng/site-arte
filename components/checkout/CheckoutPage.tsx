import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from '../../hooks/useRouter';
import { useToast } from '../../hooks/useToast';
import { useI18n } from '../../hooks/useI18n';
import { Address, OrderDocument, OrderItem, LanguageCode } from '../../firebase-types';
import AddressStep from './AddressStep';
import PaymentStep from './PaymentStep';
import ReviewStep from './ReviewStep';

type CheckoutStep = 'address' | 'payment' | 'review';

const CheckoutPage: React.FC = () => {
  const [step, setStep] = useState<CheckoutStep>('address');
  const [shippingAddress, setShippingAddress] = useState<Address | null>(null);
  const [billingAddress, setBillingAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('creditCard');
  const [isProcessing, setIsProcessing] = useState(false);

  const { cartItems, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { navigate } = useRouter();
  const { addToast } = useToast();
  const { t, language } = useI18n();

  const handleAddressSubmit = (shipping: Address, billing: Address) => {
    setShippingAddress(shipping);
    setBillingAddress(billing);
    setStep('payment');
  };
  
  const handlePaymentSubmit = (method: string) => {
    setPaymentMethod(method);
    setStep('review');
  };

  const createOrder = async (): Promise<string | null> => {
    if (!user || !shippingAddress || !billingAddress) return null;
    setIsProcessing(true);

    const orderItems: OrderItem[] = cartItems.map(item => ({...item}));
    
    // Placeholder for shipping and tax calculation
    const shippingCost = 500; // 5 EUR
    const tax = 0; // Assuming tax is included
    const total = subtotal + shippingCost;

    try {
        const orderData: Omit<OrderDocument, 'id' | 'orderNumber'> = {
            userId: user.uid,
            status: 'pending',
            paymentStatus: 'pending',
            items: orderItems,
            pricing: { subtotal, shipping: shippingCost, discount: 0, tax, total, currency: 'EUR' },
            shippingAddress,
            billingAddress,
            shippingMethod: 'Standard Shipping',
            paymentMethod,
            statusHistory: [{ status: 'pending', timestamp: serverTimestamp() as Timestamp }],
            language: language as LanguageCode,
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp,
        };
        
        // This is where you would call your backend to generate PIX code if selected
        if (paymentMethod === 'pix') {
            // NOTE: In a real app, call a secure backend function here.
            // await generatePixData();
            // This is a placeholder:
            orderData.pixQrCode = 'https://picsum.photos/200';
            orderData.pixCopiaECola = '00020126...';
        }
        
        // Add order to Firestore
        const orderRef = await addDoc(collection(db, 'orders'), orderData);
        
        // TODO: Here you would call Revolut or another payment processor if method is 'creditCard'
        // If payment is successful, you would update the order's paymentStatus to 'paid'.
        // For now, we assume payment will be handled later.
        
        clearCart();
        return orderRef.id;

    } catch (error) {
        console.error("Error creating order:", error);
        addToast(t('checkout.error'), 'error');
        return null;
    } finally {
        setIsProcessing(false);
    }
  };
  
  const handleFinalSubmit = async () => {
    const orderId = await createOrder();
    if (orderId) {
      // TODO: Send confirmation email via Brevo
      navigate(`/order-confirmation?id=${orderId}`);
    }
  };
  
  const STEPS = [
      { id: 'address', name: t('checkout.steps.address') },
      { id: 'payment', name: t('checkout.steps.payment') },
      { id: 'review', name: t('checkout.steps.review') },
  ];
  
  const currentStepIndex = STEPS.findIndex(s => s.id === step);

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-serif font-bold text-center mb-8">{t('checkout.title')}</h1>
        
        {/* Step Indicator */}
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center justify-center">
            {STEPS.map((s, index) => (
              <li key={s.id} className={`relative ${index !== STEPS.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                {index < currentStepIndex ? (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-brand-gold"></div>
                    </div>
                    <button onClick={() => setStep(s.id as CheckoutStep)} className="relative flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold hover:bg-yellow-500">
                        <span className="sr-only">{s.name}</span>
                    </button>
                  </>
                ) : index === currentStepIndex ? (
                   <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-gray-200"></div>
                    </div>
                    <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-brand-gold bg-white">
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-gold" aria-hidden="true"></span>
                      <span className="sr-only">{s.name}</span>
                    </div>
                  </>
                ) : (
                   <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-gray-200"></div>
                    </div>
                    <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 bg-white">
                        <span className="sr-only">{s.name}</span>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-12 max-w-4xl mx-auto">
          {step === 'address' && <AddressStep onSubmit={handleAddressSubmit} />}
          {step === 'payment' && <PaymentStep onSubmit={handlePaymentSubmit} onBack={() => setStep('address')} />}
          {step === 'review' && (
            <ReviewStep 
                shippingAddress={shippingAddress!} 
                billingAddress={billingAddress!}
                paymentMethod={paymentMethod}
                isProcessing={isProcessing}
                onSubmit={handleFinalSubmit} 
                onBack={() => setStep('payment')} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;