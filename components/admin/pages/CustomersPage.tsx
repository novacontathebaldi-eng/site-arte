import React from 'react';

const CustomersPage: React.FC = () => {
    // This would be fetched from the /users collection in Firestore
    const sampleCustomers = [
        { id: 'uid1', name: 'John Doe', email: 'john.doe@example.com', totalOrders: 2, totalSpent: '€570.00' },
        { id: 'uid2', name: 'Jane Smith', email: 'jane.smith@example.com', totalOrders: 1, totalSpent: '€120.00' },
        { id: 'uid3', name: 'Mark Johnson', email: 'mark.j@example.com', totalOrders: 1, totalSpent: '€75.00' },
    ];

    return (
        <div className="bg-brand-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold font-serif mb-6">Manage Customers</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                     <thead className="bg-black/5">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Total Orders</th>
                            <th className="p-3">Total Spent</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>
                     <tbody>
                        {sampleCustomers.map(customer => (
                            <tr key={customer.id} className="border-b border-black/10">
                                <td className="p-3 font-medium">{customer.name}</td>
                                <td className="p-3">{customer.email}</td>
                                <td className="p-3">{customer.totalOrders}</td>
                                <td className="p-3">{customer.totalSpent}</td>
                                <td className="p-3">
                                    <button className="text-brand-gold hover:underline">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomersPage;
