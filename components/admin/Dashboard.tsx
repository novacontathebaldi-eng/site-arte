import React, { useState } from 'react';
import { seedDatabase } from '../../lib/seed';
import { TypingIndicator } from '../icons';

const StatCard: React.FC<{ title: string; value: string; change?: string; changeType?: 'increase' | 'decrease' }> = ({ title, value, change, changeType }) => {
    const changeColor = changeType === 'increase' ? 'text-green-600' : 'text-red-600';
    return (
        <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
            {change && (
                <p className={`mt-1 text-sm ${changeColor}`}>
                    {change} vs last month
                </p>
            )}
        </div>
    );
};

const Dashboard: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
    const handleSeedDatabase = async () => {
      if (!window.confirm("Are you sure you want to seed the database? This will add 10 new mock products to Firestore.")) {
        return;
      }
  
      setLoading(true);
      setFeedback(null);
  
      const result = await seedDatabase();
  
      if (result.success) {
        setFeedback({ type: 'success', message: `${result.count} products have been successfully added to the database.` });
      } else {
        setFeedback({ type: 'error', message: `An error occurred: ${result.error}` });
      }
      setLoading(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-serif text-primary mb-6">Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Sales (Month)" value="€12,345" change="+12.5%" changeType="increase" />
                <StatCard title="New Orders (Today)" value="8" />
                <StatCard title="Conversion Rate" value="2.14%" change="-0.2%" changeType="decrease" />
                <StatCard title="Unique Visitors (30d)" value="5,678" change="+5.1%" changeType="increase" />
            </div>

            {/* Charts and Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4">Sales Overview (Last 12 Months)</h2>
                    <div className="h-80 bg-gray-200 flex items-center justify-center text-gray-500 rounded">
                        Chart Placeholder
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-lg shadow border">
                    <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
                     <ul className="space-y-4">
                        {/* Mock data */}
                        <li className="flex justify-between items-center text-sm">
                            <div>
                                <p className="font-medium">Order #MP6789</p>
                                <p className="text-gray-500">John Doe</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">€250.00</p>
                                <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Delivered</span>
                            </div>
                        </li>
                        <li className="flex justify-between items-center text-sm">
                             <div>
                                <p className="font-medium">Order #MP6788</p>
                                <p className="text-gray-500">Jane Smith</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">€1,200.00</p>
                                <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Shipped</span>
                            </div>
                        </li>
                         <li className="flex justify-between items-center text-sm">
                             <div>
                                <p className="font-medium">Order #MP6787</p>
                                <p className="text-gray-500">Peter Jones</p>
                            </div>
                            <div className="text-right">
                                <p className="font-medium">€85.50</p>
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Processing</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Development Tools Section */}
            <div className="mt-8 bg-white p-6 rounded-lg shadow-md border">
              <h2 className="text-2xl font-serif mb-4">Development Tools</h2>
              <p className="text-gray-600 mb-4">
                Populate the Firestore 'products' collection with mock data. This is useful for development and testing purposes.
              </p>
              <button
                onClick={handleSeedDatabase}
                disabled={loading}
                className="bg-accent text-white px-6 py-2 rounded-md font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <TypingIndicator /> : 'Seed Database with Mock Products'}
              </button>
    
              {feedback && (
                <div className={`mt-4 p-4 rounded-md text-sm ${
                    feedback.type === 'success' 
                    ? 'bg-green-100 border border-green-300 text-green-800' 
                    : 'bg-red-100 border border-red-300 text-red-800'
                }`}>
                  {feedback.message}
                </div>
              )}
            </div>

        </div>
    );
};

export default Dashboard;
