import React, { useState } from 'react';
import { useProducts } from '../../hooks/useProducts'; // Updated to useProducts hook
import { Product } from '../../types';
import { CURRENCY_SYMBOL } from '../../constants';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ProductForm from '../../components/admin/ProductForm';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useNotification } from '../../context/NotificationContext';

// Matches the ProductInput type in ProductsContext
type ProductFormData = Omit<Product, 'id' | 'created_at' | 'reviews' | 'imageUrls'> & { image_url?: string };


const AdminProductsPage: React.FC = () => {
  const { products, isLoading, error, addProduct, updateProduct, deleteProduct, fetchProducts } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const { showNotification } = useNotification();


  const openModalForNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = async (formData: ProductFormData) => {
    setIsSaving(true);
    try {
      let operationError;
      if (editingProduct && editingProduct.id) {
        // When updating, ensure only fields present in ProductInput are passed
        const { name, description, price, category, stock_quantity, image_url } = formData;
        const updateData: Partial<ProductFormData> = { name, description, price, category, stock_quantity, image_url };

        const result = await updateProduct(editingProduct.id, updateData);
        operationError = result.error;
      } else {
        const result = await addProduct(formData);
        operationError = result.error;
      }

      if (!operationError) {
        closeModal();
        // fetchProducts(); // Re-fetch to ensure data consistency (optional, context might update optimistically)
      } else {
         showNotification(operationError.message || 'Failed to save product', 'error');
      }
    } catch (e: any) {
      console.error("Failed to save product", e);
      showNotification(e.message || 'An unexpected error occurred.', 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      setIsSaving(true); 
      try {
        const { error: deleteError } = await deleteProduct(productToDelete.id);
        if (deleteError) {
          showNotification(deleteError.message || 'Failed to delete product', 'error');
        }
      } catch(e: any) {
        console.error("Failed to delete product", e);
        showNotification(e.message || 'An unexpected error occurred.', 'error');
      } finally {
        setIsSaving(false);
        setShowDeleteConfirm(false);
        setProductToDelete(null);
        // fetchProducts(); // Re-fetch or rely on optimistic update from context
      }
    }
  };


  if (isLoading && products.length === 0) { 
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  if (error && products.length === 0) { // Only show full page error if no products are displayed
    return <p className="text-red-500 text-center py-10">Erro ao carregar produtos: {error}</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-textPrimary">Gerir Produtos</h1>
        <Button onClick={openModalForNew} className="bg-primary hover:bg-blue-700 text-white">
          Adicionar Novo Produto
        </Button>
      </div>
      {error && <p className="text-red-500 text-center pb-4">Atenção: {error}. Alguns dados podem estar desatualizados.</p>}

      {products.length === 0 && !isLoading ? (
        <p className="text-textSecondary text-center">Nenhum produto encontrado.</p>
      ) : (
        <div className="bg-surface shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Imagem</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Nome</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Categoria</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Preço</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Stock</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => {
                // Use product.image_url from Supabase, or the first from imageUrls as a fallback
                const displayImageUrl = product.image_url || (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : undefined);
                return (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {displayImageUrl ? (
                        <img 
                            src={displayImageUrl}
                            alt={product.name} 
                            className="w-12 h-12 object-cover rounded" 
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                           <span className="text-textSecondary text-xs">Sem img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-textPrimary">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-textSecondary">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-textSecondary">{product.price.toLocaleString('pt-AO', { style: 'currency', currency: CURRENCY_SYMBOL })}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock_quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openModalForEdit(product)}>Editar</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteClick(product)} disabled={isSaving}>Eliminar</Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}>
        <ProductForm 
          initialProduct={editingProduct} 
          onSubmit={handleFormSubmit} 
          onCancel={closeModal}
          isSaving={isSaving}
        />
      </Modal>
      
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirmar Eliminação">
          <div className="py-4">
            <p className="text-textSecondary">Tem a certeza que deseja eliminar o produto "{productToDelete?.name}"?</p>
            <p className="text-sm text-red-600">Esta ação não pode ser desfeita.</p>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} disabled={isSaving}>Cancelar</Button>
            <Button variant="danger" onClick={confirmDelete} isLoading={isSaving} disabled={isSaving}>Eliminar</Button>
          </div>
      </Modal>

    </div>
  );
};

export default AdminProductsPage;