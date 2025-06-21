

import React from 'react';
import { CartItem } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { useCart } from '../context/CartContext';
import * as ReactRouterDOM from 'react-router-dom';

interface CartItemCardProps {
  item: CartItem;
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(item.id, newQuantity);
    }
  };

  // Use item.image_url (from Supabase) first, then fallback to item.imageUrls[0] (local/mock)
  const imageUrl = item.image_url || (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : undefined);


  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-surface rounded-md shadow-sm mb-4">
      <div className="flex items-center space-x-4">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={item.name} 
            className="w-20 h-20 object-cover rounded"
          />
        ) : (
          <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-textSecondary text-xs">Sem img</span>
          </div>
        )}
        <div>
          <ReactRouterDOM.Link to={`/product/${item.id}`} className="text-lg font-semibold text-textPrimary hover:text-primary">{item.name}</ReactRouterDOM.Link>
          <p className="text-sm text-textSecondary">{item.category}</p>
          <p className="text-md font-medium text-primary">
            {item.price.toLocaleString('pt-AO', { style: 'currency', currency: CURRENCY_SYMBOL })}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center border border-gray-300 rounded">
          <button 
            onClick={() => handleQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="px-3 py-1 text-textPrimary hover:bg-gray-100 disabled:opacity-50"
          >
            -
          </button>
          <span className="px-3 py-1 text-textPrimary">{item.quantity}</span>
          <button 
            onClick={() => handleQuantityChange(item.quantity + 1)}
            className="px-3 py-1 text-textPrimary hover:bg-gray-100"
          >
            +
          </button>
        </div>
        <p className="text-md font-semibold text-textPrimary w-28 text-right">
          {(item.price * item.quantity).toLocaleString('pt-AO', { style: 'currency', currency: CURRENCY_SYMBOL })}
        </p>
        <button 
          onClick={() => removeFromCart(item.id)}
          className="text-red-500 hover:text-red-700"
          title="Remover do carrinho"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default CartItemCard;