import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider } from './context/AdminAuthContext';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />

          {/* FIX: Use layout route for protected routes */}
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/" element={<AdminLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="pedidos" element={<AdminOrdersPage />} />
              <Route path="produtos" element={<AdminProductsPage />} />
              <Route path="usuarios" element={<AdminUsersPage />} />
              <Route path="configuracoes" element={<AdminSettingsPage />} />
              <Route path="analytics" element={<AdminAnalyticsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

export default App;
