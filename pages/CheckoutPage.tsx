import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PaymentOptions from '../components/PaymentOptions';
import { ShippingAddress, Order, CartItem } from '../types'; // Added Order, CartItem
import { CURRENCY_SYMBOL, LOCAL_STORAGE_ORDERS_KEY } from '../constants'; // Added LOCAL_STORAGE_ORDERS_KEY
import Button from '../components/Button';
import { useNotification } from '../context/NotificationContext';


const CheckoutPage: React.FC = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
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
  const [formErrors, setFormErrors] = useState<Partial<ShippingAddress & {payment: string}>>({});


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
     setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const errors: Partial<ShippingAddress & {payment: string}> = {};
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

  const saveOrderToLocalStorage = (order: Order) => {
    try {
      const existingOrdersJSON = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      const existingOrders: Order[] = existingOrdersJSON ? JSON.parse(existingOrdersJSON) : [];
      existingOrders.push(order);
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(existingOrders));
    } catch (error) {
      console.error("Failed to save order to localStorage:", error);
      showNotification("Não foi possível guardar o histórico do pedido localmente.", "error");
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsProcessing(true);
    
    const newOrder: Order = {
      id: self.crypto.randomUUID(),
      items: [...cartItems] as CartItem[], // Ensure it's a new array of CartItem
      totalAmount: getTotalPrice(),
      shippingAddress: { ...shippingAddress },
      paymentMethod: selectedPaymentMethod,
      orderDate: new Date().toISOString(),
      status: 'Pending', 
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Order submitted:', newOrder);
    saveOrderToLocalStorage(newOrder);
    
    clearCart(); // This already shows a notification
    setIsProcessing(false);
    navigate('/confirmation', { state: { orderDetails: newOrder } }); // Pass the full order object
  };

  if (cartItems.length === 0 && !isProcessing) {
     navigate('/cart'); 
     return null;
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
             <Button type="submit" size="lg" className="w-full bg-accent hover:bg-orange-600 text-white" isLoading={isProcessing} disabled={isProcessing}>
                {isProcessing ? 'A Processar Encomenda...' : 'Confirmar Encomenda'}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;