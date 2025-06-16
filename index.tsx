import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { CartProvider } from './context/CartContext';
import { ProductsProvider } from './context/ProductsContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext'; // Import AuthProvider

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider> {/* Add AuthProvider here */}
        <ProductsProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </ProductsProvider>
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>
);