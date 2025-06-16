import React, { useState } from 'react';
import { useProductsContext } from '../../context/ProductsContext';
import { Product } from '../../types';
import { CURRENCY_SYMBOL } from '../../constants';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import ProductForm from '../../components/admin/ProductForm';
import LoadingSpinner from '../../components/LoadingSpinner';

const AdminProductsPage: React.FC = () => {
  const { products, isLoading, error, addProduct, updateProduct, deleteProduct } = useProductsContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);


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

  const handleFormSubmit = async (productData: Omit<Product, 'id'> | Product) => {
    setIsSaving(true);
    try {
      if ('id' in productData && productData.id) { 
        await updateProduct(productData.id, productData);
      } else { 
        await addProduct(productData as Omit<Product, 'id'>);
      }
      closeModal();
    } catch (e) {
      console.error("Failed to save product", e);
      // Error handling, maybe show a toast
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
        await deleteProduct(productToDelete.id);
      } catch(e) {
        console.error("Failed to delete product", e);
      } finally {
        setIsSaving(false);
        setShowDeleteConfirm(false);
        setProductToDelete(null);
      }
    }
  };


  if (isLoading && products.length === 0) { 
    return <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>;
  }

  if (error) {
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
                const imageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : undefined;
                return (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {imageUrl ? (
                        <img 
                            src={imageUrl} 
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => openModalForEdit(product)}>Editar</Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteClick(product)}>Eliminar</Button>
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