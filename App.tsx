
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
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
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import { ROUTES } from './constants';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import DashboardOverviewPage from './pages/dashboard/DashboardOverviewPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import OrdersPage from './pages/dashboard/OrdersPage';
import AddressesPage from './pages/dashboard/AddressesPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import WishlistPage from './pages/dashboard/WishlistPage';
import OrderDetailPage from './pages/dashboard/OrderDetailPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <BrowserRouter>
              <div className="flex flex-col min-h-screen font-body bg-background text-text-primary">
                <Toaster />
                <Header />
                <main className="flex-grow">
                  <Routes>
                    {/* Rotas Públicas */}
                    <Route path={ROUTES.HOME} element={<HomePage />} />
                    <Route path={ROUTES.CATALOG} element={<CatalogPage />} />
                    <Route path={`${ROUTES.PRODUCT}/:slug`} element={<ProductDetailPage />} />
                    <Route path={ROUTES.CART} element={<CartPage />} />
                    <Route path={ROUTES.ABOUT} element={<AboutPage />} />
                    <Route path={ROUTES.CONTACT} element={<ContactPage />} />
                    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                    <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
                    <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
                    
                    {/* Rotas Protegidas */}
                    <Route 
                      path={ROUTES.CHECKOUT} 
                      element={
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      } 
                    />

                    <Route 
                      path={`${ROUTES.ORDER_CONFIRMATION}/:orderId`}
                      element={
                        <ProtectedRoute>
                          <OrderConfirmationPage />
                        </ProtectedRoute>
                      }
                    />
                    
                    {/* Layout do Dashboard com rotas aninhadas */}
                    <Route 
                      path={ROUTES.DASHBOARD}
                      element={
                        <ProtectedRoute>
                          <DashboardLayout />
                        </ProtectedRoute>
                      }
                    >
                        {/* A rota "index" é a página padrão do dashboard */}
                        <Route index element={<DashboardOverviewPage />} /> 
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="orders" element={<OrdersPage />} />
                        <Route path="orders/:orderId" element={<OrderDetailPage />} />
                        <Route path="addresses" element={<AddressesPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="wishlist" element={<WishlistPage />} />
                    </Route>

                    {/* Rota para página não encontrada */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </BrowserRouter>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
