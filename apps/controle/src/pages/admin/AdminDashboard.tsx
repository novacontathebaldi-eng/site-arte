import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '@shared/lib/firebase';
import { ShoppingBag, Package, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Order } from '@shared/types';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    totalRevenue: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [ordersSnap, productsSnap, usersSnap] = await Promise.all([
          getDocs(collection(firestore, 'orders')),
          getDocs(collection(firestore, 'products')),
          getDocs(collection(firestore, 'users'))
        ]);

        let revenue = 0;
        let pending = 0;

        ordersSnap.forEach((doc) => {
          const order = doc.data() as Order;
          if (order.status === 'delivered') { // Revenue from completed orders
            revenue += order.totals.totalCents / 100;
          }
          if (order.status === 'processing' || order.status === 'paid') {
            pending++;
          }
        });

        setStats({
          totalOrders: ordersSnap.size,
          totalProducts: productsSnap.size,
          totalUsers: usersSnap.size,
          totalRevenue: revenue,
          pendingOrders: pending
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const statCards = [
    { 
      name: 'Total de Pedidos', 
      value: stats.totalOrders, 
      icon: ShoppingBag, 
      color: 'bg-blue-500'
    },
    { 
      name: 'Produtos', 
      value: stats.totalProducts, 
      icon: Package, 
      color: 'bg-green-500'
    },
    { 
      name: 'Usuários', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'bg-purple-500'
    },
    { 
      name: 'Receita Total', 
      value: `€${stats.totalRevenue.toFixed(2).replace('.', ',')}`, 
      icon: DollarSign, 
      color: 'bg-yellow-500'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="bg-surface rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-text-secondary text-sm font-medium mb-1">{stat.name}</h3>
            <p className="text-3xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Alertas */}
      {stats.pendingOrders > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
            <div>
              <h3 className="font-semibold text-yellow-900 text-lg">
                {stats.pendingOrders} pedido(s) pendente(s)
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Existem pedidos aguardando processamento.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder para gráficos futuros */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Vendas Recentes</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>Gráfico de vendas será implementado aqui (Recharts)</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">Produtos Populares</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <p>Lista de produtos mais vendidos será implementada aqui</p>
          </div>
        </div>
      </div>
    </div>
  );
}
