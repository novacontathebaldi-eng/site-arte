import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { SearchIcon } from '../icons';
import { View } from '../../App';

interface AdminHeaderProps {
  onNavigate: (view: View) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onNavigate }) => {
  const { user, logOut } = useAuth();

  return (
    <header className="h-20 bg-white border-b flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0">
      <div className="relative">
        <input 
          type="text" 
          placeholder="Search products, orders, customers..."
          className="w-full max-w-xs pl-10 pr-4 py-2 border rounded-md text-sm"
        />
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={() => onNavigate('home')} 
          className="text-sm text-gray-600 hover:text-primary transition-colors"
        >
          View Website
        </button>
        {user && (
          <div className="relative group">
            <button className="w-10 h-10 rounded-full bg-accent text-white font-bold flex items-center justify-center">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50 opacity-0 group-hover:opacity-100 transition-opacity invisible group-hover:visible">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold truncate">{user.displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <button onClick={logOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AdminHeader;