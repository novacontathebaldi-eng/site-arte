
import React, { useState, useMemo } from 'react';
import { User } from '../../../types/user';
import { Order } from '../../../types/order';
import { Search, Star, User as UserIcon, Filter } from 'lucide-react';
import { formatPrice, cn } from '../../../lib/utils';
import { CustomerDetailsModal } from './CustomerDetailsModal';

interface CustomersTableProps {
  users: any[]; // Raw users from Firestore
  orders: Order[]; // All orders for aggregation
}

export const CustomersTable: React.FC<CustomersTableProps> = ({ users, orders }) => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // Aggregation Logic (Client-Side for this scale)
  const customers = useMemo(() => {
    return users.map(user => {
        const userOrders = orders.filter(o => o.userId === user.uid);
        const totalSpent = userOrders.reduce((sum, o) => sum + o.amount, 0);
        const lastOrder = userOrders.length > 0 ? userOrders[0].createdAt : null;
        
        let status = 'Regular';
        if (totalSpent > 1000) status = 'VIP';
        else if (new Date(user.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000) status = 'Novo';
        else if (!lastOrder || new Date(lastOrder).getTime() < Date.now() - 180 * 24 * 60 * 60 * 1000) status = 'Inativo';

        return {
            ...user,
            totalSpent,
            totalOrders: userOrders.length,
            lastOrderDate: lastOrder,
            status
        };
    }).filter(u => 
        u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
        u.email?.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => b.totalSpent - a.totalSpent); // Default sort by Value
  }, [users, orders, search]);

  return (
    <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Buscar por nome ou email..." 
                    className="bg-[#151515] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:border-accent outline-none w-64"
                />
            </div>
            <div className="text-sm text-gray-400">
                Total: <span className="text-white font-bold">{customers.length}</span> clientes
            </div>
        </div>

        <div className="flex-1 bg-[#151515] rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto h-full">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#1a1a1a] text-xs uppercase text-gray-500 font-bold sticky top-0 z-10">
                        <tr>
                            <th className="p-4">Cliente</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Total Gasto</th>
                            <th className="p-4">Pedidos</th>
                            <th className="p-4">Última Compra</th>
                            <th className="p-4 text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {customers.map(c => (
                            <tr key={c.uid} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                            {c.photoURL ? <img src={c.photoURL} className="w-full h-full object-cover" alt=""/> : <UserIcon size={16} className="text-gray-400"/>}
                                        </div>
                                        <div>
                                            <div className="text-white font-bold">{c.displayName}</div>
                                            <div className="text-xs text-gray-500">{c.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={cn(
                                        "px-2 py-1 rounded text-[10px] font-bold uppercase border",
                                        c.status === 'VIP' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                        c.status === 'Novo' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                        c.status === 'Inativo' ? "bg-gray-500/10 text-gray-500 border-gray-500/20" :
                                        "bg-green-500/10 text-green-500 border-green-500/20"
                                    )}>
                                        {c.status}
                                    </span>
                                </td>
                                <td className="p-4 text-accent font-bold">{formatPrice(c.totalSpent)}</td>
                                <td className="p-4 text-white">{c.totalOrders}</td>
                                <td className="p-4 text-gray-400 text-xs">
                                    {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : 'Nunca'}
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => setSelectedCustomer(c)}
                                        className="text-gray-500 hover:text-white underline text-xs uppercase tracking-wider"
                                    >
                                        Detalhes
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {selectedCustomer && (
            <CustomerDetailsModal 
                customer={selectedCustomer} 
                customerOrders={orders.filter(o => o.userId === selectedCustomer.uid).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())}
                onClose={() => setSelectedCustomer(null)}
            />
        )}
    </div>
  );
};
