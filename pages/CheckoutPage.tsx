import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { getAddresses, addAddress } from '../services/firestoreService';
import { createOrder } from '../services/orderService';
import { Address } from '../types';
import Spinner from '../components/Spinner';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';

const CheckoutPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const { cart, totalPrice, clearCart } = useContext(CartContext)!;
  const { t, language } = useTranslation();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchAddresses = async () => {
      setLoading(true);
      const userAddresses = await getAddresses(user.uid);
      setAddresses(userAddresses);
      const defaultAddress = userAddresses.find(a => a.isDefault) || userAddresses[0] || null;
      setSelectedAddress(defaultAddress);
      setLoading(false);
    };
    fetchAddresses();
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress || cart.length === 0) return;
    
    setIsProcessing(true);
    const orderData = {
        subtotal: totalPrice,
        shipping: 0, // Placeholder
        total: totalPrice, // Placeholder
    };
    
    const orderId = await createOrder(user.uid, cart, selectedAddress, orderData, language);
    setIsProcessing(false);
    
    if (orderId) {
        clearCart();
        navigate(`/order-confirmation/${orderId}`);
    } else {
        toast.error("Failed to place order.");
    }
  };
  
  const AddressForm: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const [formData, setFormData] = useState({ recipientName: '', addressLine1: '', city: '', postalCode: '', country: '', phone: '' });
    const { user } = useAuth();
    
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        await addAddress(user.uid, { ...formData, isDefault: false });
        setShowNewAddressForm(false);
        onSave(); // Refresh address list
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 p-4 border rounded-md">
            <input name="recipientName" onChange={handleChange} placeholder={t('recipient_name')} required className="w-full p-2 border rounded" />
            <input name="addressLine1" onChange={handleChange} placeholder={t('address_line_1')} required className="w-full p-2 border rounded" />
            <input name="city" onChange={handleChange} placeholder={t('city')} required className="w-full p-2 border rounded" />
            <input name="postalCode" onChange={handleChange} placeholder={t('postal_code')} required className="w-full p-2 border rounded" />
            <input name="country" onChange={handleChange} placeholder={t('country')} required className="w-full p-2 border rounded" />
            <input name="phone" onChange={handleChange} placeholder={t('phone_number')} required className="w-full p-2 border rounded" />
            <div className="flex gap-4">
                <button type="submit" className="bg-primary text-white py-2 px-4 rounded">{t('save_address')}</button>
                <button type="button" onClick={() => setShowNewAddressForm(false)} className="bg-gray-200 py-2 px-4 rounded">{t('cancel')}</button>
            </div>
        </form>
    );
  };
  
  if (loading) return <Spinner />;

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-serif text-center mb-8">{t('checkout')}</h1>

      <div className="max-w-3xl mx-auto">
        {/* Step 1: Address */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-serif mb-4">{t('shipping_address')}</h2>
            <div className="space-y-4">
              {addresses.map(address => (
                <div key={address.id} onClick={() => setSelectedAddress(address)}
                     className={`p-4 border rounded-md cursor-pointer ${selectedAddress?.id === address.id ? 'border-secondary ring-2 ring-secondary' : ''}`}>
                  <p><strong>{address.recipientName}</strong></p>
                  <p>{address.addressLine1}</p>
                  <p>{address.city}, {address.postalCode}</p>
                  <p>{address.country}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setShowNewAddressForm(!showNewAddressForm)} className="mt-4 text-secondary">{t('add_new_address')}</button>
            {showNewAddressForm && <AddressForm onSave={async () => {
                if(user) setAddresses(await getAddresses(user.uid));
            }} />}
            <button onClick={() => setStep(2)} disabled={!selectedAddress}
                    className="mt-6 w-full bg-primary text-white py-3 rounded-md disabled:bg-gray-400">
              {t('continue_to_payment')}
            </button>
          </div>
        )}

        {/* Step 2: Payment (Simulated) */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-serif mb-4">{t('payment_method')}</h2>
            <p>Payment integration (e.g., Stripe) would be here. For now, we'll simulate a successful payment.</p>
             <button onClick={() => setStep(3)} className="mt-6 w-full bg-primary text-white py-3 rounded-md">
              Review Order
            </button>
            <button onClick={() => setStep(1)} className="mt-2 w-full text-center">Back to Address</button>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-serif mb-4">{t('review_confirm')}</h2>
            <div className="bg-surface p-4 rounded-md">
              <h3 className="font-bold">Shipping To:</h3>
              <p>{selectedAddress?.recipientName}</p>
              <p>{selectedAddress?.addressLine1}</p>
              
              <h3 className="font-bold mt-4">Order Summary:</h3>
              {cart.map(item => <div key={item.id}>{item.translations[language]?.title} x {item.quantity}</div>)}
              <p className="font-bold mt-2">{t('total')}: €{totalPrice.toFixed(2)}</p>
            </div>
            <button onClick={handlePlaceOrder} disabled={isProcessing} className="mt-6 w-full bg-primary text-white py-3 rounded-md disabled:bg-gray-400">
              {isProcessing ? <Spinner/> : t('place_order')}
            </button>
            <button onClick={() => setStep(2)} className="mt-2 w-full text-center">Back to Payment</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
