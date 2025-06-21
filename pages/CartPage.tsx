
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItemCard from '../components/CartItemCard';
import { CURRENCY_SYMBOL } from '../constants';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner'; // Import LoadingSpinner

const CartPage: React.FC = () => {
  const { cartItems, getTotalPrice, isLoadingCart } = useCart(); // Add isLoadingCart
  const navigate = ReactRouterDOM.useNavigate();

  if (isLoadingCart) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <LoadingSpinner />
        <p className="ml-2 text-textSecondary">A carregar carrinho...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20 bg-surface rounded-lg shadow-md">
        <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
        <h2 className="text-2xl font-semibold text-textPrimary mb-3">O seu carrinho está vazio.</h2>
        <p className="text-textSecondary mb-6">Parece que ainda não adicionou nada ao seu carrinho.</p>
        <ReactRouterDOM.Link to="/products">
          <Button className="bg-primary hover:bg-secondary text-white">
            Começar a Comprar
          </Button>
        </ReactRouterDOM.Link>
      </div>
    );
  }

  const totalPrice = getTotalPrice();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-textPrimary mb-8">O Seu Carrinho de Compras</h1>
      <div className="space-y-4 mb-8">
        {cartItems.map(item => (
          <CartItemCard key={item.id} item={item} />
        ))}
      </div>
      <div className="bg-surface p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl text-textSecondary">Subtotal:</span>
          <span className="text-xl font-semibold text-textPrimary">
            {totalPrice.toLocaleString('pt-AO', { style: 'currency', currency: CURRENCY_SYMBOL })}
          </span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-xl font-bold text-textPrimary">Total:</span>
          <span className="text-2xl font-bold text-primary">
            {totalPrice.toLocaleString('pt-AO', { style: 'currency', currency: CURRENCY_SYMBOL })}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <ReactRouterDOM.Link to="/products">
            <Button variant="ghost" className="w-full sm:w-auto">Continuar a Comprar</Button>
          </ReactRouterDOM.Link>
          <Button onClick={() => navigate('/checkout')} size="lg" className="w-full sm:w-auto bg-accent hover:bg-orange-600 text-white">
            Finalizar Compra
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;