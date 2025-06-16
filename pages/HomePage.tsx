
import React, { useEffect, useState } from 'react';
import HeroSection from '../components/HeroSection';
import ProductList from '../components/ProductList';
import { Product } from '../types';
import { useProductsContext } from '../context/ProductsContext';
import { FEATURED_PRODUCT_IDS, CATEGORIES } from '../constants';
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../components/Button';

// Helper function to get an icon for each category
const getCategoryIcon = (categoryName: string): React.ReactNode => {
  switch (categoryName.toLowerCase()) {
    case 'smartphones': return <span className="text-4xl mb-2" role="img" aria-label="Smartphone">📱</span>;
    case 'laptops': return <span className="text-4xl mb-2" role="img" aria-label="Laptop">💻</span>;
    case 'audio': return <span className="text-4xl mb-2" role="img" aria-label="Audio">🎧</span>;
    case 'tvs': return <span className="text-4xl mb-2" role="img" aria-label="TV">📺</span>;
    case 'acessórios': return <span className="text-4xl mb-2" role="img" aria-label="Accessory">🔌</span>;
    case 'cuidados pessoais': return <span className="text-4xl mb-2" role="img" aria-label="Personal Care">🧴</span>;
    default: return <span className="text-4xl mb-2" role="img" aria-label="Category">🛍️</span>;
  }
};

const HomePage: React.FC = () => {
  const { products, isLoading, error } = useProductsContext();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivalsProducts, setNewArrivalsProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (products.length > 0) {
      setFeaturedProducts(
        products.filter(p => FEATURED_PRODUCT_IDS.includes(p.id)).slice(0, 4) // Limit to 4 featured
      );

      // Simple logic for "New Arrivals": take first 4 products not featured
      // In a real app, this would be based on creation date or a specific flag
      const nonFeaturedProducts = products.filter(p => !FEATURED_PRODUCT_IDS.includes(p.id));
      setNewArrivalsProducts(nonFeaturedProducts.slice(0, 4)); // Show first 4 "new"
    }
  }, [products]);

  return (
    <div>
      <HeroSection />
      
      <section className="py-12">
        <h2 className="text-3xl font-bold text-textPrimary text-center mb-8">Produtos em Destaque</h2>
        <ProductList products={featuredProducts} isLoading={isLoading && featuredProducts.length === 0} error={error} />
      </section>

      {newArrivalsProducts.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-textPrimary text-center mb-8">Novidades</h2>
            <ProductList products={newArrivalsProducts} isLoading={isLoading && newArrivalsProducts.length === 0} />
          </div>
        </section>
      )}

      <section className="py-12 bg-surface rounded-lg my-0 md:my-12"> {/* Changed from bg-background to bg-surface for better contrast if background is very light */}
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-textPrimary mb-4">Explore as Nossas Categorias</h2>
          <p className="text-textSecondary mb-10 max-w-xl mx-auto">Encontre exatamente o que procura navegando pelas nossas diversas categorias de produtos eletrónicos.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 mb-10">
            {CATEGORIES.map(category => (
              <ReactRouterDOM.Link 
                key={category} 
                to={`/products/${encodeURIComponent(category.toLowerCase())}`} 
                className="flex flex-col items-center justify-center p-4 sm:p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 aspect-square border hover:border-primary" // bg-surface (white), added border
              >
                {getCategoryIcon(category)}
                <h3 className="text-md sm:text-lg font-semibold text-primary text-center">{category}</h3>
              </ReactRouterDOM.Link>
            ))}
          </div>
          <ReactRouterDOM.Link to="/products">
            <Button variant="secondary" size="lg">Ver Todos os Produtos</Button>
          </ReactRouterDOM.Link>
        </div>
      </section>

      <section className="py-12">
          <div className="container mx-auto px-4">
              <div className="bg-secondary text-white p-10 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between">
                  <div>
                      <h2 className="text-3xl font-bold mb-3">Confiança e Conveniência</h2>
                      <p className="text-lg mb-6 md:mb-0 max-w-2xl">Compre com segurança e receba os seus produtos em casa. Oferecemos as melhores opções de pagamento locais.</p>
                  </div>
                  <ReactRouterDOM.Link to="/checkout">
                     <Button size="lg" className="bg-accent hover:bg-yellow-500 text-textPrimary whitespace-nowrap mt-6 md:mt-0">
                        Formas de Pagamento
                     </Button>
                  </ReactRouterDOM.Link>
              </div>
          </div>
      </section>

    </div>
  );
};

export default HomePage;