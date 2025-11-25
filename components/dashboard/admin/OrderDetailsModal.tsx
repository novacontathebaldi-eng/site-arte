
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Package, Truck, Printer, Mail, Loader2, Save } from 'lucide-react';
import { Order, OrderStatus } from '../../../types/order';
import { updateOrderTracking, sendOrderEmail, updateOrderStatus } from '../../../app/actions/orders';
import { useToast } from '../../ui/Toast';
import { formatPrice } from '../../../lib/utils';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [carrier, setCarrier] = useState(order.tracking?.carrier || '');
  const [trackingCode, setTrackingCode] = useState(order.tracking?.code || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const [emailSubject, setEmailSubject] = useState(`Sobre o Pedido #${order.id.slice(0,8)}`);
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    setStatus(newStatus);
    setIsSaving(true);
    await updateOrderStatus(order.id, newStatus);
    setIsSaving(false);
    toast(`Status atualizado para ${newStatus}`, "success");
  };

  const handleSaveTracking = async () => {
    if (!carrier || !trackingCode) {
        toast("Preencha transportadora e código", "error");
        return;
    }
    setIsSaving(true);
    const res = await updateOrderTracking(order.id, carrier, trackingCode);
    setIsSaving(false);
    if (res.success) {
        toast("Rastreio salvo e email enviado!", "success");
        setStatus(OrderStatus.SHIPPED);
    } else {
        toast("Erro ao salvar rastreio", "error");
    }
  };

  const handleSendEmail = async () => {
    if (!emailBody.trim()) return;
    setSendingEmail(true);
    const res = await sendOrderEmail(order.id, emailSubject, emailBody);
    setSendingEmail(false);
    if (res.success) {
        toast("Email enviado ao cliente", "success");
        setEmailBody('');
    } else {
        toast("Erro ao enviar email", "error");
    }
  };

  const handlePrintInvoice = () => {
     // Simple print logic - in a real app would generate a PDF via a library
     const printWindow = window.open('', '', 'width=800,height=600');
     if (printWindow) {
         printWindow.document.write(`
            <html>
                <head><title>Fatura #${order.id}</title></head>
                <body style="font-family: sans-serif; padding: 40px;">
                    <h1>Melissa Pelussi Art</h1>
                    <h2>Fatura de Pedido #${order.id}</h2>
                    <p>Data: ${new Date(order.createdAt).toLocaleDateString()}</p>
                    <hr/>
                    <h3>Cliente</h3>
                    <p>${order.shippingAddress.recipientName}</p>
                    <p>${order.shippingAddress.line1}, ${order.shippingAddress.city}</p>
                    <p>${order.shippingAddress.country}</p>
                    <hr/>
                    <h3>Itens</h3>
                    <ul>
                        ${order.items.map(i => `<li>${i.translations?.fr?.title || 'Obra'} - ${i.quantity}x - €${i.price}</li>`).join('')}
                    </ul>
                    <h3>Total: €${order.amount}</h3>
                </body>
            </html>
         `);
         printWindow.document.close();
         printWindow.print();
     }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
            className="w-full max-w-4xl bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            {...({ initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 } } as any)}
        >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-[#1a1a1a]">
                <h2 className="text-white font-serif text-lg flex items-center gap-2">
                    <Package className="text-accent" size={20} />
                    Pedido #{order.id.slice(0, 8)}
                </h2>
                <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 flex flex-col md:flex-row gap-8">
                {/* Left Column: Details */}
                <div className="flex-1 space-y-8">
                    {/* Status Control */}
                    <div className="bg-black/30 p-6 rounded-xl border border-white/5">
                        <label className="block text-xs uppercase text-gray-500 mb-2 font-bold tracking-widest">Status do Pedido</label>
                        <select 
                            value={status} 
                            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                            className="w-full bg-[#121212] border border-white/10 text-white p-3 rounded focus:border-accent outline-none"
                            disabled={isSaving}
                        >
                            {Object.values(OrderStatus).map(s => (
                                <option key={s} value={s}>{s.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>

                    {/* Tracking */}
                    <div className="bg-black/30 p-6 rounded-xl border border-white/5">
                         <h3 className="text-white font-serif mb-4 flex items-center gap-2"><Truck size={18} /> Rastreamento</h3>
                         <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Transportadora</label>
                                <input type="text" value={carrier} onChange={e => setCarrier(e.target.value)} placeholder="Ex: DHL, FedEx" className="w-full bg-[#121212] border border-white/10 rounded p-2 text-white text-sm" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Código de Rastreio</label>
                                <input type="text" value={trackingCode} onChange={e => setTrackingCode(e.target.value)} placeholder="XYZ123456" className="w-full bg-[#121212] border border-white/10 rounded p-2 text-white text-sm" />
                            </div>
                            <button 
                                onClick={handleSaveTracking} 
                                disabled={isSaving}
                                className="w-full py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded text-xs font-bold uppercase hover:bg-blue-600 hover:text-white transition-colors flex justify-center gap-2"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={14}/> : <Save size={14} />} Salvar & Notificar Cliente
                            </button>
                         </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="text-white font-serif mb-4 text-sm uppercase tracking-widest border-b border-white/5 pb-2">Itens do Pedido</h3>
                        <div className="space-y-3">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-4 items-center bg-white/5 p-2 rounded">
                                    <img src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url} className="w-12 h-12 object-cover rounded" alt=""/>
                                    <div className="flex-1">
                                        <div className="text-white text-sm font-medium">{item.translations?.fr?.title || 'Obra'}</div>
                                        <div className="text-gray-500 text-xs">{item.category}</div>
                                    </div>
                                    <div className="text-accent text-sm font-bold">{formatPrice(item.price)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-4 pt-4 border-t border-white/10 text-white font-serif text-lg">
                            <span>Total</span>
                            <span>{formatPrice(order.amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer & Actions */}
                <div className="w-full md:w-80 space-y-6">
                    <div className="bg-white/5 p-6 rounded-xl">
                        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Dados do Cliente</h3>
                        <div className="space-y-1 text-sm text-gray-300">
                            <p className="text-white font-bold text-lg mb-2">{order.shippingAddress.recipientName}</p>
                            <p>{order.shippingAddress.line1}</p>
                            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                            <p className="text-white">{order.shippingAddress.country}</p>
                            <p className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-500">Email: {order.customerEmail || 'N/A'}</p>
                            <p className="text-xs text-gray-500">Tel: {order.shippingAddress.phone || 'N/A'}</p>
                        </div>
                    </div>

                    <button onClick={handlePrintInvoice} className="w-full py-3 bg-white text-black font-bold uppercase text-xs tracking-widest rounded flex items-center justify-center gap-2 hover:bg-gray-200">
                        <Printer size={16} /> Imprimir Fatura
                    </button>

                    <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                        <h3 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Mail size={14}/> Enviar Mensagem</h3>
                        <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded p-2 text-xs text-white mb-2" placeholder="Assunto" />
                        <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} className="w-full bg-[#121212] border border-white/10 rounded p-2 text-xs text-white mb-2" rows={4} placeholder="Mensagem para o cliente..." />
                        <button onClick={handleSendEmail} disabled={sendingEmail} className="w-full py-2 bg-accent/20 text-accent border border-accent/30 rounded text-xs font-bold uppercase hover:bg-accent hover:text-white transition-colors flex justify-center">
                            {sendingEmail ? <Loader2 className="animate-spin" size={14}/> : 'Enviar'}
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    </div>
  );
};
