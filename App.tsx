import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
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
import DashboardPage from './pages/DashboardPage';
import { ROUTES } from './constants';


// Este é o componente principal da sua aplicação, o App.tsx.
// Ele funciona como o centro de controle que organiza tudo.
const App: React.FC = () => {
  return (
    // 1. Providers: Envolvemos a aplicação com todos os "provedores de contexto".
    //    - LanguageProvider: Gerencia o idioma.
    //    - AuthProvider: NOVO! Gerencia o estado de autenticação do usuário.
    //    - ToastProvider: Gerencia as notificações.
    //    - CartProvider: Gerencia o carrinho de compras.
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            {/* 2. HashRouter: Gerencia a navegação entre as páginas. */}
            <HashRouter>
              <div className="flex flex-col min-h-screen font-body bg-background text-text-primary">
                <Toaster />
                <Header />
                <main className="flex-grow">
                  {/* 3. Routes: Define qual componente de página deve ser mostrado com base na URL. */}
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
                    
                    {/* Rotas Protegidas (exigem login) */}
                    <Route 
                      path={ROUTES.CHECKOUT} 
                      element={
                        <ProtectedRoute>
                          <CheckoutPage />
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path={ROUTES.DASHBOARD} 
                      element={
                        <ProtectedRoute>
                          <DashboardPage />
                        </ProtectedRoute>
                      } 
                    />

                    {/* Rota para página não encontrada */}
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </HashRouter>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;