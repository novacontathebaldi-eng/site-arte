import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import { getAddresses, addAddress } from '../services/firestoreService';
import { createOrder } from '../services/orderService';
import { Address, SupportedLanguage } from '../types';
import Spinner from '../components/Spinner';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';

const CheckoutPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const { user } = useAuth();
  const { cart, totalPriceCents, clearCart } = useContext(CartContext)!;
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
      if (userAddresses.length === 0) {
          setShowNewAddressForm(true);
      }
      setLoading(false);
    };
    fetchAddresses();
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!user || !selectedAddress || cart.length === 0) return;
    
    setIsProcessing(true);
    // Placeholder for shipping calculation
    const shippingCents = 1500; // e.g., €15.00
    const totals = {
        subtotalCents: totalPriceCents,
        shippingCents: shippingCents,
        totalCents: totalPriceCents + shippingCents,
        discountCents: 0,
        taxCents: 0,
    };
    
    const orderId = await createOrder(user.uid, cart, selectedAddress, totals, language as SupportedLanguage);
    setIsProcessing(false);
    
    if (orderId) {
        clearCart();
        navigate(`/order-confirmation/${orderId}`);
    } else {
        toast.error("Failed to place order.");
    }
  };
  
  const AddressForm: React.FC<{ onSave: () => void }> = ({ onSave }) => {
    const [formData, setFormData] = useState({ name: '', line1: '', city: '', postalCode: '', country: '', phone: '' });
    const { user } = useAuth();
    
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        const newAddress = { ...formData, isDefault: addresses.length === 0 };
        const addressId = await addAddress(user.uid, newAddress);
        if (addressId) {
            toast.success(t('address_saved'));
            setShowNewAddressForm(false);
            onSave();
        } else {
            toast.error(t('error_saving_address'));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 p-4 border rounded-md">
            <input name="name" onChange={handleChange} placeholder={t('recipient_name')} required className="w-full p-2 border rounded" />
            <input name="line1" onChange={handleChange} placeholder={t('address_line_1')} required className="w-full p-2 border rounded" />
            <input name="city" onChange={handleChange} placeholder={t('city')} required className="w-full p-2 border rounded" />
            <input name="postalCode" onChange={handleChange} placeholder={t('postal_code')} required className="w-full p-2 border rounded" />
            <input name="country" onChange={handleChange} placeholder={t('country')} required className="w-full p-2 border rounded" />
            <input name="phone" onChange={handleChange} placeholder={t('phone_number')} required className="w-full p-2 border rounded" />
            <div className="flex gap-4">
                <button type="submit" className="bg-primary text-white py-2 px-4 rounded">{t('save_address')}</button>
                {addresses.length > 0 && <button type="button" onClick={() => setShowNewAddressForm(false)} className="bg-gray-200 py-2 px-4 rounded">{t('cancel')}</button>}
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
                  <p><strong>{address.name}</strong></p>
                  <p>{address.line1}</p>
                  <p>{address.city}, {address.postalCode}</p>
                  <p>{address.country}</p>
                </div>
              ))}
            </div>
             {addresses.length > 0 && <button onClick={() => setShowNewAddressForm(!showNewAddressForm)} className="mt-4 text-secondary">{t('add_new_address')}</button>}
            {showNewAddressForm && <AddressForm onSave={async () => {
                if(user) {
                    const freshAddresses = await getAddresses(user.uid);
                    setAddresses(freshAddresses);
                    // Select the newly added address
                    setSelectedAddress(freshAddresses[freshAddresses.length - 1]);
                }
            }} />}
            <button onClick={() => setStep(2)} disabled={!selectedAddress}
                    className="mt-6 w-full bg-primary text-white py-3 rounded-md disabled:bg-gray-400">
              {t('review_confirm')}
            </button>
          </div>
        )}

        {/* Step 2: Review & Confirm */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-serif mb-4">{t('review_confirm')}</h2>
            <div className="bg-surface p-6 rounded-md space-y-6">
              <div>
                <h3 className="font-bold text-lg">{t('shipping_address')}</h3>
                <div className="text-sm">
                    <p>{selectedAddress?.name}</p>
                    <p>{selectedAddress?.line1}</p>
                    <p>{selectedAddress?.city}, {selectedAddress?.postalCode}</p>
                    <button onClick={() => setStep(1)} className="text-secondary text-xs hover:underline mt-1">{t('edit_address')}</button>
                </div>
              </div>
              
              <div className="border-t pt-4">
                 <h3 className="font-bold text-lg">{t('order_summary')}</h3>
                 <div className="space-y-2 mt-2 text-sm">
                    {cart.map(item => <div key={item.id} className="flex justify-between"><span>{item.translations[language]?.title} x {item.quantity}</span> <span>€{(item.priceCents * item.quantity / 100).toFixed(2)}</span></div>)}
                     <div className="flex justify-between border-t pt-2 mt-2"><span>{t('shipping')}</span><span>€15.00</span></div>
                    <p className="font-bold mt-2 text-base flex justify-between">{t('total')}: <span>€{(totalPriceCents / 100 + 15).toFixed(2)}</span></p>
                 </div>
              </div>
               <div>
                <h3 className="font-bold text-lg">{t('payment_method')}</h3>
                 <p className="text-sm">Payment instructions will be sent to your email after placing the order.</p>
              </div>
            </div>
            <button onClick={handlePlaceOrder} disabled={isProcessing} className="mt-6 w-full bg-primary text-white py-3 rounded-md disabled:bg-gray-400">
              {isProcessing ? <Spinner/> : t('place_order')}
            </button>
            <button onClick={() => setStep(1)} className="mt-2 w-full text-center text-sm text-text-secondary">Back</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;