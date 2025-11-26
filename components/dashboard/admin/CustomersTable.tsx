
import React, { useState, useMemo, useEffect } from 'react';
import { User } from '../../../types/user';
import { Order } from '../../../types/order';
import { Search, Star, User as UserIcon, Filter, Globe, Loader2, ChevronLeft, ChevronRight, Mail, Users, Book } from 'lucide-react';
import { formatPrice, cn, formatDate } from '../../../lib/utils';
import { CustomerDetailsModal } from './CustomerDetailsModal';
import { useLanguage } from '../../../hooks/useLanguage';
import { getBrevoContacts } from '../../../app/actions/admin';
import { BrevoContact } from '../../../types/admin';

interface CustomersTableProps {
  users: any[]; // Raw users from Firestore
  orders: Order[]; // All orders for aggregation
}

export const CustomersTable: React.FC<CustomersTableProps> = ({ users, orders }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'collectors' | 'circle'>('collectors');
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  // Brevo State
  const [brevoContacts, setBrevoContacts] = useState<BrevoContact[]>([]);
  const [brevoLoading, setBrevoLoading] = useState(false);
  const [brevoOffset, setBrevoOffset] = useState(0);
  const BREVO_LIMIT = 50;

  // Fetch Brevo contacts when tab changes or pagination
  useEffect(() => {
    if (activeTab === 'circle') {
        const fetchBrevo = async () => {
            setBrevoLoading(true);
            const data = await getBrevoContacts(BREVO_LIMIT, brevoOffset);
            setBrevoContacts(data);
            setBrevoLoading(false);
        };
        fetchBrevo();
    }
  }, [activeTab, brevoOffset]);

  // Aggregation Logic for Collectors
  const customers = useMemo(() => {
    return users.map(user => {
        const userOrders = orders.filter(o => o.userId === user.uid);
        const sortedOrders = [...userOrders].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const totalSpent = userOrders.reduce((sum, o) => sum + o.amount, 0);
        const lastOrder = sortedOrders.length > 0 ? sortedOrders[0] : null;
        
        let status = t('admin.crm.status_regular');
        if (totalSpent > 1000) status = t('admin.crm.status_vip');
        else if (new Date(user.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000) status = t('admin.crm.status_new');
        else if (!lastOrder || new Date(lastOrder.createdAt).getTime() < Date.now() - 180 * 24 * 60 * 60 * 1000) status = t('admin.crm.status_inactive');

        // Extract Location from latest order
        const location = lastOrder ? lastOrder.shippingAddress.country : '—';

        return {
            ...user,
            totalSpent,
            totalOrders: userOrders.length,
            lastOrderDate: lastOrder?.createdAt,
            location,
            status
        };
    }).filter(u => 
        u.displayName?.toLowerCase().includes(search.toLowerCase()) || 
        u.email?.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [users, orders, search, t]);

  return (
    <div className="h-full flex flex-col">
        {/* Header & Tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-white/10">
                <button 
                    onClick={() => setActiveTab('collectors')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-all",
                        activeTab === 'collectors' ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-white"
                    )}
                >
                    <Book size={16} /> {t('admin.crm.tab_collectors')}
                </button>
                <button 
                    onClick={() => setActiveTab('circle')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold uppercase tracking-widest transition-all",
                        activeTab === 'circle' ? "bg-white/10 text-white shadow-sm" : "text-gray-500 hover:text-white"
                    )}
                >
                    <Users size={16} /> {t('admin.crm.tab_circle')}
                </button>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder={t('admin.crm.search_placeholder')}
                        className="w-full md:w-64 bg-[#151515] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:border-accent outline-none"
                    />
                </div>
                <div className="text-sm text-gray-400 hidden md:block">
                   <span className="text-white font-bold">{activeTab === 'collectors' ? customers.length : brevoContacts.length}</span> {t('admin.crm.total_clients')}
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#151515] rounded-xl border border-white/10 overflow-hidden relative">
            
            {/* TAB: COLLECTORS */}
            {activeTab === 'collectors' && (
                <div className="overflow-x-auto h-full">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-[#1a1a1a] text-xs uppercase text-gray-500 font-bold sticky top-0 z-10">
                            <tr>
                                <th className="p-4">{t('admin.crm.col_client')}</th>
                                <th className="p-4">{t('admin.crm.col_status')}</th>
                                <th className="p-4">{t('admin.crm.col_ltv')}</th>
                                <th className="p-4">{t('admin.crm.col_location')}</th>
                                <th className="p-4">{t('admin.crm.col_since')}</th>
                                <th className="p-4 text-right">{t('admin.crm.col_action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {customers.map(c => (
                                <tr key={c.uid} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedCustomer(c)}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/5">
                                                {c.photoURL ? <img src={c.photoURL} className="w-full h-full object-cover" alt=""/> : <UserIcon size={18} className="text-gray-400"/>}
                                            </div>
                                            <div>
                                                <div className="text-white font-serif font-bold tracking-wide">{c.displayName}</div>
                                                <div className="text-xs text-gray-500 font-mono">{c.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={cn(
                                            "px-2 py-1 rounded-sm text-[10px] font-bold uppercase border tracking-wider",
                                            c.status === t('admin.crm.status_vip') ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                                            c.status === t('admin.crm.status_new') ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                            c.status === t('admin.crm.status_inactive') ? "bg-gray-500/10 text-gray-500 border-gray-500/20" :
                                            "bg-green-500/10 text-green-500 border-green-500/20"
                                        )}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-accent font-serif font-bold text-lg">{formatPrice(c.totalSpent, 'EUR', language)}</td>
                                    <td className="p-4 text-white flex items-center gap-2">
                                        <Globe size={14} className="text-gray-600" /> {c.location}
                                    </td>
                                    <td className="p-4 text-gray-400 text-xs">
                                        {formatDate(c.createdAt, language)}
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-gray-500 hover:text-white text-xs uppercase tracking-wider font-bold border border-white/10 px-3 py-1 rounded hover:bg-white/10 transition-colors">
                                            {t('admin.crm.btn_details')}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* TAB: THE CIRCLE (BREVO) */}
            {activeTab === 'circle' && (
                <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-x-auto">
                        {brevoLoading ? (
                            <div className="h-full flex items-center justify-center text-gray-500 gap-3">
                                <Loader2 className="animate-spin" />
                                <span className="text-xs uppercase tracking-widest">Syncing with Brevo...</span>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#1a1a1a] text-xs uppercase text-gray-500 font-bold sticky top-0 z-10">
                                    <tr>
                                        <th className="p-4">Email</th>
                                        <th className="p-4">{t('admin.crm.brevo_added')}</th>
                                        <th className="p-4">{t('admin.crm.brevo_status')}</th>
                                        <th className="p-4 text-right">ID</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {brevoContacts.map(contact => (
                                        <tr key={contact.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 flex items-center gap-3">
                                                <div className="p-2 bg-blue-500/10 rounded text-blue-500"><Mail size={16}/></div>
                                                <span className="text-white font-medium">{contact.email}</span>
                                            </td>
                                            <td className="p-4 text-gray-400 text-xs">
                                                {formatDate(contact.createdAt, language)}
                                            </td>
                                            <td className="p-4">
                                                <span className={cn(
                                                    "px-2 py-1 rounded text-[10px] font-bold uppercase",
                                                    contact.emailBlacklisted ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
                                                )}>
                                                    {contact.emailBlacklisted ? 'Blacklisted' : 'Subscribed'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right text-gray-600 font-mono text-xs">
                                                #{contact.id}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                    
                    {/* Pagination */}
                    <div className="p-4 border-t border-white/10 flex justify-between items-center bg-[#1a1a1a]">
                        <button 
                            disabled={brevoOffset === 0 || brevoLoading}
                            onClick={() => setBrevoOffset(Math.max(0, brevoOffset - BREVO_LIMIT))}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs uppercase font-bold disabled:opacity-50"
                        >
                            <ChevronLeft size={16}/> {t('admin.crm.pagination_prev')}
                        </button>
                        <span className="text-xs text-gray-500 font-mono">
                            Page {Math.floor(brevoOffset / BREVO_LIMIT) + 1}
                        </span>
                        <button 
                             disabled={brevoContacts.length < BREVO_LIMIT || brevoLoading}
                             onClick={() => setBrevoOffset(brevoOffset + BREVO_LIMIT)}
                             className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded text-xs uppercase font-bold disabled:opacity-50"
                        >
                            {t('admin.crm.pagination_next')} <ChevronRight size={16}/>
                        </button>
                    </div>
                </div>
            )}

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
