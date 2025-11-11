
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Address, AddressWithId } from 'shared/types';
import Input from 'shared/components/ui/Input';
import Button from 'shared/components/ui/Button';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Partial<Address>) => void;
  addressToEdit: AddressWithId | null;
}

const initialAddressState: Omit<Address, 'id' | 'userId'> = {
  name: '',
  line1: '',
  line2: '',
  city: '',
  postalCode: '',
  country: 'Luxembourg',
  phone: '',
  isDefault: false,
};

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onSave, addressToEdit }) => {
  const { t } = useTranslation();
  const [address, setAddress] = useState<Partial<Address>>(initialAddressState);

  useEffect(() => {
    if (addressToEdit) {
      const { id, userId, ...editableAddress } = addressToEdit;
      setAddress(editableAddress);
    } else {
      setAddress(initialAddressState);
    }
  }, [addressToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // FIX: Use `currentTarget` which is correctly typed for the element the event handler is attached to.
    const { name, value, type, checked } = e.currentTarget;
    setAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(address);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-6">
          {addressToEdit ? t('dashboard.editAddress') : t('dashboard.addAddress')}
        </h2>
        <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input id="name" name="name" label={t('dashboard.recipientName')} value={address.name} onChange={handleChange} required />
                <Input id="company" name="company" label={t('dashboard.company')} value={address.company || ''} onChange={handleChange} />
                <Input id="line1" name="line1" label={t('dashboard.addressLine1')} value={address.line1} onChange={handleChange} required className="md:col-span-2" />
                <Input id="line2" name="line2" label={t('dashboard.addressLine2')} value={address.line2 || ''} onChange={handleChange} className="md:col-span-2" />
                <Input id="postalCode" name="postalCode" label={t('dashboard.postalCode')} value={address.postalCode} onChange={handleChange} required />
                <Input id="city" name="city" label={t('dashboard.city')} value={address.city} onChange={handleChange} required />
                <Input id="country" name="country" label={t('dashboard.country')} value={address.country} onChange={handleChange} required />
                <Input id="phone" name="phone" label={t('dashboard.phone')} value={address.phone || ''} onChange={handleChange} />
            </div>
            <div className="mt-4">
                <label className="flex items-center">
                    <input type="checkbox" name="isDefault" checked={address.isDefault} onChange={handleChange} className="mr-2" />
                    {t('dashboard.setAsDefault')}
                </label>
            </div>

          <div className="flex justify-end gap-4 mt-8">
            <Button type="button" variant="secondary" onClick={onClose} className="w-auto">{t('general.cancel')}</Button>
            <Button type="submit" variant="primary" className="w-auto">{t('general.save')}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;