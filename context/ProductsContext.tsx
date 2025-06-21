import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Product, Review } from '../types';
import { supabase } from '../lib/supabaseClient';
import { useNotification } from './NotificationContext';

// Interface for product data coming from Supabase (matches table structure)
interface SupabaseProduct {
  id: string; // UUID
  created_at: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock_quantity: number;
}

// Type for data to insert/update (excluding auto-generated fields)
type ProductInput = Omit<SupabaseProduct, 'id' | 'created_at'>;

interface ProductsContextType {
  products: Product[]; // Frontend Product type
  isLoading: boolean;
  error: string | null;
  addProduct: (productData: ProductInput) => Promise<{ data: Product | null; error: any }>;
  updateProduct: (productId: string, productData: Partial<ProductInput>) => Promise<{ data: Product | null; error: any }>;
  deleteProduct: (productId: string) => Promise<{ error: any }>;
  fetchProducts: () => Promise<void>;
  addReview: (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => Promise<void>; // Keep mock for now
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

// Helper to convert Supabase product to frontend Product
const fromSupabaseProduct = (sp: SupabaseProduct): Product => ({
  id: sp.id,
  created_at: sp.created_at,
  name: sp.name,
  description: sp.description || '',
  price: sp.price,
  image_url: sp.image_url || undefined,
  imageUrls: sp.image_url ? [sp.image_url] : [], // Adapt if multiple images are handled differently
  category: sp.category || 'Uncategorized',
  stock_quantity: sp.stock_quantity,
  reviews: [], // Reviews will be handled separately or mocked
});


export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { showNotification } = useNotification();

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setProducts(data ? data.map(fromSupabaseProduct) : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching products.';
      setError(errorMessage);
      showNotification(`Error fetching products: ${errorMessage}`, 'error');
      console.error("Failed to fetch products:", err);
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (productData: ProductInput) => {
    setIsLoading(true);
    try {
      const { data, error: insertError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single(); // Assuming you want the inserted row back

      if (insertError) throw insertError;

      if (data) {
        const newProduct = fromSupabaseProduct(data as SupabaseProduct);
        setProducts(prevProducts => [newProduct, ...prevProducts]);
        showNotification('Product added successfully!', 'success');
        return { data: newProduct, error: null };
      }
      return { data: null, error: null }; // Should not happen if insertError is not thrown
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while adding product.';
      setError(errorMessage);
      showNotification(`Error adding product: ${errorMessage}`, 'error');
      console.error("Failed to add product:", err);
      return { data: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (productId: string, productData: Partial<ProductInput>) => {
    setIsLoading(true);
    try {
      const { data, error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId)
        .select()
        .single();

      if (updateError) throw updateError;

      if (data) {
        const updatedProduct = fromSupabaseProduct(data as SupabaseProduct);
        setProducts(prevProducts =>
          prevProducts.map(p => (p.id === productId ? updatedProduct : p))
        );
        showNotification('Product updated successfully!', 'success');
        return { data: updatedProduct, error: null };
      }
      return { data: null, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while updating product.';
      setError(errorMessage);
      showNotification(`Error updating product: ${errorMessage}`, 'error');
      console.error("Failed to update product:", err);
      return { data: null, error: err };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (deleteError) throw deleteError;

      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
      showNotification('Product deleted successfully!', 'success');
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while deleting product.';
      setError(errorMessage);
      showNotification(`Error deleting product: ${errorMessage}`, 'error');
      console.error("Failed to delete product:", err);
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Mock implementation for addReview - can be replaced with Supabase later
  const addReview = async (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    console.log("Adding review (mock)", productId, reviewData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const newReview: Review = {
      ...reviewData,
      id: self.crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId
          ? { ...p, reviews: [...(p.reviews || []), newReview] }
          : p
      )
    );
    showNotification('Review added (mock).', 'success');
  };
  
  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        addReview,
        fetchProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProductsContext = (): ProductsContextType => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProductsContext must be used within a ProductsProvider');
  }
  return context;
};