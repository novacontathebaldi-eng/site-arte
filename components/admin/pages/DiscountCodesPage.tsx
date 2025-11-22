import React, { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { DiscountCodeDocument } from '../../../firebase-types';
import Button from '../../common/Button';
import { useToast } from '../../../hooks/useToast';
import Spinner from '../../common/Spinner';
import { useI18n } from '../../../hooks/useI18n';
import Modal from '../../common/Modal';
import DiscountCodeForm from '../forms/DiscountCodeForm';

const DiscountCodesPage: React.FC = () => {
    const [codes, setCodes] = useState<DiscountCodeDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCode, setSelectedCode] = useState<DiscountCodeDocument | null>(null);
    
    const { addToast } = useToast();
    const { t } = useI18n();

    const fetchCodes = useCallback(async () => {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, "discount_codes"));
        const codesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiscountCodeDocument));
        setCodes(codesData);
        setLoading(false);
    }, []);
    
    useEffect(() => {
        fetchCodes();
    }, [fetchCodes]);

    const handleDelete = async (id: string) => {
        if (window.confirm(t('admin.discounts.deleteConfirm'))) {
            try {
                await deleteDoc(doc(db, "discount_codes", id));
                addToast("Code deleted successfully", "success");
                fetchCodes();
            } catch (error) {
                addToast("Error deleting code", "error");
            }
        }
    };

    const handleOpenModal = (code: DiscountCodeDocument | null = null) => {
        setSelectedCode(code);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCode(null);
        fetchCodes(); // Refresh list after modal closes
    };

    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>;
    }

    return (
        <>
            <div className="bg-brand-white dark:bg-brand-black p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold font-serif">{t('admin.discounts.title')}</h2>
                    <Button onClick={() => handleOpenModal()}>{t('admin.discounts.addNew')}</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-black/5 dark:bg-white/5">
                            <tr>
                                <th className="p-3">{t('admin.discounts.table.code')}</th>
                                <th className="p-3">{t('admin.discounts.table.type')}</th>
                                <th className="p-3">{t('admin.discounts.table.value')}</th>
                                <th className="p-3">{t('admin.discounts.table.status')}</th>
                                <th className="p-3">{t('admin.discounts.table.expires')}</th>
                                <th className="p-3 text-right">{t('admin.discounts.table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {codes.map(code => (
                                <tr key={code.id} className="border-b border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                    <td className="p-3 font-mono font-bold text-brand-gold">{code.code}</td>
                                    <td className="p-3 capitalize">{code.type.replace('_', ' ')}</td>
                                    <td className="p-3">{code.type === 'percentage' ? `${code.value}%` : `€${(code.value/100).toFixed(2)}`}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${code.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {code.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="p-3">{code.expiresAt ? new Date(code.expiresAt.seconds * 1000).toLocaleDateString() : 'Never'}</td>
                                    <td className="p-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button size="sm" variant="tertiary" onClick={() => handleOpenModal(code)}>Edit</Button>
                                            <Button size="sm" variant="tertiary" className="text-red-600" onClick={() => handleDelete(code.id)}>Delete</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <DiscountCodeForm code={selectedCode} onSuccess={handleCloseModal} />
            </Modal>
        </>
    );
};

export default DiscountCodesPage;
