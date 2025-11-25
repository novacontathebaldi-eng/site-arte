
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Package, Users, MessageSquare, Plus, Edit, Trash2, Save, Upload, Search, Filter, TrendingUp, DollarSign, RefreshCw, Lock, Globe, MoveUp, MoveDown, Check, ThumbsDown, AlertCircle, Move, Loader2, Settings, Database, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuthStore } from '../store';
import { db } from '../lib/firebase/config';
import { deleteDocument, subscribeToCollection, updateDocument } from '../lib/firebase/firestore';
import { collection, query, onSnapshot, where, orderBy, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { Product, ProductCategory } from '../types';
import { getBrevoStats, getBrevoContacts, getChatConfig, updateChatConfig, getChatFeedback, resolveFeedback, syncFirestoreToBrevo } from '../app/actions/admin';
import { seedDatabase } from '../app/actions/seed';
import { formatPrice, cn } from '../lib/utils';
import { AvatarUploader } from './dashboard/AvatarUploader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChatConfig, ChatFeedback, BrevoContact, ChatStarter } from '../types/admin';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from './ui/Toast';
import { ProductForm } from './dashboard/ProductForm';

interface AdminDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

// --- SORTABLE COMPONENTS ---

interface SortableRowProps {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
  index: number;
}

const SortableRow: React.FC<SortableRowProps> = ({ product, onEdit, onDelete, index }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });
    const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1, opacity: isDragging ? 0.5 : 1 };
    
    // Safely access image 0
    const imgUrl = product.images && product.images.length > 0 
        ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url)
        : '';

    return (
        <tr ref={setNodeRef} style={style} className="hover:bg-white/5 bg-[#151515]">
            <td className="p-4 flex gap-2 items-center">
                 <button {...attributes} {...listeners} className="p-1 hover:bg-white/10 rounded cursor-grab active:cursor-grabbing"><Move size={14} /></button>
                 <span className="w-6 text-center text-gray-500">{index + 1}</span>
            </td>
            <td className="p-4">
                <div className="flex items-center gap-4">
                    {imgUrl && <img src={imgUrl} className="w-10 h-10 object-cover rounded" alt="" />}
                    <div>
                        <span className="block">{product.translations?.fr?.title || 'Sem Título'}</span>
                        <span className="text-xs text-gray-500">{product.sku}</span>
                    </div>
                </div>
            </td>
            <td className="p-4">{formatPrice(product.price)}</td>
            <td className="p-4 text-right flex justify-end gap-2">
                <button onClick={() => onEdit(product)} className="p-2 bg-blue-500/10 text-blue-500 rounded hover:bg-blue-500/20"><Edit size={16}/></button>
                <button onClick={() => onDelete(product.id)} className="p-2 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20"><Trash2 size={16}/></button>
            </td>
        </tr>
    );
};

interface SortableStarterProps {
  starter: ChatStarter;
  onChange: (s: ChatStarter) => void;
  onDelete: (id: string) => void;
}

const SortableStarter: React.FC<SortableStarterProps> = ({ starter, onChange, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: starter.id });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="flex gap-2 items-center bg-black/20 p-2 rounded mb-2">
             <button {...attributes} {...listeners} className="p-2 text-gray-500 cursor-grab active:cursor-grabbing"><Move size={14}/></button>
             <input value={starter.label} onChange={e => onChange({...starter, label: e.target.value})} className="bg-black/30 border border-white/10 rounded p-2 text-xs w-1/3 focus:border-accent outline-none text-white" placeholder="Rótulo" />
             <input value={starter.text} onChange={e => onChange({...starter, text: e.target.value})} className="bg-black/30 border border-white/10 rounded p-2 text-xs flex-1 focus:border-accent outline-none text-white" placeholder="Mensagem enviada" />
             <button onClick={() => onDelete(starter.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded"><Trash2 size={14}/></button>
        </div>
    );
};

