
'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Package, Users, MessageSquare, Plus, Edit, Trash2, Save, Upload, Search, Filter, TrendingUp, DollarSign, RefreshCw, Lock, Globe, MoveUp, MoveDown, Check, ThumbsDown, AlertCircle, Move, Loader2, Settings, Database, AlertTriangle, ToggleLeft, ToggleRight, EyeOff, ThumbsUp, ShoppingCart, Cpu } from 'lucide-react';
import { useAuthStore } from '../store';
import { db } from '../lib/firebase/config';
import { deleteDocument, updateDocument } from '../lib/firebase/firestore';
import { collection, query, onSnapshot, orderBy, QuerySnapshot, DocumentData } from 'firebase/firestore';
import { Product, Order } from '../types';
import { getBrevoStats, getChatConfig, updateChatConfig, getChatFeedback, resolveFeedback, deleteFeedback } from '../app/actions/admin';
import { seedDatabase } from '../app/actions/seed';
import { formatPrice, cn } from '../lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChatConfig, ChatFeedback, ChatStarter } from '../types/admin';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from './ui/Toast';
import { ProductForm } from './dashboard/ProductForm';
import { OrdersKanban } from './dashboard/admin/OrdersKanban';
import { CustomersTable } from './dashboard/admin/CustomersTable';
import { ProductsBoard } from './dashboard/admin/ProductsBoard';

