import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import ProductList from '../components/ProductList';
import CategorySidebar from '../components/CategorySidebar';
import { useProductsContext } from '../context/ProductsContext'; // Updated import
import LoadingSpinner from '../components/LoadingSpinner';

const ProductsPage: React.FC = () => {
  const { products, isLoading, error } = useProductsContext(); // Updated hook usage
  const { category: categoryParam } = ReactRouterDOM.useParams<{ category?: string }>();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    let prods = products;
    if (categoryParam) {
      prods = prods.filter(p => p.category.toLowerCase() === categoryParam.toLowerCase());
    }
    if (searchTerm) {
      prods = prods.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    return prods;
  }, [products, categoryParam, searchTerm]);

  const pageTitle = categoryParam && products.length > 0
    ? products.find(p => p.category.toLowerCase() === categoryParam.toLowerCase())?.category || 'Produtos'
    : 'Todos os Produtos';

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <CategorySidebar />
      <div className="flex-1">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold text-textPrimary">{pageTitle}</h1>
            <input 
                type="text"
                placeholder="Pesquisar nesta categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent w-full sm:w-auto bg-white text-textPrimary placeholder-textSecondary"
            />
        </div>
        {isLoading && <div className="flex justify-center py-10"><LoadingSpinner /></div>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!isLoading && !error && <ProductList products={filteredProducts} />}
      </div>
    </div>
  );
};

export default ProductsPage;