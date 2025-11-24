import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Package, Heart, LogOut, MapPin, User, Plus, Edit, Save, Trash2, Phone, Globe, CheckCircle, Loader2 } from 'lucide-react';
import { useUIStore, useAuthStore, useWishlistStore } from '../store';
import { AvatarUploader } from './dashboard/AvatarUploader';
import { useLanguage } from '../hooks/useLanguage';
import { cn, formatPrice } from '../lib/utils';
import { updateDocument } from '../lib/firebase/firestore';
import { auth, db } from '../lib/firebase/config';
import { collection, query, where, orderBy, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Address, Product } from '../types';
import { useToast } from './ui/Toast';

// --- Constants ---
const COUNTRIES = ["Luxembourg", "France", "Germany", "Portugal", "Belgium", "Netherlands", "United Kingdom", "United States", "Brazil", "Spain", "Italy"];

// --- Helper ---
const getImageUrl = (img: any) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    return img.url || '';
};

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
            "flex items-center gap-4 px-6 py-4 w-full text-left transition-all relative overflow-hidden group rounded-xl my-1",
            active ? "text-white bg-white/10 shadow-lg" : "text-gray-400 hover:text-white hover:bg-white/5"
        )}
    >
        <Icon size={20} className={cn("relative z-10 transition-transform group-hover:scale-110", active && "text-accent")} />
        <span className="relative z-10 text-sm uppercase tracking-widest font-medium">{label}</span>
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
    const { isDashboardOpen, closeDashboard, closeAllOverlays } = useUIStore();
    const { user, logout, setUser, isLoading } = useAuthStore();
    const { items: wishlistIds } = useWishlistStore();
    const { t } = useLanguage();
    const { toast } = useToast();
    
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
    const [addressForm, setAddressForm] = useState<Partial<Address>>({ country: 'Luxembourg' });
    
    // Profile Edit State
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState({ displayName: '', phoneNumber: '' });

    // --- SCROLL LOCK ---
    useEffect(() => {
        if (isDashboardOpen && user) {
            document.body.style.overflow = 'hidden';
            document.documentElement.classList.add('lenis-stopped');
        } else {
            document.body.style.overflow = '';
            document.documentElement.classList.remove('lenis-stopped');
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.classList.remove('lenis-stopped');
        };
    }, [isDashboardOpen, user]);

    // --- PROTEÇÃO DE ESTADO ---
    useEffect(() => {
        if (isDashboardOpen && !user && !isLoading) {
            closeDashboard();
        }
    }, [isDashboardOpen, user, isLoading, closeDashboard]);

    // Fetch Orders
    useEffect(() => {
        if (activeTab === 'orders' && user) {
            const fetchOrders = async () => {
                setLoadingOrders(true);
                try {
                    const q = query(
                        collection(db, 'orders'),
                        where('userId', '==', user.uid),
                        orderBy('createdAt', 'desc')
                    );
                    const snapshot = await getDocs(q);
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

    // Fetch Wishlist
    useEffect(() => {
        if (activeTab === 'wishlist' && user && wishlistIds.length > 0) {
            const fetchWishlist = async () => {
                setLoadingWishlist(true);
                try {
                    const products: Product[] = [];
                    for (const id of wishlistIds) {
                        const docRef = doc(db, 'products', id);
                        const docSnap = await getDoc(docRef);
                        if (docSnap.exists()) products.push({ id: docSnap.id, ...docSnap.data() } as Product);
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
                    const colRef = collection(db, 'users', user.uid, 'addresses');
                    const snapshot = await getDocs(colRef);
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

    const handleLogout = async () => {
        closeAllOverlays();
        await logout();
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setIsSavingProfile(true);
        
        try {
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: profileForm.displayName });
            }
            await updateDocument('users', user.uid, { 
                displayName: profileForm.displayName,
                phoneNumber: profileForm.phoneNumber 
            });
            setUser({ ...user, displayName: profileForm.displayName, phoneNumber: profileForm.phoneNumber });
            
            toast("Perfil atualizado com sucesso", "success");
            setIsEditingProfile(false);
        } catch (e) {
            console.error("Profile update failed", e);
            toast("Erro ao atualizar perfil", "error");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const handleSaveAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        try {
            const addressesRef = collection(db, 'users', user.uid, 'addresses');
            
            if (editingAddress) {
                const docRef = doc(db, 'users', user.uid, 'addresses', editingAddress.id);
                await updateDoc(docRef, addressForm);
                toast("Endereço atualizado", "success");
            } else {
                await addDoc(addressesRef, {
                    ...addressForm,
                    createdAt: new Date().toISOString()
                });
                toast("Endereço adicionado", "success");
            }
            const snapshot = await getDocs(addressesRef);
            setAddresses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Address[]);
            setIsAddressFormOpen(false);
            setEditingAddress(null);
            setAddressForm({ country: 'Luxembourg' });
        } catch (e) {
            console.error("Address save failed", e);
            toast("Erro ao salvar endereço", "error");
        }
    };

    const handleDeleteAddress = async (id: string) => {
        if (!user || !confirm("Confirmar exclusão?")) return;
        try {
            const docRef = doc(db, 'users', user.uid, 'addresses', id);
            await deleteDoc(docRef);
            setAddresses(addresses.filter(a => a.id !== id));
            toast("Endereço removido", "info");
        } catch (e) {
            console.error(e);
            toast("Erro ao remover", "error");
        }
    };

    const showContent = isDashboardOpen && user;

    return (
        <AnimatePresence>
            {showContent && (
                <motion.div 
                    className="fixed inset-0 z-[100] flex bg-[#0a0a0a] text-white"
                    {...({
                        initial: { opacity: 0, scale: 0.96, filter: "blur(10px)" },
                        animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
                        exit: { opacity: 0, scale: 1.02, filter: "blur(10px)" },
                        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                    } as any)}
                >
                    {/* Background Texture/Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#121212] via-[#0a0a0a] to-black pointer-events-none" />

                    {/* --- SIDEBAR --- */}
                    <div className="w-20 md:w-80 border-r border-white/5 flex flex-col bg-[#0f0f0f] relative z-10">
                        <div className="h-28 flex items-center px-8 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center font-bold text-black shadow-lg shadow-accent/20">
                                    {user.displayName?.[0] || 'U'}
                                </div>
                                <div className="hidden md:block">
                                    <h3 className="font-serif text-lg leading-none">{user.displayName?.split(' ')[0]}</h3>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">My Suite</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto" data-lenis-prevent>
                            <DashboardTab id="overview" label="Visão Geral" icon={LayoutDashboard} active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
                            <DashboardTab id="orders" label="Meus Pedidos" icon={Package} active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                            <DashboardTab id="wishlist" label="Wishlist" icon={Heart} active={activeTab === 'wishlist'} onClick={() => setActiveTab('wishlist')} />
                            <DashboardTab id="addresses" label="Endereços" icon={MapPin} active={activeTab === 'addresses'} onClick={() => setActiveTab('addresses')} />
                            <DashboardTab id="profile" label="Dados Pessoais" icon={User} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                        </div>

                        <div className="p-4 border-t border-white/5">
                            <button 
                                onClick={handleLogout}
                                className="w-full p-4 flex items-center justify-center md:justify-start gap-4 text-gray-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all"
                            >
                                <LogOut size={20} />
                                <span className="text-sm uppercase tracking-widest hidden md:inline font-medium">Sair da Conta</span>
                            </button>
                        </div>
                    </div>

                    {/* --- MAIN CONTENT --- */}
                    <div className="flex-1 flex flex-col relative z-10 h-full overflow-hidden">
                        {/* Top Bar */}
                        <div className="h-28 flex items-center justify-between px-8 md:px-12 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-sm">
                            <div>
                                <h1 className="text-3xl font-serif text-white capitalize tracking-tight">{activeTab === 'overview' ? 'Visão Geral' : activeTab}</h1>
                                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                            </div>
                            <button 
                                onClick={closeDashboard}
                                className="w-12 h-12 rounded-full border border-white/10 hover:bg-white hover:text-black hover:scale-110 flex items-center justify-center transition-all duration-300 group"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>
                        </div>

                        {/* Scrollable Area */}
                        <div 
                            className="flex-1 overflow-y-auto p-8 md:p-12 overscroll-contain"
                            data-lenis-prevent // CRITICAL FIX
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    className="max-w-6xl mx-auto pb-24"
                                    {...({
                                        initial: { opacity: 0, y: 30 },
                                        animate: { opacity: 1, y: 0 },
                                        exit: { opacity: 0, y: -20 },
                                        transition: { duration: 0.4 }
                                    } as any)}
                                >
                                    {/* --- OVERVIEW --- */}
                                    {activeTab === 'overview' && (
                                        <div className="space-y-12">
                                            <div className="relative overflow-hidden rounded-3xl bg-[#151515] border border-white/10 p-12 flex flex-col md:flex-row gap-12 items-center md:items-start shadow-2xl group">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors duration-700" />
                                                
                                                <div className="relative">
                                                    <AvatarUploader />
                                                </div>
                                                
                                                <div className="text-center md:text-left flex-1 relative z-10 pt-2">
                                                    <h3 className="text-5xl text-white font-serif mb-3 tracking-tight">{user.displayName}</h3>
                                                    <p className="text-gray-400 text-lg mb-8 font-light">
                                                        {user.email}
                                                    </p>
                                                    <div className="flex gap-4 justify-center md:justify-start">
                                                        <button onClick={() => setActiveTab('orders')} className="bg-white text-black px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all shadow-lg hover:shadow-accent/20">
                                                            Ver Pedidos
                                                        </button>
                                                        {addresses.length === 0 && (
                                                            <button onClick={() => setActiveTab('addresses')} className="bg-transparent border border-white/20 text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                                                                Adicionar Endereço
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                {[
                                                    { label: 'Total Investido', value: '€ 0,00', icon: CheckCircle },
                                                    { label: 'Obras Colecionadas', value: '0', icon: Package },
                                                    { label: 'Lista de Desejos', value: wishlistIds.length, icon: Heart }
                                                ].map((stat, i) => (
                                                    <div key={i} className="bg-[#151515] p-8 rounded-2xl border border-white/5 hover:border-accent/30 transition-all hover:-translate-y-1 duration-300 shadow-xl">
                                                        <div className="flex justify-between items-start mb-6">
                                                            <span className="text-gray-500 text-xs uppercase tracking-widest font-bold">{stat.label}</span>
                                                            <stat.icon size={20} className="text-accent" />
                                                        </div>
                                                        <div className="text-4xl font-serif text-white">{stat.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* --- ORDERS --- */}
                                    {activeTab === 'orders' && (
                                        <div>
                                            {loadingOrders ? (
                                                <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
                                                    <Loader2 className="animate-spin" size={32}/>
                                                    <span className="text-xs uppercase tracking-widest">Carregando Pedidos...</span>
                                                </div>
                                            ) : orders.length === 0 ? (
                                                <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-[#151515]">
                                                    <Package className="mx-auto text-gray-700 mb-6" size={64} />
                                                    <h3 className="text-white font-serif text-2xl mb-3">Nenhum pedido encontrado</h3>
                                                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Sua coleção de arte ainda está vazia. Explore nossas obras exclusivas.</p>
                                                    <button onClick={closeDashboard} className="bg-accent text-white px-8 py-3 rounded-full uppercase tracking-widest text-xs font-bold hover:shadow-lg hover:shadow-accent/20 transition-all">
                                                        Explorar Galeria
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {orders.map(order => (
                                                        <div key={order.id} className="bg-[#151515] border border-white/5 hover:border-white/20 rounded-2xl p-8 flex flex-col md:flex-row justify-between gap-6 transition-colors">
                                                            <div className="flex gap-6 items-center">
                                                                <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center">
                                                                    <Package className="text-gray-400" size={24} />
                                                                </div>
                                                                <div>
                                                                    <div className="text-white text-lg font-bold mb-1 font-serif">Pedido #{order.id.slice(0, 8)}</div>
                                                                    <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col items-end justify-center">
                                                                <div className="px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase mb-2 border border-yellow-500/20 tracking-wider">
                                                                    {order.status}
                                                                </div>
                                                                <div className="text-white font-serif text-2xl">{formatPrice(order.amount)}</div>
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
                                                <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-400">
                                                    <Loader2 className="animate-spin" size={32}/>
                                                    <span className="text-xs uppercase tracking-widest">Carregando Favoritos...</span>
                                                </div>
                                            ) : wishlistProducts.length === 0 ? (
                                                <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-[#151515]">
                                                    <Heart className="mx-auto text-gray-700 mb-6" size={64} />
                                                    <p className="text-gray-500 text-lg">Sua lista de desejos está vazia.</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                                    {wishlistProducts.map(p => (
                                                        <div key={p.id} className="group bg-[#151515] rounded-2xl overflow-hidden border border-white/5 hover:border-accent/50 transition-all hover:shadow-2xl hover:shadow-accent/5">
                                                            <div className="aspect-square relative overflow-hidden">
                                                                <img src={getImageUrl(p.images[0])} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                            <div className="p-6">
                                                                <h4 className="text-white font-serif text-lg truncate mb-1">{p.translations['fr']?.title}</h4>
                                                                <div className="flex justify-between items-center mt-4 border-t border-white/5 pt-4">
                                                                    <span className="text-accent font-medium">{formatPrice(p.price)}</span>
                                                                    <button className="text-[10px] uppercase tracking-widest text-white/60 hover:text-white border border-white/20 px-3 py-1 rounded-full hover:bg-white/10 transition-colors">
                                                                        Ver Obra
                                                                    </button>
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
                                                    <div className="flex justify-between items-center mb-12">
                                                        <h3 className="text-white font-serif text-2xl">Meus Endereços</h3>
                                                        <button 
                                                            onClick={() => {
                                                                setEditingAddress(null);
                                                                setAddressForm({ country: 'Luxembourg' });
                                                                setIsAddressFormOpen(true);
                                                            }}
                                                            className="bg-white text-black px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-accent hover:text-white transition-colors shadow-lg"
                                                        >
                                                            <Plus size={16} /> Novo Endereço
                                                        </button>
                                                    </div>

                                                    {addresses.length === 0 ? (
                                                        <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-[#151515]">
                                                            <MapPin className="mx-auto text-gray-700 mb-6" size={64} />
                                                            <p className="text-gray-500">Nenhum endereço cadastrado para entrega.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {addresses.map(addr => (
                                                                <div key={addr.id} className="bg-[#151515] p-8 rounded-2xl border border-white/10 hover:border-white/30 transition-all relative group">
                                                                    <div className="flex items-start justify-between mb-6">
                                                                        <div className="flex items-center gap-2 text-accent text-xs font-bold uppercase tracking-widest border border-accent/20 px-3 py-1 rounded-full bg-accent/5">
                                                                            <MapPin size={12} />
                                                                            {addr.name || 'Endereço'}
                                                                        </div>
                                                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                            <button 
                                                                                onClick={() => {
                                                                                    setEditingAddress(addr);
                                                                                    setAddressForm(addr);
                                                                                    setIsAddressFormOpen(true);
                                                                                }}
                                                                                className="p-2 bg-white/10 rounded-full hover:bg-white hover:text-black text-white transition-colors"
                                                                            >
                                                                                <Edit size={16} />
                                                                            </button>
                                                                            <button 
                                                                                onClick={() => handleDeleteAddress(addr.id)}
                                                                                className="p-2 bg-red-500/10 rounded-full hover:bg-red-500 hover:text-white text-red-500 transition-colors"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-gray-300 text-sm space-y-2 pl-1">
                                                                        <p className="font-bold text-white text-lg font-serif">{addr.recipientName}</p>
                                                                        <p>{addr.line1}</p>
                                                                        {addr.line2 && <p>{addr.line2}</p>}
                                                                        <p>{addr.postalCode} {addr.city}</p>
                                                                        <p className="flex items-center gap-2"><Globe size={12} className="text-gray-600"/> {addr.country}</p>
                                                                        <p className="text-gray-500 mt-4 text-xs flex items-center gap-2 pt-4 border-t border-white/5"><Phone size={12}/> {addr.phone}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <motion.div 
                                                    className="bg-[#151515] p-10 rounded-3xl border border-white/10 max-w-2xl mx-auto"
                                                    {...({
                                                        initial: { opacity: 0, scale: 0.95 },
                                                        animate: { opacity: 1, scale: 1 }
                                                    } as any)}
                                                >
                                                    <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
                                                        <h3 className="text-white font-serif text-2xl">
                                                            {editingAddress ? 'Editar Endereço' : 'Novo Endereço de Entrega'}
                                                        </h3>
                                                        <button onClick={() => setIsAddressFormOpen(false)} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full"><X size={24}/></button>
                                                    </div>

                                                    <form onSubmit={handleSaveAddress} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                                        <div className="md:col-span-2 mb-2">
                                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-2">País *</label>
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
                                                        <InputField label="Rótulo (Ex: Casa)" value={addressForm.name || ''} onChange={(e:any) => setAddressForm({...addressForm, name: e.target.value})} placeholder="Casa" required />
                                                        <InputField label="Destinatário" value={addressForm.recipientName || ''} onChange={(e:any) => setAddressForm({...addressForm, recipientName: e.target.value})} placeholder="Nome completo" required />
                                                        <div className="md:col-span-2"><InputField label="Endereço" value={addressForm.line1 || ''} onChange={(e:any) => setAddressForm({...addressForm, line1: e.target.value})} placeholder="Rua, Número..." required /></div>
                                                        <div className="md:col-span-2"><InputField label="Complemento" value={addressForm.line2 || ''} onChange={(e:any) => setAddressForm({...addressForm, line2: e.target.value})} placeholder="Apt, Bloco..." /></div>
                                                        <InputField label="Cidade" value={addressForm.city || ''} onChange={(e:any) => setAddressForm({...addressForm, city: e.target.value})} required />
                                                        <InputField label="Código Postal" value={addressForm.postalCode || ''} onChange={(e:any) => setAddressForm({...addressForm, postalCode: e.target.value})} required />
                                                        <InputField label="Estado" value={addressForm.state || ''} onChange={(e:any) => setAddressForm({...addressForm, state: e.target.value})} required />
                                                        <div className="mb-4">
                                                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Telefone *</label>
                                                            <div className="relative">
                                                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                                                <input type="tel" value={addressForm.phone || ''} onChange={e => setAddressForm({...addressForm, phone: e.target.value})} placeholder="+352 ..." className="w-full bg-[#121212] border border-white/10 rounded-sm pl-10 pr-4 py-3 text-white focus:border-accent focus:outline-none transition-colors text-sm" required />
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-2 pt-6 flex gap-4 border-t border-white/10 mt-4">
                                                            <button type="submit" className="flex-1 bg-accent text-white py-4 font-bold uppercase tracking-widest text-xs rounded hover:bg-accent/80 transition-colors shadow-lg">Salvar Endereço</button>
                                                            <button type="button" onClick={() => setIsAddressFormOpen(false)} className="px-8 border border-white/10 text-white rounded hover:bg-white/5 text-xs uppercase tracking-widest font-bold">Cancelar</button>
                                                        </div>
                                                    </form>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}

                                    {/* --- PROFILE --- */}
                                    {activeTab === 'profile' && (
                                        <div className="max-w-2xl mx-auto">
                                            <div className="flex justify-between items-center mb-8">
                                                <h3 className="text-white font-serif text-2xl">Dados Pessoais</h3>
                                                <button 
                                                    onClick={() => isEditingProfile ? handleSaveProfile() : setIsEditingProfile(true)}
                                                    disabled={isSavingProfile}
                                                    className={cn(
                                                        "px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all min-w-[120px] justify-center",
                                                        isEditingProfile 
                                                            ? isSavingProfile 
                                                                ? "bg-green-700/50 text-white/50 cursor-not-allowed" 
                                                                : "bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-green-500/20" 
                                                            : "bg-white text-black hover:bg-gray-200"
                                                    )}
                                                >
                                                    {isEditingProfile ? (
                                                        isSavingProfile ? (
                                                            <><Loader2 size={16} className="animate-spin"/> Salvando...</>
                                                        ) : (
                                                            <><Save size={16}/> Salvar</>
                                                        )
                                                    ) : (
                                                        <><Edit size={16}/> Editar</>
                                                    )}
                                                </button>
                                            </div>
                                            <div className="bg-[#151515] p-10 rounded-3xl border border-white/10 space-y-8 shadow-2xl">
                                                <div className="flex items-start gap-8 border-b border-white/5 pb-8">
                                                    <AvatarUploader />
                                                    <div className="pt-2">
                                                        <label className="block text-white font-serif text-lg mb-2">Foto de Perfil</label>
                                                        <p className="text-sm text-gray-500 max-w-xs">Recomendamos uma imagem de 500x500px. Formatos suportados: JPG, PNG.</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Nome de Exibição</label>
                                                        <input type="text" disabled={!isEditingProfile || isSavingProfile} value={profileForm.displayName} onChange={e => setProfileForm({...profileForm, displayName: e.target.value})} className="w-full bg-[#0a0a0a] border border-white/10 rounded p-4 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-accent focus:outline-none transition-colors" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Email de Acesso</label>
                                                        <input type="email" disabled value={user.email} className="w-full bg-[#0a0a0a] border border-white/10 rounded p-4 text-gray-400 cursor-not-allowed" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-500 text-xs uppercase tracking-widest mb-2">Telefone Principal</label>
                                                        <input type="tel" disabled={!isEditingProfile || isSavingProfile} value={profileForm.phoneNumber} onChange={e => setProfileForm({...profileForm, phoneNumber: e.target.value})} placeholder="+352 ..." className="w-full bg-[#0a0a0a] border border-white/10 rounded p-4 text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-accent focus:outline-none transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};