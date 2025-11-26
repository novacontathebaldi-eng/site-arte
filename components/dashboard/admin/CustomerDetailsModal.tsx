
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, User, Ban, RefreshCw, Loader2, Star, MapPin, Mail, Calendar, Phone, TrendingUp, Package, Tag } from 'lucide-react';
import { banUser, syncUserAttributesToBrevo } from '../../../app/actions/crm';
import { useToast } from '../../ui/Toast';
import { formatPrice, cn, formatDate } from '../../../lib/utils';
import { Order } from '../../../types/order';
import { useLanguage } from '../../../hooks/useLanguage';

interface CustomerDetailsModalProps {
  customer: any; // User + aggregated stats
  customerOrders: Order[];
  onClose: () => void;
}

// Helper to find mode
const getFavoriteCategory = (orders: Order[]) => {
    const counts: Record<string, number> = {};
    orders.forEach(o => {
        o.items.forEach(i => {
            counts[i.category] = (counts[i.category] || 0) + 1;
        });
    });
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : '—';
};

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ customer, customerOrders, onClose }) => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [isProcessing, setIsProcessing] = useState(false);

  // Stats Logic
  const favCategory = useMemo(() => getFavoriteCategory(customerOrders), [customerOrders]);
  const avgTicket = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;
  
  // Extract Shipping Address from latest order
  const address = customerOrders[0]?.shippingAddress;

  const handleBan = async () => {
      if(!confirm(`Bloquear ${customer.displayName}?`)) return;
      setIsProcessing(true);
      const res = await banUser(customer.uid);
      setIsProcessing(false);
      if(res.success) toast("Usuário bloqueado", "success");
      else toast("Erro ao bloquear", "error");
  };

  const handleSync = async () => {
      setIsProcessing(true);
      const res = await syncUserAttributesToBrevo(customer.uid, { 
          totalSpent: customer.totalSpent, 
          isVIP: customer.totalSpent > 1000,
          lastOrderDate: customerOrders[0]?.createdAt 
      });
      setIsProcessing(false);
      if(res.success) toast("Sincronizado com Sucesso", "success");
      else toast("Erro na sincronização", "error");
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div 
            className="w-full max-w-5xl bg-[#121212] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]"
            {...({ initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 } } as any)}
        >
            {/* Artistic Header */}
            <div className="h-40 bg-gradient-to-r from-[#D4AF37]/20 via-[#121212] to-[#121212] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/40 text-white rounded-full hover:bg-white hover:text-black transition-colors z-20"><X size={20}/></button>
            </div>
            
            <div className="px-10 pb-10 -mt-16 flex-1 overflow-y-auto">
                {/* Profile Header Block */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                    <div className="flex items-end gap-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-black border-4 border-[#121212] flex items-center justify-center overflow-hidden shadow-2xl">
                                {customer.photoURL ? (
                                    <img src={customer.photoURL} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <User size={48} className="text-gray-500" />
                                )}
                            </div>
                            {customer.status === t('admin.crm.status_vip') && (
                                <div className="absolute bottom-2 right-0 bg-accent text-black p-2 rounded-full border-4 border-[#121212]" title="VIP">
                                    <Star size={16} fill="currentColor" />
                                </div>
                            )}
                        </div>
                        <div className="mb-2">
                            <h2 className="text-4xl text-white font-serif tracking-tight">{customer.displayName}</h2>
                            <p className="text-gray-500 font-mono text-sm flex items-center gap-2">
                                <Mail size={12} /> {customer.email}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 mb-2">
                        <button onClick={handleSync} disabled={isProcessing} className="px-5 py-3 bg-[#1a1a1a] border border-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-2">
                             {isProcessing ? <Loader2 className="animate-spin" size={14}/> : <RefreshCw size={14}/>} {t('admin.crm.btn_sync')}
                        </button>
                        <button onClick={handleBan} disabled={isProcessing} className="px-5 py-3 bg-red-900/10 border border-red-900/30 text-red-500 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
                            <Ban size={14}/> {t('admin.crm.btn_ban')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* LEFT COLUMN: CONTACT & INFO */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Status Card */}
                        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
                            <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 flex items-center gap-2"><User size={14}/> {t('admin.crm.detail_contact')}</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400 text-sm">ID</span>
                                    <span className="font-mono text-xs text-gray-500">{customer.uid.slice(0,8)}...</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400 text-sm">{t('admin.crm.col_since')}</span>
                                    <span className="text-white text-sm">{formatDate(customer.createdAt, language)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-gray-400 text-sm">Status</span>
                                    <span className="text-accent text-sm font-bold">{customer.status}</span>
                                </div>
                            </div>
                        </div>

                        {/* Address Card (Visual) */}
                        <div className="bg-[#EFEFEF] text-black p-6 rounded-2xl shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <MapPin size={120} />
                            </div>
                            <h3 className="text-xs font-bold uppercase text-gray-500 mb-4 relative z-10 flex items-center gap-2">
                                <Package size={14}/> {t('admin.crm.detail_address')}
                            </h3>
                            
                            {address ? (
                                <div className="relative z-10 space-y-1 font-serif text-lg leading-snug">
                                    <p className="font-bold">{address.recipientName}</p>
                                    <p>{address.line1}</p>
                                    <p>{address.postalCode} {address.city}</p>
                                    <p className="uppercase tracking-widest text-sm mt-2 font-sans font-bold">{address.country}</p>
                                    {address.phone && <p className="text-xs text-gray-500 font-sans mt-4 flex items-center gap-1"><Phone size={10}/> {address.phone}</p>}
                                </div>
                            ) : (
                                <div className="relative z-10 h-32 flex items-center justify-center text-gray-400 text-sm italic">
                                    N/A
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: JOURNEY & STATS */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* AI Insights & Metrics */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Insight Card */}
                            <div className="bg-gradient-to-br from-[#1a1a1a] to-black p-6 rounded-2xl border border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-accent/10 rounded-full blur-xl" />
                                <h3 className="text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-2"><Tag size={14}/> {t('admin.crm.insight_fav_category')}</h3>
                                <p className="text-2xl text-white font-serif">{favCategory}</p>
                            </div>

                            <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
                                <h3 className="text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-2"><TrendingUp size={14}/> LTV</h3>
                                <p className="text-2xl text-accent font-serif">{formatPrice(customer.totalSpent, 'EUR', language)}</p>
                            </div>

                            <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-white/5">
                                <h3 className="text-xs font-bold uppercase text-gray-500 mb-2 flex items-center gap-2"><Package size={14}/> {t('admin.crm.metric_avg_ticket')}</h3>
                                <p className="text-2xl text-white font-serif">{formatPrice(avgTicket, 'EUR', language)}</p>
                            </div>
                        </div>

                        {/* Visual Timeline */}
                        <div className="bg-[#1a1a1a] p-8 rounded-2xl border border-white/5">
                            <h3 className="text-sm font-bold uppercase text-white mb-6 flex items-center gap-2">
                                <Calendar size={16}/> {t('admin.crm.detail_timeline')}
                            </h3>
                            
                            {customerOrders.length === 0 ? (
                                <div className="h-32 flex items-center justify-center text-gray-500 text-sm italic border border-dashed border-white/10 rounded-xl">
                                    No purchase history yet.
                                </div>
                            ) : (
                                <div className="relative">
                                    {/* Horizontal Scroll Timeline */}
                                    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x">
                                        {customerOrders.map((order, idx) => (
                                            <div key={order.id} className="min-w-[140px] snap-center">
                                                <div className="text-[10px] text-gray-500 mb-2 font-mono text-center">
                                                    {formatDate(order.createdAt, language)}
                                                </div>
                                                
                                                {/* Stacked Images for Multiple Items */}
                                                <div className="relative h-32 w-full mb-3 group cursor-pointer">
                                                    {order.items.slice(0,3).map((item, i) => (
                                                        <div 
                                                            key={i}
                                                            className="absolute top-0 left-0 w-full h-full rounded-lg overflow-hidden border border-white/10 shadow-lg transition-transform bg-[#121212]"
                                                            style={{ 
                                                                transform: `translate(${i * 4}px, ${i * -4}px)`,
                                                                zIndex: 10 - i 
                                                            }}
                                                        >
                                                            <img 
                                                                src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url} 
                                                                alt="" 
                                                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="text-center">
                                                    <div className="text-white font-bold text-sm">{formatPrice(order.amount, 'EUR', language)}</div>
                                                    <div className="text-[10px] uppercase tracking-wider text-gray-500">{order.items.length} Items</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Connecting Line (Visual) */}
                                    <div className="absolute top-[34px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none -z-10" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    </div>
  );
};
