
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Product } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { useCart } from '../context/CartContext';
import Button from './Button';
import StarRating from './StarRating'; // Import StarRating

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
  };
  
  const imageUrl = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls[0] 
    : undefined;

  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;

  return (
    <div className="bg-surface rounded-lg shadow-md overflow-hidden flex flex-col transition-all hover:shadow-xl hover:-translate-y-0.5">
      <ReactRouterDOM.Link to={`/product/${product.id}`} className="block relative group">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.name} 
            className="w-full h-60 object-cover" // Increased height
          />
        ) : (
          <div className="w-full h-60 bg-gray-200 flex items-center justify-center">
            <span className="text-textSecondary text-sm">Sem imagem</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-black bg-opacity-40"> {/* Softer overlay */}
          <p className="text-white text-base font-semibold text-right"> {/* Smaller price */}
            {product.price.toLocaleString('pt-AO', { style: 'currency', currency: CURRENCY_SYMBOL, minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
      </ReactRouterDOM.Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <ReactRouterDOM.Link to={`/product/${product.id}`} className="block mb-auto">
          <h3 className="text-md font-semibold text-textPrimary mb-1 truncate" title={product.name}>{product.name}</h3>
          <p className="text-xs text-textSecondary mb-1">{product.category}</p> 
           {product.reviews && product.reviews.length > 0 && (
            <div className="flex items-center mb-2">
              <StarRating rating={averageRating} size="sm" />
              <span className="text-xs text-textSecondary ml-1.5">({product.reviews.length})</span>
            </div>
          )}
        </ReactRouterDOM.Link>
        
        {product.stock > 0 ? (
          <Button 
            onClick={handleAddToCart} 
            variant="secondary" // Use secondary variant for light gray button
            className="w-full mt-3 py-2.5" // Ensure padding is consistent
          >
            Adicionar ao Carrinho
          </Button>
        ) : (
          <p className="text-sm text-red-500 font-semibold mt-3 text-center py-2.5">Esgotado</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;