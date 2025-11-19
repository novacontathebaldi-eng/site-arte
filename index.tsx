import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './contexts/I18nContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/common/Toast';
import ErrorBoundary from './components/common/ErrorBoundary';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <I18nProvider>
        <ToastProvider>
          <AuthProvider>
            <App />
            <ToastContainer />
          </AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </ErrorBoundary>
  </React.StrictMode>
);