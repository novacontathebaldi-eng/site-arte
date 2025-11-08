import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAddresses, addAddress, deleteAddress, updateAddress } from '../../services/firestoreService';
import { Address } from '../../types';
import Spinner from '../../components/Spinner';
import { useTranslation } from '../../hooks/useTranslation';
import toast from 'react-hot-toast';

const AddressForm: React.FC<{ onSave: () => void; onCancel: () => void; address?: Address | null }> = ({ onSave, onCancel, address }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        name: address?.name || '',
        line1: address?.line1 || '',
        line2: address?.line2 || '',
        city: address?.city || '',
        postalCode: address?.postalCode || '',
        country: address?.country || '',
        phone: address?.phone || '',
        isDefault: address?.isDefault || false,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
             const addressPayload = { ...formData };
            if (address?.id) {
                // Update existing address
                await updateAddress(user.uid, address.id, addressPayload);
            } else {
                // Add new address
                await addAddress(user.uid, addressPayload);
            }
            toast.success(t('address_saved'));
            onSave();
        } catch (error) {
            toast.error(t('error_saving_address'));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-serif mb-4">{address ? t('edit_address') : t('add_new_address')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input name="name" value={formData.name} onChange={handleChange} placeholder={t('recipient_name')} required className="w-full p-2 border rounded" />
                    <input name="line1" value={formData.line1} onChange={handleChange} placeholder={t('address_line_1')} required className="w-full p-2 border rounded" />
                    <input name="line2" value={formData.line2} onChange={handleChange} placeholder={t('address_line_2')} className="w-full p-2 border rounded" />
                    <input name="city" value={formData.city} onChange={handleChange} placeholder={t('city')} required className="w-full p-2 border rounded" />
                    <input name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder={t('postal_code')} required className="w-full p-2 border rounded" />
                    <input name="country" value={formData.country} onChange={handleChange} placeholder={t('country')} required className="w-full p-2 border rounded" />
                    <input name="phone" value={formData.phone} onChange={handleChange} placeholder={t('phone_number')} required className="w-full p-2 border rounded" />
                    <label className="flex items-center">
                        <input type="checkbox" name="isDefault" checked={formData.isDefault} onChange={handleChange} className="mr-2" />
                        {t('set_as_default')}
                    </label>
                    <div className="flex gap-4">
                        <button type="submit" className="bg-primary text-white py-2 px-4 rounded">{t('save_address')}</button>
                        <button type="button" onClick={onCancel} className="bg-gray-200 py-2 px-4 rounded">{t('cancel')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const DashboardAddressesPage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const fetchAddresses = async () => {
        if (!user) return;
        setLoading(true);
        const userAddresses = await getAddresses(user.uid);
        setAddresses(userAddresses);
        setLoading(false);
    };

    useEffect(() => {
        fetchAddresses();
    }, [user]);

    const handleAddClick = () => {
        setEditingAddress(null);
        setIsFormVisible(true);
    };
    
    const handleEditClick = (address: Address) => {
        setEditingAddress(address);
        setIsFormVisible(true);
    }

    const handleDelete = async (addressId: string) => {
        if (window.confirm(t('confirm_delete_address'))) {
            if (!user) return;
            try {
                await deleteAddress(user.uid, addressId);
                toast.success(t('address_deleted'));
                fetchAddresses();
            } catch (error) {
                toast.error(t('error_deleting_address'));
            }
        }
    };

    const handleSave = () => {
        setIsFormVisible(false);
        setEditingAddress(null);
        fetchAddresses();
    };

    if (loading) return <Spinner />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-serif">{t('my_addresses')}</h1>
                <button onClick={handleAddClick} className="bg-primary text-white py-2 px-4 rounded hover:bg-opacity-90">{t('add_new_address')}</button>
            </div>
            {addresses.length === 0 ? (
                <p>{t('no_addresses_found')}</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map(address => (
                        <div key={address.id} className="p-6 bg-surface rounded-lg shadow-sm">
                            {address.isDefault && <span className="text-xs font-bold text-accent mb-2 inline-block">{t('default')}</span>}
                            <p className="font-semibold text-lg">{address.name}</p>
                            <p>{address.line1}</p>
                            {address.line2 && <p>{address.line2}</p>}
                            <p>{address.city}, {address.postalCode}</p>
                            <p>{address.country}</p>
                            <p>{address.phone}</p>
                            <div className="mt-4 space-x-4">
                                <button onClick={() => handleEditClick(address)} className="text-secondary hover:underline">{t('edit_address')}</button>
                                <button onClick={() => handleDelete(address.id)} className="text-red-500 hover:underline">{t('delete_address')}</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {isFormVisible && <AddressForm onSave={handleSave} onCancel={() => setIsFormVisible(false)} address={editingAddress} />}
        </div>
    );
};

export default DashboardAddressesPage;