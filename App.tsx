import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CheckoutPage from './pages/CheckoutPage';
import NotFoundPage from './pages/NotFoundPage';
import Toaster from './components/ui/Toaster';
import ProtectedRoute from './components/ProtectedRoute';
import { ROUTES } from './constants';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardOverviewPage from './pages/dashboard/DashboardOverviewPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import OrdersPage from './pages/dashboard/OrdersPage';
import AddressesPage from './pages/dashboard/AddressesPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import WishlistPage from './pages/dashboard/WishlistPage';
import OrderDetailPage from './pages/dashboard/OrderDetailPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ProductManagementPage from './pages/admin/ProductManagementPage';
import OrderManagementPage from './pages/admin/OrderManagementPage';
import ProductEditPage from './pages/admin/ProductEditPage';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <HashRouter>
              <div className="flex flex-col min-h-screen font-body bg-background text-text-primary">
                <Toaster />
                <Routes>
                  {/* Rotas de Autenticação (sem Header/Footer) */}
                  <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                  <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                  <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

                  {/* Rotas do Painel de Administração (sem Header/Footer) */}
                  <Route
                    path="/admin/*"
                    element={
                      <AdminRoute>
                        <Routes>
                          <Route element={<AdminLayout />}>
                              <Route index element={<AdminDashboardPage />} />
                              <Route path="products" element={<ProductManagementPage />} />
                              <Route path="products/new" element={<ProductEditPage />} />
                              <Route path="products/edit/:productId" element={<ProductEditPage />} />
                              <Route path="orders" element={<OrderManagementPage />} />
                          </Route>
                        </Routes>
                      </AdminRoute>
                    }
                  />

                  {/* Rotas Públicas e do Cliente (com Header/Footer) */}
                  <Route 
                    path="/*"
                    element={
                      <>
                        <Header />
                        <main className="flex-grow">
                          <Routes>
                              <Route path={ROUTES.HOME} element={<HomePage />} />
                              <Route path={ROUTES.CATALOG} element={<CatalogPage />} />
                              <Route path={`${ROUTES.PRODUCT}/:slug`} element={<ProductDetailPage />} />
                              <Route path={ROUTES.CART} element={<CartPage />} />
                              <Route path={ROUTES.ABOUT} element={<AboutPage />} />
                              <Route path={ROUTES.CONTACT} element={<ContactPage />} />
                              
                              <Route 
                                path={ROUTES.CHECKOUT} 
                                element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} 
                              />
                              <Route 
                                path={`${ROUTES.ORDER_CONFIRMATION}/:orderId`}
                                element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>}
                              />
                              
                              <Route path={ROUTES.DASHBOARD} element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                                  <Route index element={<DashboardOverviewPage />} /> 
                                  <Route path="profile" element={<ProfilePage />} />
                                  <Route path="orders" element={<OrdersPage />} />
                                  <Route path="orders/:orderId" element={<OrderDetailPage />} />
                                  <Route path="addresses" element={<AddressesPage />} />
                                  <Route path="settings" element={<SettingsPage />} />
                                  <Route path="wishlist" element={<WishlistPage />} />
                              </Route>
                              
                              <Route path="*" element={<NotFoundPage />} />
                          </Routes>
                        </main>
                        <Footer />
                      </>
                    }
                  />
                </Routes>
              </div>
            </HashRouter>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;