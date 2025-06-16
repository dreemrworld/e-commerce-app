
import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Product, Review } from '../types'; // Added Review
import { MOCK_PRODUCTS } from '../constants'; 
// import { API_BASE_URL } from '../constants'; // For future API integration

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  addProduct: (productData: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (productId: string, productData: Partial<Omit<Product, 'id' | 'reviews'>>) => Promise<void>; // Allow updating reviews
  deleteProduct: (productId: string) => Promise<void>;
  addReview: (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => Promise<void>; // New function
  fetchProducts: () => Promise<void>; 
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 500)); 
      // Initialize reviews array if not present
      const productsWithReviews = MOCK_PRODUCTS.map(p => ({ ...p, reviews: p.reviews || [] }));
      setProducts([...productsWithReviews]); 
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while fetching products.';
      setError(errorMessage);
      console.error("Failed to fetch products:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (productData: Omit<Product, 'id'>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const newProduct: Product = {
        ...productData,
        id: self.crypto.randomUUID(), 
        reviews: [], // Initialize with empty reviews
      };
      setProducts(prevProducts => [...prevProducts, newProduct]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while adding product.';
      setError(errorMessage);
      console.error("Failed to add product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (productId: string, productData: Partial<Omit<Product, 'id'>>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts(prevProducts =>
        prevProducts.map(p => (p.id === productId ? { ...p, ...productData } : p))
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while updating product.';
      setError(errorMessage);
      console.error("Failed to update product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while deleting product.';
      setError(errorMessage);
      console.error("Failed to delete product:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const addReview = async (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    setIsLoading(true); // Simulate async operation for review submission
    try {
      await new Promise(resolve => setTimeout(resolve, 700)); // Slightly longer delay for "processing"
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
    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred while adding review.';
       setError(errorMessage); // You might want a specific error state for reviews
       console.error("Failed to add review:", err);
    } finally {
      setIsLoading(false);
    }
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
        addReview, // Expose new function
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