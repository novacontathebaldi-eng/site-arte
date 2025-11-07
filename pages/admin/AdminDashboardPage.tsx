import React from 'react';

const AdminDashboardPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">Admin Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-text-secondary">
          Welcome to the admin dashboard. Analytics, KPIs, and recent activity will be displayed here.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboardPage;