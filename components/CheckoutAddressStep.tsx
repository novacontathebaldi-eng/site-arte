

import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import { AddressWithId, Address } from '../types';
import { getAddresses, addAddress } from '../services/api';
import AddressModal from './AddressModal';
import Button from './ui/Button';

interface CheckoutAddressStepProps {
  onAddressSelect: (address: AddressWithId) => void;
}

const CheckoutAddressStep: React.FC<CheckoutAddressStepProps> = ({ onAddressSelect }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<AddressWithId[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (user) {
        const userAddresses = await getAddresses(user.uid);
        setAddresses(userAddresses);
        const defaultAddress = userAddresses.find(a => a.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
          onAddressSelect(defaultAddress);
        } else if (userAddresses.length > 0) {
          setSelectedAddressId(userAddresses[0].id);
           onAddressSelect(userAddresses[0]);
        }
      }
    };
    fetchAddresses();
  }, [user, onAddressSelect]);

  const handleSaveNewAddress = async (addressData: Partial<Address>) => {
    if (!user) return;
    // FIX: The `addAddress` function expects a full `Address` object.
    // We construct a valid object by adding the required `userId` from the current user
    // and casting, as other required fields are guaranteed by the form.
    const newAddress = await addAddress(user.uid, { ...addressData, userId: user.uid } as Address);
    setAddresses(prev => [...prev, newAddress]);
    setSelectedAddressId(newAddress.id);
    onAddressSelect(newAddress);
    setIsModalOpen(false);
  };

  const handleContinue = () => {
    const selected = addresses.find(a => a.id === selectedAddressId);
    if (selected) {
      onAddressSelect(selected);
    }
  };
  
  const handleSelectAddress = (address: AddressWithId) => {
    setSelectedAddressId(address.id);
    onAddressSelect(address);
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{t('checkout.selectAddress')}</h2>
      <div className="space-y-4">
        {addresses.map(addr => (
          <label key={addr.id} className={`flex items-start p-4 border rounded-lg cursor-pointer ${selectedAddressId === addr.id ? 'border-secondary bg-secondary/5' : ''}`}>
            <input
              type="radio"
              name="address"
              value={addr.id}
              checked={selectedAddressId === addr.id}
              onChange={() => handleSelectAddress(addr)}
              className="mt-1"
            />
            <div className="ml-4 text-sm">
              <p className="font-semibold">{addr.name}</p>
              <p>{addr.line1}</p>
              <p>{addr.postalCode} {addr.city}</p>
              <p>{addr.country}</p>
            </div>
          </label>
        ))}
      </div>
      <button onClick={() => setIsModalOpen(true)} className="text-secondary font-semibold mt-4 hover:underline">
        + {t('checkout.deliverToNewAddress')}
      </button>

      <div className="mt-8 flex justify-end">
        <Button onClick={handleContinue} disabled={!selectedAddressId} className="w-auto">
          {t('checkout.continueToPayment')}
        </Button>
      </div>

      <AddressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveNewAddress}
        addressToEdit={null}
      />
    </div>
  );
};

export default CheckoutAddressStep;