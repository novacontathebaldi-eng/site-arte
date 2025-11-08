import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import DashboardPage from './pages/DashboardPage';
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
import DashboardOrdersPage from './pages/dashboard/DashboardOrdersPage';
import DashboardAddressesPage from './pages/dashboard/DashboardAddressesPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import ShippingReturnsPage from './pages/ShippingReturnsPage';
import DashboardWishlistPage from './pages/dashboard/DashboardWishlistPage';
import DashboardOrderDetailPage from './pages/dashboard/DashboardOrderDetailPage';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <HashRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Toaster position="bottom-center" reverseOrder={false} />
              <div className="flex flex-col min-h-screen bg-white text-text-primary font-sans">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Static Pages */}
                    <Route path="/privacy" element={<PrivacyPolicyPage />} />
                    <Route path="/terms" element={<TermsOfServicePage />} />
                    <Route path="/shipping" element={<ShippingReturnsPage />} />

                    {/* Protected Routes */}
                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                    <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
                    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}>
                      <Route index element={<DashboardHomePage />} />
                      <Route path="orders" element={<DashboardOrdersPage />} />
                      <Route path="orders/:orderId" element={<DashboardOrderDetailPage />} />
                      <Route path="addresses" element={<DashboardAddressesPage />} />
                      <Route path="wishlist" element={<DashboardWishlistPage />} />
                    </Route>

                  </Routes>
                </main>
                <Footer />
                <Chatbot />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;