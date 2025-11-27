import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Users, Settings, MessageSquare, Save, Loader2, Database, Box } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { OrdersKanban } from './dashboard/admin/OrdersKanban';
import { CustomersTable } from './dashboard/admin/CustomersTable';
import { ProductsBoard } from './dashboard/admin/ProductsBoard';
import { useToast } from './ui/Toast';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase/config';
import { Order } from '../types/order';
import { getChatConfig, updateChatConfig, getBrevoStats, getChatFeedback } from '../app/actions/admin';
import { seedDatabase } from '../app/actions/seed';
import { ChatConfig, ChatFeedback } from '../types/admin';
import { useLanguage } from '../hooks/useLanguage';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const { isAdmin, loading } = useAdmin();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('orders');
  
  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Chat Config State
  const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null);
  const [chatFeedback, setChatFeedback] = useState<ChatFeedback[]>([]);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [stats, setStats] = useState({ subscribers: 0, clients: 0 });

  // Listeners
  useEffect(() => {
    if (!isOpen || !isAdmin) return;

    // Orders
    const qOrders = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(qOrders, (snap) => {
        setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() } as Order)));
    });

    // Users (Limit to recent/active for performance, or handle pagination in component)
    // For now getting all for CRM table (assuming reasonable size for MVP)
    const qUsers = query(collection(db, 'users'), limit(500)); 
    const unsubUsers = onSnapshot(qUsers, (snap) => {
        setUsers(snap.docs.map(d => ({ ...d.data() })));
    });

    // Chat Config & Stats
    getChatConfig().then(setChatConfig);
    getBrevoStats().then(s => setStats(s));
    getChatFeedback('dislike').then(setChatFeedback);

    return () => { unsubOrders(); unsubUsers(); };
  }, [isOpen, isAdmin]);

  const handleSaveConfig = async () => {
    if (!chatConfig) return;
    setIsSavingConfig(true);
    const res = await updateChatConfig(chatConfig);
    setIsSavingConfig(false);
    if (res.success) toast("Configurações salvas", "success");
    else toast("Erro ao salvar", "error");
  };

  const handleSeed = async () => {
      if(!confirm("Isso irá criar produtos de exemplo. Continuar?")) return;
      const res = await seedDatabase(false);
      if(res.success) toast(res.message, "success");
      else toast("Erro no seed", "error");
  };

  if (!isAdmin && !loading) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex overflow-hidden">
           {/* Sidebar */}
           <motion.div 
             initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
             className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col"
           >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-white font-serif font-bold">Admin</h2>
                  <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={20}/></button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                  <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'orders' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                      <Package size={18}/> Pedidos
                  </button>
                  <button onClick={() => setActiveTab('crm')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'crm' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                      <Users size={18}/> CRM
                  </button>
                  <button onClick={() => setActiveTab('catalog')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'catalog' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                      <Box size={18}/> Catálogo
                  </button>
                  <button onClick={() => setActiveTab('chatbot')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors ${activeTab === 'chatbot' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                      <MessageSquare size={18}/> Chatbot AI
                  </button>
              </nav>
              <div className="p-4 border-t border-white/10">
                  <button onClick={handleSeed} className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-white p-2 border border-white/5 rounded hover:bg-white/5 transition-colors">
                      <Database size={14}/> Seed DB
                  </button>
              </div>
           </motion.div>

           {/* Content */}
           <div className="flex-1 bg-[#121212] flex flex-col h-full overflow-hidden">
               {/* Top Bar */}
               <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 bg-[#151515]">
                   <h1 className="text-xl font-serif text-white capitalize">{activeTab}</h1>
                   <div className="flex items-center gap-4 text-xs text-gray-500">
                       <span>Newsletter: <strong>{stats.subscribers}</strong></span>
                       <span>Clientes: <strong>{stats.clients}</strong></span>
                   </div>
               </div>
               
               {/* Main Area */}
               <div className="flex-1 overflow-y-auto p-8 relative">
                   {activeTab === 'orders' && <OrdersKanban orders={orders} />}
                   {activeTab === 'crm' && <CustomersTable users={users} orders={orders} />}
                   {activeTab === 'catalog' && <ProductsBoard />}
                   
                   {activeTab === 'chatbot' && chatConfig && (
                       <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                           <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/10">
                               <h3 className="text-lg font-serif text-white mb-6 flex items-center gap-2">
                                   <Settings size={20}/> Configurações do Modelo
                               </h3>
                               
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                   <div>
                                       <label className="block text-xs uppercase text-gray-500 mb-2 font-bold">Modelo Gemini</label>
                                       <select 
                                           value={chatConfig.modelName} 
                                           onChange={(e) => setChatConfig({...chatConfig, modelName: e.target.value})}
                                           className="w-full bg-[#121212] border border-white/10 rounded p-3 text-sm text-white focus:border-accent outline-none"
                                       >
                                           <option value="gemini-2.5-flash">Gemini 2.5 Flash (Padrão/Rápido)</option>
                                           <option value="gemini-2.0-flash">Gemini 2.0 Flash (Estável)</option>
                                           <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Econômico)</option>
                                           <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash Lite (Econômico)</option>
                                           <option value="gemini-3-pro-preview">Gemini 3 Pro Preview (Avançado)</option>
                                       </select>
                                   </div>
                                   <div>
                                       <label className="block text-xs uppercase text-gray-500 mb-2 font-bold">Temperatura (Criatividade)</label>
                                       <input 
                                           type="range" 
                                           min="0" max="1" step="0.1" 
                                           value={chatConfig.modelTemperature}
                                           onChange={(e) => setChatConfig({...chatConfig, modelTemperature: parseFloat(e.target.value)})}
                                           className="w-full accent-accent"
                                       />
                                       <div className="text-right text-xs text-gray-400 mt-1">{chatConfig.modelTemperature}</div>
                                   </div>
                               </div>

                               <div className="mb-6">
                                   <div className="flex items-center justify-between mb-2">
                                       <label className="block text-xs uppercase text-gray-500 font-bold">Prompt do Sistema</label>
                                       <div className="flex items-center gap-2">
                                           <input 
                                               type="checkbox" 
                                               checked={chatConfig.useCustomPrompt}
                                               onChange={(e) => setChatConfig({...chatConfig, useCustomPrompt: e.target.checked})}
                                               className="w-4 h-4 accent-accent"
                                           />
                                           <span className="text-xs text-white">Usar Personalizado</span>
                                       </div>
                                   </div>
                                   <textarea 
                                       value={chatConfig.systemPrompt}
                                       onChange={(e) => setChatConfig({...chatConfig, systemPrompt: e.target.value})}
                                       disabled={!chatConfig.useCustomPrompt}
                                       rows={6}
                                       className={`w-full bg-[#121212] border border-white/10 rounded p-4 text-sm text-white focus:border-accent outline-none transition-opacity ${!chatConfig.useCustomPrompt ? 'opacity-50 cursor-not-allowed' : ''}`}
                                   />
                               </div>

                               <button 
                                   onClick={handleSaveConfig} 
                                   disabled={isSavingConfig}
                                   className="bg-accent text-white px-6 py-3 rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-accent/80 flex items-center gap-2"
                               >
                                   {isSavingConfig ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                                   Salvar Alterações
                               </button>
                           </div>
                           
                           {chatFeedback.length > 0 && (
                               <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/10">
                                   <h3 className="text-lg font-serif text-white mb-6">Feedback Recente (Dislikes)</h3>
                                   <div className="space-y-4">
                                       {chatFeedback.map(fb => (
                                           <div key={fb.id} className="p-4 bg-[#121212] border border-white/5 rounded-lg">
                                               <p className="text-xs text-gray-500 mb-1">Usuário: "{fb.userMessage}"</p>
                                               <p className="text-sm text-white mb-2">AI: "{fb.aiResponse}"</p>
                                               <div className="text-right">
                                                   <span className="text-[10px] text-red-500 uppercase font-bold border border-red-500/30 px-2 py-1 rounded">Dislike</span>
                                               </div>
                                           </div>
                                       ))}
                                   </div>
                               </div>
                           )}
                       </div>
                   )}
               </div>
           </div>
        </div>
      )}
    </AnimatePresence>
  );
};