
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, ShoppingBag, Ban, RefreshCw, Loader2, Star } from 'lucide-react';
import { banUser, syncUserAttributesToBrevo } from '../../../app/actions/crm';
import { useToast } from '../../ui/Toast';
import { formatPrice, cn } from '../../../lib/utils';
import { Order } from '../../../types/order';

interface CustomerDetailsModalProps {
  customer: any; // User + aggregated stats
  customerOrders: Order[];
  onClose: () => void;
}

export const CustomerDetailsModal: React.FC<CustomerDetailsModalProps> = ({ customer, customerOrders, onClose }) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

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
      if(res.success) toast("Dados sincronizados com Brevo", "success");
      else toast("Erro na sincronização", "error");
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
            className="w-full max-w-2xl bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            {...({ initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 } } as any)}
        >
            <div className="h-24 bg-gradient-to-r from-accent/20 to-black relative">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white hover:text-black transition-colors"><X size={20}/></button>
            </div>
            
            <div className="px-8 pb-8 -mt-12 flex-1 overflow-y-auto">
                <div className="flex justify-between items-end mb-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-black border-4 border-[#121212] flex items-center justify-center overflow-hidden">
                            {customer.photoURL ? (
                                <img src={customer.photoURL} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <User size={40} className="text-gray-500" />
                            )}
                        </div>
                        {customer.totalSpent > 1000 && (
                            <div className="absolute bottom-0 right-0 bg-yellow-500 text-black p-1.5 rounded-full border-2 border-[#121212]" title="VIP Client">
                                <Star size={14} fill="currentColor" />
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSync} disabled={isProcessing} className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded text-xs font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-colors flex items-center gap-2">
                             {isProcessing ? <Loader2 className="animate-spin" size={14}/> : <RefreshCw size={14}/>} Sync CRM
                        </button>
                        <button onClick={handleBan} disabled={isProcessing} className="px-4 py-2 bg-red-600/20 text-red-500 rounded text-xs font-bold uppercase tracking-widest hover:bg-red-600 hover:text-white transition-colors flex items-center gap-2">
                            <Ban size={14}/> Banir
                        </button>
                    </div>
                </div>

                <h2 className="text-2xl text-white font-serif">{customer.displayName}</h2>
                <p className="text-gray-500 text-sm mb-8">{customer.email} • ID: {customer.uid}</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-[#1a1a1a] p-4 rounded border border-white/5">
                        <div className="text-xs text-gray-500 uppercase">Total Gasto</div>
                        <div className="text-xl text-accent font-serif">{formatPrice(customer.totalSpent)}</div>
                    </div>
                    <div className="bg-[#1a1a1a] p-4 rounded border border-white/5">
                        <div className="text-xs text-gray-500 uppercase">Pedidos</div>
                        <div className="text-xl text-white font-serif">{customer.totalOrders}</div>
                    </div>
                    <div className="bg-[#1a1a1a] p-4 rounded border border-white/5">
                        <div className="text-xs text-gray-500 uppercase">LTV Médio</div>
                        <div className="text-xl text-white font-serif">
                            {customer.totalOrders > 0 ? formatPrice(customer.totalSpent / customer.totalOrders) : '€ 0,00'}
                        </div>
                    </div>
                </div>

                <h3 className="text-white font-serif mb-4 border-b border-white/10 pb-2">Histórico Recente</h3>
                <div className="space-y-2">
                    {customerOrders.length === 0 ? (
                        <p className="text-gray-500 italic text-sm">Nenhum pedido encontrado.</p>
                    ) : (
                        customerOrders.slice(0, 5).map(order => (
                            <div key={order.id} className="flex justify-between items-center bg-[#1a1a1a] p-3 rounded hover:bg-white/5 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/5 rounded text-gray-400"><ShoppingBag size={16}/></div>
                                    <div>
                                        <div className="text-white text-sm font-bold">#{order.id.slice(0,8)}</div>
                                        <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-accent text-sm font-bold">{formatPrice(order.amount)}</div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-400">{order.status}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </motion.div>
    </div>
  );
};
