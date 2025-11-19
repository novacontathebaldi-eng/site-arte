import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, collection, query, where, getDocs, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { UserDocument, OrderDocument } from '../../../firebase-types';
import Spinner from '../../common/Spinner';
import { useI18n } from '../../../hooks/useI18n';
import { useToast } from '../../../hooks/useToast';
import Button from '../../common/Button';
import { useRouter } from '../../../hooks/useRouter';
// FIX: Moved missing import for Input component to the top of the file.
import Input from '../../common/Input';

interface CustomerDetailAdminPageProps {
  userId: string;
}

const CustomerDetailAdminPage: React.FC<CustomerDetailAdminPageProps> = ({ userId }) => {
    const [customer, setCustomer] = useState<UserDocument | null>(null);
    const [orders, setOrders] = useState<OrderDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [notes, setNotes] = useState('');

    const { t } = useI18n();
    const { addToast } = useToast();
    const { navigate } = useRouter();

    const fetchCustomerData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch user document
            const userDocRef = doc(db, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userData = { uid: userDocSnap.id, ...userDocSnap.data() } as UserDocument;
                setCustomer(userData);
                setNotes(userData.adminNotes || '');
            } else {
                 addToast('Customer not found', 'error');
                 setLoading(false);
                 return;
            }

            // Fetch user's orders
            const ordersQuery = query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
            const ordersSnapshot = await getDocs(ordersQuery);
            const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderDocument));
            setOrders(ordersData);

        } catch (error) {
            addToast('Failed to fetch customer data', 'error');
        } finally {
            setLoading(false);
        }
    }, [userId, addToast]);

    useEffect(() => {
        fetchCustomerData();
    }, [fetchCustomerData]);
    
    const handleSaveNotes = async () => {
        const userDocRef = doc(db, 'users', userId);
        try {
            await updateDoc(userDocRef, { adminNotes: notes });
            addToast(t('admin.customers.notesSaved'), 'success');
        } catch (error) {
             addToast('Failed to save notes', 'error');
        }
    };
    
    if (loading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;
    if (!customer) return <p>Customer not found.</p>;
    
    const Card: React.FC<{title: string, children: React.ReactNode, className?: string}> = ({title, children, className}) => (
        <div className={`bg-white p-6 rounded-lg shadow-sm ${className}`}>
            <h3 className="font-bold font-serif mb-4">{title}</h3>
            {children}
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-8">
                <Card title={t('admin.customers.detailsTitle')}>
                    <div className="flex items-center space-x-4">
                        <img src={customer.photoURL || `https://ui-avatars.com/api/?name=${customer.displayName}&background=D4AF37&color=2C2C2C`} alt="avatar" className="w-16 h-16 rounded-full"/>
                        <div>
                            <p className="font-bold">{customer.displayName}</p>
                            <p className="text-sm text-brand-black/70">{customer.email}</p>
                        </div>
                    </div>
                    <div className="text-sm mt-4 space-y-1">
                        <p>{t('admin.customers.lastLogin')}: {new Date(customer.lastLogin.seconds * 1000).toLocaleString()}</p>
                        <p>{t('admin.customers.totalSpent')}: €{(customer.stats.totalSpent / 100).toFixed(2)} ({customer.stats.totalOrders} orders)</p>
                    </div>
                </Card>
                 <Card title={t('admin.customers.internalNotes')}>
                     <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5} className="w-full text-sm p-2 border rounded-md"></textarea>
                     <Button onClick={handleSaveNotes} size="sm" className="mt-2">{t('admin.customers.saveNotes')}</Button>
                 </Card>
                 <Card title={t('admin.customers.sendEmail')}>
                     <p className="text-sm text-brand-black/70 mb-4">This form simulates sending an email via Brevo from a secure backend function.</p>
                     <Input id="subject" label={t('admin.customers.subject')} className="text-sm"/>
                     <textarea rows={4} placeholder={t('admin.customers.message')} className="w-full text-sm p-2 border rounded-md mt-2"></textarea>
                     <Button size="sm" className="mt-2">Send</Button>
                 </Card>
            </div>
             <div className="lg:col-span-2">
                <Card title={t('admin.customers.orderHistory')}>
                    {orders.length === 0 ? (
                        <p className="text-sm text-brand-black/70">{t('admin.customers.noOrders')}</p>
                    ) : (
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody>
                                    {orders.map(order => (
                                        <tr key={order.id} className="border-b last:border-b-0 border-black/5 hover:bg-black/5 cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                                            <td className="p-3 font-mono text-xs">#{order.id.slice(0, 6)}</td>
                                            <td className="p-3">{new Date(order.createdAt.seconds * 1000).toLocaleDateString()}</td>
                                            <td className="p-3 capitalize">{order.status}</td>
                                            <td className="p-3 text-right font-medium">€{(order.pricing.total / 100).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default CustomerDetailAdminPage;