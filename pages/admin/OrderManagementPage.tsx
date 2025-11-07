import React from 'react';

const OrderManagementPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">Order Management</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-text-secondary">
          This is where you will manage all customer orders. Functionality to filter, view details, and update order statuses will be built here.
        </p>
      </div>
    </div>
  );
};

export default OrderManagementPage;