interface AdminDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SortableStarterProps { starter: ChatStarter; onChange: (s: ChatStarter) => void; onDelete: (id: string) => void; }
const SortableStarter: React.FC<SortableStarterProps> = ({ starter, onChange, onDelete }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: starter.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    return (
        <div ref={setNodeRef} style={style} className="flex gap-2 items-center bg-black/20 p-2 rounded mb-2"><button {...attributes} {...listeners} className="p-2 text-gray-500 cursor-grab active:cursor-grabbing"><Move size={14}/></button><input value={starter.label} onChange={e => onChange({...starter, label: e.target.value})} className="bg-black/30 border border-white/10 rounded p-2 text-xs w-1/3 focus:border-accent outline-none text-white" placeholder="Rótulo" /><input value={starter.text} onChange={e => onChange({...starter, text: e.target.value})} className="bg-black/30 border border-white/10 rounded p-2 text-xs flex-1 focus:border-accent outline-none text-white" placeholder="Mensagem enviada" /><button onClick={() => onDelete(starter.id)} className="text-red-500 p-2 hover:bg-red-500/10 rounded"><Trash2 size={14}/></button></div>
    );
};

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
    const { user } = useAuthStore();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<'analytics' | 'orders' | 'products' | 'crm' | 'chatbot' | 'settings'>('analytics');
    
    // Stats State
    const [stats, setStats] = useState({ salesToday: 0, salesMonth: 0, newOrders: 0, activeUsers: 0, brevoSubs: 0, brevoClients: 0 });
    const [salesData, setSalesData] = useState<any[]>([]);
    
    // --- GLOBAL DATA ---
    const [orders, setOrders] = useState<Order[]>([]); 
    const [users, setUsers] = useState<any[]>([]); 

    // --- SUB-STATES ---
    const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null);
    const [feedbackList, setFeedbackList] = useState<ChatFeedback[]>([]);
    const [positiveFeedbackList, setPositiveFeedbackList] = useState<ChatFeedback[]>([]);
    const [isSavingChat, setIsSavingChat] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState<ChatFeedback | null>(null);
    const [fixAnswer, setFixAnswer] = useState('');
    const [isSeeding, setIsSeeding] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.classList.add('lenis-stopped');
        } else {
            document.body.style.overflow = '';
            document.documentElement.classList.remove('lenis-stopped');
        }
        return () => { document.body.style.overflow = ''; document.documentElement.classList.remove('lenis-stopped'); };
    }, [isOpen]);

    // --- DATA FETCHING ---
    useEffect(() => {
        if (!isOpen) return;

        // 1. Orders (For Analytics & Kanban)
        const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubOrders = onSnapshot(qOrders, (snapshot) => {
             const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) })) as Order[];
             setOrders(data);
             
             // Process Analytics
             let todayTotal = 0;
             let monthTotal = 0;
             let pending = 0;
             const monthlyDataMap = new Map<string, number>();
             const startOfDay = new Date(new Date().setHours(0,0,0,0)).toISOString();
             const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

             data.forEach(o => {
                if (o.createdAt >= startOfDay) todayTotal += o.amount;
                if (o.createdAt >= startOfMonth) monthTotal += o.amount;
                if (['pending', 'processing', 'paid'].includes(o.status)) pending++;
                const monthKey = new Date(o.createdAt).toLocaleString('default', { month: 'short' });
                monthlyDataMap.set(monthKey, (monthlyDataMap.get(monthKey) || 0) + o.amount);
             });

             setStats(prev => ({ ...prev, salesToday: todayTotal, salesMonth: monthTotal, newOrders: pending }));
             const chartData = Array.from(monthlyDataMap.entries()).map(([name, value]) => ({ name, value })).reverse();
             setSalesData(chartData.length ? chartData : [{ name: 'Jan', value: 0 }]);
        });

        // 2. Users (For Stats & CRM)
        const qUsers = query(collection(db, 'users'));
        const unsubUsers = onSnapshot(qUsers, (snapshot) => {
             const data = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as DocumentData) }));
             setUsers(data);
             setStats(prev => ({ ...prev, activeUsers: snapshot.size }));
        });

        // 3. One-off Stats
        if (activeTab === 'analytics') {
             getBrevoStats().then(brevo => setStats(prev => ({ ...prev, brevoSubs: brevo.subscribers, brevoClients: brevo.clients })));
        }

        // 4. Chatbot
        if (activeTab === 'chatbot') {
            getChatConfig().then(setChatConfig);
            getChatFeedback('dislike').then(setFeedbackList);
            getChatFeedback('like').then(setPositiveFeedbackList);
        }

        return () => { unsubOrders(); unsubUsers(); };
    }, [isOpen, activeTab]);

    // --- HANDLERS ---
    const handleDragEndStarters = (event: any) => {
        if (!chatConfig) return;
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIdx = chatConfig.starters.findIndex(s => s.id === active.id);
            const newIdx = chatConfig.starters.findIndex(s => s.id === over.id);
            const newS = arrayMove(chatConfig.starters, oldIdx, newIdx).map((s, i) => ({ ...s, order: i }));
            setChatConfig({ ...chatConfig, starters: newS });
        }
    };
    const handleSaveChatConfig = async () => { if(chatConfig) { setIsSavingChat(true); await updateChatConfig(chatConfig); setIsSavingChat(false); toast("Salvo", "success"); }};
    const handleResolveFeedback = async () => { if(showFeedbackModal && fixAnswer.trim()) { await resolveFeedback(showFeedbackModal.id, { id: Date.now().toString(), question: showFeedbackModal.userMessage, answer: fixAnswer, tags: ['fix'] }); setFeedbackList(l => l.filter(i => i.id !== showFeedbackModal!.id)); setShowFeedbackModal(null); setFixAnswer(''); toast("Aprendido", "success"); }};
    const handleIgnoreFeedback = async (id: string) => { if(await deleteFeedback(id).then(r => r.success)) setFeedbackList(l => l.filter(i => i.id !== id)); };
    const handleDeletePositive = async (id: string) => { if(await deleteFeedback(id).then(r => r.success)) setPositiveFeedbackList(l => l.filter(i => i.id !== id)); };
    const handleSeedDatabase = async (clear: boolean) => { if(confirm("Tem certeza?")) { setIsSeeding(true); await seedDatabase(clear); setIsSeeding(false); toast("Feito", "success"); }};

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex bg-black/80 backdrop-blur-md overflow-hidden text-white font-sans">
            {/* SIDEBAR */}
            <motion.div className="w-20 md:w-64 bg-[#121212] border-r border-white/10 flex flex-col items-center md:items-stretch py-8" initial={{ x: -100 }} animate={{ x: 0 }}>
                <div className="mb-12 text-center"><div className="w-10 h-10 bg-red-600 rounded-lg mx-auto flex items-center justify-center text-white shadow-red-500/20 shadow-lg"><Lock size={20} /></div><h2 className="mt-4 font-serif text-lg hidden md:block tracking-widest text-red-500">ADMIN</h2></div>
                <nav className="flex-1 space-y-2 px-2">
                    {[
                        { id: 'analytics', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'orders', label: 'Pedidos (Kanban)', icon: ShoppingCart },
                        { id: 'products', label: 'Catálogo', icon: Package },
                        { id: 'crm', label: 'Clientes (CRM)', icon: Users },
                        { id: 'chatbot', label: 'IA Control', icon: MessageSquare },
                        { id: 'settings', label: 'Configurações', icon: Settings },
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
                <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-[#0a0a0a]">
                    <h1 className="text-2xl font-serif capitalize">{activeTab}</h1>
                    <div className="flex items-center gap-4"><span className="text-xs text-gray-500 uppercase">Admin: {user?.displayName}</span><div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-black font-bold">{user?.displayName?.[0] || 'A'}</div></div>
                </header>
                <main className="flex-1 overflow-y-auto p-8" data-lenis-prevent>
                    {activeTab === 'analytics' && (
                        <div className="space-y-8 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[{ label: 'Vendas Hoje', value: formatPrice(stats.salesToday), icon: TrendingUp, color: 'text-green-500' }, { label: 'Receita Mensal', value: formatPrice(stats.salesMonth), icon: DollarSign, color: 'text-accent' }, { label: 'Pedidos Ativos', value: stats.newOrders, icon: Package, color: 'text-blue-500' }, { label: 'Clientes', value: stats.activeUsers, icon: Users, color: 'text-purple-500' }].map((stat, i) => (
                                    <div key={i} className="bg-[#151515] p-6 rounded-xl border border-white/5"><div className="flex justify-between items-start mb-4"><span className="text-gray-500 text-xs uppercase">{stat.label}</span><stat.icon className={stat.color} size={20} /></div><div className="text-3xl font-serif">{stat.value}</div></div>
                                ))}
                            </div>
                            <div className="bg-[#151515] p-6 rounded-xl border border-white/5 h-[350px]">
                                <h3 className="text-lg font-serif mb-6">Performance de Vendas</h3>
                                <ResponsiveContainer width="100%" height="100%"><AreaChart data={salesData}><defs><linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/><stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/></linearGradient></defs><XAxis dataKey="name" stroke="#555" /><YAxis stroke="#555" /><Tooltip contentStyle={{backgroundColor:'#1a1a1a', border:'1px solid #333'}} /><Area type="monotone" dataKey="value" stroke="#D4AF37" fillOpacity={1} fill="url(#colorSales)" /></AreaChart></ResponsiveContainer>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'orders' && (
                        <div className="h-full"><OrdersKanban orders={orders} /></div>
                    )}

                    {activeTab === 'crm' && (
                        <div className="h-full"><CustomersTable users={users} orders={orders} /></div>
                    )}

                    {activeTab === 'products' && (
                        <div className="h-full"><ProductsBoard /></div>
                    )}

                    {activeTab === 'chatbot' && chatConfig && (
                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
                            <div className="bg-[#151515] p-6 rounded-xl border border-white/10 space-y-6">
                                <h3 className="text-lg font-serif border-b border-white/10 pb-4 mb-4">Personalidade da IA</h3>
                                
                                {/* MODEL SELECTION */}
                                <div className="bg-black/30 p-4 rounded border border-white/10 flex flex-col gap-2">
                                    <label className="text-xs uppercase text-gray-500 font-bold flex items-center gap-2"><Cpu size={14}/> Modelo de IA</label>
                                    <select
                                        value={chatConfig.modelName}
                                        onChange={(e) => setChatConfig({...chatConfig, modelName: e.target.value})}
                                        className="w-full bg-[#121212] border border-white/10 rounded p-3 text-sm text-white focus:border-accent outline-none transition-colors"
                                    >
                                        <option value="gemini-2.5-flash">Gemini 2.5 Flash (Padrão/Rápido)</option>
                                        <option value="gemini-2.0-flash">Gemini 2.0 Flash (Estável)</option>
                                    </select>
                                    <p className="text-[10px] text-gray-500">Use apenas modelos estáveis para evitar erros de cota.</p>
                                </div>

                                <div className="flex items-center justify-between bg-black/30 p-4 rounded border border-white/10">
                                    <div className="flex items-center gap-3">{chatConfig.useCustomPrompt ? (<ToggleRight size={32} className="text-accent cursor-pointer" onClick={() => setChatConfig({...chatConfig, useCustomPrompt: false})} />) : (<ToggleLeft size={32} className="text-gray-500 cursor-pointer" onClick={() => setChatConfig({...chatConfig, useCustomPrompt: true})} />)}<div><span className="block text-sm font-bold text-white">Prompt Personalizado</span><span className="text-xs text-gray-500">Desligado = Padrão de Fábrica.</span></div></div>
                                </div>
                                <div><label className="block text-xs uppercase text-gray-500 mb-2">Prompt</label><textarea value={chatConfig.systemPrompt} onChange={e => setChatConfig({...chatConfig, systemPrompt: e.target.value})} rows={10} disabled={!chatConfig.useCustomPrompt} className={cn("w-full bg-black/30 border border-white/10 rounded p-4 text-sm text-gray-300 focus:border-accent focus:outline-none transition-opacity", !chatConfig.useCustomPrompt && "opacity-50")} /></div>
                                <div><label className="block text-xs uppercase text-gray-500 mb-2">Starters</label><DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndStarters}><SortableContext items={chatConfig.starters.map(s => s.id)} strategy={verticalListSortingStrategy}>{chatConfig.starters.map((starter) => (<SortableStarter key={starter.id} starter={starter} onChange={(updated) => setChatConfig({...chatConfig, starters: chatConfig.starters.map(s => s.id === updated.id ? updated : s)})} onDelete={(id) => setChatConfig({...chatConfig, starters: chatConfig.starters.filter(s => s.id !== id)})}/>))}</SortableContext></DndContext></div>
                                <button onClick={handleSaveChatConfig} disabled={isSavingChat} className="w-full py-3 bg-accent text-white rounded font-bold uppercase tracking-widest text-xs hover:bg-accent/80 flex justify-center gap-2">{isSavingChat ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>} Salvar</button>
                            </div>
                            <div className="space-y-6">
                                <div className="bg-[#151515] p-6 rounded-xl border border-white/10 max-h-[400px] overflow-hidden flex flex-col"><h3 className="text-lg font-serif border-b border-white/10 pb-4 mb-4 text-white">Feedback Negativo</h3><div className="flex-1 overflow-y-auto pr-2 space-y-4">{feedbackList.length === 0 ? (<p className="text-gray-500 text-sm italic py-4">Nenhum pendente.</p>) : (feedbackList.map(item => (<div key={item.id} className="bg-black/20 p-4 rounded border border-white/5"><div className="mb-2"><span className="text-xs text-gray-500">Usuário:</span><p className="text-white text-sm">"{item.userMessage}"</p></div><div className="flex gap-2"><button onClick={() => setShowFeedbackModal(item)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-xs uppercase rounded">Corrigir</button><button onClick={() => handleIgnoreFeedback(item.id)} className="px-3 py-2 bg-red-500/10 text-red-500 rounded"><Trash2 size={16}/></button></div></div>)))}</div></div>
                                <div className="bg-[#151515] p-6 rounded-xl border border-white/10 max-h-[300px] overflow-hidden flex flex-col"><h3 className="text-lg font-serif border-b border-white/10 pb-4 mb-4 text-white">Histórico Positivo</h3><div className="flex-1 overflow-y-auto pr-2 space-y-4">{positiveFeedbackList.map(item => (<div key={item.id} className="bg-black/20 p-4 rounded border border-white/5 flex justify-between"><div><p className="text-white text-sm">"{item.userMessage}"</p></div><button onClick={() => handleDeletePositive(item.id)} className="text-gray-500 hover:text-red-500"><Trash2 size={14}/></button></div>))}</div></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
                            <div className="bg-[#151515] p-8 rounded-xl border border-white/10"><h3 className="text-xl font-serif mb-6 flex items-center gap-3"><Database className="text-accent" />Seed / Reset</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><button onClick={() => handleSeedDatabase(false)} disabled={isSeeding} className="p-6 border border-white/10 rounded-lg hover:bg-white/5 text-white font-bold flex flex-col items-center gap-2">{isSeeding ? <Loader2 className="animate-spin"/> : <Plus />} Adicionar Exemplos</button><button onClick={() => handleSeedDatabase(true)} disabled={isSeeding} className="p-6 border border-red-900/30 bg-red-900/5 rounded-lg hover:bg-red-900/10 text-red-500 font-bold flex flex-col items-center gap-2">{isSeeding ? <Loader2 className="animate-spin"/> : <Trash2 />} Resetar Tudo</button></div></div>
                        </div>
                    )}
                </main>
            </div>
            
            {showFeedbackModal && (<div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur flex items-center justify-center p-4"><div className="bg-[#151515] p-8 rounded-xl max-w-lg w-full border border-white/10"><h3 className="text-xl font-serif mb-4">Corrigir IA</h3><div className="bg-black/30 p-4 rounded mb-4 text-sm text-gray-400"><p><strong>P:</strong> {showFeedbackModal.userMessage}</p><p><strong>R:</strong> {showFeedbackModal.aiResponse}</p></div><textarea value={fixAnswer} onChange={e => setFixAnswer(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded p-4 text-white outline-none mb-4" placeholder="Resposta correta..." /><div className="flex gap-4"><button onClick={() => setShowFeedbackModal(null)} className="flex-1 py-3 text-gray-400">Cancelar</button><button onClick={handleResolveFeedback} className="flex-1 py-3 bg-accent text-white font-bold rounded">Salvar</button></div></div></div>)}
        </div>
    );
};
