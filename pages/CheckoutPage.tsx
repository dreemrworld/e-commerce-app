import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import PaymentOptions from '../components/PaymentOptions';
import { ShippingAddress, Order, CartItem } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import Button from '../components/Button';
import { useNotification } from '../context/NotificationContext';
import { supabase } from '../lib/supabaseClient'; // Import Supabase client
import LoadingSpinner from '../components/LoadingSpinner';

const CheckoutPage: React.FC = () => {
  const { cartItems, getTotalPrice, clearCart, isLoadingCart } = useCart();
  const { user, session } = useAuth(); // Get user session
  const navigate = ReactRouterDOM.useNavigate();
  const { showNotification } = useNotification();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: '',
    address: '',
    city: 'Luanda',
    province: 'Luanda',
    phoneNumber: '',
  });
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<ShippingAddress & { payment: string }>>({});

  // Redirect to login if user is not authenticated and tries to checkout
  useEffect(() => {
    if (!isLoadingCart && !session && cartItems.length > 0) {
      showNotification('Por favor, faça login para continuar com a compra.', 'info');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  }, [session, isLoadingCart, navigate, showNotification, cartItems.length]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<ShippingAddress & { payment: string }> = {};
    if (!shippingAddress.fullName.trim()) errors.fullName = "Nome completo é obrigatório.";
    if (!shippingAddress.address.trim()) errors.address = "Endereço é obrigatório.";
    if (!shippingAddress.city.trim()) errors.city = "Cidade é obrigatória.";
    if (!shippingAddress.province.trim()) errors.province = "Província é obrigatória.";
    if (!shippingAddress.phoneNumber.trim()) errors.phoneNumber = "Telefone é obrigatório.";
    else if (!/^\d{9}$/.test(shippingAddress.phoneNumber.replace(/\s/g, ''))) errors.phoneNumber = "Número de telefone inválido (ex: 9xx xxx xxx).";

    if (!selectedPaymentMethod) errors.payment = "Por favor, selecione um método de pagamento.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!user) {
      showNotification('Sessão inválida. Por favor, faça login novamente.', 'error');
      navigate('/login');
      return;
    }

    setIsProcessing(true);

    const orderDataForSupabase = {
      user_id: user.id,
      total_amount: getTotalPrice(),
      shipping_address: shippingAddress, // JSONB
      payment_method_id: selectedPaymentMethod, // Assuming this is a string ID or name
      status: 'Pending', // Default status
      payment_status: 'Pending', // Default payment status
      // created_at will be set by Supabase default
    };

    try {
      // 1. Insert into 'orders' table
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert(orderDataForSupabase)
        .select()
        .single();

      if (orderError || !orderResult) {
        throw orderError || new Error('Failed to create order entry.');
      }

      const newOrderId = orderResult.id;

      // 2. Prepare and insert into 'order_items' table
      const orderItemsData = cartItems.map(item => ({
        order_id: newOrderId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.price, // Capture price at the time of purchase
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) {
        // Potentially attempt to rollback order insertion or mark it as failed
        console.error('Failed to insert order items, attempting to clean up order:', itemsError);
        await supabase.from('orders').delete().match({ id: newOrderId }); // Simple cleanup
        throw itemsError;
      }

      // Construct an Order object for confirmation page (consistent with local type)
      const confirmedOrder: Order = {
        id: newOrderId,
        userId: user.id,
        items: cartItems.map(ci => ({...ci})), // Deep copy cart items for the order state
        totalAmount: orderResult.total_amount,
        shippingAddress: orderResult.shipping_address,
        paymentMethod: orderResult.payment_method_id,
        orderDate: orderResult.created_at,
        status: orderResult.status as Order['status'],
      };

      await clearCart(); // Clear cart from context (and Supabase via context)
      showNotification('Encomenda submetida com sucesso!', 'success');
      navigate('/confirmation', { state: { orderDetails: confirmedOrder } });

    } catch (error: any) {
      console.error('Order submission error:', error);
      showNotification(error.message || 'Falha ao submeter a encomenda.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Redirect to cart if it's empty and not processing (and not loading initial cart)
  useEffect(() => {
    if (!isLoadingCart && cartItems.length === 0 && !isProcessing) {
      navigate('/cart');
    }
  }, [cartItems, isLoadingCart, isProcessing, navigate]);


  if (isLoadingCart || (!session && cartItems.length > 0)) { // Show loading if cart is loading OR if user not logged in but has items (while redirecting)
    return (
        <div className="flex justify-center items-center h-[calc(100vh-300px)]">
            <LoadingSpinner />
            <p className="ml-3 text-textSecondary">A preparar checkout...</p>
        </div>
    );
  }
  
  const totalPrice = getTotalPrice();

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-textPrimary mb-8">Finalizar Compra</h1>
      <form onSubmit={handleSubmitOrder} className="grid md:grid-cols-2 gap-10">
        {/* Shipping Details */}
        <div className="space-y-6 bg-surface p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-textPrimary mb-4">Detalhes da Entrega</h2>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-textSecondary mb-1">Nome Completo</label>
            <input type="text" name="fullName" id="fullName" value={shippingAddress.fullName} onChange={handleInputChange} className={`w-full p-2 border ${formErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary placeholder-textSecondary`} />
            {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-textSecondary mb-1">Endereço (Rua, Bairro)</label>
            <input type="text" name="address" id="address" value={shippingAddress.address} onChange={handleInputChange} className={`w-full p-2 border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary placeholder-textSecondary`} />
            {formErrors.address && <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-textSecondary mb-1">Cidade</label>
              <input type="text" name="city" id="city" value={shippingAddress.city} onChange={handleInputChange} className={`w-full p-2 border ${formErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary placeholder-textSecondary`} />
              {formErrors.city && <p className="text-red-500 text-xs mt-1">{formErrors.city}</p>}
            </div>
            <div>
              <label htmlFor="province" className="block text-sm font-medium text-textSecondary mb-1">Província</label>
              <select name="province" id="province" value={shippingAddress.province} onChange={handleInputChange} className={`w-full p-2 border ${formErrors.province ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary`}>
                <option value="Luanda">Luanda</option>
                <option value="Benguela">Benguela</option>
                <option value="Huambo">Huambo</option>
                <option value="Huila">Huíla</option>
                <option value="Bengo">Bengo</option>
                <option value="Bié">Bié</option>
                <option value="Cabinda">Cabinda</option>
                <option value="Cuando Cubango">Cuando Cubango</option>
                <option value="Cuanza Norte">Cuanza Norte</option>
                <option value="Cuanza Sul">Cuanza Sul</option>
                <option value="Cunene">Cunene</option>
                <option value="Lunda Norte">Lunda Norte</option>
                <option value="Lunda Sul">Lunda Sul</option>
                <option value="Malanje">Malanje</option>
                <option value="Moxico">Moxico</option>
                <option value="Namibe">Namibe</option>
                <option value="Uíge">Uíge</option>
                <option value="Zaire">Zaire</option>
              </select>
              {formErrors.province && <p className="text-red-500 text-xs mt-1">{formErrors.province}</p>}
            </div>
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-textSecondary mb-1">Telefone</label>
            <input type="tel" name="phoneNumber" id="phoneNumber" value={shippingAddress.phoneNumber} onChange={handleInputChange} placeholder="9xx xxx xxx" className={`w-full p-2 border ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-primary focus:border-primary bg-white text-textPrimary placeholder-textSecondary`} />
            {formErrors.phoneNumber && <p className="text-red-500 text-xs mt-1">{formErrors.phoneNumber}</p>}
          </div>
        </div>

        {/* Order Summary & Payment */}
        <div className="space-y-6">
            <div className="bg-surface p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-textPrimary mb-4">Resumo do Pedido</h2>
                {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm py-1 border-b border-gray-100 last:border-b-0">
                        <span className="text-textSecondary">{item.name} (x{item.quantity})</span>
                        <span className="text-textPrimary font-medium">{(item.price * item.quantity).toLocaleString('pt-AO', { style: 'currency', currency: CURRENCY_SYMBOL })}</span>
                    </div>
                ))}
                <div className="flex justify-between items-center text-lg font-bold mt-4 pt-2 border-t border-gray-200">
                    <span className="text-textPrimary">Total:</span>
                    <span className="text-primary">{totalPrice.toLocaleString('pt-AO', { style: 'currency', currency: CURRENCY_SYMBOL })}</span>
                </div>
            </div>
            <div className="bg-surface p-6 rounded-lg shadow-md">
                <PaymentOptions selectedPaymentMethod={selectedPaymentMethod} onSelectPaymentMethod={(id) => { setSelectedPaymentMethod(id); setFormErrors(prev => ({...prev, payment: undefined})); }} />
                {formErrors.payment && <p className="text-red-500 text-xs mt-2">{formErrors.payment}</p>}
            </div>
             <Button type="submit" size="lg" className="w-full bg-accent hover:bg-orange-600 text-white" isLoading={isProcessing} disabled={isProcessing || !session}>
                {isProcessing ? 'A Processar Encomenda...' : 'Confirmar Encomenda'}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;