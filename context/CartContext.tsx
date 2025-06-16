
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '../types';
import { useNotification } from './NotificationContext'; // New Import

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const localData = localStorage.getItem('cartItems');
    return localData ? JSON.parse(localData) : [];
  });
  const { showNotification } = useNotification(); // New hook usage

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, product.stock);
        if (newQuantity > existingItem.quantity) { // Only show notification if quantity actually increased
            showNotification(`${product.name} adicionado ao carrinho!`, 'success');
        } else if (quantity > 0 && newQuantity === existingItem.quantity && existingItem.quantity === product.stock) {
            showNotification(`Quantidade máxima de ${product.name} (${product.stock}) já está no carrinho.`, 'info');
        }
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity } 
            : item
        );
      }
      showNotification(`${product.name} adicionado ao carrinho!`, 'success');
      return [...prevItems, { ...product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const removeFromCart = (productId: string) => {
    const itemToRemove = cartItems.find(item => item.id === productId);
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    if (itemToRemove) {
        showNotification(`${itemToRemove.name} removido do carrinho.`, 'info');
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item 
      )
    );
    // Notification for quantity update can be added if desired, but might be noisy.
  };

  const clearCart = () => {
    setCartItems([]);
    showNotification('Carrinho esvaziado.', 'info');
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};