import React from 'react';

// Placeholder Icon Components
// FIX: Corrected SVG syntax for all icons.
// The original SVGs had syntax errors (e.g., malformed viewBox attribute) which caused parsing failures.
// Replaced with standard, valid JSX for each icon.
const DollarSignIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const ShoppingCartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; change?: string; changeType?: 'increase' | 'decrease'}> = ({ title, value, icon, change, changeType }) => (
    <div className="bg-brand-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-brand-black/60">{title}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
            </div>
            <div className="p-2 bg-brand-gold/10 rounded-full text-brand-gold">
                {icon}
            </div>
        </div>
        {change && (
            <p className={`text-xs mt-2 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                {change} vs. last month
            </p>
        )}
    </div>
);


const DashboardPage: React.FC = () => {
    // In a real app, this data would be fetched from Firestore aggregations.
    const stats: { title: string; value: string; icon: React.ReactNode; change: string; changeType: 'increase' | 'decrease' }[] = [
        { title: 'Total Sales', value: '€12,842', icon: <DollarSignIcon />, change: '+12.5%', changeType: 'increase' },
        { title: 'Total Orders', value: '142', icon: <ShoppingCartIcon />, change: '+8.1%', changeType: 'increase' },
        { title: 'Total Customers', value: '89', icon: <UsersIcon />, change: '+2', changeType: 'increase' },
    ];
    
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-brand-white p-6 rounded-lg shadow">
                    <h3 className="font-bold font-serif">Sales Overview</h3>
                    <p className="text-sm text-brand-black/60 mt-4 text-center">Chart component would be here.</p>
                     <div className="h-64 bg-black/5 mt-4 rounded-md flex items-center justify-center">
                        [Sales Chart Placeholder]
                    </div>
                </div>
                 <div className="bg-brand-white p-6 rounded-lg shadow">
                    <h3 className="font-bold font-serif">Recent Activity</h3>
                    <ul className="mt-4 space-y-3 text-sm">
                        <li>New order #1088 by John Doe.</li>
                        <li>New customer registered: jane@example.com</li>
                        <li>Product "Ethereal Reverie" is low on stock (2 left).</li>
                        <li>New contact message from Mark Smith.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
