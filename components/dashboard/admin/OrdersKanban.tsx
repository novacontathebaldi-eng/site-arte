
import React, { useState, useMemo } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, closestCorners } from '@dnd-kit/core';
import { Order, OrderStatus } from '../../../types/order';
import { updateOrderStatus } from '../../../app/actions/orders';
import { formatPrice, cn } from '../../../lib/utils';
import { AlertCircle, Calendar, Clock, Package, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { OrderDetailsModal } from './OrderDetailsModal';
import { useToast } from '../../ui/Toast';

interface OrdersKanbanProps {
  orders: Order[];
}

const COLUMNS = [
  { id: OrderStatus.PENDING, title: 'Pendente', color: 'border-yellow-500/50 bg-yellow-500/5' },
  { id: OrderStatus.PAID, title: 'Pago', color: 'border-green-500/50 bg-green-500/5' },
  { id: OrderStatus.PROCESSING, title: 'Em Preparo', color: 'border-blue-500/50 bg-blue-500/5' },
  { id: OrderStatus.SHIPPED, title: 'Enviado', color: 'border-purple-500/50 bg-purple-500/5' },
  { id: OrderStatus.DELIVERED, title: 'Entregue', color: 'border-emerald-600/50 bg-emerald-600/5' },
  { id: OrderStatus.CANCELLED, title: 'Cancelado', color: 'border-red-500/50 bg-red-500/5' },
];

interface OrderCardProps {
    order: Order;
    onClick: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: { order }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 999,
  } : undefined;

  const isStale = [OrderStatus.PENDING, OrderStatus.PAID, OrderStatus.PROCESSING].includes(order.status) && 
                  (Date.now() - new Date(order.createdAt).getTime() > 48 * 60 * 60 * 1000);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
          "bg-[#1a1a1a] p-4 rounded-lg border border-white/5 shadow-lg mb-3 cursor-grab active:cursor-grabbing hover:border-accent/50 transition-colors group relative",
          isDragging && "opacity-50 ring-2 ring-accent",
          isStale && "border-l-4 border-l-red-500"
      )}
    >
        <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-mono text-gray-500">#{order.id.slice(0, 6)}</span>
            <span className="text-xs font-bold text-white">{formatPrice(order.amount)}</span>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
             <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] text-white font-bold">
                 {order.shippingAddress.recipientName?.[0] || '?'}
             </div>
             <div className="text-sm text-gray-300 truncate max-w-[120px]">
                 {order.shippingAddress.recipientName}
             </div>
        </div>

        <div className="flex gap-1 mb-3 overflow-hidden">
            {order.items.slice(0, 3).map((item, idx) => (
                <img key={idx} src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url} className="w-8 h-8 rounded object-cover bg-black" alt="" />
            ))}
            {order.items.length > 3 && (
                <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-[10px] text-gray-400">+{order.items.length - 3}</div>
            )}
        </div>

        <div className="flex justify-between items-center text-[10px] text-gray-500">
            <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(order.createdAt).toLocaleDateString()}</span>
            {isStale && <span className="flex items-center gap-1 text-red-500 font-bold"><Clock size={10}/> +48h</span>}
        </div>
    </div>
  );
};

const KanbanColumn = ({ id, title, color, orders, onOrderClick }: any) => {
  const { setNodeRef } = useDroppable({ id });
  
  return (
    <div className="flex flex-col h-full min-w-[280px] w-[280px]">
      <div className={cn("p-3 rounded-t-lg border-b-2 border-white/5 font-bold text-xs uppercase tracking-widest text-gray-300 flex justify-between items-center bg-[#151515]", color)}>
          {title}
          <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">{orders.length}</span>
      </div>
      <div ref={setNodeRef} className="flex-1 bg-[#121212]/50 p-2 overflow-y-auto rounded-b-lg border border-t-0 border-white/5">
        {orders.map((order: Order) => (
            <OrderCard key={order.id} order={order} onClick={() => onOrderClick(order)} />
        ))}
        {orders.length === 0 && <div className="h-20 flex items-center justify-center text-gray-600 text-xs italic">Vazio</div>}
      </div>
    </div>
  );
};

export const OrdersKanban: React.FC<OrdersKanbanProps> = ({ orders: initialOrders }) => {
  const { toast } = useToast();
  const [localOrders, setLocalOrders] = useState<Order[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);

  // Sync local state when prop updates (from Firestore listener in Parent)
  React.useEffect(() => {
      setLocalOrders(initialOrders);
  }, [initialOrders]);

  const filteredOrders = useMemo(() => {
    return localOrders.filter(o => 
        o.id.toLowerCase().includes(search.toLowerCase()) || 
        o.shippingAddress.recipientName.toLowerCase().includes(search.toLowerCase())
    );
  }, [localOrders, search]);

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
        const orderId = active.id;
        const newStatus = over.id as OrderStatus;

        // Optimistic Update
        const oldOrder = localOrders.find(o => o.id === orderId);
        if (oldOrder && oldOrder.status !== newStatus) {
            setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            
            const res = await updateOrderStatus(orderId, newStatus);
            if (!res.success) {
                // Revert
                setLocalOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: oldOrder.status } : o));
                toast("Erro ao atualizar status", "error");
            } else {
                toast(`Pedido movido para ${newStatus}`, "success");
            }
        }
    }
  };

  const activeOrder = activeId ? localOrders.find(o => o.id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Buscar pedido ou cliente..." 
                    className="bg-[#151515] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:border-accent outline-none w-64"
                />
            </div>
            <div className="text-xs text-gray-500 flex gap-4">
                <span className="flex items-center gap-1"><AlertCircle size={12} className="text-red-500"/> Atrasado (+48h)</span>
            </div>
        </div>

        {/* Board */}
        <div className="flex-1 overflow-x-auto pb-4">
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
                <div className="flex gap-4 h-full min-w-max">
                    {COLUMNS.map(col => (
                        <KanbanColumn 
                            key={col.id} 
                            id={col.id} 
                            title={col.title} 
                            color={col.color}
                            orders={filteredOrders.filter(o => o.status === col.id)}
                            onOrderClick={setSelectedOrder}
                        />
                    ))}
                </div>
                <DragOverlay>
                    {activeOrder ? (
                         <div className="bg-[#1a1a1a] p-4 rounded-lg border border-accent shadow-2xl w-[280px] opacity-90 rotate-3">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-gray-500">#{activeOrder.id.slice(0, 6)}</span>
                                <span className="text-xs font-bold text-white">{formatPrice(activeOrder.amount)}</span>
                            </div>
                            <div className="text-sm text-gray-300 mb-2">{activeOrder.shippingAddress.recipientName}</div>
                         </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>

        {selectedOrder && (
            <OrderDetailsModal 
                order={selectedOrder} 
                onClose={() => setSelectedOrder(null)} 
            />
        )}
    </div>
  );
};
