
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Package, Users, MessageSquare, Plus, Edit, Trash2, Save, Upload, Search, Filter, TrendingUp, DollarSign, RefreshCw, Lock, Globe, MoveUp, MoveDown, Check, ThumbsDown, AlertCircle, Move, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store';
import { db } from '../lib/firebase/config';
import { deleteDocument, subscribeToCollection, updateDocument } from '../lib/firebase/firestore';
import { Product, ProductCategory } from '../types';
import { getBrevoStats, getBrevoContacts, getChatConfig, updateChatConfig, getChatFeedback, resolveFeedback, syncFirestoreToBrevo } from '../app/actions/admin';
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
    const [activeTab, setActiveTab] = useState<'analytics' | 'products' | 'crm' | 'chatbot'>('analytics');
    const [stats, setStats] = useState({ 
        salesToday: 0, salesMonth: 0, newOrders: 0, activeUsers: 0, brevoSubs: 0, brevoClients: 0 
    });
    
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
    useEffect(() => {
        if (!isOpen) return;

        // 1. Real-time Products
        const unsubProducts = subscribeToCollection('products', (data) => {
            const sorted = data.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
            setProducts(sorted as Product[]);
        });

        // 2. Dashboard Stats
        const fetchStats = async () => {
            const brevo = await getBrevoStats();
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

        return () => unsubProducts();
    }, [isOpen]);

    // Fetch tab-specific data
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

    if (!isOpen) return null;

    const salesData = [
        { name: 'Jan', value: 4000 }, { name: 'Fev', value: 3000 }, { name: 'Mar', value: 2000 }, 
        { name: 'Abr', value: 2780 }, { name: 'Mai', value: 1890 }, { name: 'Jun', value: 2390 }, 
        { name: 'Jul', value: 3490 }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex bg-black/80 backdrop-blur-md overflow-hidden text-white font-sans">
            {/* SIDEBAR */}
            <motion.div 
                className="w-20 md:w-64 bg-[#121212] border-r border-white/10 flex flex-col items-center md:items-stretch py-8"
                initial={{ x: -100 }}
                animate={{ x: 0 }}
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
                    <h1 className="text-2xl font-serif capitalize">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500 uppercase">Ultimo login: {new Date().toLocaleTimeString()}</span>
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-bold">{user?.displayName?.[0] || 'A'}</div>
                    </div>
                </header>

                <div 
                    className="flex-1 overflow-y-auto p-8 overscroll-contain"
                    data-lenis-prevent // CRITICAL FIX: Allows internal scrolling in Admin Panel
                >
                    <AnimatePresence mode="wait">
                        
                        {/* 1. ANALYTICS */}
                        {activeTab === 'analytics' && (
                            <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Vendas Hoje', value: `€ ${stats.salesToday}`, icon: DollarSign, trend: '+12%', color: '#10B981' },
                                        { label: 'Novos Pedidos', value: stats.newOrders, icon: Package, trend: '+3', color: '#3B82F6' },
                                        { label: 'Inscritos Brevo', value: stats.brevoSubs, icon: Users, trend: 'Lista 5', color: '#D4AF37' },
                                        { label: 'Clientes Brevo', value: stats.brevoClients, icon: Users, trend: 'Lista 7', color: '#8B5CF6' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-[#151515] p-6 rounded-xl border border-white/10 relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-2 rounded-lg bg-[${stat.color}]/10`}><stat.icon size={20} style={{ color: stat.color }} /></div>
                                                <span className="text-xs font-bold bg-white/5 px-2 py-1 rounded text-green-400">{stat.trend}</span>
                                            </div>
                                            <h3 className="text-2xl font-bold font-serif">{stat.value}</h3>
                                            <p className="text-gray-500 text-xs uppercase tracking-widest mt-1">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-[#151515] p-6 rounded-xl border border-white/10 h-[400px]">
                                    <h3 className="text-lg font-serif mb-6">Desempenho de Vendas</h3>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={salesData}>
                                            <defs>
                                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                            <XAxis dataKey="name" stroke="#666" />
                                            <YAxis stroke="#666" />
                                            <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }} />
                                            <Area type="monotone" dataKey="value" stroke="#D4AF37" fillOpacity={1} fill="url(#colorSales)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>
                        )}

                        {/* 2. PRODUCTS */}
                        {activeTab === 'products' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex gap-4 bg-[#151515] p-2 rounded-lg border border-white/10 w-96">
                                        <Search className="text-gray-500" size={20} />
                                        <input type="text" placeholder="Buscar produtos..." className="bg-transparent outline-none text-sm w-full" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
                                    </div>
                                    <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-accent text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-accent/80">
                                        <Plus size={16} /> Novo Produto
                                    </button>
                                </div>
                                <div className="bg-[#151515] rounded-xl border border-white/10 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-white/5 text-gray-400">
                                            <tr><th className="p-4 text-left w-20">Ord.</th><th className="p-4 text-left">Produto</th><th className="p-4 text-left">Preço</th><th className="p-4 text-right">Ações</th></tr>
                                        </thead>
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndProducts}>
                                            <tbody className="divide-y divide-white/5">
                                                <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
                                                    {products.filter(p => p.translations?.fr?.title?.toLowerCase().includes(productSearch.toLowerCase())).map((product, index) => (
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
                                </div>
                            </motion.div>
                        )}
                        
                        {/* 3. CRM */}
                        {activeTab === 'crm' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {loadingContacts ? <div className="text-center py-20 flex flex-col items-center"><Loader2 className="animate-spin mb-4" /> Carregando...</div> : (
                                    <div className="bg-[#151515] rounded-xl border border-white/10 overflow-hidden">
                                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                            <div className="flex items-center gap-4">
                                                <h3 className="font-serif text-lg">Contatos Brevo</h3>
                                                <span className="bg-green-500/10 text-green-500 text-xs px-2 py-1 rounded">Listas 5 & 7</span>
                                            </div>
                                            <div className="flex gap-3">
                                                <button onClick={handleSyncBrevo} disabled={isSyncing} className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded text-xs uppercase font-bold hover:bg-white/20 disabled:opacity-50">
                                                    <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} /> Sync Firestore
                                                </button>
                                                <a href="https://app.brevo.com" target="_blank" className="text-accent text-xs uppercase font-bold hover:underline flex items-center gap-1">
                                                    Dashboard Externo <Globe size={12}/>
                                                </a>
                                            </div>
                                        </div>
                                        <table className="w-full text-sm">
                                            <thead className="bg-white/5 text-gray-400">
                                                <tr><th className="p-4 text-left">Email</th><th className="p-4 text-left">Nome</th><th className="p-4 text-left">Status</th><th className="p-4 text-right">Data</th></tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {brevoContacts.map((c) => (
                                                    <tr key={c.id} className="hover:bg-white/5">
                                                        <td className="p-4">{c.email}</td>
                                                        <td className="p-4">{c.attributes.FIRSTNAME} {c.attributes.NOME}</td>
                                                        <td className="p-4"><span className={cn("px-2 py-1 rounded text-[10px]", c.emailBlacklisted ? "bg-red-500/20 text-red-500" : "bg-green-500/20 text-green-500")}>{c.emailBlacklisted ? 'Blacklisted' : 'Ativo'}</span></td>
                                                        <td className="p-4 text-right">{new Date(c.createdAt).toLocaleDateString()}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* 4. CHATBOT IA */}
                        {activeTab === 'chatbot' && chatConfig && (
                             <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-[#151515] p-6 rounded-xl border border-white/10 space-y-4">
                                        <h3 className="font-serif text-lg text-accent mb-4">Cérebro da IA (System Prompt)</h3>
                                        <textarea 
                                            value={chatConfig.systemPrompt}
                                            onChange={(e) => setChatConfig({...chatConfig, systemPrompt: e.target.value})}
                                            className="w-full h-48 bg-black/30 border border-white/10 rounded p-3 text-sm focus:border-accent outline-none text-white/80"
                                            placeholder="Instruções do sistema..."
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs uppercase text-gray-500">Temperatura</label>
                                                <input type="range" min="0" max="1" step="0.1" value={chatConfig.modelTemperature} onChange={e => setChatConfig({...chatConfig, modelTemperature: parseFloat(e.target.value)})} className="w-full mt-2" />
                                                <div className="text-right text-xs text-accent">{chatConfig.modelTemperature}</div>
                                            </div>
                                            <div>
                                                 <label className="text-xs uppercase text-gray-500">Rate Limit (0=Ilimitado)</label>
                                                 <div className="flex gap-2 mt-1">
                                                     <input type="number" value={chatConfig.rateLimit?.maxMessages} onChange={e => setChatConfig({...chatConfig, rateLimit: {...chatConfig.rateLimit, maxMessages: parseInt(e.target.value)}})} className="w-1/2 bg-black/30 border border-white/10 rounded p-2 text-sm text-white" />
                                                     <input type="number" value={chatConfig.rateLimit?.windowMinutes} onChange={e => setChatConfig({...chatConfig, rateLimit: {...chatConfig.rateLimit, windowMinutes: parseInt(e.target.value)}})} className="w-1/2 bg-black/30 border border-white/10 rounded p-2 text-sm text-white" />
                                                 </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-[#151515] p-6 rounded-xl border border-white/10">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-serif text-lg text-accent">Prompt Starters (Drag & Drop)</h3>
                                            <button onClick={() => setChatConfig({...chatConfig, starters: [...chatConfig.starters, { id: Date.now().toString(), label: 'Nova', text: '', order: chatConfig.starters.length + 1 }]})} className="text-xs bg-white/10 p-1 rounded hover:bg-white/20"><Plus size={14}/></button>
                                        </div>
                                        
                                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndStarters}>
                                            <SortableContext items={chatConfig.starters.map(s => s.id)} strategy={verticalListSortingStrategy}>
                                                {chatConfig.starters.map((starter, idx) => (
                                                    <SortableStarter 
                                                        key={starter.id} 
                                                        starter={starter} 
                                                        onChange={(s) => {
                                                            const newS = [...chatConfig.starters];
                                                            const idx = newS.findIndex(x => x.id === s.id);
                                                            newS[idx] = s;
                                                            setChatConfig({...chatConfig, starters: newS});
                                                        }}
                                                        onDelete={(id) => setChatConfig({...chatConfig, starters: chatConfig.starters.filter(s => s.id !== id)})}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button 
                                        onClick={handleSaveChatConfig} 
                                        disabled={isSavingChat} 
                                        className="bg-accent text-white px-8 py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-accent/80 flex items-center gap-2 shadow-lg hover:shadow-accent/20 transition-all disabled:opacity-50"
                                    >
                                        {isSavingChat ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>} 
                                        {isSavingChat ? 'Salvando...' : 'Salvar Configurações'}
                                    </button>
                                </div>

                                <div className="bg-[#151515] rounded-xl border border-white/10 overflow-hidden">
                                    <div className="p-4 border-b border-white/10 bg-red-500/5">
                                        <h3 className="font-serif text-lg text-red-400 flex items-center gap-2"><AlertCircle size={18}/> Feedback Negativo</h3>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead className="bg-white/5 text-gray-400">
                                            <tr><th className="p-4 text-left">Pergunta</th><th className="p-4 text-left">Resposta da IA</th><th className="p-4 text-right">Ação</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {feedbackList.length === 0 ? (
                                                <tr><td colSpan={3} className="p-8 text-center text-gray-500">Nenhum feedback negativo pendente.</td></tr>
                                            ) : feedbackList.map(f => (
                                                <tr key={f.id} className="hover:bg-white/5">
                                                    <td className="p-4 max-w-xs truncate" title={f.userMessage}>{f.userMessage}</td>
                                                    <td className="p-4 max-w-xs truncate text-gray-400" title={f.aiResponse}>{f.aiResponse}</td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => setShowFeedbackModal(f)} className="bg-white/10 hover:bg-accent hover:text-white px-3 py-1 rounded text-xs uppercase font-bold transition-colors">Corrigir</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                             </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* PRODUCT FORM MODAL - REPLACED WITH NEW COMPONENT */}
            <AnimatePresence>
                {isProductModalOpen && (
                    <ProductForm 
                        initialData={editingProduct} 
                        onClose={() => setIsProductModalOpen(false)}
                        onSuccess={() => {
                            setIsProductModalOpen(false);
                            setEditingProduct(null);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* FEEDBACK FIX MODAL */}
            <AnimatePresence>
                {showFeedbackModal && (
                    <motion.div 
                        className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4" 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <div className="w-full max-w-lg bg-[#121212] border border-white/10 rounded-2xl p-8">
                            <h2 className="text-2xl font-serif mb-4 text-accent">Corrigir Conhecimento</h2>
                            <p className="text-gray-400 text-sm mb-4">
                                O usuário perguntou: <span className="text-white italic">"{showFeedbackModal.userMessage}"</span>
                                <br/>A IA respondeu: <span className="text-red-400 italic">"{showFeedbackModal.aiResponse}"</span>
                            </p>
                            
                            <label className="block text-xs uppercase text-gray-500 mb-2">Qual a resposta correta?</label>
                            <textarea 
                                className="w-full bg-black/30 border border-white/10 rounded p-3 text-sm h-32 focus:border-accent outline-none text-white"
                                value={fixAnswer}
                                onChange={(e) => setFixAnswer(e.target.value)}
                                placeholder="Digite a informação correta para a IA aprender..."
                            />
                            
                            <div className="mt-6 flex justify-end gap-4">
                                <button onClick={() => setShowFeedbackModal(null)} className="px-6 py-2 border border-white/10 rounded">Cancelar</button>
                                <button onClick={handleResolveFeedback} className="bg-accent text-white px-6 py-2 rounded font-bold">Salvar & Ensinar</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
