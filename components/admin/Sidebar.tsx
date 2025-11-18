import React, { useState } from 'react';
import { ChevronDownIcon } from '../icons'; // Assuming you have a ChevronDownIcon
import { View } from '../../App';

// A simple icon component placeholder
const Icon: React.FC<{ name: string, className?: string }> = ({ name, className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      {/* Basic placeholder paths, replace with real icons */}
      {name === 'dashboard' && <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />}
      {name === 'products' && <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l.383-1.437M7.5 14.25L5.106 5.106A2.25 2.25 0 002.857 3H2.25m9.75 0h.008v.008h-.008V3zm3.75 0h.008v.008h-.008V3zm3.75 0h.008v.008h-.008V3z" />}
      {name === 'orders' && <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM6.75 10.5h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5z" />}
      {name === 'customers' && <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.67c.12-.318.232-.654.328-1.003M7.86 15.75l3.249-3.249m0 0a2.25 2.25 0 10-3.182-3.182 2.25 2.25 0 003.182 3.182zM9 12.75l-3.249 3.249" />}
      {name === 'content' && <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />}
      {name === 'settings' && <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.48.398.668 1.03.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.075.124a6.57 6.57 0 01-.22.127c-.332.185-.582.496-.645.87l-.213 1.281c-.09.543-.56.94-1.11.94h-2.593c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.003-.827c.293-.24.438-.613.438-.995s-.145-.755-.438-.995l-1.003-.827c-.48-.398-.668-1.03-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.075.124.073.044.146.087.22.127.332.185.582.496.645.87l.213 1.281z" />}
      {name === 'analytics' && <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1.293-1.293a1.125 1.125 0 010-1.591l1.293-1.293m0 0l-1.293-1.293a1.125 1.125 0 010-1.591l1.293-1.293m0 0l-1.293-1.293a1.125 1.125 0 010-1.591l1.293-1.293" />}
    </svg>
);


interface NavItemProps {
  icon: string;
  label: string;
  onClick?: () => void;
  children?: React.ReactNode;
  isActive?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, onClick, children, isActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubmenu = !!children;

  const handleClick = () => {
    if (hasSubmenu) {
      setIsOpen(!isOpen);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <li>
      <button
        onClick={handleClick}
        className={`flex items-center justify-between w-full p-2 text-sm rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary font-semibold' : 'text-gray-600 hover:bg-gray-200'}`}
      >
        <div className="flex items-center gap-3">
          <Icon name={icon} />
          <span>{label}</span>
        </div>
        {hasSubmenu && <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
      </button>
      {hasSubmenu && isOpen && (
        <ul className="pl-6 mt-1 space-y-1">
          {children}
        </ul>
      )}
    </li>
  );
};

const SubNavItem: React.FC<{ label: string, onClick?: () => void, isActive?: boolean }> = ({ label, onClick, isActive }) => {
  return (
    <li>
      <button onClick={onClick} className={`w-full text-left p-2 text-xs rounded-md ${isActive ? 'text-primary font-semibold' : 'text-gray-500 hover:bg-gray-200'}`}>
        {label}
      </button>
    </li>
  );
};


const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block">
      <div className="h-20 flex items-center justify-center border-b">
        <div className="text-2xl font-serif font-bold text-primary">
            Admin
        </div>
      </div>
      <div className="p-4">
        <ul className="space-y-2">
          <NavItem icon="dashboard" label="Dashboard" />
          <NavItem icon="products" label="Products">
            <SubNavItem label="All Products" />
            <SubNavItem label="Add New Product" />
            <SubNavItem label="Categories" />
          </NavItem>
          <NavItem icon="orders" label="Orders" />
          <NavItem icon="customers" label="Customers" />
          <NavItem icon="content" label="Content">
             <SubNavItem label="Homepage" />
             <SubNavItem label="About Page" />
             <SubNavItem label="FAQ" />
          </NavItem>
          <NavItem icon="settings" label="Settings">
             <SubNavItem label="General" />
             <SubNavItem label="Shipping" />
             <SubNavItem label="Payment" />
             <SubNavItem label="Email Templates" />
          </NavItem>
           <NavItem icon="analytics" label="Analytics" />
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;