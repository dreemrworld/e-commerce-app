
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CartIcon: React.FC = () => {
  const { cartItems } = useCart();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <ReactRouterDOM.Link to="/cart" className="relative text-textPrimary hover:text-primary transition-colors">
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
      </svg>
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-accent text-textPrimary text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {totalItems}
        </span>
      )}
    </ReactRouterDOM.Link>
  );
};

export default CartIcon;