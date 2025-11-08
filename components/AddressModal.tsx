
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Address, AddressWithId } from '../types';
import Input from './ui/Input';
import Button from './ui/Button';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  addressToEdit: AddressWithId | null;
}

const initialAddressState: Address = {
  recipientName: '',
  company: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  country: 'Luxembourg',
  phone: '',
  isDefault: false,
};

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose, onSave, addressToEdit }) => {
  const { t } = useTranslation();
  const [address, setAddress] = useState<Address>(initialAddressState);

  useEffect(() => {
    if (addressToEdit) {
      setAddress(addressToEdit);
    } else {
      setAddress(initialAddressState);
    }
  }, [addressToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
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
            {/* FIX: Removed 'label' prop from Input components and added explicit <label> elements. */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="recipientName" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.recipientName')}</label>
                    <Input id="recipientName" name="recipientName" value={address.recipientName} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.company')}</label>
                    <Input id="company" name="company" value={address.company || ''} onChange={handleChange} />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.addressLine1')}</label>
                    <Input id="addressLine1" name="addressLine1" value={address.addressLine1} onChange={handleChange} required />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.addressLine2')}</label>
                    <Input id="addressLine2" name="addressLine2" value={address.addressLine2 || ''} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.postalCode')}</label>
                    <Input id="postalCode" name="postalCode" value={address.postalCode} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.city')}</label>
                    <Input id="city" name="city" value={address.city} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.country')}</label>
                    <Input id="country" name="country" value={address.country} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">{t('dashboard.phone')}</label>
                    <Input id="phone" name="phone" value={address.phone} onChange={handleChange} required />
                </div>
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
