import React from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { View } from '../../App';

interface AdminLayoutProps {
  children: React.ReactNode;
  onNavigate: (view: View) => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onNavigate }) => {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onNavigate={onNavigate} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;