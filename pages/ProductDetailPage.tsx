import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Product, Review } from '../types';
import { useProductsContext } from '../context/ProductsContext';
import { CURRENCY_SYMBOL } from '../constants';
import { useCart } from '../context/CartContext';
import { useNotification } from '../context/NotificationContext';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductList from '../components/ProductList';
import ProductImageCarousel from '../components/ProductImageCarousel'; 
import StarRating from '../components/StarRating'; // Import StarRating

const ProductDetailPage: React.FC = () => {
  const { id } = ReactRouterDOM.useParams<{ id: string }>();
  const { products, isLoading: productsLoading, error: productsError, addReview, fetchProducts } = useProductsContext();
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Review form state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewFormError, setReviewFormError] = useState('');


  useEffect(() => {
    if (id && products.length > 0) {
      const foundProduct = products.find(p => p.id === id);
      setProduct(foundProduct || null);
      if (foundProduct) {
        setRelatedProducts(
          products.filter(p => p.category === foundProduct.category && p.id !== foundProduct.id).slice(0, 4)
        );
      }
    }
  }, [id, products]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (reviewRating === 0) {
        setReviewFormError("Por favor, selecione uma classificação.");
        return;
    }
    if (!reviewAuthor.trim()) {
        setReviewFormError("Por favor, insira o seu nome.");
        return;
    }
    if (!reviewComment.trim()) {
        setReviewFormError("Por favor, escreva um comentário.");
        return;
    }
    setReviewFormError('');
    setIsSubmittingReview(true);
    try {
      await addReview(product.id, { author: reviewAuthor, rating: reviewRating, comment: reviewComment });
      showNotification('Avaliação enviada com sucesso!', 'success');
      // Clear form
      setReviewAuthor('');
      setReviewRating(0);
      setReviewComment('');
      // Optionally refetch product or trust context update
      // await fetchProducts(); // If reviews don't update immediately
    } catch (error) {
      showNotification('Falha ao enviar avaliação.', 'error');
      console.error("Review submission error:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };


  if (productsLoading && !product) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner /></div>;
  if (productsError) return <p className="text-red-500 text-center py-10">{productsError}</p>;
  if (!product && !productsLoading) return <p className="text-textSecondary text-center py-10">Produto não encontrado.</p>;
  if (!product) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner /></div>; 

  const averageRating = product.reviews && product.reviews.length > 0
    ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
    : 0;
  const totalReviews = product.reviews ? product.reviews.length : 0;

  return (
    <div className="space-y-12">
      <div className="bg-surface p-6 md:p-8 rounded-lg shadow-lg">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <ProductImageCarousel imageUrls={product.imageUrls} altText={product.name} />
          </div>
          <div className="flex flex-col"> {/* Removed justify-center to allow natural flow */}
            <ReactRouterDOM.Link to={`/products/${product.category.toLowerCase()}`} className="text-sm text-primary hover:underline mb-1">{product.category}</ReactRouterDOM.Link>
            <h1 className="text-3xl lg:text-4xl font-bold text-textPrimary mb-2">{product.name}</h1>
            
            {totalReviews > 0 && (
              <div className="flex items-center mb-3">
                <StarRating rating={averageRating} size="md" />
                <span className="ml-2 text-textSecondary text-sm">({averageRating.toFixed(1)} de {totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'})</span>
              </div>
            )}

            <p className="text-textSecondary mb-4 text-base">{product.description}</p>
            <p className="text-4xl font-bold text-primary mb-6">
              {product.price.toLocaleString('pt-AO', { style: 'currency', currency: CURRENCY_SYMBOL })}
            </p>
            <div className="flex items-center space-x-4 mb-6">
              <label htmlFor="quantity" className="font-medium text-textPrimary">Quantidade:</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                max={product.stock > 0 ? product.stock : 1}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-20 p-2 border border-gray-300 rounded-md text-center focus:ring-primary focus:border-primary bg-white text-textPrimary placeholder-textSecondary"
                disabled={product.stock === 0}
              />
            </div>
            {product.stock > 0 ? (
                <>
                    <Button onClick={handleAddToCart} size="lg" className="bg-accent hover:bg-orange-600 text-white w-full md:w-auto" disabled={quantity <= 0}>
                        Adicionar ao Carrinho
                    </Button>
                    <p className="text-sm text-green-600 mt-2">Em stock: {product.stock} unidades</p>
                </>
            ) : (
                <p className="text-lg text-red-500 font-semibold">Esgotado</p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="bg-surface p-6 md:p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-textPrimary mb-6">Avaliações dos Clientes</h2>
        {totalReviews === 0 ? (
          <p className="text-textSecondary">Ainda não existem avaliações para este produto. Seja o primeiro a avaliar!</p>
        ) : (
          <div className="space-y-6 mb-8">
            {product.reviews?.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(review => (
              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-center mb-1">
                  <StarRating rating={review.rating} size="sm" />
                  <strong className="ml-3 text-textPrimary">{review.author}</strong>
                </div>
                <p className="text-xs text-textSecondary mb-2">{new Date(review.date).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-textSecondary text-sm">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Review Form */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-textPrimary mb-4">Deixe a sua Avaliação</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label htmlFor="reviewAuthor" className="block text-sm font-medium text-textSecondary mb-1">O seu nome</label>
              <input 
                type="text" 
                id="reviewAuthor" 
                value={reviewAuthor} 
                onChange={(e) => setReviewAuthor(e.target.value)}
                className="w-full max-w-md p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary placeholder-textSecondary"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-textSecondary mb-1">A sua classificação</label>
              <StarRating rating={reviewRating} onRatingChange={setReviewRating} size="md" interactive={true} />
            </div>
            <div>
              <label htmlFor="reviewComment" className="block text-sm font-medium text-textSecondary mb-1">O seu comentário</label>
              <textarea 
                id="reviewComment" 
                value={reviewComment} 
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary placeholder-textSecondary"
                required
              ></textarea>
            </div>
            {reviewFormError && <p className="text-red-500 text-sm">{reviewFormError}</p>}
            <Button type="submit" className="bg-primary text-white" isLoading={isSubmittingReview} disabled={isSubmittingReview}>
              {isSubmittingReview ? 'A Enviar...' : 'Enviar Avaliação'}
            </Button>
          </form>
        </div>
      </section>


      {relatedProducts.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-textPrimary mb-6">Produtos Relacionados</h2>
          <ProductList products={relatedProducts} />
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;