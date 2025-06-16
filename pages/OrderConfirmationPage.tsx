
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Button from '../components/Button';
import { CURRENCY_SYMBOL, PAYMENT_METHODS } from '../constants';
import { Order } from '../types'; // Changed from CartItem, ShippingAddress to Order

const OrderConfirmationPage: React.FC = () => {
  const location = ReactRouterDOM.useLocation();
  // orderDetails is now the full Order object
  const orderDetails = location.state?.orderDetails as Order | undefined; 

  if (!orderDetails) {
    // This case might happen if user directly navigates here or state is lost
    // Redirecting to home or orders page might be better
    return (
      <div className="text-center py-20 bg-surface rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-textPrimary mb-4">Detalhes do Pedido Indisponíveis</h1>
        <p className="text-textSecondary mb-8">Não foi possível carregar os detalhes do seu pedido. Pode verificar os seus pedidos na sua conta.</p>
        <ReactRouterDOM.Link to="/orders">
          <Button className="bg-primary hover:bg-secondary text-white">Ver Meus Pedidos</Button>
        </ReactRouterDOM.Link>
        <ReactRouterDOM.Link to="/" className="ml-4">
          <Button variant="ghost">Voltar à Página Inicial</Button>
        </ReactRouterDOM.Link>
      </div>
    );
  }

  const paymentMethodObj = PAYMENT_METHODS.find(p => p.id === orderDetails.paymentMethod);
  const paymentMethodName = paymentMethodObj?.name || orderDetails.paymentMethod || 'Não especificado';

  return (
    <div className="max-w-2xl mx-auto text-center py-10 bg-surface p-8 rounded-lg shadow-xl">
      <svg className="w-20 h-20 text-green-500 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">Pedido Confirmado!</h1>
      <p className="text-lg text-textSecondary mb-8">Obrigado pela sua compra, {orderDetails.shippingAddress.fullName}! O seu pedido <strong className="text-primary">#{orderDetails.id.substring(0,8)}</strong> foi recebido com sucesso.</p>
      
      <div className="text-left bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-textPrimary mb-4">Resumo do Pedido</h2>
        <div className="space-y-3">
            <p><strong>Data do Pedido:</strong> {new Date(orderDetails.orderDate).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p><strong>Nome:</strong> {orderDetails.shippingAddress.fullName}</p>
            <p><strong>Endereço:</strong> {orderDetails.shippingAddress.address}, {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.province}</p>
            <p><strong>Telefone:</strong> {orderDetails.shippingAddress.phoneNumber}</p>
            <p><strong>Método de Pagamento:</strong> {paymentMethodName}</p>
            <p><strong>Status:</strong> <span className="font-semibold text-primary">{orderDetails.status}</span></p>
            <h3 className="text-md font-semibold text-textPrimary mt-3 pt-3 border-t border-gray-200">Itens:</h3>
            <ul className="list-disc list-inside text-sm text-textSecondary space-y-1">
                {orderDetails.items.map(item => (
                    <li key={item.id}>{item.name} (x{item.quantity}) - {item.price.toLocaleString('pt-AO', { style: 'currency', currency: CURRENCY_SYMBOL })} cada</li>
                ))}
            </ul>
            <p className="text-lg font-bold text-primary mt-3 pt-3 border-t border-gray-200">
                Total: {orderDetails.totalAmount.toLocaleString('pt-AO', { style: 'currency', currency: CURRENCY_SYMBOL })}
            </p>
        </div>
      </div>

      <p className="text-sm text-textSecondary mb-6">
        Em breve receberá um email de confirmação com os detalhes do seu pedido e informações de rastreamento (se aplicável).
        {paymentMethodObj && paymentMethodObj.name === 'Transferência Bancária' ? ' Para pagamentos por Transferência Bancária, os detalhes da conta serão enviados por email.' : ''}
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <ReactRouterDOM.Link to="/">
          <Button size="lg" className="bg-primary hover:bg-blue-700 text-white w-full sm:w-auto">
            Continuar a Comprar
          </Button>
        </ReactRouterDOM.Link>
        <ReactRouterDOM.Link to="/orders">
          <Button size="lg" variant="secondary" className="w-full sm:w-auto">
            Ver Meus Pedidos
          </Button>
        </ReactRouterDOM.Link>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;