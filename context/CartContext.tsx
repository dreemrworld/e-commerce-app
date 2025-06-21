import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Product, CartItem } from '../types';
import { useNotification } from './NotificationContext';
import { useAuth } from './AuthContext'; // To get user session
import { supabase } from '../lib/supabaseClient'; // Supabase client
import { useProductsContext } from './ProductsContext'; // To fetch product details

interface CartContextType {
  cartItems: CartItem[];
  isLoadingCart: boolean;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoadingCart, setIsLoadingCart] = useState<boolean>(true);
  const { showNotification } = useNotification();
  const { user, session } = useAuth(); // Use session to check auth state reliably
  const { products: allProducts, isLoading: isLoadingProducts } = useProductsContext(); // For fetching product details

  // Debounce function
  const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise(resolve => {
        if (timeout) {
          clearTimeout(timeout);
        }
        timeout = setTimeout(() => resolve(func(...args)), waitFor);
      });
  };

  // Debounced version of Supabase update
  const debouncedUpdateSupabaseCart = useCallback(
    debounce(async (userId: string, productId: string, quantity: number) => {
      if (quantity <= 0) { // Remove if quantity is 0 or less
        const { error } = await supabase
          .from('user_carts')
          .delete()
          .match({ user_id: userId, product_id: productId });
        if (error) console.error("Error removing item from Supabase cart:", error);
      } else { // Upsert (insert or update)
        const { error } = await supabase
          .from('user_carts')
          .upsert({ user_id: userId, product_id: productId, quantity }, { onConflict: 'user_id,product_id' });
        if (error) console.error("Error updating Supabase cart:", error);
      }
    }, 1000), // 1 second debounce
    []
  );

  const debouncedRemoveSupabaseCartItem = useCallback(
    debounce(async (userId: string, productId: string) => {
        const { error } = await supabase
          .from('user_carts')
          .delete()
          .match({ user_id: userId, product_id: productId });
        if (error) console.error("Error removing item from Supabase cart:", error);
    }, 500),
    []
  );

  const debouncedClearSupabaseCart = useCallback(
    debounce(async (userId: string) => {
        const { error } = await supabase
            .from('user_carts')
            .delete()
            .match({ user_id: userId });
        if (error) console.error("Error clearing Supabase cart:", error);
    }, 500),
    []
);


  // Load cart from localStorage or Supabase
  useEffect(() => {
    const loadCart = async () => {
      setIsLoadingCart(true);
      if (user && session) { // Check session for more reliable auth state
        // User is logged in, fetch from Supabase
        const { data: supabaseCartItems, error } = await supabase
          .from('user_carts')
          .select('product_id, quantity')
          .eq('user_id', user.id);

        if (error) {
          console.error("Error fetching Supabase cart:", error);
          showNotification("Erro ao carregar carrinho da nuvem.", "error");
          // Fallback to localStorage if Supabase fetch fails? Or clear local?
          const localData = localStorage.getItem('cartItems');
          setCartItems(localData ? JSON.parse(localData) : []);
        } else if (supabaseCartItems && allProducts.length > 0) {
          // Merge with localStorage cart if any, prefer Supabase for conflicts
          const localCartData = localStorage.getItem('cartItems');
          const localCart: CartItem[] = localCartData ? JSON.parse(localCartData) : [];

          const detailedSupabaseCart: CartItem[] = supabaseCartItems
            .map(item => {
              const productDetails = allProducts.find(p => p.id === item.product_id);
              return productDetails ? { ...productDetails, quantity: item.quantity } : null;
            })
            .filter((item): item is CartItem => item !== null);

          // Basic merge: Combine and then consolidate duplicates, preferring Supabase quantities
          const combinedCart = [...localCart, ...detailedSupabaseCart];
          const finalCart: CartItem[] = [];
          const productMap = new Map<string, CartItem>();

          for (const item of combinedCart) {
            const existing = productMap.get(item.id);
            if (existing) {
              // If item exists in both, prefer Supabase quantity if it's from there,
              // or sum if both are local/one is local one is Supabase.
              // For simplicity now, just take the latest one (Supabase items are added last)
              productMap.set(item.id, { ...item, quantity: Math.max(existing.quantity, item.quantity) });
            } else {
              productMap.set(item.id, item);
            }
          }

          productMap.forEach(item => finalCart.push(item));
          setCartItems(finalCart);

          // Sync merged cart back to Supabase (important for items from local storage)
          for (const item of finalCart) {
            await debouncedUpdateSupabaseCart(user.id, item.id, item.quantity);
          }
          localStorage.removeItem('cartItems'); // Clear local cart after migrating
        }
      } else {
        // User is not logged in, load from localStorage
        const localData = localStorage.getItem('cartItems');
        setCartItems(localData ? JSON.parse(localData) : []);
      }
      setIsLoadingCart(false);
    };

    if (!isLoadingProducts) { // Ensure allProducts are loaded before trying to map cart items
        loadCart();
    }
  }, [user, session, showNotification, allProducts, isLoadingProducts]); // Rerun on user/session change

  // Save cart to localStorage (if not logged in)
  useEffect(() => {
    if (!user && !isLoadingCart) { // Only save to localStorage if not logged in and cart is loaded
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }
  }, [cartItems, user, isLoadingCart]);

  const addToCart = async (product: Product, quantity: number) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      let newItems;
      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, product.stock_quantity);
        if (newQuantity > existingItem.quantity) {
          showNotification(`${product.name} adicionado ao carrinho!`, 'success');
        } else if (quantity > 0 && newQuantity === existingItem.quantity && existingItem.quantity === product.stock_quantity) {
          showNotification(`Quantidade máxima de ${product.name} (${product.stock_quantity}) já está no carrinho.`, 'info');
        }
        newItems = prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      } else {
        showNotification(`${product.name} adicionado ao carrinho!`, 'success');
        newItems = [...prevItems, { ...product, quantity: Math.min(quantity, product.stock_quantity) }];
      }

      if (user && session) {
        const itemInCart = newItems.find(item => item.id === product.id);
        if (itemInCart) {
            debouncedUpdateSupabaseCart(user.id, product.id, itemInCart.quantity);
        }
      }
      return newItems;
    });
  };

  const removeFromCart = async (productId: string) => {
    const itemToRemove = cartItems.find(item => item.id === productId);
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    if (itemToRemove) {
      showNotification(`${itemToRemove.name} removido do carrinho.`, 'info');
      if (user && session) {
        debouncedRemoveSupabaseCartItem(user.id, productId);
      }
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === productId ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock_quantity)) } : item
      );
      if (user && session) {
        const updatedItem = newItems.find(item => item.id === productId);
        if (updatedItem) {
            debouncedUpdateSupabaseCart(user.id, productId, updatedItem.quantity);
        }
      }
      return newItems;
    });
  };

  const clearCart = async () => {
    setCartItems([]);
    showNotification('Carrinho esvaziado.', 'info');
    if (user && session) {
      debouncedClearSupabaseCart(user.id);
    }
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
        isLoadingCart,
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