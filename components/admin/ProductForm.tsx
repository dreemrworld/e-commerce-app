import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../../types'; // Frontend Product type
import { CATEGORIES } from '../../constants';
import Button from '../Button';
import CameraCaptureModal from './CameraCaptureModal';
import { supabase } from '../../lib/supabaseClient'; // For potential direct Supabase operations like storage
import { useNotification } from '../../context/NotificationContext';

// This type should align with ProductInput in ProductsContext for new products,
// and allow partial updates for existing ones.
// For simplicity, using a more specific type for the form data itself.
type FormDataType = {
  name: string;
  description: string;
  price: string;
  category: string;
  stock_quantity: string; // Corresponds to Supabase column
  image_url: string; // Single image URL for Supabase
};

interface ProductFormProps {
  initialProduct?: Product | null; // This is the frontend Product type
  onSubmit: (productData: Omit<Product, 'id' | 'created_at' | 'reviews' | 'imageUrls'> & { image_url?: string }) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialProduct, onSubmit, onCancel, isSaving }) => {
  const [formData, setFormData] = useState<FormDataType>({
    name: '',
    description: '',
    price: '',
    category: CATEGORIES[0] || '',
    stock_quantity: '',
    image_url: '', // Default to empty, will be populated by upload or manual input
  });

  const [currentImagePreview, setCurrentImagePreview] = useState<string | null>(null); // Single preview
  const [imageFile, setImageFile] = useState<File | null>(null); // For new uploads
  const [errors, setErrors] = useState<Partial<Record<keyof FormDataType, string>>>({});
  const [showCameraModal, setShowCameraModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name,
        description: initialProduct.description,
        price: String(initialProduct.price),
        category: initialProduct.category,
        stock_quantity: String(initialProduct.stock_quantity),
        image_url: initialProduct.image_url || (initialProduct.imageUrls && initialProduct.imageUrls[0]) || '',
      });
      setCurrentImagePreview(initialProduct.image_url || (initialProduct.imageUrls && initialProduct.imageUrls[0]) || null);
      setImageFile(null); // Reset file on edit
    } else {
      // Reset form for new product
      setFormData({
        name: '',
        description: '',
        price: '',
        category: CATEGORIES[0] || '',
        stock_quantity: '',
        image_url: '',
      });
      setCurrentImagePreview(null);
      setImageFile(null);
    }
    setErrors({});
  }, [initialProduct]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormDataType]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file); // Store the file for upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImagePreview(reader.result as string);
        setFormData(prev => ({ ...prev, image_url: '' })); // Clear manual URL if file is chosen
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      // Optionally clear preview if file is invalid or deselected
      // setCurrentImagePreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = ""; // Allow re-selecting same file
    if (errors.image_url) setErrors(prev => ({ ...prev, image_url: undefined }));
  };

  const handleImageCapture = (base64Image: string) => {
    // Convert base64 to File-like object if direct upload of base64 is not supported/desired
    // For simplicity, we might just use this as preview and require manual URL or upload for saving
    setCurrentImagePreview(base64Image);
    setImageFile(null); // Clear file if photo is taken
    setFormData(prev => ({ ...prev, image_url: '' })); // Clear manual URL if photo is taken
    setShowCameraModal(false);
    if (errors.image_url) setErrors(prev => ({ ...prev, image_url: undefined }));
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('productimages') // Ensure this bucket exists and has appropriate policies
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('productimages')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showNotification(`Image upload failed: ${error.message}`, 'error');
      return null;
    }
  };


  const validate = () => {
    const newErrors: Partial<Record<keyof FormDataType, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório.';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória.';
    if (!formData.price.trim() || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Preço deve ser um número positivo.';
    }
    if (!imageFile && !formData.image_url?.trim() && !currentImagePreview?.startsWith('data:image')) {
        // If there's a currentImagePreview that is not a new base64 (i.e., it's an existing URL from initialProduct), it's valid.
        // A new image is only required if no existing image_url and no new file/camera capture.
        if (!initialProduct?.image_url && !initialProduct?.imageUrls?.[0]) {
             newErrors.image_url = 'Imagem (URL, upload ou foto) é obrigatória.';
        }
    } else if (formData.image_url?.trim()) {
        try {
            new URL(formData.image_url);
        } catch (_) {
            newErrors.image_url = 'URL da imagem inválida.';
        }
    }
    if (!formData.category) newErrors.category = 'Categoria é obrigatória.';
    if (!formData.stock_quantity.trim() || isNaN(parseInt(formData.stock_quantity)) || parseInt(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = 'Stock deve ser um número não negativo.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let finalImageUrl = formData.image_url;

    if (imageFile) { // If a new file was selected, upload it
      const uploadedUrl = await uploadImage(imageFile);
      if (!uploadedUrl) {
        // Error is shown by uploadImage function
        return; // Stop submission if upload fails
      }
      finalImageUrl = uploadedUrl;
    } else if (currentImagePreview?.startsWith('data:image') && !imageFile) {
      // If there's a base64 preview (e.g. from camera) and no file (meaning it wasn't replaced by upload)
      // We need a way to upload this base64 or ask for a URL.
      // For now, let's assume this means the user needs to provide a URL or upload a file if it's a new product.
      // If it's an existing product, and the preview is the original image_url, that's fine.
      // This logic might need refinement based on how base64 images are handled for saving.
      // For now, if it's a new product with only a base64 preview, it's an error.
      if (!initialProduct) {
        showNotification("Por favor, faça upload da imagem capturada ou forneça um URL.", "error");
        setErrors(prev => ({...prev, image_url: "Imagem capturada precisa ser carregada ou fornecida como URL."}));
        return;
      }
    }


    const productDataToSubmit = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      stock_quantity: parseInt(formData.stock_quantity),
      image_url: finalImageUrl || undefined, // Ensure it's undefined if empty, not empty string
    };

    await onSubmit(productDataToSubmit);
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
            <label htmlFor="stock_quantity" className="block text-sm font-medium text-textSecondary mb-1">Stock</label>
            <input type="number" name="stock_quantity" id="stock_quantity" value={formData.stock_quantity} onChange={handleChange} className={`w-full p-2 border ${errors.stock_quantity ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary placeholder-textSecondary`} />
            {errors.stock_quantity && <p className="text-red-500 text-xs mt-1">{errors.stock_quantity}</p>}
          </div>
        </div>
        
        {/* Image Section */}
        <div>
          <label className="block text-sm font-medium text-textSecondary mb-1">Imagem do Produto</label>

          {/* Image Preview */}
          {currentImagePreview && (
            <div className="mt-2 mb-2 relative group aspect-video w-full max-w-xs mx-auto">
              <img src={currentImagePreview} alt="Pré-visualização" className="w-full h-full object-contain rounded-md border border-gray-200" />
               {(imageFile || currentImagePreview.startsWith('data:image')) && ( // Show remove if it's a new file or camera capture
                <button
                    type="button"
                    onClick={() => { setCurrentImagePreview(null); setImageFile(null); if(initialProduct?.image_url) setFormData(f => ({...f, image_url: initialProduct.image_url}));}}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-70 group-hover:opacity-100 transition-opacity text-xs"
                    aria-label="Remover imagem"
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
               )}
            </div>
          )}

          {/* File Upload & Camera */}
          <div className="flex items-center space-x-3 mt-1">
            <label htmlFor="imageUpload" className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-textPrimary bg-white hover:bg-gray-50">
              <svg className="-ml-1 mr-2 h-4 w-4 text-textSecondary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              Upload
            </label>
            <input type="file" id="imageUpload" ref={fileInputRef} accept="image/*" onChange={handleFileSelect} className="sr-only" />
            <Button type="button" variant="ghost" size="sm" onClick={() => setShowCameraModal(true)}>Tirar Foto</Button>
          </div>
          
          {/* Manual URL Input */}
          <div className="mt-3">
            <label htmlFor="image_url" className="block text-xs font-medium text-textSecondary mb-0.5">Ou cole o URL da imagem</label>
            <input
                type="text"
                name="image_url"
                id="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className={`w-full p-2 border ${errors.image_url ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary placeholder-textSecondary`}
                placeholder="https://exemplo.com/imagem.jpg"
                disabled={!!imageFile || currentImagePreview?.startsWith('data:image')} // Disable if file/camera used
            />
          </div>
          {errors.image_url && <p className="text-red-500 text-xs mt-1">{errors.image_url}</p>}
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