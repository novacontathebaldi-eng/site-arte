import React from 'react';

const OrdersPage: React.FC = () => {
    // This would be fetched from Firestore
    const sampleOrders = [
        { id: '1092', customer: 'John Doe', date: '2024-07-28', status: 'shipped', total: '€450.00' },
        { id: '1091', customer: 'Jane Smith', date: '2024-07-27', status: 'delivered', total: '€120.00' },
        { id: '1090', customer: 'Mark Johnson', date: '2024-07-25', status: 'pending', total: '€75.00' },
    ];

    return (
        <div className="bg-brand-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold font-serif mb-6">Manage Orders</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                     <thead className="bg-black/5">
                        <tr>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">Date</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                     <tbody>
                        {sampleOrders.map(order => (
                            <tr key={order.id} className="border-b border-black/10">
                                <td className="p-3 font-medium">#{order.id}</td>
                                <td className="p-3">{order.customer}</td>
                                <td className="p-3">{order.date}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 text-xs rounded-full ${order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="p-3">{order.total}</td>
                                <td className="p-3">
                                    <button className="text-brand-gold hover:underline">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OrdersPage;
