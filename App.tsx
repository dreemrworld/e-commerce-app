import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage'; // Import LoginPage
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import ToastNotification from './components/ToastNotification';

const App: React.FC = () => {
  return (
    <ReactRouterDOM.HashRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <ToastNotification />
          <ReactRouterDOM.Routes>
            <ReactRouterDOM.Route path="/" element={<ProductsPage />} />
            <ReactRouterDOM.Route path="/products" element={<ProductsPage />} />
            <ReactRouterDOM.Route path="/products/:category" element={<ProductsPage />} />
            <ReactRouterDOM.Route path="/product/:id" element={<ProductDetailPage />} />
            <ReactRouterDOM.Route path="/cart" element={<CartPage />} />
            <ReactRouterDOM.Route path="/login" element={<LoginPage />} /> {/* Add Login Page Route */}
            
            <ReactRouterDOM.Route 
              path="/checkout" 
              element={<CheckoutPage />}
            />
            <ReactRouterDOM.Route path="/confirmation" element={<OrderConfirmationPage />} />
            <ReactRouterDOM.Route path="/orders" element={<OrdersPage />} />
            
            <ReactRouterDOM.Route 
              path="/admin/products" 
              element={
                <ProtectedRoute>
                  <AdminProductsPage />
                </ProtectedRoute>
              } 
            />
            <ReactRouterDOM.Route 
              path="/profile" 
              element={<ProfilePage />} 
            />

            <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/" />} />
          </ReactRouterDOM.Routes>
        </main>
        <Footer />
      </div>
    </ReactRouterDOM.HashRouter>
  );
};

export default App;