import React, { useState, useEffect } from 'react';
import { doc, setDoc, addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { DiscountCodeDocument } from '../../../firebase-types';
import Button from '../../common/Button';
import Input from '../../common/Input';
import { useToast } from '../../../hooks/useToast';
import { useI18n } from '../../../hooks/useI18n';
import Spinner from '../../common/Spinner';

interface DiscountCodeFormProps {
  code: DiscountCodeDocument | null;
  onSuccess: () => void;
}

const DiscountCodeForm: React.FC<DiscountCodeFormProps> = ({ code, onSuccess }) => {
    const [formData, setFormData] = useState({
        code: '',
        type: 'percentage' as 'percentage' | 'fixed_amount',
        value: 0,
        expiresAt: '',
        isActive: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToast();
    const { t } = useI18n();

    useEffect(() => {
        if (code) {
            setFormData({
                code: code.code,
                type: code.type,
                value: code.value,
                expiresAt: code.expiresAt ? new Date(code.expiresAt.seconds * 1000).toISOString().split('T')[0] : '',
                isActive: code.isActive,
            });
        }
    }, [code]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // FIX: Added missing 'usageLimit' property to satisfy the type.
            const dataToSave: Omit<DiscountCodeDocument, 'id' | 'timesUsed' | 'minPurchase'> = {
                code: formData.code.toUpperCase(),
                type: formData.type,
                value: Number(formData.value),
                expiresAt: formData.expiresAt ? Timestamp.fromDate(new Date(formData.expiresAt)) : null,
                isActive: formData.isActive,
                usageLimit: null, // Defaulting to no limit as it's not in the form
            };
            
            if (code?.id) {
                await setDoc(doc(db, "discount_codes", code.id), dataToSave, { merge: true });
                addToast('Code updated successfully', 'success');
            } else {
                await addDoc(collection(db, "discount_codes"), {
                    ...dataToSave,
                    timesUsed: 0,
                    minPurchase: 0, // Default value
                });
                addToast('Code created successfully', 'success');
            }
            onSuccess();
        } catch (error) {
            addToast('Error saving code', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold font-serif mb-6">
                {code ? t('admin.discounts.editTitle') : t('admin.discounts.newTitle')}
            </h2>
            <div className="space-y-4">
                <Input id="code" name="code" label={t('admin.discounts.form.code')} value={formData.code} onChange={handleChange} required />
                <div>
                    <label className="block text-sm font-medium text-brand-black/80 dark:text-brand-white/80 mb-1">{t('admin.discounts.form.type')}</label>
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border dark:border-white/20 rounded-md bg-transparent dark:bg-gray-800">
                        <option value="percentage">{t('admin.discounts.form.percentage')}</option>
                        <option value="fixed_amount">{t('admin.discounts.form.fixedAmount')}</option>
                    </select>
                </div>
                 <div>
                    <Input id="value" name="value" label={t('admin.discounts.form.value')} type="number" value={formData.value} onChange={handleChange} required />
                    <p className="text-xs text-brand-black/60 dark:text-brand-white/60 mt-1">
                        {formData.type === 'percentage' ? t('admin.discounts.form.valueHelpPercentage') : t('admin.discounts.form.valueHelpFixed')}
                    </p>
                </div>
                <Input id="expiresAt" name="expiresAt" label={t('admin.discounts.form.expiresAt')} type="date" value={formData.expiresAt} onChange={handleChange} />
                <label className="flex items-center space-x-2">
                    <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                    <span>{t('admin.discounts.form.isActive')}</span>
                </label>
            </div>
             <div className="mt-6 flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Spinner size="sm" color="border-white" />}
                    {t('admin.discounts.form.save')}
                </Button>
            </div>
        </form>
    );
};

export default DiscountCodeForm;
