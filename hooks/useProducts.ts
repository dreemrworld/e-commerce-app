import { useProductsContext } from '../context/ProductsContext';

/**
 * Custom hook to access product data and operations.
 * This hook simplifies the usage of ProductsContext in components.
 */
export const useProducts = () => {
  const context = useProductsContext();
  // You can add more derived state or convenience functions here if needed.
  // For example, finding a product by ID:
  // const getProductById = (id: string) => context.products.find(p => p.id === id);

  return {
    ...context,
    // getProductById, // Uncomment if you add such a function
  };
};
