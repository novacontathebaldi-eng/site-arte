import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, ShoppingBag, Heart, Settings, LogOut, Package } from 'lucide-react';
import { useUIStore, useAuthStore, useWishlistStore } from '../store';
import { AvatarUploader } from './dashboard/AvatarUploader';
import { useLanguage } from '../hooks/useLanguage';
import { cn, formatPrice } from '../lib/utils';
import { getCollection } from '../lib/firebase/firestore';
import { where } from 'firebase/firestore';

const DashboardTab: React.FC<{ 
    id: string; 
    label: string; 
    icon: any; 
    active: boolean; 
    onClick: () => void; 
}> = ({ id, label, icon: Icon, active, onClick }) => (
    <button
        onClick={onClick}
        className={cn(
            "flex items-center gap-4 px-6 py-4 w-full text-left transition-all relative overflow-hidden group",
            active ? "text-accent" : "text-gray-400 hover:text-white"
        )}
    >
        <Icon size={20} className={cn("relative z-10 transition-transform group-hover:scale-110", active && "text-accent")} />
        <span className="relative z-10 text-sm uppercase tracking-widest font-medium">{label}</span>
        
        {active && (
            <motion.div 
                layoutId="dashboardTab"
                className="absolute inset-0 bg-white/5 border-r-2 border-accent"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        )}
    </button>
);

export const Dashboard: React.FC = () => {
    const { isDashboardOpen, toggleDashboard, closeAuthModal } = useUIStore();
    const { user, logout } = useAuthStore();
    const { items: wishlistItems } = useWishlistStore();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Fetch Orders when tab active
    useEffect(() => {
        if (activeTab === 'orders' && user) {
            const fetchOrders = async () => {
                setLoadingOrders(true);
                try {
                    const data = await getCollection('orders', where('userId', '==', user.uid));
                    setOrders(data);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoadingOrders(false);
                }
            };
            fetchOrders();
        }
    }, [activeTab, user]);

    const handleLogout = async () => {
        await logout();
        toggleDashboard();
    };

    if (!user) return null;

    return (
        <AnimatePresence>
            {isDashboardOpen && (
                <div className="fixed inset-0 z-[100] overflow-hidden">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={toggleDashboard}
                    />

                    {/* Main Content Slide-in */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="absolute inset-y-0 right-0 w-full md:w-[90%] lg:w-[80%] bg-[#121212] flex shadow-2xl"
                    >
                        {/* Sidebar (Left) */}
                        <div className="w-20 md:w-72 border-r border-white/10 flex flex-col bg-[#1a1a1a]">
                            <div className="h-24 flex items-center justify-center border-b border-white/10">
                                <span className="font-serif text-xl text-white hidden md:block">MY SUITE</span>
                                <span className="font-serif text-xl text-white md:hidden">MS</span>
                            </div>

                            <div className="flex-1 py-8 space-y-2">
                                <DashboardTab id="overview" label="Visão Geral" icon={LayoutDashboard} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                                <DashboardTab id="orders" label="Meus Pedidos" icon={Package} active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                                <DashboardTab id="wishlist" label="Wishlist" icon={Heart} active={activeTab === 'wishlist'} onClick={() => setActiveTab('wishlist')} />
                                <DashboardTab id="settings" label="Configurações" icon={Settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                            </div>

                            <button 
                                onClick={handleLogout}
                                className="p-6 flex items-center gap-4 text-red-500 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="text-sm uppercase tracking-widest hidden md:inline">Logout</span>
                            </button>
                        </div>

                        {/* Content Area (Right) */}
                        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                            {/* Top Bar */}
                            <div className="h-24 border-b border-white/10 flex justify-between items-center px-8 md:px-12 bg-[#1a1a1a]/50 backdrop-blur">
                                <h2 className="text-2xl font-serif text-white capitalize">{activeTab}</h2>
                                <button onClick={toggleDashboard} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-8 md:p-12">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        {activeTab === 'overview' && (
                                            <div className="max-w-4xl">
                                                <div className="flex flex-col md:flex-row gap-12 items-center md:items-start mb-16">
                                                    <AvatarUploader />
                                                    <div className="text-center md:text-left space-y-2">
                                                        <h3 className="text-3xl text-white font-serif">Olá, {user.displayName}</h3>
                                                        <p className="text-gray-400">{user.email}</p>
                                                        <span className="inline-block px-3 py-1 bg-accent/20 text-accent text-[10px] font-bold uppercase tracking-widest rounded border border-accent/20 mt-2">
                                                            Cliente VIP
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Stats Cards */}
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="bg-gradient-to-br from-[#252525] to-[#1a1a1a] p-6 rounded-lg border border-white/5 shadow-lg group hover:border-accent/50 transition-all">
                                                        <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">Total Gasto</div>
                                                        <div className="text-2xl font-serif text-white group-hover:text-accent transition-colors">€ 0,00</div>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-[#252525] to-[#1a1a1a] p-6 rounded-lg border border-white/5 shadow-lg group hover:border-accent/50 transition-all">
                                                        <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">Pedidos</div>
                                                        <div className="text-2xl font-serif text-white group-hover:text-accent transition-colors">0</div>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-[#252525] to-[#1a1a1a] p-6 rounded-lg border border-white/5 shadow-lg group hover:border-accent/50 transition-all">
                                                        <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">Wishlist</div>
                                                        <div className="text-2xl font-serif text-white group-hover:text-accent transition-colors">{wishlistItems.length}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeTab === 'orders' && (
                                            <div className="max-w-4xl">
                                                {loadingOrders ? (
                                                    <div className="text-white">Carregando...</div>
                                                ) : orders.length === 0 ? (
                                                    <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
                                                        <Package className="mx-auto text-gray-600 mb-4" size={48} />
                                                        <p className="text-gray-400">Você ainda não fez nenhum pedido.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        {/* Render Orders List Here */}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'wishlist' && (
                                            <div className="max-w-4xl">
                                                <p className="text-gray-400 mb-8">Seus itens salvos ({wishlistItems.length})</p>
                                                {/* Grid of Wishlist Items would go here */}
                                                {wishlistItems.length === 0 && (
                                                     <div className="text-center py-20 border border-dashed border-white/10 rounded-lg">
                                                        <Heart className="mx-auto text-gray-600 mb-4" size={48} />
                                                        <p className="text-gray-400">Sua lista de desejos está vazia.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {activeTab === 'settings' && (
                                            <div className="max-w-2xl space-y-8">
                                                <div>
                                                    <h3 className="text-white font-serif text-lg mb-4">Segurança</h3>
                                                    <button className="text-accent hover:underline text-sm">Alterar Senha</button>
                                                </div>
                                                <div className="pt-8 border-t border-white/10">
                                                    <h3 className="text-white font-serif text-lg mb-4">Preferências</h3>
                                                    <p className="text-gray-500 text-sm">Gerenciar assinaturas de email e idioma.</p>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};