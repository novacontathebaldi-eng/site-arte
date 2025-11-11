import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  Settings, 
  BarChart3,
  LogOut,
  Shield,
  Bell
} from 'lucide-react';

export default function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Pedidos', href: '/pedidos', icon: ShoppingBag },
    { name: 'Produtos', href: '/produtos', icon: Package },
    { name: 'Usuários', href: '/usuarios', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Configurações', href: '/configuracoes', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-secondary" />
            <div>
              <h1 className="text-lg font-bold">Painel Admin</h1>
              <p className="text-xs text-gray-400">Controle Total</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-secondary text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-400">Administrador</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="bg-surface border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">
                Bem-vindo, Admin
              </h2>
              <p className="text-sm text-text-secondary">
                Gerencie sua galeria de arte
              </p>
            </div>
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
