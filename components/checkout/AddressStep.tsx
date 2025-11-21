import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, Unsubscribe } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../hooks/useAuth';
import { Address, AddressDocument } from '../../firebase-types';
import Button from '../common/Button';
import Input from '../common/Input';
import { useI18n } from '../../hooks/useI18n';
import Spinner from '../common/Spinner';

interface AddressStepProps {
  onSubmit: (shippingAddress: Address, billingAddress: Address) => void;
}

const AddressForm: React.FC<{ onSave: (address: Address) => void; }> = ({ onSave }) => {
    const [address, setAddress] = useState<Omit<Address, 'id' | 'userId' | 'isDefault'>>({
        recipientName: '', addressLine1: '', city: '', postalCode: '', country: 'LU'
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAddress({...address, [e.target.name]: e.target.value });
    }
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(address);
    }
    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4 border-t dark:border-white/10 pt-4">
             <Input id="recipientName" name="recipientName" label="Full Name" value={address.recipientName} onChange={handleChange} required />
             <Input id="addressLine1" name="addressLine1" label="Address Line 1" value={address.addressLine1} onChange={handleChange} required />
             <Input id="city" name="city" label="City" value={address.city} onChange={handleChange} required />
             <Input id="postalCode" name="postalCode" label="Postal Code" value={address.postalCode} onChange={handleChange} required />
             <Button type="submit">Save Address</Button>
        </form>
    );
};


const AddressStep: React.FC<AddressStepProps> = ({ onSubmit }) => {
  const { user } = useAuth();
  const { t } = useI18n();
  const [addresses, setAddresses] = useState<AddressDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [selectedBilling, setSelectedBilling] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [useSameAddress, setUseSameAddress] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const q = query(collection(db, "users", user.uid, "addresses"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userAddresses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AddressDocument));
      setAddresses(userAddresses);
      
      if (userAddresses.length > 0) {
        // If there's a default, use it. Otherwise, use the first one.
        const defaultAddress = userAddresses.find(a => a.isDefault);
        if (!selectedShipping) {
          setSelectedShipping(defaultAddress ? defaultAddress.id : userAddresses[0].id);
        }
      } else {
        // Automatically show form if no addresses exist
        setShowNewAddressForm(true);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user, selectedShipping]);
  
  const handleAddNewAddress = async (newAddress: Address) => {
      if (!user) return;
      const addressData: Omit<AddressDocument, 'id'> = {
          ...newAddress,
          userId: user.uid,
          isDefault: addresses.length === 0,
          type: 'shipping', // or make this selectable
      }
      const docRef = await addDoc(collection(db, 'users', user.uid, 'addresses'), addressData);
      setSelectedShipping(docRef.id);
      setShowNewAddressForm(false);
  }

  const handleSubmit = () => {
    const shipping = addresses.find(a => a.id === selectedShipping);
    const billing = useSameAddress ? shipping : addresses.find(a => a.id === selectedBilling);
    if (shipping && billing) {
      onSubmit(shipping, billing);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;

  return (
    <div className="bg-white dark:bg-brand-gray-800 p-8 rounded-lg shadow-md">
      <div>
        <h2 className="text-xl font-bold font-serif mb-4">{t('checkout.shippingAddress')}</h2>
        {addresses.length > 0 && (
            <div className="space-y-4">
                {addresses.map(addr => (
                    <label key={addr.id} className="flex items-start p-4 border dark:border-brand-gray-700 rounded-md cursor-pointer">
                        <input type="radio" name="shippingAddress" value={addr.id} checked={selectedShipping === addr.id} onChange={(e) => setSelectedShipping(e.target.value)} className="mt-1"/>
                        <div className="ml-4">
                            <p className="font-semibold">{addr.recipientName}</p>
                            <p>{addr.addressLine1}</p>
                            <p>{addr.city}, {addr.postalCode}</p>
                            <p>{addr.country}</p>
                        </div>
                    </label>
                ))}
            </div>
        )}
        <button onClick={() => setShowNewAddressForm(!showNewAddressForm)} className="mt-4 text-brand-gold font-semibold">{showNewAddressForm ? 'Cancel' : t('checkout.addNewAddress')}</button>
        {showNewAddressForm && <AddressForm onSave={handleAddNewAddress}/>}
      </div>

      <div className="mt-8 border-t dark:border-white/10 pt-6">
        <h2 className="text-xl font-bold font-serif mb-4">{t('checkout.billingAddress')}</h2>
        <label className="flex items-center">
            <input type="checkbox" checked={useSameAddress} onChange={(e) => setUseSameAddress(e.target.checked)} className="rounded"/>
            <span className="ml-2">{t('checkout.sameAsShipping')}</span>
        </label>
        
        {!useSameAddress && (
             <div className="space-y-4 mt-4">
                {addresses.map(addr => (
                    <label key={addr.id} className="flex items-start p-4 border dark:border-brand-gray-700 rounded-md cursor-pointer">
                        <input type="radio" name="billingAddress" value={addr.id} checked={selectedBilling === addr.id} onChange={(e) => setSelectedBilling(e.target.value)} className="mt-1"/>
                        <div className="ml-4">
                            <p className="font-semibold">{addr.recipientName}</p>
                        </div>
                    </label>
                ))}
            </div>
        )}
      </div>

      <div className="mt-8 text-right">
        <Button onClick={handleSubmit} disabled={!selectedShipping || (!useSameAddress && !selectedBilling)}>{t('checkout.continueToPayment')}</Button>
      </div>
    </div>
  );
};

export default AddressStep;