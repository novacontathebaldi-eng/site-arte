import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, limit, orderBy, getCountFromServer } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useI18n } from '../../../hooks/useI18n';
import { OrderDocument, ProductDocument, ContactMessageDocument } from '../../../firebase-types';
import Skeleton from '../../common/Skeleton';
import { useRouter } from '../../../hooks/useRouter';

// Icon Components
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
const PackageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const MessageSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;


interface DashboardStats {
    totalSales: number;
    totalOrders: number;
    totalCustomers: number;
    recentOrders: OrderDocument[];
    lowStockProducts: ProductDocument[];
    unreadMessages: ContactMessageDocument[];
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
    <div className="bg-brand-white dark:bg-brand-gray-800 p-6 rounded-lg shadow-sm transition-shadow hover:shadow-md">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-brand-black/60 dark:text-brand-white/60">{title}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
            </div>
            <div className="p-3 bg-brand-gold/10 rounded-full text-brand-gold">
                {icon}
            </div>
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
    const { t } = useI18n();
    const { navigate } = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // KPIs
                const ordersQuery = query(collection(db, 'orders'), where('paymentStatus', '==', 'paid'));
                const ordersSnapshot = await getDocs(ordersQuery);
                const totalSales = ordersSnapshot.docs.reduce((sum, doc) => sum + doc.data().pricing.total, 0);

                const totalOrdersSnapshot = await getCountFromServer(collection(db, 'orders'));
                const totalCustomersSnapshot = await getCountFromServer(query(collection(db, 'users'), where('role', '==', 'customer')));

                // Recent Orders
                const recentOrdersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
                const recentOrdersSnapshot = await getDocs(recentOrdersQuery);
                const recentOrders = recentOrdersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderDocument));

                // Low Stock Products
                const lowStockQuery = query(collection(db, 'products'), where('stock', '<', 5), where('stock', '>', 0), orderBy('stock', 'asc'), limit(5));
                const lowStockSnapshot = await getDocs(lowStockQuery);
                const lowStockProducts = lowStockSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductDocument));
                
                // Unread Messages
                const unreadMessagesQuery = query(collection(db, 'contact_messages'), where('isRead', '==', false), limit(5));
                const unreadMessagesSnapshot = await getDocs(unreadMessagesQuery);
                const unreadMessages = unreadMessagesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ContactMessageDocument));


                setStats({
                    totalSales,
                    totalOrders: totalOrdersSnapshot.data().count,
                    totalCustomers: totalCustomersSnapshot.data().count,
                    recentOrders,
                    lowStockProducts,
                    unreadMessages
                });
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const statCards = [
        { title: t('admin.dashboard.totalSales'), value: `€${((stats?.totalSales || 0) / 100).toFixed(2)}`, icon: <DollarSignIcon /> },
        { title: t('admin.dashboard.totalOrders'), value: String(stats?.totalOrders || 0), icon: <ShoppingCartIcon /> },
        { title: t('admin.dashboard.totalCustomers'), value: String(stats?.totalCustomers || 0), icon: <UsersIcon /> },
    ];

    const DashboardCard: React.FC<{title: string, children: React.ReactNode, viewAllLink?: string}> = ({title, children, viewAllLink}) => (
        <div className="bg-brand-white dark:bg-brand-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold font-serif">{title}</h3>
                {viewAllLink && <a href={`#${viewAllLink}`} className="text-sm font-medium text-brand-gold hover:underline">{t('admin.dashboard.viewAll')}</a>}
            </div>
            {children}
        </div>
    );
    
    if (loading) {
        return <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="lg:col-span-2 h-80" />
                <Skeleton className="h-80" />
            </div>
        </div>
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statCards.map(stat => <StatCard key={stat.title} {...stat} />)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <DashboardCard title={t('admin.dashboard.recentOrders')} viewAllLink="/admin/orders">
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody>
                                    {stats?.recentOrders.map(order => (
                                        <tr key={order.id} className="border-b last:border-b-0 border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer" onClick={() => navigate(`/admin/orders/${order.id}`)}>
                                            <td className="p-3">#{order.id.slice(0, 6)}</td>
                                            <td className="p-3">{order.user?.displayName || order.user?.email}</td>
                                            <td className="p-3 capitalize">{order.status}</td>
                                            <td className="p-3 text-right font-medium">€{(order.pricing.total / 100).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </DashboardCard>
                </div>
                 <div>
                     <DashboardCard title={t('admin.dashboard.lowStock')} viewAllLink="/admin/products">
                        <ul className="space-y-3 text-sm">
                            {stats?.lowStockProducts.map(p => (
                                <li key={p.id} className="flex justify-between items-center">
                                    <span className="truncate">{p.translations?.en?.title || p.sku}</span>
                                    <span className="font-bold ml-4">{p.stock} left</span>
                                </li>
                            ))}
                        </ul>
                    </DashboardCard>
                 </div>
            </div>
        </div>
    );
};

export default DashboardPage;