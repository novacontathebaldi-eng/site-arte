import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Package, Users, MessageSquare, Plus, Edit, Trash2, Save, Upload, Search, Filter, TrendingUp, DollarSign, RefreshCw, Lock, Globe, MoveUp, MoveDown, Check } from 'lucide-react';
import { useAuthStore } from '../store';
import { db } from '../lib/firebase/config';
import { uploadImage, getPublicUrl } from '../lib/supabase/storage';
import { updateDocument, createDocument, deleteDocument, subscribeToCollection } from '../lib/firebase/firestore';
import { Product, ProductCategory } from '../types';
import { getBrevoStats } from '../app/actions/admin';
import { formatPrice, cn } from '../lib/utils';
import { AvatarUploader } from './dashboard/AvatarUploader';

// --- CUSTOM SVG CHARTS (No External Deps) ---
const SimpleLineChart = ({ data, color = "#D4AF37" }: { data: number[], color?: string }) => {
    const max = Math.max(...data, 1);
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - (val / max) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="w-full h-24 relative overflow-hidden">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <defs>
                    <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M0,100 L0,100 L${points} L100,100 Z`} fill={`url(#grad-${color})`} />
                <path d={`M${points}`} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
        </div>
    );
};

// --- COMPONENTS ---

interface AdminDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'crm' | 'chatbot'>('analytics');
    const [stats, setStats] = useState({ 
        salesToday: 0, salesMonth: 0, newOrders: 0, activeUsers: 0, brevoSubs: 0, brevoClients: 0 
    });
    
    // --- PRODUCT MANAGEMENT STATE ---
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [editLang, setEditLang] = useState('fr');

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!isOpen) return;

        // 1. Real-time Products
        const unsubProducts = subscribeToCollection('products', (data) => {
            // Sort by displayOrder or createdAt
            const sorted = data.sort((a, b) => (a.displayOrder || 9999) - (b.displayOrder || 9999));
            setProducts(sorted as Product[]);
        });

        // 2. Dashboard Stats (Simulated Aggregation)
        const fetchStats = async () => {
            // Mocking rapid Firestore aggregation
            const brevo = await getBrevoStats();
            
            // In real app, run aggregation queries
            setStats({
                salesToday: 1250,
                salesMonth: 15400,
                newOrders: 3,
                activeUsers: 45,
                brevoSubs: brevo.subscribers,
                brevoClients: brevo.clients
            });
        };
        fetchStats();

        return () => {
            unsubProducts();
        };
    }, [isOpen]);

    // --- HANDLERS ---

    const handleSaveProduct = async () => {
        if (!editingProduct) return;
        
        try {
            const productData = {
                ...editingProduct,
                updatedAt: new Date().toISOString()
            };

            if (editingProduct.id) {
                await updateDocument('products', editingProduct.id, productData);
            } else {
                await createDocument('products', {
                    ...productData,
                    createdAt: new Date().toISOString(),
                    translations: editingProduct.translations || {
                        fr: { title: 'New Art', description: '' },
                        en: { title: 'New Art', description: '' },
                        de: { title: 'New Art', description: '' },
                        pt: { title: 'New Art', description: '' },
                    },
                    images: editingProduct.images || [],
                    price: editingProduct.price || 0,
                    category: editingProduct.category || ProductCategory.PAINTINGS,
                    available: true,
                    status: 'available',
                    stock: 1
                });
            }
            setIsProductModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Erro ao salvar produto.");
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if(confirm("Tem certeza que deseja deletar esta obra?")) {
            await deleteDocument('products', id);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingProduct) return;

        try {
            const { path } = await uploadImage("products", file, `prod-${Date.now()}`);
            const url = getPublicUrl("products", path);
            setEditingProduct({
                ...editingProduct,
                images: [...(editingProduct.images || []), url]
            });
        } catch (err) {
            console.error(err);
            alert("Erro no upload.");
        }
    };

    const handleReorder = async (product: Product, direction: 'up' | 'down') => {
        // Simple swap logic
        const currentIndex = products.findIndex(p => p.id === product.id);
        if (currentIndex === -1) return;
        
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= products.length) return;

        const targetProduct = products[targetIndex];
        
        // Swap orders locally then update cloud
        const currentOrder = product.displayOrder || currentIndex;
        const targetOrder = targetProduct.displayOrder || targetIndex;

        await updateDocument('products', product.id, { displayOrder: targetOrder });
        await updateDocument('products', targetProduct.id, { displayOrder: currentOrder });
    };

    // --- RENDER ---

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex bg-black/80 backdrop-blur-md overflow-hidden text-white font-sans">
            {/* SIDEBAR */}
            <motion.div 
                initial={{ x: -100 }} animate={{ x: 0 }}
                className="w-20 md:w-64 bg-[#121212] border-r border-white/10 flex flex-col items-center md:items-stretch py-8"
            >
                <div className="mb-12 text-center">
                    <div className="w-10 h-10 bg-red-600 rounded-lg mx-auto flex items-center justify-center text-white shadow-red-500/20 shadow-lg">
                        <Lock size={20} />
                    </div>
                    <h2 className="mt-4 font-serif text-lg hidden md:block tracking-widest text-red-500">ADMIN</h2>
                </div>

                <nav className="flex-1 space-y-2 px-2">
                    {[
                        { id: 'analytics', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'products', label: 'Produtos', icon: Package },
                        { id: 'crm', label: 'CRM / Brevo', icon: Users },
                        { id: 'chatbot', label: 'Chatbot IA', icon: MessageSquare },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={cn(
                                "flex items-center gap-4 p-3 rounded-lg w-full transition-all group",
                                activeTab === item.id 
                                    ? "bg-white/10 text-white" 
                                    : "text-gray-500 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon size={20} className={activeTab === item.id ? "text-accent" : ""} />
                            <span className="hidden md:block text-sm font-medium tracking-wide">{item.label}</span>
                        </button>
                    ))}
                </nav>
                
                <button onClick={onClose} className="p-4 flex items-center justify-center gap-2 text-gray-500 hover:text-white mt-auto border-t border-white/10">
                    <X size={20} />
                    <span className="hidden md:block text-xs uppercase">Fechar</span>
                </button>
            </motion.div>

            {/* CONTENT AREA */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] relative">
                {/* Header */}
                <header className="h-20 border-b border-white/10 flex items-center justify-between px-8">
                    <h1 className="text-2xl font-serif capitalize">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500 uppercase">Ultimo login: {new Date().toLocaleTimeString()}</span>
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-bold">
                            {user?.displayName?.[0] || 'A'}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <AnimatePresence mode="wait">
                        
                        {/* 1. ANALYTICS TAB */}
                        {activeTab === 'analytics' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                                {/* KPI Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Vendas Hoje', value: `€ ${stats.salesToday}`, icon: DollarSign, trend: '+12%', color: '#10B981' },
                                        { label: 'Novos Pedidos', value: stats.newOrders, icon: Package, trend: '+3', color: '#3B82F6' },
                                        { label: 'Inscritos Brevo', value: stats.brevoSubs, icon: Users, trend: 'Total', color: '#D4AF37' },
                                        { label: 'Clientes Brevo', value: stats.brevoClients, icon: Users, trend: 'VIP', color: '#8B5CF6' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-[#151515] p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-2 rounded-lg bg-[${stat.color}]/10 text-[${stat.color}]`}>
                                                    <stat.icon size={20} style={{ color: stat.color }} />
                                                </div>
                                                <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded text-green-400">{stat.trend}</span>
                                            </div>
                                            <h3 className="text-2xl font-bold font-serif">{stat.value}</h3>
                                            <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">{stat.label}</p>
                                            
                                            <div className="absolute bottom-0 left-0 right-0 opacity-20">
                                                <SimpleLineChart data={[10, 25, 15, 40, 30, 60, 50]} color={stat.color} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Main Chart Section */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-[#151515] p-6 rounded-xl border border-white/10">
                                        <h3 className="text-lg font-serif mb-6">Receita Mensal</h3>
                                        <div className="h-64 flex items-end justify-between gap-2">
                                            {[30, 45, 25, 60, 75, 50, 40, 80, 70, 90, 65, 85].map((h, i) => (
                                                <div key={i} className="w-full bg-white/5 rounded-t-sm hover:bg-accent transition-colors relative group" style={{ height: `${h}%` }}>
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                                        €{h * 100}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-4 text-xs text-gray-500 uppercase">
                                            <span>Jan</span><span>Dec</span>
                                        </div>
                                    </div>

                                    <div className="bg-[#151515] p-6 rounded-xl border border-white/10">
                                        <h3 className="text-lg font-serif mb-6">Atividade Recente</h3>
                                        <div className="space-y-4">
                                            {[1,2,3,4,5].map((_, i) => (
                                                <div key={i} className="flex gap-4 items-start border-b border-white/5 pb-4 last:border-0">
                                                    <div className="w-2 h-2 rounded-full bg-accent mt-2" />
                                                    <div>
                                                        <p className="text-sm">Novo pedido <span className="text-accent">#1234</span></p>
                                                        <p className="text-xs text-gray-500">Há 2 horas • Pedro Silva</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. PRODUCTS TAB */}
                        {activeTab === 'products' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex gap-4 bg-[#151515] p-2 rounded-lg border border-white/10 w-96">
                                        <Search className="text-gray-500" size={20} />
                                        <input 
                                            type="text" 
                                            placeholder="Buscar produtos..." 
                                            className="bg-transparent outline-none text-sm w-full"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setEditingProduct({});
                                            setIsProductModalOpen(true);
                                        }}
                                        className="bg-accent text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-accent/80"
                                    >
                                        <Plus size={16} /> Novo Produto
                                    </button>
                                </div>

                                <div className="bg-[#151515] rounded-xl border border-white/10 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-white/5 text-xs uppercase text-gray-400">
                                            <tr>
                                                <th className="p-4 text-left">Ordenação</th>
                                                <th className="p-4 text-left">Produto</th>
                                                <th className="p-4 text-left">Categoria</th>
                                                <th className="p-4 text-left">Preço</th>
                                                <th className="p-4 text-left">Status</th>
                                                <th className="p-4 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {products.filter(p => p.translations?.fr?.title?.toLowerCase().includes(productSearch.toLowerCase())).map((product, index) => (
                                                <tr key={product.id} className="hover:bg-white/5 transition-colors group">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-1">
                                                            <button onClick={() => handleReorder(product, 'up')} className="p-1 hover:text-accent disabled:opacity-30"><MoveUp size={14}/></button>
                                                            <span className="text-xs font-mono w-6 text-center">{product.displayOrder || index}</span>
                                                            <button onClick={() => handleReorder(product, 'down')} className="p-1 hover:text-accent disabled:opacity-30"><MoveDown size={14}/></button>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 bg-white/10 rounded overflow-hidden">
                                                                <img src={product.images[0]} className="w-full h-full object-cover" alt="" />
                                                            </div>
                                                            <div>
                                                                <div className="font-bold">{product.translations?.fr?.title || 'Sem título'}</div>
                                                                <div className="text-xs text-gray-500">{product.id.slice(0,6)}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-sm text-gray-300 capitalize">{product.category}</td>
                                                    <td className="p-4 font-mono">{formatPrice(product.price)}</td>
                                                    <td className="p-4">
                                                        <span className={cn(
                                                            "px-2 py-1 rounded text-[10px] uppercase font-bold",
                                                            product.status === 'sold' ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500"
                                                        )}>
                                                            {product.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }}
                                                                className="p-2 bg-white/5 hover:bg-white/20 rounded text-blue-400"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteProduct(product.id)}
                                                                className="p-2 bg-white/5 hover:bg-white/20 rounded text-red-400"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* 3. CRM TAB */}
                        {activeTab === 'crm' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
                                <Users size={64} className="text-accent opacity-50" />
                                <h3 className="text-2xl font-serif">Gestão de Clientes e Newsletter</h3>
                                <p className="text-gray-400 max-w-md">Gerencie seus contatos e campanhas diretamente pelo painel do Brevo.</p>
                                
                                <div className="flex gap-4">
                                    <button onClick={async () => {
                                        alert("Iniciando sincronização forçada...");
                                        // Logic would go here
                                    }} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-2">
                                        <RefreshCw size={18} /> Sincronizar Agora
                                    </button>
                                    <a href="https://app.brevo.com" target="_blank" rel="noreferrer" className="px-6 py-3 bg-accent text-white rounded-lg flex items-center gap-2 font-bold hover:bg-accent/80">
                                        Acessar Brevo <Upload size={18} />
                                    </a>
                                </div>
                            </motion.div>
                        )}
                         
                         {/* 4. CHATBOT TAB */}
                        {activeTab === 'chatbot' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-6">
                                <MessageSquare size={64} className="text-accent opacity-50" />
                                <h3 className="text-2xl font-serif">Base de Conhecimento IA</h3>
                                <p className="text-gray-400 max-w-md">O chatbot utiliza as informações dos produtos e configurações gerais. Para adicionar FAQs específicas, edite abaixo.</p>
                                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg text-sm">
                                    Em desenvolvimento: Editor Visual de Knowledge Graph.
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            {/* PRODUCT MODAL */}
            <AnimatePresence>
                {isProductModalOpen && editingProduct && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                    >
                        <div className="w-full max-w-6xl h-[90vh] bg-[#121212] border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
                            {/* Form Side */}
                            <div className="flex-1 overflow-y-auto p-8 border-r border-white/10">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-serif">Editar Produto</h2>
                                    <div className="flex gap-2">
                                        {['fr', 'en', 'de', 'pt'].map(l => (
                                            <button 
                                                key={l}
                                                onClick={() => setEditLang(l)}
                                                className={cn(
                                                    "w-8 h-8 rounded text-xs uppercase font-bold",
                                                    editLang === l ? "bg-accent text-black" : "bg-white/10 text-gray-400"
                                                )}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase text-gray-500">Título ({editLang})</label>
                                        <input 
                                            value={editingProduct.translations?.[editLang]?.title || ''}
                                            onChange={(e) => {
                                                const newTrans = { ...editingProduct.translations };
                                                if (!newTrans[editLang]) newTrans[editLang] = { title: '', description: '' };
                                                newTrans[editLang].title = e.target.value;
                                                setEditingProduct({ ...editingProduct, translations: newTrans });
                                            }}
                                            className="w-full bg-black/20 border border-white/10 rounded p-3 focus:border-accent outline-none" 
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase text-gray-500">Descrição ({editLang})</label>
                                        <textarea 
                                            rows={5}
                                            value={editingProduct.translations?.[editLang]?.description || ''}
                                            onChange={(e) => {
                                                const newTrans = { ...editingProduct.translations };
                                                if (!newTrans[editLang]) newTrans[editLang] = { title: '', description: '' };
                                                newTrans[editLang].description = e.target.value;
                                                setEditingProduct({ ...editingProduct, translations: newTrans });
                                            }}
                                            className="w-full bg-black/20 border border-white/10 rounded p-3 focus:border-accent outline-none" 
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                         <div className="space-y-2">
                                            <label className="text-xs uppercase text-gray-500">Preço (€)</label>
                                            <input 
                                                type="number"
                                                value={editingProduct.price}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                                                className="w-full bg-black/20 border border-white/10 rounded p-3 focus:border-accent outline-none" 
                                            />
                                        </div>
                                         <div className="space-y-2">
                                            <label className="text-xs uppercase text-gray-500">Status</label>
                                            <select 
                                                value={editingProduct.status}
                                                onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as any })}
                                                className="w-full bg-black/20 border border-white/10 rounded p-3 focus:border-accent outline-none appearance-none" 
                                            >
                                                <option value="available">Disponível</option>
                                                <option value="sold">Vendido</option>
                                                <option value="reserved">Reservado</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase text-gray-500">Categoria</label>
                                        <select 
                                            value={editingProduct.category}
                                            onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                                            className="w-full bg-black/20 border border-white/10 rounded p-3 focus:border-accent outline-none appearance-none capitalize" 
                                        >
                                            {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase text-gray-500">Imagens</label>
                                        <div className="flex flex-wrap gap-4">
                                            {editingProduct.images?.map((img, i) => (
                                                <div key={i} className="w-24 h-24 relative group border border-white/10 rounded overflow-hidden">
                                                    <img src={img} className="w-full h-full object-cover" alt="" />
                                                    <button 
                                                        onClick={() => {
                                                            const newImages = [...(editingProduct.images || [])];
                                                            newImages.splice(i, 1);
                                                            setEditingProduct({ ...editingProduct, images: newImages });
                                                        }}
                                                        className="absolute top-1 right-1 bg-red-500 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="w-24 h-24 border border-dashed border-white/20 rounded flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors text-gray-500 hover:text-white">
                                                <Upload size={20} />
                                                <span className="text-[10px]">Upload</span>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview Side */}
                            <div className="w-96 bg-[#0a0a0a] p-8 flex flex-col items-center justify-center border-l border-white/10">
                                <h3 className="text-gray-500 uppercase tracking-widest text-xs mb-8">Preview do Card</h3>
                                <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-sm overflow-hidden shadow-2xl relative group">
                                    <div className="aspect-square relative">
                                        <img 
                                            src={editingProduct.images?.[0] || 'https://via.placeholder.com/400'} 
                                            className="w-full h-full object-cover"
                                            alt=""
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-serif text-lg truncate">{editingProduct.translations?.[editLang]?.title || 'Título'}</h4>
                                        <p className="text-accent">{formatPrice(editingProduct.price || 0)}</p>
                                    </div>
                                </div>

                                <div className="mt-auto w-full flex gap-4">
                                    <button 
                                        onClick={handleSaveProduct}
                                        className="flex-1 bg-accent text-white py-4 rounded font-bold uppercase tracking-widest text-xs hover:bg-accent/80 transition-colors"
                                    >
                                        Salvar Produto
                                    </button>
                                    <button 
                                        onClick={() => setIsProductModalOpen(false)}
                                        className="px-6 border border-white/10 rounded hover:bg-white/5"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};