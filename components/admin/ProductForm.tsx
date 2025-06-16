import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../../types';
import { CATEGORIES } from '../../constants';
import Button from '../Button';
import Modal from '../Modal'; // For camera modal
import CameraCaptureModal from './CameraCaptureModal'; // New component

interface ProductFormProps {
  initialProduct?: Product | null;
  onSubmit: (productData: Omit<Product, 'id'> | Product) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialProduct, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: CATEGORIES[0] || '',
    stock: '',
  });
  const [imageUrlsString, setImageUrlsString] = useState(''); // For external URLs
  const [localImagePreviews, setLocalImagePreviews] = useState<string[]>([]); // For base64 previews
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData | 'imageUrls', string>>>({});
  const [showCameraModal, setShowCameraModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name,
        description: initialProduct.description,
        price: String(initialProduct.price),
        category: initialProduct.category,
        stock: String(initialProduct.stock),
      });
      // Separate existing URLs into external and base64
      const externalUrls: string[] = [];
      const base64Previews: string[] = [];
      initialProduct.imageUrls.forEach(url => {
        if (url && typeof url === 'string') {
          if (url.startsWith('data:image')) {
            base64Previews.push(url);
          } else {
            externalUrls.push(url);
          }
        }
      });
      setImageUrlsString(externalUrls.join('\n'));
      setLocalImagePreviews(base64Previews);
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: CATEGORIES[0] || '',
        stock: '',
      });
      setImageUrlsString('');
      setLocalImagePreviews([]);
    }
    setErrors({});
  }, [initialProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'imageUrlsString') {
      setImageUrlsString(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
     if (name === 'imageUrlsString' && errors.imageUrls) {
        setErrors(prev => ({ ...prev, imageUrls: undefined }));
    }
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPreviews: string[] = [];
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result) {
              setLocalImagePreviews(prev => [...prev, reader.result as string]);
            }
          };
          reader.readAsDataURL(file);
        }
      });
      // Clear file input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    if (errors.imageUrls) {
        setErrors(prev => ({ ...prev, imageUrls: undefined }));
    }
  };

  const handleRemoveLocalImage = (index: number) => {
    setLocalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageCapture = (base64Image: string) => {
    setLocalImagePreviews(prev => [...prev, base64Image]);
    setShowCameraModal(false);
     if (errors.imageUrls) {
        setErrors(prev => ({ ...prev, imageUrls: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Partial<Record<keyof typeof formData | 'imageUrls', string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório.';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória.';
    if (!formData.price.trim() || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Preço deve ser um número positivo.';
    }
    
    const externalUrls = imageUrlsString.split('\n').map(url => url.trim()).filter(url => url);
    const allImageSourcesCount = externalUrls.length + localImagePreviews.length;

    if (allImageSourcesCount === 0) {
        newErrors.imageUrls = 'Pelo menos uma imagem (URL, upload ou foto) é obrigatória.';
    } else {
        for (const url of externalUrls) {
            try {
                new URL(url); // Validate external URLs
            } catch (_) {
                newErrors.imageUrls = 'Uma ou mais URLs de imagem externas são inválidas.';
                break;
            }
        }
    }

    if (!formData.category) newErrors.category = 'Categoria é obrigatória.';
    if (!formData.stock.trim() || isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock deve ser um número não negativo.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalImageUrls = [
      ...imageUrlsString.split('\n').map(url => url.trim()).filter(url => url),
      ...localImagePreviews
    ];

    const productDataToSubmit = {
      ...formData,
      price: parseFloat(formData.price),
      imageUrls: finalImageUrls,
      stock: parseInt(formData.stock),
    };

    if (initialProduct && initialProduct.id) {
      await onSubmit({ ...productDataToSubmit, id: initialProduct.id, reviews: initialProduct.reviews || [] });
    } else {
      await onSubmit(productDataToSubmit as Omit<Product, 'id'>);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-textSecondary mb-1">Nome do Produto</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={`w-full p-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary placeholder-textSecondary`} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-textSecondary mb-1">Descrição</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows={3} className={`w-full p-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary placeholder-textSecondary`}></textarea>
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-textSecondary mb-1">Preço (AOA)</label>
            <input type="number" name="price" id="price" value={formData.price} onChange={handleChange} step="any" className={`w-full p-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary placeholder-textSecondary`} />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-textSecondary mb-1">Stock</label>
            <input type="number" name="stock" id="stock" value={formData.stock} onChange={handleChange} className={`w-full p-2 border ${errors.stock ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary placeholder-textSecondary`} />
            {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock}</p>}
          </div>
        </div>
        
        {/* Image Upload and URL section */}
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-1">Imagens do Produto</label>
          {/* File Upload */}
          <div className="mb-2">
            <label htmlFor="imageUpload" className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-textPrimary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
              <svg className="-ml-1 mr-2 h-5 w-5 text-textSecondary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Escolher Ficheiros
            </label>
            <input type="file" id="imageUpload" ref={fileInputRef} multiple accept="image/*" onChange={handleFileSelect} className="sr-only" />
            <Button type="button" variant="ghost" onClick={() => setShowCameraModal(true)} className="ml-3">Tirar Foto</Button>
          </div>

          {/* Image Previews */}
          {localImagePreviews.length > 0 && (
            <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-2">
              {localImagePreviews.map((src, index) => (
                <div key={index} className="relative group aspect-square">
                  <img src={src} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-md border border-gray-200" />
                  <button
                    type="button"
                    onClick={() => handleRemoveLocalImage(index)}
                    className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                    aria-label="Remover imagem"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* External URLs Textarea */}
          <div>
            <label htmlFor="imageUrlsString" className="block text-xs font-medium text-textSecondary mb-0.5">Ou adicione URLs de imagens (uma por linha)</label>
            <textarea name="imageUrlsString" id="imageUrlsString" value={imageUrlsString} onChange={handleChange} rows={3} className={`w-full p-2 border ${errors.imageUrls ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary placeholder-textSecondary`} placeholder="https://exemplo.com/imagem1.jpg&#10;https://exemplo.com/imagem2.png"></textarea>
          </div>
          {errors.imageUrls && <p className="text-red-500 text-xs mt-1">{errors.imageUrls}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-textSecondary mb-1">Categoria</label>
          <select name="category" id="category" value={formData.category} onChange={handleChange} className={`w-full p-2 border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary`}>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>Cancelar</Button>
          <Button type="submit" isLoading={isSaving} disabled={isSaving} className="bg-accent hover:bg-orange-600 text-white">
            {initialProduct ? 'Guardar Alterações' : 'Criar Produto'}
          </Button>
        </div>
      </form>

      {showCameraModal && (
        <CameraCaptureModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onCapture={handleImageCapture}
        />
      )}
    </>
  );
};

export default ProductForm;