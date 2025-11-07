import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';
import { AddressWithId } from '../../types';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import Button from '../../components/ui/Button';
import { PlusCircleIcon, EditIcon, TrashIcon } from '../../components/ui/icons';
import AddressModal from '../../components/AddressModal';

const AddressesPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [addresses, setAddresses] = useState<AddressWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<AddressWithId | null>(null);

  const fetchAddresses = async () => {
    if (user) {
      try {
        setIsLoading(true);
        // FIX: Property 'uid' does not exist on type 'UserData'. Use 'user.id' instead.
        const userAddresses = await getAddresses(user.id);
        setAddresses(userAddresses);
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
        showToast(t('toast.error'), 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const handleOpenModal = (address: AddressWithId | null = null) => {
    setAddressToEdit(address);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setAddressToEdit(null);
  };

  const handleSaveAddress = async (addressData: any) => {
    if (!user) return;
    try {
      if (addressToEdit) {
        // FIX: Property 'uid' does not exist on type 'UserData'. Use 'user.id' instead.
        await updateAddress(user.id, addressToEdit.id, addressData);
        showToast(t('toast.addressUpdated'), 'success');
      } else {
        // FIX: Property 'uid' does not exist on type 'UserData'. Use 'user.id' instead.
        await addAddress(user.id, addressData);
        showToast(t('toast.addressAdded'), 'success');
      }
      fetchAddresses();
      handleCloseModal();
    } catch (error) {
      showToast(t('toast.error'), 'error');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user || !window.confirm(t('dashboard.confirmDelete'))) return;
    try {
      // FIX: Property 'uid' does not exist on type 'UserData'. Use 'user.id' instead.
      await deleteAddress(user.id, addressId);
      showToast(t('toast.addressDeleted'), 'info');
      fetchAddresses();
    } catch (error) {
       showToast(t('toast.error'), 'error');
    }
  };

  return (
    <>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-primary">{t('dashboard.addressesTitle')}</h1>
          <Button onClick={() => handleOpenModal()} className="w-auto flex items-center gap-2">
            <PlusCircleIcon className="w-5 h-5" />
            {t('dashboard.addAddress')}
          </Button>
        </div>

        {isLoading ? (
          <p>{t('auth.loading')}...</p>
        ) : addresses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-text-secondary mb-4">{t('dashboard.noAddresses')}</p>
            <button onClick={() => handleOpenModal()} className="text-secondary font-semibold hover:underline">
              {t('dashboard.addFirstAddress')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map(addr => (
              <div key={addr.id} className={`p-4 border rounded-lg ${addr.isDefault ? 'border-secondary' : ''}`}>
                {addr.isDefault && (
                  <span className="text-xs font-bold text-secondary">{t('dashboard.default')}</span>
                )}
                <p className="font-semibold">{addr.recipientName}</p>
                <p className="text-sm text-text-secondary">{addr.addressLine1}</p>
                <p className="text-sm text-text-secondary">{addr.postalCode} {addr.city}</p>
                <p className="text-sm text-text-secondary">{addr.country}</p>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleOpenModal(addr)} className="text-sm flex items-center gap-1 hover:text-secondary"><EditIcon className="w-4 h-4" /> {t('dashboard.editAddress')}</button>
                  <button onClick={() => handleDeleteAddress(addr.id)} className="text-sm flex items-center gap-1 hover:text-red-500"><TrashIcon className="w-4 h-4" /> {t('dashboard.deleteAddress')}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <AddressModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveAddress}
        addressToEdit={addressToEdit}
      />
    </>
  );
};

export default AddressesPage;