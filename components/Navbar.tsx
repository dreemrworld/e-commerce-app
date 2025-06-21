import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import CartIcon from './CartIcon';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = ReactRouterDOM.useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/'); // Redirect to home after logout
  };

  // Function to get a display name for the user
  const getUserDisplayName = () => {
    if (user?.email) {
      return user.email.split('@')[0]; // Show part of email before @
    }
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    return 'Utilizador'; // Default if no other info is available
  };

  return (
    <nav className="bg-surface shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <ReactRouterDOM.Link to="/" className="text-2xl font-bold text-primary">
          AngoTech
        </ReactRouterDOM.Link>
        <div className="hidden md:flex space-x-6 items-center">
          <ReactRouterDOM.Link to="/products" className="text-textPrimary hover:text-primary transition-colors">Produtos</ReactRouterDOM.Link>
          {isAuthenticated && ( // Example: Show admin link if user is authenticated. Add role checks if needed.
             <ReactRouterDOM.Link to="/admin/products" className="text-textPrimary hover:text-primary transition-colors">Gerir Produtos</ReactRouterDOM.Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <CartIcon />
          {isAuthenticated && (
            <ReactRouterDOM.Link to="/orders" className="text-textPrimary hover:text-primary transition-colors text-sm" title="Meus Pedidos">
              <svg className="w-7 h-7 inline md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
              <span className="hidden md:inline">Meus Pedidos</span>
            </ReactRouterDOM.Link>
          )}
          
          {isAuthenticated ? (
            <>
              <ReactRouterDOM.Link to="/profile" className="text-sm text-textSecondary hidden sm:inline hover:text-primary" title="Meu Perfil">
                Olá, {getUserDisplayName()}!
              </ReactRouterDOM.Link>
              <Button onClick={handleLogout} variant="ghost" size="sm">Logout</Button>
            </>
          ) : (
            <ReactRouterDOM.Link to="/login">
                <Button variant="primary" size="sm">Login / Criar Conta</Button>
            </ReactRouterDOM.Link>
          )}
           {/* Profile icon is now part of the "Olá, {user}!" link or login button */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;