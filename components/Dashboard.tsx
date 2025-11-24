
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Package, Heart, LogOut, MapPin, User, Plus, Edit, Save, Trash2, Phone, Globe, CheckCircle, Loader2 } from 'lucide-react';
import { useUIStore, useAuthStore, useWishlistStore } from '../store';
import { AvatarUploader } from './dashboard/AvatarUploader';
import { useLanguage } from '../hooks/useLanguage';
import { cn, formatPrice } from '../lib/utils';
import { updateDocument } from '../lib/firebase/firestore';
import { auth, db } from '../lib/firebase/config';
import { Address, Product } from '../types';

// --- Constants ---
const COUNTRIES = ["Luxembourg", "France", "Germany", "Portugal", "Belgium", "Netherlands", "United Kingdom", "United States", "Brazil", "Spain", "Italy"];

// --- Components ---

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
            active ? "text-accent bg-white/5" : "text-gray-400 hover:text-white hover:bg-white/5"
        )}
    >
        <Icon size={20} className={cn("relative z-10 transition-transform group-hover:scale-110", active && "text-accent")} />
        <span className="relative z-10 text-sm uppercase tracking-widest font-medium">{label}</span>
        
        {active && (
            <motion.div 
                className="absolute left-0 top-0 bottom-0 w-[3px] bg-accent"
                {...({ layoutId: "activeDashboardTabIndicator" } as any)}
            />
        )}
    </button>
);