// --- MAIN COMPONENT ---

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'crm' | 'chatbot' | 'settings'>('analytics');
    
    // Stats State
    const [stats, setStats] = useState({ 
        salesToday: 0, 
        salesMonth: 0, 
        newOrders: 0, 
        activeUsers: 0, 
        brevoSubs: 0, 
        brevoClients: 0 
    });
    const [salesData, setSalesData] = useState<any[]>([]);
    
    // --- PRODUCT STATE ---
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    // --- CRM STATE ---
    const [brevoContacts, setBrevoContacts] = useState<BrevoContact[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);

    // --- AI STATE ---
    const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null);
    const [feedbackList, setFeedbackList] = useState<ChatFeedback[]>([]);
    const [isSavingChat, setIsSavingChat] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState<ChatFeedback | null>(null);
    const [fixAnswer, setFixAnswer] = useState('');

    // --- SETTINGS / SEED STATE ---
    const [isSeeding, setIsSeeding] = useState(false);

    // DnD Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    // --- SCROLL LOCK ---
    useEffect(() => {
        if (isOpen) {
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
    }, [isOpen]);

    // --- DATA FETCHING ---
    
    // 1. Real-time Products (Always Active when Open)
    useEffect(() => {
        if (!isOpen) return;

        // Use onSnapshot for real-time updates and proper cleanup
        const q = query(collection(db, 'products'), orderBy('displayOrder', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) })) as Product[];
            // Ensure sorting in client side as fail-safe
            const sorted = data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            setProducts(sorted);
        }, (error) => {
            console.error("Products listener error:", error);
        });

        return () => unsubscribe();
    }, [isOpen]);

    // 2. Dashboard Stats (Realtime Orders & Users) - CRITICAL FIX FOR KPIS
    useEffect(() => {
        if (!isOpen || activeTab !== 'analytics') return;

        // Fetch External API Stats (Brevo) once
        getBrevoStats().then(brevo => {
            setStats(prev => ({ ...prev, brevoSubs: brevo.subscribers, brevoClients: brevo.clients }));
        });

        // Setup Dates
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // Orders Listener
        const ordersQuery = query(collection(db, 'orders'));
        const unsubOrders = onSnapshot(ordersQuery, (snapshot: QuerySnapshot<DocumentData>) => {
            let todayTotal = 0;
            let monthTotal = 0;
            let pending = 0;
            
            const monthlyDataMap = new Map<string, number>();

            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const amount = Number(data.amount) || 0;
                const dateStr = data.createdAt; // ISO String

                if (dateStr >= startOfDay) todayTotal += amount;
                if (dateStr >= startOfMonth) monthTotal += amount;
                // Check multiple status for pending count
                if (['pending', 'processing', 'paid'].includes(data.status)) pending++;

                // Chart Data Aggregation (by Month)
                if (dateStr) {
                    const dateObj = new Date(dateStr);
                    const monthKey = dateObj.toLocaleString('default', { month: 'short' });
                    monthlyDataMap.set(monthKey, (monthlyDataMap.get(monthKey) || 0) + amount);
                }
            });

            // Convert map to array for Recharts
            const chartData = Array.from(monthlyDataMap.entries()).map(([name, value]) => ({ name, value }));

            setStats(prev => ({
                ...prev,
                salesToday: todayTotal,
                salesMonth: monthTotal,
                newOrders: pending
            }));
            
            if (chartData.length > 0) {
                 // Sort months if needed, but simple insert order usually works for recent data
                 setSalesData(chartData);
            } else {
                 setSalesData([
                    { name: 'Jan', value: 0 }, { name: 'Fev', value: 0 }, { name: 'Mar', value: 0 }, 
                    { name: 'Abr', value: 0 }, { name: 'Mai', value: 0 }, { name: 'Jun', value: 0 }
                ]);
            }
        }, (error) => {
            console.error("Orders listener error:", error);
        });

        // Users Listener
        const usersQuery = query(collection(db, 'users'));
        const unsubUsers = onSnapshot(usersQuery, (snapshot: QuerySnapshot<DocumentData>) => {
            setStats(prev => ({ ...prev, activeUsers: snapshot.size }));
        }, (error) => {
             console.error("Users listener error:", error);
        });

        // CRITICAL: CLEANUP FUNCTION TO PREVENT BACKOFF ERROR
        return () => {
            unsubOrders();
            unsubUsers();
        };
    }, [isOpen, activeTab]);

    // Fetch tab-specific data (One-time fetches)
    useEffect(() => {
        if (!isOpen) return;

        if (activeTab === 'crm') {
            setLoadingContacts(true);
            getBrevoContacts().then(c => {
                setBrevoContacts(c);
                setLoadingContacts(false);
            });
        }
        
        if (activeTab === 'chatbot') {
            getChatConfig().then(setChatConfig);
            getChatFeedback().then(setFeedbackList);
        }

    }, [activeTab, isOpen]);

    // --- HANDLERS ---

    const handleDeleteProduct = async (id: string) => {
        if(confirm("Tem certeza que deseja deletar esta obra?")) await deleteDocument('products', id);
    };

    const handleDragEndProducts = async (event: any) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = products.findIndex(p => p.id === active.id);
            const newIndex = products.findIndex(p => p.id === over.id);
            const newItems = arrayMove(products, oldIndex, newIndex);
            setProducts(newItems);

            for (let i = 0; i < newItems.length; i++) {
                await updateDocument('products', newItems[i].id, { displayOrder: i });
            }
        }
    };

    const handleDragEndStarters = (event: any) => {
        if (!chatConfig) return;
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = chatConfig.starters.findIndex(s => s.id === active.id);
            const newIndex = chatConfig.starters.findIndex(s => s.id === over.id);
            const newStarters = arrayMove(chatConfig.starters, oldIndex, newIndex);
            
            const updated = newStarters.map((s, idx) => ({ ...s, order: idx }));
            setChatConfig({ ...chatConfig, starters: updated });
        }
    };

    const handleSyncBrevo = async () => {
        setIsSyncing(true);
        const res = await syncFirestoreToBrevo();
        toast(`Sincronização concluída: ${res.added} adicionados.`, "success");
        setIsSyncing(false);
        setLoadingContacts(true);
        getBrevoContacts().then(c => { setBrevoContacts(c); setLoadingContacts(false); });
    };

    const handleSaveChatConfig = async () => {
        if (!chatConfig) return;
        setIsSavingChat(true);
        const res = await updateChatConfig(chatConfig);
        setIsSavingChat(false);
        if (res.success) {
            toast("Configurações do Chatbot salvas.", "success");
        } else {
            toast("Erro ao salvar configurações.", "error");
        }
    };

    const handleResolveFeedback = async () => {
        if (!showFeedbackModal || !fixAnswer.trim()) return;
        
        const item = showFeedbackModal;
        const solution = { 
            id: Date.now().toString(), 
            question: item.userMessage, 
            answer: fixAnswer, 
            tags: ['feedback-fix'] 
        };
        
        await resolveFeedback(item.id, solution);
        setFeedbackList(prev => prev.filter(f => f.id !== item.id));
        setShowFeedbackModal(null);
        setFixAnswer('');
        toast("Conhecimento adicionado. O bot aprendeu!", "success");
    };

    const handleSeedDatabase = async (clear: boolean) => {
        if (!confirm(`Tem certeza? Isso irá ${clear ? 'APAGAR TODOS os produtos existentes e ' : ''}criar produtos de exemplo.`)) return;
        
        setIsSeeding(true);
        try {
            const res = await seedDatabase(clear);
            if (res.success) {
                toast(res.message, "success");
                setActiveTab('products'); // Redireciona para ver o resultado
            } else {
                toast("Erro ao popular banco: " + res.message, "error");
            }
        } catch (e) {
            toast("Erro desconhecido ao popular.", "error");
        } finally {
            setIsSeeding(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex bg-black/80 backdrop-blur-md overflow-hidden text-white font-sans">
            {/* SIDEBAR */}
            <motion.div 
                className="w-20 md:w-64 bg-[#121212] border-r border-white/10 flex flex-col items-center md:items-stretch py-8"
                {...({
                    initial: { x: -100 },
                    animate: { x: 0 }
                } as any)}
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
                        { id: 'chatbot', label: 'IA Control', icon: MessageSquare },
                        { id: 'settings', label: 'Config / Seed', icon: Settings },
                    ].map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id as any)} className={cn("flex items-center gap-4 p-3 rounded-lg w-full transition-all group", activeTab === item.id ? "bg-white/10 text-white" : "text-gray-500 hover:bg-white/5 hover:text-white")}>
                            <item.icon size={20} className={activeTab === item.id ? "text-accent" : ""} />
                            <span className="hidden md:block text-sm font-medium tracking-wide">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <button onClick={onClose} className="p-4 flex items-center justify-center gap-2 text-gray-500 hover:text-white mt-auto border-t border-white/10"><X size={20} /><span className="hidden md:block text-xs uppercase">Fechar</span></button>
            </motion.div>

            {/* CONTENT */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a] relative">
                <header className="h-20 border-b border-white/10 flex items-center justify-between px-8">
                    <h1 className="text-2xl font-serif capitalize">{activeTab === 'settings' ? 'Configurações do Sistema' : activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500 uppercase">Ultimo login: {new Date().toLocaleTimeString()}</span>
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-bold">{user?.displayName?.[0] || 'A'}</div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8" data-lenis-prevent>
                    {activeTab === 'analytics' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: 'Vendas Hoje', value: formatPrice(stats.salesToday), icon: TrendingUp, color: 'text-green-500' },
                                    { label: 'Receita Mensal', value: formatPrice(stats.salesMonth), icon: DollarSign, color: 'text-accent' },
                                    { label: 'Novos Pedidos', value: stats.newOrders, icon: Package, color: 'text-blue-500' },
                                    { label: 'Usuários Ativos', value: stats.activeUsers, icon: Users, color: 'text-purple-500' },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-[#151515] p-6 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-gray-500 text-xs uppercase">{stat.label}</span>
                                            <stat.icon className={stat.color} size={20} />
                                        </div>
                                        <div className="text-3xl font-serif">{stat.value}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-[#151515] p-6 rounded-xl border border-white/5">
                                    <h3 className="text-lg font-serif mb-6">Performance de Vendas</h3>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={salesData}>
                                                <defs>
                                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <XAxis dataKey="name" stroke="#555" tick={{fill: '#888'}} />
                                                <YAxis stroke="#555" tick={{fill: '#888'}} />
                                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                                <Tooltip contentStyle={{backgroundColor: '#1a1a1a', border: '1px solid #333'}} />
                                                <Area type="monotone" dataKey="value" stroke="#D4AF37" fillOpacity={1} fill="url(#colorSales)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="bg-[#151515] p-6 rounded-xl border border-white/5">
                                    <h3 className="text-lg font-serif mb-6">Marketing (Brevo)</h3>
                                    <div className="space-y-6">
                                        <div className="p-4 bg-white/5 rounded-lg">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-gray-400 text-sm">Newsletter</span>
                                                <span className="text-accent font-bold">{stats.brevoSubs}</span>
                                            </div>
                                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                <div className="h-full bg-accent w-[70%]"></div>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-lg">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-gray-400 text-sm">Clientes</span>
                                                <span className="text-green-500 font-bold">{stats.brevoClients}</span>
                                            </div>
                                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 w-[45%]"></div>
                                            </div>
                                        </div>
                                        <button onClick={handleSyncBrevo} className="w-full py-3 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 rounded border border-blue-600/30 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors">
                                            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} /> Sincronizar Agora
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'products' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="flex justify-between items-center">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar obra..." 
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                        className="bg-[#151515] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:border-accent outline-none w-64"
                                    />
                                </div>
                                <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-accent text-white px-6 py-2 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-accent/80 flex items-center gap-2">
                                    <Plus size={16} /> Nova Obra
                                </button>
                            </div>

                            <div className="bg-[#151515] rounded-xl border border-white/10 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-gray-400 uppercase text-xs font-medium">
                                        <tr>
                                            <th className="px-4 py-3 text-left w-16">Ord</th>
                                            <th className="px-4 py-3 text-left">Obra</th>
                                            <th className="px-4 py-3 text-left">Preço</th>
                                            <th className="px-4 py-3 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndProducts}>
                                        <tbody className="divide-y divide-white/5">
                                            <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                                {products
                                                    .filter(p => p.translations?.fr?.title?.toLowerCase().includes(productSearch.toLowerCase()))
                                                    .map((product, index) => (
                                                        <SortableRow 
                                                            key={product.id} 
                                                            product={product} 
                                                            index={index} 
                                                            onEdit={(p) => { setEditingProduct(p); setIsProductModalOpen(true); }}
                                                            onDelete={handleDeleteProduct}
                                                        />
                                                    ))}
                                            </SortableContext>
                                        </tbody>
                                    </DndContext>
                                </table>
                                {products.length === 0 && (
                                    <div className="p-8 text-center text-gray-500">
                                        Nenhum produto encontrado. Vá em Configurações > Seed para adicionar exemplos.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'crm' && (
                        <div className="space-y-6 animate-fade-in">
                             <div className="flex justify-between items-center bg-[#151515] p-6 rounded-xl border border-white/10">
                                <div>
                                    <h3 className="text-xl font-serif">Contatos Brevo</h3>
                                    <p className="text-gray-500 text-sm">Sincronizado com lista de Newsletter e Clientes.</p>
                                </div>
                                <button onClick={handleSyncBrevo} disabled={isSyncing} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded flex items-center gap-2 text-sm transition-colors">
                                    <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} /> Refresh
                                </button>
                            </div>

                            {loadingContacts ? (
                                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-accent" size={32} /></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {brevoContacts.map(contact => (
                                        <div key={contact.id} className="bg-[#151515] p-4 rounded-lg border border-white/5 flex items-center justify-between group hover:border-white/20 transition-all">
                                            <div>
                                                <div className="font-bold text-white">{contact.email}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Adicionado: {new Date(contact.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-xs bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-500/20">
                                                Ativo
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'chatbot' && chatConfig && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                            {/* CONFIG */}
                            <div className="bg-[#151515] p-6 rounded-xl border border-white/10 space-y-6">
                                <h3 className="text-lg font-serif border-b border-white/10 pb-4 mb-4">Personalidade da IA</h3>
                                
                                {/* TOGGLE OVERRIDE */}
                                <div className="flex items-center justify-between bg-black/30 p-4 rounded border border-white/10">
                                    <div className="flex items-center gap-3">
                                        {chatConfig.useCustomPrompt ? (
                                            <ToggleRight size={32} className="text-accent cursor-pointer" onClick={() => setChatConfig({...chatConfig, useCustomPrompt: false})} />
                                        ) : (
                                            <ToggleLeft size={32} className="text-gray-500 cursor-pointer" onClick={() => setChatConfig({...chatConfig, useCustomPrompt: true})} />
                                        )}
                                        <div>
                                            <span className="block text-sm font-bold text-white">Usar Prompt Personalizado</span>
                                            <span className="text-xs text-gray-500">Se desligado, usa o Prompt Padrão de Fábrica (Seguro).</span>
                                        </div>
                                    </div>
                                    {!chatConfig.useCustomPrompt && (
                                        <span className="text-[10px] bg-green-900/30 text-green-500 px-2 py-1 rounded border border-green-500/20 uppercase font-bold">Modo Seguro</span>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-2">System Prompt (Instruções)</label>
                                    <textarea 
                                        value={chatConfig.systemPrompt}
                                        onChange={e => setChatConfig({...chatConfig, systemPrompt: e.target.value})}
                                        rows={12}
                                        disabled={!chatConfig.useCustomPrompt}
                                        className={cn(
                                            "w-full bg-black/30 border border-white/10 rounded p-4 text-sm text-gray-300 focus:border-accent focus:outline-none leading-relaxed transition-opacity",
                                            !chatConfig.useCustomPrompt && "opacity-50 cursor-not-allowed"
                                        )}
                                    />
                                    {!chatConfig.useCustomPrompt && (
                                        <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                                            <AlertTriangle size={12} /> O prompt acima está inativo. O sistema está usando o padrão interno.
                                        </p>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-xs uppercase text-gray-500 mb-2">Criatividade (Temperatura: {chatConfig.modelTemperature})</label>
                                    <input 
                                        type="range" min="0" max="1" step="0.1"
                                        value={chatConfig.modelTemperature}
                                        onChange={e => setChatConfig({...chatConfig, modelTemperature: parseFloat(e.target.value)})}
                                        className="w-full accent-accent"
                                    />
                                </div>
                                
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs uppercase text-gray-500">Sugestões Iniciais (Starters)</label>
                                        <button 
                                            onClick={() => setChatConfig({
                                                ...chatConfig, 
                                                starters: [...chatConfig.starters, { id: Date.now().toString(), label: 'Nova', text: '', order: chatConfig.starters.length }]
                                            })}
                                            className="text-xs text-accent hover:underline"
                                        >
                                            + Adicionar
                                        </button>
                                    </div>
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndStarters}>
                                        <SortableContext items={chatConfig.starters.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                            {chatConfig.starters.map((starter) => (
                                                <SortableStarter 
                                                    key={starter.id} 
                                                    starter={starter} 
                                                    onChange={(updated) => setChatConfig({...chatConfig, starters: chatConfig.starters.map(s => s.id === updated.id ? updated : s)})}
                                                    onDelete={(id) => setChatConfig({...chatConfig, starters: chatConfig.starters.filter(s => s.id !== id)})}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                </div>

                                <button onClick={handleSaveChatConfig} disabled={isSavingChat} className="w-full py-3 bg-accent text-white rounded font-bold uppercase tracking-widest text-xs hover:bg-accent/80 flex justify-center gap-2">
                                    {isSavingChat ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Salvar Configurações
                                </button>
                            </div>

                            {/* FEEDBACK LOOP */}
                            <div className="space-y-6">
                                <div className="bg-[#151515] p-6 rounded-xl border border-white/10 h-full">
                                    <h3 className="text-lg font-serif border-b border-white/10 pb-4 mb-4 flex items-center gap-2">
                                        <AlertCircle size={18} className="text-red-500"/>
                                        Feedback Negativo (Aprendizado)
                                    </h3>
                                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                                        {feedbackList.length === 0 ? (
                                            <p className="text-gray-500 text-sm italic">Nenhum feedback negativo pendente.</p>
                                        ) : (
                                            feedbackList.map(item => (
                                                <div key={item.id} className="bg-black/20 p-4 rounded border border-white/5 hover:border-red-500/30 transition-colors">
                                                    <div className="mb-2">
                                                        <span className="text-xs text-gray-500">Usuário perguntou:</span>
                                                        <p className="text-white text-sm font-medium">"{item.userMessage}"</p>
                                                    </div>
                                                    <div className="mb-3 pl-2 border-l-2 border-red-500/20">
                                                        <span className="text-xs text-gray-500">IA respondeu:</span>
                                                        <p className="text-gray-400 text-xs italic">"{item.aiResponse}"</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setShowFeedbackModal(item)}
                                                        className="w-full py-2 bg-white/5 hover:bg-white/10 text-xs uppercase tracking-wide rounded text-gray-300"
                                                    >
                                                        Ensinar Resposta Correta
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
                            <div className="bg-[#151515] p-8 rounded-xl border border-white/10">
                                <h3 className="text-xl font-serif mb-6 flex items-center gap-3">
                                    <Database className="text-accent" />
                                    Gerenciamento de Dados (Seed)
                                </h3>
                                
                                <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg mb-8 flex gap-4">
                                    <AlertTriangle className="text-yellow-500 flex-shrink-0" />
                                    <div className="text-sm text-yellow-200/80">
                                        <strong className="block text-yellow-500 mb-1">Atenção: Área Sensível</strong>
                                        Use estas ferramentas para popular o banco de dados com produtos de exemplo. 
                                        Ideal para testes ou reiniciar o catálogo.
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                                        <h4 className="font-bold text-white mb-2">Adicionar Exemplos</h4>
                                        <p className="text-sm text-gray-500 mb-6">
                                            Adiciona 8 produtos de luxo (Pinturas, Esculturas, Joias) sem apagar os existentes.
                                        </p>
                                        <button 
                                            onClick={() => handleSeedDatabase(false)}
                                            disabled={isSeeding}
                                            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                                        >
                                            {isSeeding ? <Loader2 className="animate-spin" size={16}/> : <Plus size={16}/>}
                                            Adicionar Obras
                                        </button>
                                    </div>

                                    <div className="p-6 border border-red-900/30 bg-red-900/5 rounded-lg hover:bg-red-900/10 transition-colors">
                                        <h4 className="font-bold text-red-500 mb-2">Resetar Catálogo Completo</h4>
                                        <p className="text-sm text-gray-500 mb-6">
                                            ⚠️ APAGA todos os produtos atuais e recria o catálogo do zero com os exemplos.
                                        </p>
                                        <button 
                                            onClick={() => handleSeedDatabase(true)}
                                            disabled={isSeeding}
                                            className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                                        >
                                            {isSeeding ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16}/>}
                                            Resetar & Popular
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
            
            {/* PRODUCT MODAL */}
            {isProductModalOpen && (
                <ProductForm 
                    initialData={editingProduct} 
                    onClose={() => setIsProductModalOpen(false)}
                    onSuccess={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                />
            )}

            {/* FEEDBACK TEACHING MODAL */}
            <AnimatePresence>
                {showFeedbackModal && (
                    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur flex items-center justify-center p-4">
                        <motion.div 
                            className="bg-[#151515] p-8 rounded-xl max-w-lg w-full border border-white/10 shadow-2xl"
                            {...({
                                initial: { scale: 0.9, opacity: 0 },
                                animate: { scale: 1, opacity: 1 },
                                exit: { scale: 0.9, opacity: 0 }
                            } as any)}
                        >
                            <h3 className="text-xl font-serif mb-4">Ensinar o Chatbot</h3>
                            <div className="bg-black/30 p-4 rounded mb-4 text-sm text-gray-400">
                                <p className="mb-2"><strong>Pergunta:</strong> {showFeedbackModal.userMessage}</p>
                                <p><strong>Resposta Ruim:</strong> {showFeedbackModal.aiResponse}</p>
                            </div>
                            <div className="mb-6">
                                <label className="block text-xs uppercase text-gray-500 mb-2">Qual seria a resposta correta?</label>
                                <textarea 
                                    value={fixAnswer}
                                    onChange={e => setFixAnswer(e.target.value)}
                                    className="w-full bg-black/50 border border-white/10 rounded p-4 text-white focus:border-accent outline-none"
                                    rows={4}
                                    placeholder="Escreva a informação correta aqui..."
                                />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setShowFeedbackModal(null)} className="flex-1 py-3 text-gray-400 hover:text-white transition-colors">Cancelar</button>
                                <button onClick={handleResolveFeedback} className="flex-1 py-3 bg-accent text-white font-bold rounded hover:bg-accent/80">Salvar Conhecimento</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};