
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LayoutDashboard, Users, ShoppingBag, MessageSquare, Settings, Cpu, Save, RefreshCw, AlertTriangle, Database, CheckCircle, ThumbsDown, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from './ui/Toast';
import { CustomersTable } from './dashboard/admin/CustomersTable';
import { ProductsBoard } from './dashboard/admin/ProductsBoard';
import { getBrevoStats, getChatConfig, updateChatConfig, getChatFeedback, resolveFeedback, deleteFeedback } from '../app/actions/admin';
import { seedDatabase } from '../app/actions/seed';
import { ChatConfig, ChatFeedback } from '../types/admin';
import { cn } from '../lib/utils';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { Order } from '../types/order';

interface AdminDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
    const { t } = useLanguage();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState('overview');
    
    // Data States
    const [users, setUsers] = useState<any[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [stats, setStats] = useState({ subscribers: 0, clients: 0 });
    const [loadingStats, setLoadingStats] = useState(false);
    
    // Chatbot State
    const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null);
    const [feedbacks, setFeedbacks] = useState<ChatFeedback[]>([]);
    const [savingConfig, setSavingConfig] = useState(false);

    // Initial Load
    useEffect(() => {
        if (isOpen) {
            // Live Users
            const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
                setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
            });
            // Live Orders
            const unsubOrders = onSnapshot(collection(db, 'orders'), (snap) => {
                setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
            });

            loadStats();

            return () => {
                unsubUsers();
                unsubOrders();
            };
        }
    }, [isOpen]);

    // Load Chat Config when tab active
    useEffect(() => {
        if (isOpen && activeTab === 'chatbot') {
            loadChatData();
        }
    }, [isOpen, activeTab]);

    const loadStats = async () => {
        setLoadingStats(true);
        const s = await getBrevoStats();
        setStats({ subscribers: s.subscribers, clients: s.clients });
        setLoadingStats(false);
    };

    const loadChatData = async () => {
        const [config, fb] = await Promise.all([
            getChatConfig(),
            getChatFeedback('dislike')
        ]);
        setChatConfig(config);
        setFeedbacks(fb);
    };

    const handleSaveChatConfig = async () => {
        if (!chatConfig) return;
        setSavingConfig(true);
        await updateChatConfig(chatConfig);
        setSavingConfig(false);
        toast("Configurações do Chatbot salvas.", "success");
    };

    const handleSeed = async () => {
        if (!confirm("Isso irá criar produtos de exemplo. Continuar?")) return;
        const res = await seedDatabase(false);
        if (res.success) toast(res.message, "success");
        else toast("Erro ao popular banco.", "error");
    };

    const handleResolveFeedback = async (id: string, solution?: any) => {
        await resolveFeedback(id, solution);
        setFeedbacks(prev => prev.filter(f => f.id !== id));
        toast("Feedback resolvido.", "success");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
                     <motion.div 
                        className="w-full h-full max-w-[1600px] bg-[#0a0a0a] rounded-2xl border border-white/10 shadow-2xl flex overflow-hidden"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                     >
                        {/* Sidebar */}
                        <div className="w-64 bg-[#0f0f0f] border-r border-white/5 flex flex-col">
                            <div className="p-6 border-b border-white/5 flex items-center gap-3">
                                <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-serif font-bold">M</div>
                                <span className="font-serif text-white tracking-wide">Admin</span>
                            </div>
                            
                            <nav className="flex-1 p-4 space-y-2">
                                {[
                                    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
                                    { id: 'crm', label: 'CRM & Clientes', icon: Users },
                                    { id: 'catalog', label: 'Catálogo', icon: ShoppingBag },
                                    { id: 'chatbot', label: 'IA & Chatbot', icon: MessageSquare },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left transition-all text-sm font-medium",
                                            activeTab === tab.id ? "bg-white/10 text-white" : "text-gray-500 hover:text-white hover:bg-white/5"
                                        )}
                                    >
                                        <tab.icon size={18} />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>

                            <div className="p-4 border-t border-white/5 space-y-2">
                                <button onClick={handleSeed} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 text-sm transition-all">
                                    <Database size={18} /> Seed Data
                                </button>
                                <button onClick={onClose} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 text-sm transition-all">
                                    <X size={18} /> Fechar
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-[#121212] overflow-hidden flex flex-col relative">
                            {/* Header Content */}
                            <div className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-[#151515]">
                                <h2 className="text-white font-serif text-xl capitalize">{activeTab}</h2>
                                {activeTab === 'overview' && (
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/> Sistema Operacional
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto p-8">
                                {activeTab === 'overview' && (
                                    <div className="space-y-8 animate-fade-in">
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10">
                                                <div className="flex justify-between mb-4"><span className="text-gray-500 text-xs uppercase font-bold">Vendas Totais</span><ShoppingBag size={16} className="text-accent"/></div>
                                                <div className="text-3xl text-white font-serif">
                                                    {orders.reduce((acc, o) => acc + o.amount, 0).toLocaleString('fr-LU', { style: 'currency', currency: 'EUR' })}
                                                </div>
                                            </div>
                                            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10">
                                                <div className="flex justify-between mb-4"><span className="text-gray-500 text-xs uppercase font-bold">Clientes Ativos</span><Users size={16} className="text-blue-400"/></div>
                                                <div className="text-3xl text-white font-serif">{users.length}</div>
                                            </div>
                                            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10">
                                                <div className="flex justify-between mb-4"><span className="text-gray-500 text-xs uppercase font-bold">Newsletter (Brevo)</span><ExternalLink size={16} className="text-green-400"/></div>
                                                <div className="text-3xl text-white font-serif">{loadingStats ? '...' : stats.subscribers}</div>
                                            </div>
                                            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-white/10">
                                                <div className="flex justify-between mb-4"><span className="text-gray-500 text-xs uppercase font-bold">Pedidos Pendentes</span><AlertTriangle size={16} className="text-yellow-500"/></div>
                                                <div className="text-3xl text-white font-serif">{orders.filter(o => o.status === 'pending').length}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'crm' && (
                                    <CustomersTable users={users} orders={orders} />
                                )}

                                {activeTab === 'catalog' && (
                                    <ProductsBoard />
                                )}

                                {activeTab === 'chatbot' && chatConfig && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
                                        {/* Settings Column */}
                                        <div className="lg:col-span-2 space-y-6">
                                            <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/10">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h3 className="text-white font-serif text-lg flex items-center gap-2">
                                                        <Settings size={20} className="text-accent"/> Configurações do Modelo
                                                    </h3>
                                                    <button 
                                                        onClick={handleSaveChatConfig} 
                                                        disabled={savingConfig}
                                                        className="bg-accent text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-accent/80 flex items-center gap-2"
                                                    >
                                                        {savingConfig ? <Loader2 size={14} className="animate-spin"/> : <Save size={14}/>} Salvar
                                                    </button>
                                                </div>

                                                <div className="space-y-6">
                                                    <div>
                                                        <label className="text-xs uppercase text-gray-500 font-bold flex items-center gap-2 mb-2"><Cpu size={14}/> Modelo de IA</label>
                                                        <select
                                                            value={chatConfig.modelName}
                                                            onChange={(e) => setChatConfig({...chatConfig, modelName: e.target.value})}
                                                            className="w-full bg-[#121212] border border-white/10 rounded p-3 text-sm text-white focus:border-accent outline-none transition-colors"
                                                        >
                                                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Padrão/Rápido)</option>
                                                            <option value="gemini-2.0-flash">Gemini 2.0 Flash (Estável)</option>
                                                            <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Econômico)</option>
                                                            <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (Econômico)</option>
                                                        </select>
                                                        <p className="text-[10px] text-gray-500 mt-1">Use apenas modelos estáveis para evitar erros de cota.</p>
                                                    </div>

                                                    <div className="flex items-center justify-between bg-black/30 p-4 rounded border border-white/10">
                                                        <div>
                                                            <span className="text-white text-sm font-bold block">Prompt Personalizado</span>
                                                            <span className="text-gray-500 text-xs">Substituir o System Prompt padrão</span>
                                                        </div>
                                                        <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full border border-white/10">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={chatConfig.useCustomPrompt} 
                                                                onChange={(e) => setChatConfig({...chatConfig, useCustomPrompt: e.target.checked})}
                                                                className="absolute opacity-0 w-full h-full cursor-pointer z-10"
                                                            />
                                                            <span className={cn("block w-4 h-4 mt-1 ml-1 bg-gray-400 rounded-full shadow transition-transform", chatConfig.useCustomPrompt && "translate-x-6 bg-accent")} />
                                                        </div>
                                                    </div>

                                                    {chatConfig.useCustomPrompt && (
                                                        <div className="animate-fade-in">
                                                            <label className="text-xs uppercase text-gray-500 font-bold mb-2 block">System Instruction</label>
                                                            <textarea 
                                                                value={chatConfig.systemPrompt}
                                                                onChange={(e) => setChatConfig({...chatConfig, systemPrompt: e.target.value})}
                                                                className="w-full h-64 bg-[#121212] border border-white/10 rounded p-4 text-sm text-gray-300 font-mono focus:border-accent outline-none"
                                                            />
                                                        </div>
                                                    )}

                                                    <div>
                                                        <label className="text-xs uppercase text-gray-500 font-bold mb-2 block flex justify-between">
                                                            <span>Temperatura (Criatividade)</span>
                                                            <span>{chatConfig.modelTemperature}</span>
                                                        </label>
                                                        <input 
                                                            type="range" 
                                                            min="0" max="1" step="0.1" 
                                                            value={chatConfig.modelTemperature}
                                                            onChange={(e) => setChatConfig({...chatConfig, modelTemperature: parseFloat(e.target.value)})}
                                                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Feedback Column */}
                                        <div className="space-y-6">
                                            <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/10 h-full flex flex-col">
                                                <h3 className="text-white font-serif text-lg mb-6 flex items-center gap-2">
                                                    <ThumbsDown size={20} className="text-red-400"/> Feedback Negativo ({feedbacks.length})
                                                </h3>
                                                
                                                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                                    {feedbacks.length === 0 && (
                                                        <div className="text-center text-gray-500 text-sm py-10 italic">Nenhum feedback pendente.</div>
                                                    )}
                                                    {feedbacks.map(fb => (
                                                        <div key={fb.id} className="bg-red-500/5 border border-red-500/10 p-4 rounded-lg">
                                                            <div className="mb-2">
                                                                <span className="text-[10px] text-gray-500 uppercase font-bold">Usuário:</span>
                                                                <p className="text-white text-sm bg-black/30 p-2 rounded mt-1">{fb.userMessage}</p>
                                                            </div>
                                                            <div className="mb-3">
                                                                <span className="text-[10px] text-gray-500 uppercase font-bold">IA:</span>
                                                                <p className="text-gray-400 text-sm italic mt-1 line-clamp-3">{fb.aiResponse}</p>
                                                            </div>
                                                            <div className="flex justify-end gap-2">
                                                                <button onClick={() => deleteFeedback(fb.id)} className="p-2 text-gray-500 hover:text-white"><Trash2 size={14}/></button>
                                                                <button onClick={() => handleResolveFeedback(fb.id)} className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded text-xs font-bold uppercase hover:bg-green-500 hover:text-white transition-colors">Resolver</button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                     </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
