import React from 'react';

const ProductManagementPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-primary mb-6">Product Management</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-text-secondary">
          This is where you will add, edit, and manage all products in the catalog.
        </p>
      </div>
    </div>
  );
};

export default ProductManagementPage;