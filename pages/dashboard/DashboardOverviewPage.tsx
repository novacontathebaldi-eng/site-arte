
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';
import { DashboardStats, Order } from '../../types';
import { getUserDashboardStats, getOrdersByUserId } from '../../services/api';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { PackageIcon, EuroIcon, HeartIcon, TruckIcon } from '../../components/ui/icons';
import Badge from '../../components/ui/Badge';

const StatCard: React.FC<{ icon: React.ElementType, title: string, value: string | number, linkTo?: string }> = ({ icon: Icon, title, value, linkTo }) => {
    const content = (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
            <div className="bg-secondary/10 p-3 rounded-full">
                <Icon className="w-6 h-6 text-secondary" />
            </div>
            <div>
                <p className="text-sm text-text-secondary">{title}</p>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
            </div>
        </div>
    );
    return linkTo ? <Link to={linkTo}>{content}</Link> : content;
};


const DashboardOverviewPage: React.FC = () => {
    const { t, language } = useTranslation();
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                try {
                    setIsLoading(true);
                    const [userStats, allOrders] = await Promise.all([
                        // FIX: Property 'id' does not exist on type 'UserData'. Use 'uid' instead.
                        getUserDashboardStats(user.uid),
                        // FIX: Property 'id' does not exist on type 'UserData'. Use 'uid' instead.
                        getOrdersByUserId(user.uid)
                    ]);
                    setStats(userStats);
                    setRecentOrders(allOrders.slice(0, 3));
                } catch (error) {
                    console.error("Failed to fetch dashboard data:", error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchData();
    }, [user]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(language + '-LU', { style: 'currency', currency: 'EUR' }).format(amount);
    };
    
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(language, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary">
                {t('dashboard.overviewTitle')} {user?.profile?.display_name || user?.email}!
            </h1>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard icon={PackageIcon} title={t('dashboard.totalOrders')} value={stats?.totalOrders ?? 0} linkTo={ROUTES.DASHBOARD_ORDERS} />
                <StatCard icon={EuroIcon} title={t('dashboard.totalSpent')} value={formatCurrency(stats?.totalSpent ?? 0)} />
                <StatCard icon={TruckIcon} title={t('dashboard.activeOrders')} value={recentOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length} />
                <StatCard icon={HeartIcon} title={t('dashboard.wishlistItems')} value={stats?.wishlistCount ?? 0} linkTo={ROUTES.DASHBOARD_WISHLIST} />
            </div>

            {/* Pedidos Recentes */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-primary mb-4">{t('dashboard.recentOrders')}</h2>
                {isLoading ? (
                    <p>{t('auth.loading')}...</p>
                ) : recentOrders.length > 0 ? (
                    <div className="space-y-4">
                        {recentOrders.map(order => (
                            <div key={order.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-surface transition-colors">
                                <div>
                                    <p className="font-semibold text-primary">{order.orderNumber}</p>
                                    <p className="text-sm text-text-secondary">{formatDate(order.createdAt)}</p>
                                </div>
                                <div className="flex items-center gap-4 mt-2 sm:mt-0">
                                    <p className="font-semibold">{formatCurrency(order.pricing.total)}</p>
                                    <Badge>{t(`orderStatus.${order.status}`)}</Badge>
                                    <Link to={`/dashboard/orders/${order.id}`} className="text-secondary font-semibold text-sm hover:underline">{t('dashboard.viewDetails')}</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-secondary">{t('dashboard.noOrders')}</p>
                )}
            </div>
        </div>
    );
};

export default DashboardOverviewPage;