const InputField = ({ label, value, onChange, placeholder, required = false, type = "text" }: any) => (
    <div className="mb-4">
        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">{label} {required && '*'}</label>
        <input 
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-[#121212] border border-white/10 rounded-sm px-4 py-3 text-white focus:border-accent focus:outline-none transition-colors text-sm"
            required={required}
        />
    </div>
);

export const Dashboard: React.FC = () => {
    const { isDashboardOpen, toggleDashboard, closeAllOverlays } = useUIStore();
    const { user, logout, setUser, isLoading } = useAuthStore();
    const { items: wishlistIds } = useWishlistStore();
    const { t } = useLanguage();
    
    // Tabs
    const [activeTab, setActiveTab] = useState('overview');
    
    // Data States
    const [orders, setOrders] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    
    const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
    const [loadingWishlist, setLoadingWishlist] = useState(false);

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    
    // Address Form State
    const [addressForm, setAddressForm] = useState<Partial<Address>>({
        country: 'Luxembourg'
    });

    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({
        displayName: '',
        phoneNumber: ''
    });

    // --- Critical Fix: Auto-close only if NOT loading and user is missing ---
    useEffect(() => {
        if (isDashboardOpen && !isLoading && !user) {
            closeAllOverlays();
        }
    }, [isDashboardOpen, user, isLoading, closeAllOverlays]);

    // --- Effects ---

    // Fetch Orders
    useEffect(() => {
        if (activeTab === 'orders' && user) {
            const fetchOrders = async () => {
                setLoadingOrders(true);
                try {
                    const ordersRef = db.collection('orders').where('userId', '==', user.uid).orderBy('createdAt', 'desc');
                    const snapshot = await ordersRef.get();
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setOrders(data);
                } catch (e) {
                    console.error("Error fetching orders", e);
                } finally {
                    setLoadingOrders(false);
                }
            };
            fetchOrders();
        }
    }, [activeTab, user]);

    // Fetch Wishlist Details
    useEffect(() => {
        if (activeTab === 'wishlist' && user && wishlistIds.length > 0) {
            const fetchWishlist = async () => {
                setLoadingWishlist(true);
                try {
                    const products: Product[] = [];
                    for (const id of wishlistIds) {
                        const doc = await db.collection('products').doc(id).get();
                        if (doc.exists) products.push({ id: doc.id, ...doc.data() } as Product);
                    }
                    setWishlistProducts(products);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoadingWishlist(false);
                }
            };
            fetchWishlist();
        } else {
             setWishlistProducts([]);
        }
    }, [activeTab, user, wishlistIds]);

    // Fetch Addresses
    useEffect(() => {
        if ((activeTab === 'addresses' || activeTab === 'overview') && user) {
            const fetchAddresses = async () => {
                setLoadingAddresses(true);
                try {
                    const snapshot = await db.collection('users').doc(user.uid).collection('addresses').get();
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Address[];
                    setAddresses(data);
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoadingAddresses(false);
                }
            };
            fetchAddresses();
        }
    }, [activeTab, user]);

    // Init Profile Form
    useEffect(() => {
        if (user) {
            setProfileForm({
                displayName: user.displayName || '',
                phoneNumber: user.phoneNumber || ''
            });
        }
    }, [user]);


    // --- Actions ---

    const handleLogout = async () => {
        await logout();
        closeAllOverlays(); // Ensures Dashboard closes immediately and cleans UI state
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            await auth.currentUser?.updateProfile({ displayName: profileForm.displayName });
            await updateDocument('users', user.uid, { 
                displayName: profileForm.displayName,
                phoneNumber: profileForm.phoneNumber 
            });
            setUser({ ...user, displayName: profileForm.displayName, phoneNumber: profileForm.phoneNumber });
            setIsEditingProfile(false);
        } catch (e) {
            console.error("Profile update failed", e);
        }
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            if (editingAddress) {
                await db.collection('users').doc(user.uid).collection('addresses').doc(editingAddress.id).update(addressForm);
            } else {
                await db.collection('users').doc(user.uid).collection('addresses').add({
                    ...addressForm,
                    createdAt: new Date().toISOString()
                });
            }
            
            // Refresh
            const snapshot = await db.collection('users').doc(user.uid).collection('addresses').get();
            setAddresses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Address[]);
            
            setIsAddressFormOpen(false);
            setEditingAddress(null);
            setAddressForm({ country: 'Luxembourg' });
        } catch (e) {
            console.error("Address save failed", e);
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!user || !confirm("Confirmar exclusão?")) return;
        try {
            await db.collection('users').doc(user.uid).collection('addresses').doc(id).delete();
            setAddresses(addresses.filter(a => a.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <AnimatePresence>
            {isDashboardOpen && (
                <div className="fixed inset-0 z-[100] overflow-hidden font-sans">
                    {/* Backdrop */}
                    <motion.div 
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={toggleDashboard}
                        {...({
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 }
                        } as any)}
                    />

                    {/* Main Content Slide-in */}
                    <motion.div
                        className="absolute inset-y-0 right-0 w-full md:w-[90%] lg:w-[80%] bg-[#121212] flex shadow-2xl"
                        {...({
                            initial: { x: '100%' },
                            animate: { x: 0 },
                            exit: { x: '100%' },
                            transition: { type: 'spring', damping: 30, stiffness: 300 }
                        } as any)}
                    >
                        {isLoading || !user ? (
                            <div className="w-full h-full flex items-center justify-center flex-col gap-4 text-white">
                                <Loader2 size={48} className="animate-spin text-accent" />
                                <p className="text-sm uppercase tracking-widest animate-pulse">Sincronizando Perfil...</p>
                            </div>
                        ) : (
                            <>
                                {/* Sidebar (Left) */}
                                <div className="w-20 md:w-72 border-r border-white/10 flex flex-col bg-[#1a1a1a]">
                                    <div className="h-24 flex items-center justify-center border-b border-white/10 bg-black/20">
                                        <span className="font-serif text-xl text-white hidden md:block tracking-widest">MY SUITE</span>
                                        <span className="font-serif text-xl text-white md:hidden">MS</span>
                                    </div>

                                    <div className="flex-1 py-8 space-y-2 overflow-y-auto">
                                        <DashboardTab id="overview" label="Visão Geral" icon={LayoutDashboard} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                                        <DashboardTab id="orders" label="Meus Pedidos" icon={Package} active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                                        <DashboardTab id="wishlist" label="Wishlist" icon={Heart} active={activeTab === 'wishlist'} onClick={() => setActiveTab('wishlist')} />
                                        <DashboardTab id="addresses" label="Endereços" icon={MapPin} active={activeTab === 'addresses'} onClick={() => setActiveTab('addresses')} />
                                        <DashboardTab id="profile" label="Dados Pessoais" icon={User} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                                    </div>

                                    <button 
                                        onClick={handleLogout}
                                        className="p-6 flex items-center gap-4 text-red-500 hover:bg-red-500/10 transition-colors mt-auto border-t border-white/10"
                                    >
                                        <LogOut size={20} />
                                        <span className="text-sm uppercase tracking-widest hidden md:inline">Sair</span>
                                    </button>
                                </div>

                                {/* Content Area (Right) */}
                                <div className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#121212]">
                                    {/* Top Bar */}
                                    <div className="h-24 border-b border-white/10 flex justify-between items-center px-8 md:px-12 bg-[#1a1a1a]/50 backdrop-blur shrink-0">
                                        <div>
                                            <h2 className="text-2xl font-serif text-white capitalize">{activeTab === 'overview' ? `Bem-vindo, ${user.displayName?.split(' ')[0]}` : activeTab}</h2>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Painel de Controle</p>
                                        </div>
                                        <button onClick={toggleDashboard} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    {/* Scrollable Content */}
                                    <div className="flex-1 overflow-y-auto p-8 md:p-12">
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={activeTab}
                                                className="max-w-5xl"
                                                {...({
                                                    initial: { opacity: 0, y: 20 },
                                                    animate: { opacity: 1, y: 0 },
                                                    exit: { opacity: 0, y: -20 },
                                                    transition: { duration: 0.3 }
                                                } as any)}
                                            >
                                                {/* --- OVERVIEW --- */}
                                                {activeTab === 'overview' && (
                                                    <div className="space-y-12">
                                                        {/* Hero Card */}
                                                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a1a1a] to-[#252525] border border-white/10 p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center md:items-start shadow-2xl">
                                                            <AvatarUploader />
                                                            <div className="text-center md:text-left flex-1 z-10">
                                                                <h3 className="text-4xl text-white font-serif mb-2">{user.displayName}</h3>
                                                                <p className="text-gray-400 flex items-center justify-center md:justify-start gap-2">
                                                                    {user.email}
                                                                    {addresses.length === 0 && (
                                                                        <span className="text-amber-500 text-xs bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                                            <MapPin size={10} /> Sem endereço
                                                                        </span>
                                                                    )}
                                                                </p>
                                                                <div className="mt-6 flex gap-4 justify-center md:justify-start">
                                                                    <button onClick={() => setActiveTab('orders')} className="bg-accent text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-accent/80 transition-colors">
                                                                        Ver Pedidos
                                                                    </button>
                                                                    {addresses.length === 0 && (
                                                                        <button onClick={() => setActiveTab('addresses')} className="bg-white/10 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors">
                                                                            Adicionar Endereço
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Stats */}
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            {[
                                                                { label: 'Total Investido', value: '€ 0,00', icon: CheckCircle },
                                                                { label: 'Obras Colecionadas', value: '0', icon: Package },
                                                                { label: 'Lista de Desejos', value: wishlistIds.length, icon: Heart }
                                                            ].map((stat, i) => (
                                                                <div key={i} className="bg-[#1a1a1a] p-6 rounded-xl border border-white/5 hover:border-accent/30 transition-colors">
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <span className="text-gray-500 text-xs uppercase tracking-widest">{stat.label}</span>
                                                                        <stat.icon size={18} className="text-accent" />
                                                                    </div>
                                                                    <div className="text-3xl font-serif text-white">{stat.value}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* --- ORDERS --- */}
                                                {activeTab === 'orders' && (
                                                    <div>
                                                        {loadingOrders ? (
                                                            <div className="flex items-center gap-2 text-gray-400"><Package className="animate-bounce" /> Carregando...</div>
                                                        ) : orders.length === 0 ? (
                                                            <div className="text-center py-24 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                                                                <Package className="mx-auto text-gray-600 mb-4" size={48} />
                                                                <h3 className="text-white font-serif text-xl mb-2">Nenhum pedido encontrado</h3>
                                                                <p className="text-gray-400 mb-6">Explore nossa coleção e encontre sua próxima obra de arte.</p>
                                                                <button onClick={toggleDashboard} className="text-accent uppercase tracking-widest text-sm font-bold hover:underline">Ir para a Loja</button>
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-6">
                                                                {orders.map(order => (
                                                                    <div key={order.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 flex flex-col md:flex-row justify-between gap-6">
                                                                        <div className="flex gap-4">
                                                                            <div className="w-12 h-12 bg-white/5 rounded flex items-center justify-center">
                                                                                <Package className="text-gray-400" />
                                                                            </div>
                                                                            <div>
                                                                                <div className="text-white font-bold mb-1">Pedido #{order.id.slice(0, 8)}</div>
                                                                                <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col items-end">
                                                                            <div className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-bold uppercase mb-2 border border-yellow-500/20">
                                                                                {order.status}
                                                                            </div>
                                                                            <div className="text-white font-serif">{formatPrice(order.amount)}</div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* --- WISHLIST --- */}
                                                {activeTab === 'wishlist' && (
                                                    <div>
                                                        {loadingWishlist ? (
                                                            <div className="text-gray-400">Carregando favoritos...</div>
                                                        ) : wishlistProducts.length === 0 ? (
                                                            <div className="text-center py-24 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                                                                <Heart className="mx-auto text-gray-600 mb-4" size={48} />
                                                                <p className="text-gray-400">Sua lista de desejos está vazia.</p>
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                                {wishlistProducts.map(p => (
                                                                    <div key={p.id} className="group bg-[#1a1a1a] rounded-lg overflow-hidden border border-white/5 hover:border-accent/50 transition-all">
                                                                        <div className="aspect-square relative overflow-hidden">
                                                                            <img src={p.images[0]} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                                        </div>
                                                                        <div className="p-4">
                                                                            <h4 className="text-white font-serif truncate">{p.translations['fr']?.title}</h4>
                                                                            <div className="flex justify-between items-center mt-2">
                                                                                <span className="text-accent">{formatPrice(p.price)}</span>
                                                                                <button className="text-xs uppercase tracking-wider text-gray-400 hover:text-white">Ver Detalhes</button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* --- ADDRESSES --- */}
                                                {activeTab === 'addresses' && (
                                                    <div>
                                                        {!isAddressFormOpen ? (
                                                            <div>
                                                                <div className="flex justify-between items-center mb-8">
                                                                    <h3 className="text-white font-serif text-xl">Meus Endereços</h3>
                                                                    <button 
                                                                        onClick={() => {
                                                                            setEditingAddress(null);
                                                                            setAddressForm({ country: 'Luxembourg' });
                                                                            setIsAddressFormOpen(true);
                                                                        }}
                                                                        className="bg-accent text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-accent/80 transition-colors"
                                                                    >
                                                                        <Plus size={16} /> Novo Endereço
                                                                    </button>
                                                                </div>

                                                                {addresses.length === 0 ? (
                                                                    <div className="text-center py-24 border-2 border-dashed border-white/10 rounded-xl bg-white/5">
                                                                        <MapPin className="mx-auto text-gray-600 mb-4" size={48} />
                                                                        <p className="text-gray-400 mb-4">Nenhum endereço cadastrado para entrega.</p>
                                                                    </div>
                                                                ) : (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                        {addresses.map(addr => (
                                                                            <div key={addr.id} className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10 hover:border-white/30 transition-all relative group">
                                                                                <div className="flex items-start justify-between mb-4">
                                                                                    <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest">
                                                                                        <MapPin size={14} />
                                                                                        {addr.name || 'Endereço'}
                                                                                    </div>
                                                                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                        <button 
                                                                                            onClick={() => {
                                                                                                setEditingAddress(addr);
                                                                                                setAddressForm(addr);
                                                                                                setIsAddressFormOpen(true);
                                                                                            }}
                                                                                            className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 text-white"
                                                                                        >
                                                                                            <Edit size={14} />
                                                                                        </button>
                                                                                        <button 
                                                                                            onClick={() => handleDeleteAddress(addr.id)}
                                                                                            className="p-1.5 bg-red-500/10 rounded-full hover:bg-red-500/20 text-red-500"
                                                                                        >
                                                                                            <Trash2 size={14} />
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-gray-300 text-sm space-y-1">
                                                                                    <p className="font-bold text-white">{addr.recipientName}</p>
                                                                                    <p>{addr.line1}</p>
                                                                                    {addr.line2 && <p>{addr.line2}</p>}
                                                                                    <p>{addr.postalCode} {addr.city}</p>
                                                                                    <p>{addr.country}</p>
                                                                                    <p className="text-gray-500 mt-2 text-xs">{addr.phone}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <motion.div 
                                                                className="bg-[#1a1a1a] p-8 rounded-xl border border-white/10"
                                                                {...({
                                                                    initial: { opacity: 0, x: 20 },
                                                                    animate: { opacity: 1, x: 0 }
                                                                } as any)}
                                                            >
                                                                <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
                                                                    <h3 className="text-white font-serif text-xl">
                                                                        {editingAddress ? 'Editar Endereço' : 'Novo Endereço de Entrega'}
                                                                    </h3>
                                                                    <button onClick={() => setIsAddressFormOpen(false)} className="text-gray-400 hover:text-white"><X size={24}/></button>
                                                                </div>

                                                                <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                                                    {/* Country - Full Width */}
                                                                    <div className="md:col-span-2 mb-4">
                                                                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">País *</label>
                                                                        <div className="relative">
                                                                            <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                                                            <select 
                                                                                value={addressForm.country}
                                                                                onChange={e => setAddressForm({...addressForm, country: e.target.value})}
                                                                                className="w-full bg-[#121212] border border-white/10 rounded-sm pl-10 pr-4 py-3 text-white focus:border-accent focus:outline-none appearance-none cursor-pointer"
                                                                            >
                                                                                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                                            </select>
                                                                        </div>
                                                                    </div>

                                                                    <InputField 
                                                                        label="Rótulo (Ex: Casa, Trabalho)" 
                                                                        value={addressForm.name || ''} 
                                                                        onChange={(e:any) => setAddressForm({...addressForm, name: e.target.value})}
                                                                        placeholder="Casa"
                                                                        required
                                                                    />
                                                                    <InputField 
                                                                        label="Nome do Destinatário" 
                                                                        value={addressForm.recipientName || ''} 
                                                                        onChange={(e:any) => setAddressForm({...addressForm, recipientName: e.target.value})}
                                                                        placeholder="Nome completo"
                                                                        required
                                                                    />
                                                                    
                                                                    <div className="md:col-span-2">
                                                                        <InputField 
                                                                            label="Endereço (Rua, Número)" 
                                                                            value={addressForm.line1 || ''} 
                                                                            onChange={(e:any) => setAddressForm({...addressForm, line1: e.target.value})}
                                                                            placeholder="Rue de la Gare, 10"
                                                                            required
                                                                        />
                                                                    </div>

                                                                    <div className="md:col-span-2">
                                                                        <InputField 
                                                                            label="Complemento (Opcional)" 
                                                                            value={addressForm.line2 || ''} 
                                                                            onChange={(e:any) => setAddressForm({...addressForm, line2: e.target.value})}
                                                                            placeholder="Apt 4B"
                                                                        />
                                                                    </div>

                                                                    <InputField 
                                                                        label="Cidade" 
                                                                        value={addressForm.city || ''} 
                                                                        onChange={(e:any) => setAddressForm({...addressForm, city: e.target.value})}
                                                                        required
                                                                    />
                                                                    <InputField 
                                                                        label="Código Postal" 
                                                                        value={addressForm.postalCode || ''} 
                                                                        onChange={(e:any) => setAddressForm({...addressForm, postalCode: e.target.value})}
                                                                        required
                                                                    />

                                                                    <InputField 
                                                                        label="Estado / Província" 
                                                                        value={addressForm.state || ''} 
                                                                        onChange={(e:any) => setAddressForm({...addressForm, state: e.target.value})}
                                                                        required
                                                                    />
                                                                    
                                                                    <div className="mb-4">
                                                                        <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Telefone *</label>
                                                                        <div className="relative">
                                                                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                                                            <input 
                                                                                type="tel"
                                                                                value={addressForm.phone || ''}
                                                                                onChange={e => setAddressForm({...addressForm, phone: e.target.value})}
                                                                                placeholder="+352 ..."
                                                                                className="w-full bg-[#121212] border border-white/10 rounded-sm pl-10 pr-4 py-3 text-white focus:border-accent focus:outline-none transition-colors text-sm"
                                                                                required
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="md:col-span-2 pt-4 flex gap-4">
                                                                        <button type="submit" className="flex-1 bg-accent text-white py-3 font-bold uppercase tracking-widest text-xs rounded hover:bg-accent/80 transition-colors">
                                                                            Salvar Endereço
                                                                        </button>
                                                                        <button type="button" onClick={() => setIsAddressFormOpen(false)} className="px-6 border border-white/10 text-white rounded hover:bg-white/5 text-xs uppercase tracking-widest">
                                                                            Cancelar
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* --- PROFILE --- */}
                                                {activeTab === 'profile' && (
                                                    <div className="max-w-2xl">
                                                        <div className="flex justify-between items-center mb-8">
                                                            <h3 className="text-white font-serif text-xl">Dados Pessoais</h3>
                                                            <button 
                                                                onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                                                                className={cn(
                                                                    "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors",
                                                                    isEditingProfile ? "bg-green-600 text-white hover:bg-green-700" : "bg-white/10 text-white hover:bg-white/20"
                                                                )}
                                                            >
                                                                {isEditingProfile ? <><Save size={16}/> Salvar</> : <><Edit size={16}/> Editar</>}
                                                            </button>
                                                        </div>
                                                        
                                                        <div className="bg-[#1a1a1a] p-8 rounded-xl border border-white/10 space-y-6">
                                                            <div>
                                                                <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Foto de Perfil</label>
                                                                <div className="flex items-center gap-6">
                                                                    <AvatarUploader />
                                                                    <div className="text-sm text-gray-500">
                                                                        <p>JPG, GIF ou PNG. Max 2MB.</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-6">
                                                                <div>
                                                                    <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Nome de Exibição</label>
                                                                    <input 
                                                                        type="text" 
                                                                        disabled={!isEditingProfile}
                                                                        value={profileForm.displayName}
                                                                        onChange={e => setProfileForm({...profileForm, displayName: e.target.value})}
                                                                        className="w-full bg-[#121212] border border-white/10 rounded p-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-accent focus:outline-none"
                                                                    />
                                                                </div>
                                                                
                                                                <div>
                                                                    <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Email</label>
                                                                    <input 
                                                                        type="email" 
                                                                        disabled
                                                                        value={user.email}
                                                                        className="w-full bg-[#121212] border border-white/10 rounded p-3 text-gray-400 cursor-not-allowed"
                                                                    />
                                                                </div>

                                                                <div>
                                                                    <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Telefone Principal</label>
                                                                    <input 
                                                                        type="tel" 
                                                                        disabled={!isEditingProfile}
                                                                        value={profileForm.phoneNumber}
                                                                        onChange={e => setProfileForm({...profileForm, phoneNumber: e.target.value})}
                                                                        placeholder="+352 ..."
                                                                        className="w-full bg-[#121212] border border-white/10 rounded p-3 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-accent focus:outline-none"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </motion.div>
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
