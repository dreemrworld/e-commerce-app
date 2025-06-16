
import React from 'react';
import { PaymentMethod, PaymentMethodType } from '../types';
import { PAYMENT_METHODS } from '../constants';

interface PaymentOptionsProps {
  selectedPaymentMethod: string | null;
  onSelectPaymentMethod: (methodId: string) => void;
}

// Simple SVG icons for demonstration
const MulticaixaIcon: React.FC = () => (
  <svg viewBox="0 0 64 40" className="w-10 h-auto mr-2" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="64" height="40" rx="4" className="fill-primary"/> 
    <path d="M10 10H18L14 20L10 30H18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 10H32L28 20L24 30H32" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M38 10H46L42 20L38 30H46" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="54" cy="30" r="4" className="fill-accent"/> 
  </svg>
);

const BankTransferIcon: React.FC = () => (
  <svg className="w-8 h-8 mr-2 text-textSecondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
);

const MobileMoneyIcon: React.FC = () => (
 <svg className="w-8 h-8 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
);

const CashIcon: React.FC = () => (
  <svg className="w-8 h-8 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
);


const PaymentOptions: React.FC<PaymentOptionsProps> = ({ selectedPaymentMethod, onSelectPaymentMethod }) => {
  const getIcon = (methodName: PaymentMethodType) => {
    switch(methodName) {
      case PaymentMethodType.MULTICAIXA: return <MulticaixaIcon />;
      case PaymentMethodType.BANK_TRANSFER: return <BankTransferIcon />;
      case PaymentMethodType.UNITEL_MONEY: return <MobileMoneyIcon />;
      case PaymentMethodType.CASH_ON_DELIVERY: return <CashIcon />;
      default: return null;
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-textPrimary mb-4">Opções de Pagamento</h3>
      {PAYMENT_METHODS.map((method) => (
        <label
          key={method.id}
          htmlFor={`payment-${method.id}`}
          className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
            selectedPaymentMethod === method.id ? 'border-primary ring-2 ring-primary bg-blue-50' : 'border-gray-300 hover:border-gray-400' // Changed from bg-green-50 to bg-blue-50
          }`}
        >
          <input
            type="radio"
            id={`payment-${method.id}`}
            name="paymentMethod"
            value={method.id}
            checked={selectedPaymentMethod === method.id}
            onChange={() => onSelectPaymentMethod(method.id)}
            className="mr-3 h-5 w-5 text-primary focus:ring-primary border-gray-300"
          />
          {getIcon(method.name)}
          <div>
            <span className="font-medium text-textPrimary">{method.name}</span>
            <p className="text-sm text-textSecondary">{method.description}</p>
          </div>
        </label>
      ))}
    </div>
  );
};

export default PaymentOptions;