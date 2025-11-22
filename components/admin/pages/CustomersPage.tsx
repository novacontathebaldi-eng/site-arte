import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { UserDocument } from '../../../firebase-types';
import Spinner from '../../common/Spinner';
import { useI18n } from '../../../hooks/useI18n';
import Button from '../../common/Button';
import { useRouter } from '../../../hooks/useRouter';

const CustomersPage: React.FC = () => {
    const [customers, setCustomers] = useState<UserDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useI18n();
    const { navigate } = useRouter();

    useEffect(() => {
        const fetchCustomers = async () => {
            setLoading(true);
            // FIX: Removed orderBy to prevent composite index error. Data is sorted client-side.
            const q = query(collection(db, "users"), where("role", "==", "customer"));
            const querySnapshot = await getDocs(q);
            const customersData = querySnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserDocument));
            
            // Sort by creation date on the client
            customersData.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return b.createdAt.seconds - a.createdAt.seconds;
                }
                return 0;
            });

            setCustomers(customersData);
            setLoading(false);
        };
        fetchCustomers();
    }, []);
    
    if (loading) {
        return <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>
    }

    return (
        <div className="bg-brand-white dark:bg-brand-black p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold font-serif mb-6">{t('admin.customers.title')}</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                     <thead className="bg-black/5 dark:bg-white/5">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Total Orders</th>
                            <th className="p-3 text-right">Total Spent</th>
                            <th className="p-3 text-right">Actions</th>
                        </tr>
                    </thead>
                     <tbody>
                        {customers.map(customer => (
                            <tr key={customer.uid} className="border-b border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <td className="p-3 font-medium">{customer.displayName}</td>
                                <td className="p-3">{customer.email}</td>
                                <td className="p-3">{customer.stats.totalOrders}</td>
                                <td className="p-3 text-right">€{(customer.stats.totalSpent / 100).toFixed(2)}</td>
                                <td className="p-3 text-right">
                                    <Button size="sm" variant="tertiary" onClick={() => navigate(`/admin/customers/${customer.uid}`)}>View Details</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomersPage;
