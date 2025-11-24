import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Package, Users, MessageSquare, Plus, Edit, Trash2, Save, Upload, Search, Filter, TrendingUp, DollarSign, RefreshCw, Lock, Globe, MoveUp, MoveDown, Check, ThumbsDown, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store';
import { db } from '../lib/firebase/config';
import { uploadImage, getPublicUrl } from '../lib/supabase/storage';
import { updateDocument, createDocument, deleteDocument, subscribeToCollection } from '../lib/firebase/firestore';
import { Product, ProductCategory } from '../types';
import { getBrevoStats, getBrevoContacts, getChatConfig, updateChatConfig, getChatFeedback, resolveFeedback } from '../app/actions/admin';
import { formatPrice, cn } from '../lib/utils';
import { AvatarUploader } from './dashboard/AvatarUploader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChatConfig, ChatFeedback, BrevoContact } from '../types/admin';

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
    
    // --- PRODUCT STATE ---
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [editLang, setEditLang] = useState('fr');

    // --- CRM STATE ---
    const [brevoContacts, setBrevoContacts] = useState<BrevoContact[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);

    // --- AI STATE ---
    const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null);
    const [feedbackList, setFeedbackList] = useState<ChatFeedback[]>([]);
    const [isSavingChat, setIsSavingChat] = useState(false);

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!isOpen) return;

        // 1. Real-time Products
        const unsubProducts = subscribeToCollection('products', (data) => {
            const sorted = data.sort((a, b) => (a.displayOrder || 9999) - (b.displayOrder || 9999));
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

    const handleSaveProduct = async () => {
        if (!editingProduct) return;
        try {
            const productData = { ...editingProduct, updatedAt: new Date().toISOString() };
            if (editingProduct.id) {
                await updateDocument('products', editingProduct.id, productData);
            } else {
                await createDocument('products', {
                    ...productData,
                    createdAt: new Date().toISOString(),
                    translations: editingProduct.translations || { fr: { title: 'New Art', description: '' } },
                    images: editingProduct.images || [],
                    price: editingProduct.price || 0,
                    category: editingProduct.category || ProductCategory.PAINTINGS,
                    available: true, status: 'available', stock: 1
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
        if(confirm("Tem certeza que deseja deletar esta obra?")) await deleteDocument('products', id);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingProduct) return;
        try {
            const { path } = await uploadImage("products", file, `prod-${Date.now()}`);
            const url = getPublicUrl("products", path);
            setEditingProduct({ ...editingProduct, images: [...(editingProduct.images || []), url] });
        } catch (err) {
            alert("Erro no upload.");
        }
    };

    const handleReorder = async (product: Product, direction: 'up' | 'down') => {
        const currentIndex = products.findIndex(p => p.id === product.id);
        if (currentIndex === -1) return;
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex < 0 || targetIndex >= products.length) return;
        const targetProduct = products[targetIndex];
        const currentOrder = product.displayOrder || currentIndex;
        const targetOrder = targetProduct.displayOrder || targetIndex;
        await updateDocument('products', product.id, { displayOrder: targetOrder });
        await updateDocument('products', targetProduct.id, { displayOrder: currentOrder });
    };

    const handleSaveChatConfig = async () => {
        if (!chatConfig) return;
        setIsSavingChat(true);
        await updateChatConfig(chatConfig);
        setIsSavingChat(false);
        alert("Configurações salvas com sucesso!");
    };

    const handleResolveFeedback = async (item: ChatFeedback) => {
        const solution = prompt("Adicione uma correção para a base de conhecimento (Formato: Pergunta | Resposta)", `${item.userMessage} | `);
        if (solution) {
            const [q, a] = solution.split('|');
            if (q && a) {
                await resolveFeedback(item.id, { id: Date.now().toString(), question: q.trim(), answer: a.trim(), tags: ['feedback-fix'] });
                setFeedbackList(prev => prev.filter(f => f.id !== item.id));
            }
        } else if (confirm("Marcar como resolvido sem adicionar à base de conhecimento?")) {
            await resolveFeedback(item.id);
            setFeedbackList(prev => prev.filter(f => f.id !== item.id));
        }
    };

    if (!isOpen) return null;

    // --- CHART DATA MOCK ---
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
                initial={{ x: -100 }} animate={{ x: 0 }}
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

                <div className="flex-1 overflow-y-auto p-8">
                    <AnimatePresence mode="wait">
                        
                        {/* 1. ANALYTICS */}
                        {activeTab === 'analytics' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Vendas Hoje', value: `€ ${stats.salesToday}`, icon: DollarSign, trend: '+12%', color: '#10B981' },
                                        { label: 'Novos Pedidos', value: stats.newOrders, icon: Package, trend: '+3', color: '#3B82F6' },
                                        { label: 'Inscritos Brevo', value: stats.brevoSubs, icon: Users, trend: 'Total', color: '#D4AF37' },
                                        { label: 'Clientes Brevo', value: stats.brevoClients, icon: Users, trend: 'VIP', color: '#8B5CF6' },
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
                                    <button onClick={() => { setEditingProduct({}); setIsProductModalOpen(true); }} className="bg-accent text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-accent/80">
                                        <Plus size={16} /> Novo Produto
                                    </button>
                                </div>
                                <div className="bg-[#151515] rounded-xl border border-white/10 overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-white/5 text-gray-400">
                                            <tr><th className="p-4 text-left">Ordenação</th><th className="p-4 text-left">Produto</th><th className="p-4 text-left">Preço</th><th className="p-4 text-right">Ações</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {products.filter(p => p.translations?.fr?.title?.toLowerCase().includes(productSearch.toLowerCase())).map((product, index) => (
                                                <tr key={product.id} className="hover:bg-white/5">
                                                    <td className="p-4 flex gap-1">
                                                        <button onClick={() => handleReorder(product, 'up')}><MoveUp size={14}/></button>
                                                        <span className="w-6 text-center">{product.displayOrder || index}</span>
                                                        <button onClick={() => handleReorder(product, 'down')}><MoveDown size={14}/></button>
                                                    </td>
                                                    <td className="p-4"><div className="flex items-center gap-4"><img src={product.images[0]} className="w-10 h-10 object-cover rounded" alt="" /> <span>{product.translations?.fr?.title}</span></div></td>
                                                    <td className="p-4">{formatPrice(product.price)}</td>
                                                    <td className="p-4 text-right flex justify-end gap-2">
                                                        <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }} className="p-2 bg-blue-500/10 text-blue-500 rounded"><Edit size={16}/></button>
                                                        <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-red-500/10 text-red-500 rounded"><Trash2 size={16}/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                        
                        {/* 3. CRM */}
                        {activeTab === 'crm' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                {loadingContacts ? <div className="text-center py-20">Carregando contatos do Brevo...</div> : (
                                    <div className="bg-[#151515] rounded-xl border border-white/10 overflow-hidden">
                                        <div className="p-4 border-b border-white/10 flex justify-between">
                                            <h3 className="font-serif text-lg">Contatos Brevo</h3>
                                            <a href="https://app.brevo.com" target="_blank" className="text-accent text-xs uppercase font-bold hover:underline">Ir para Dashboard Brevo</a>
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
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Configs */}
                                    <div className="bg-[#151515] p-6 rounded-xl border border-white/10 space-y-4">
                                        <h3 className="font-serif text-lg text-accent mb-4">Cérebro da IA (System Prompt)</h3>
                                        <textarea 
                                            value={chatConfig.systemPrompt}
                                            onChange={(e) => setChatConfig({...chatConfig, systemPrompt: e.target.value})}
                                            className="w-full h-32 bg-black/30 border border-white/10 rounded p-3 text-sm focus:border-accent outline-none"
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs uppercase text-gray-500">Temperatura (Criatividade)</label>
                                                <input type="range" min="0" max="1" step="0.1" value={chatConfig.modelTemperature} onChange={e => setChatConfig({...chatConfig, modelTemperature: parseFloat(e.target.value)})} className="w-full mt-2" />
                                                <div className="text-right text-xs">{chatConfig.modelTemperature}</div>
                                            </div>
                                            <div>
                                                 <label className="text-xs uppercase text-gray-500">Rate Limit (Msgs/5min)</label>
                                                 <input type="number" value={chatConfig.rateLimit.maxMessages} onChange={e => setChatConfig({...chatConfig, rateLimit: {...chatConfig.rateLimit, maxMessages: parseInt(e.target.value)}})} className="w-full bg-black/30 border border-white/10 rounded p-2 mt-1" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Starters */}
                                    <div className="bg-[#151515] p-6 rounded-xl border border-white/10">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-serif text-lg text-accent">Sugestões Iniciais</h3>
                                            <button onClick={() => setChatConfig({...chatConfig, starters: [...chatConfig.starters, { id: Date.now().toString(), label: 'Nova', text: '', order: chatConfig.starters.length + 1 }]})} className="text-xs bg-white/10 p-1 rounded hover:bg-white/20"><Plus size={14}/></button>
                                        </div>
                                        <div className="space-y-2">
                                            {chatConfig.starters.sort((a,b) => a.order - b.order).map((starter, idx) => (
                                                <div key={starter.id} className="flex gap-2 items-center">
                                                    <input value={starter.label} onChange={e => {
                                                        const newS = [...chatConfig.starters];
                                                        newS[idx].label = e.target.value;
                                                        setChatConfig({...chatConfig, starters: newS});
                                                    }} className="bg-black/30 border border-white/10 rounded p-2 text-xs w-1/3" placeholder="Rótulo" />
                                                    <input value={starter.text} onChange={e => {
                                                        const newS = [...chatConfig.starters];
                                                        newS[idx].text = e.target.value;
                                                        setChatConfig({...chatConfig, starters: newS});
                                                    }} className="bg-black/30 border border-white/10 rounded p-2 text-xs flex-1" placeholder="Mensagem enviada" />
                                                    <button onClick={() => {
                                                        const newS = chatConfig.starters.filter(s => s.id !== starter.id);
                                                        setChatConfig({...chatConfig, starters: newS});
                                                    }} className="text-red-500"><Trash2 size={14}/></button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button onClick={handleSaveChatConfig} disabled={isSavingChat} className="bg-accent text-white px-8 py-3 rounded font-bold uppercase tracking-widest text-xs hover:bg-accent/80 flex items-center gap-2">
                                        <Save size={16}/> Salvar Configurações
                                    </button>
                                </div>

                                {/* Feedback Loop */}
                                <div className="bg-[#151515] rounded-xl border border-white/10 overflow-hidden">
                                    <div className="p-4 border-b border-white/10 bg-red-500/5">
                                        <h3 className="font-serif text-lg text-red-400 flex items-center gap-2"><AlertCircle size={18}/> Feedback Negativo (Ajuste de Conhecimento)</h3>
                                    </div>
                                    <table className="w-full text-sm">
                                        <thead className="bg-white/5 text-gray-400">
                                            <tr><th className="p-4 text-left">Pergunta do Usuário</th><th className="p-4 text-left">Resposta da IA</th><th className="p-4 text-right">Ação</th></tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {feedbackList.length === 0 ? (
                                                <tr><td colSpan={3} className="p-8 text-center text-gray-500">Nenhum feedback negativo pendente. Ótimo trabalho!</td></tr>
                                            ) : feedbackList.map(f => (
                                                <tr key={f.id} className="hover:bg-white/5">
                                                    <td className="p-4 max-w-xs truncate" title={f.userMessage}>{f.userMessage}</td>
                                                    <td className="p-4 max-w-xs truncate text-gray-400" title={f.aiResponse}>{f.aiResponse}</td>
                                                    <td className="p-4 text-right">
                                                        <button onClick={() => handleResolveFeedback(f)} className="bg-white/10 hover:bg-accent hover:text-white px-3 py-1 rounded text-xs uppercase font-bold transition-colors">Corrigir / Ensinar</button>
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

            {/* PRODUCT MODAL */}
            <AnimatePresence>
                {isProductModalOpen && editingProduct && (
                    <motion.div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="w-full max-w-4xl bg-[#121212] border border-white/10 rounded-2xl p-8 overflow-y-auto max-h-[90vh]">
                            <h2 className="text-2xl font-serif mb-6">Editar Produto</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <input placeholder="Título" value={editingProduct.translations?.[editLang]?.title || ''} onChange={(e) => { const t = {...editingProduct.translations}; if(!t[editLang]) t[editLang]={title:'',description:''}; t[editLang].title=e.target.value; setEditingProduct({...editingProduct, translations:t}); }} className="w-full bg-black/30 border border-white/10 rounded p-3" />
                                    <textarea placeholder="Descrição" rows={5} value={editingProduct.translations?.[editLang]?.description || ''} onChange={(e) => { const t = {...editingProduct.translations}; if(!t[editLang]) t[editLang]={title:'',description:''}; t[editLang].description=e.target.value; setEditingProduct({...editingProduct, translations:t}); }} className="w-full bg-black/30 border border-white/10 rounded p-3" />
                                    <div className="flex gap-4">
                                        <input type="number" placeholder="Preço" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: parseFloat(e.target.value)})} className="flex-1 bg-black/30 border border-white/10 rounded p-3" />
                                        <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value as any})} className="flex-1 bg-black/30 border border-white/10 rounded p-3 capitalize">
                                            {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs uppercase text-gray-500">Imagens</label>
                                    <div className="flex flex-wrap gap-2">
                                        {editingProduct.images?.map((img, i) => (
                                            <img key={i} src={img} className="w-20 h-20 object-cover rounded border border-white/10" alt=""/>
                                        ))}
                                        <label className="w-20 h-20 border border-dashed border-white/20 rounded flex items-center justify-center cursor-pointer hover:bg-white/5"><Upload size={20}/><input type="file" className="hidden" onChange={handleImageUpload}/></label>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-4">
                                <button onClick={() => setIsProductModalOpen(false)} className="px-6 py-2 border border-white/10 rounded">Cancelar</button>
                                <button onClick={handleSaveProduct} className="bg-accent text-white px-6 py-2 rounded font-bold">Salvar</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};