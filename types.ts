export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // AOA
  imageUrls: string[]; // Changed from imageUrl: string
  category: string;
  stock: number;
  reviews?: Review[]; // Added for product reviews
}

export interface CartItem extends Product {
  quantity: number;
}

export enum PaymentMethodType {
  MULTICAIXA = 'Multicaixa Express',
  BANK_TRANSFER = 'Transferência Bancária',
  UNITEL_MONEY = 'Unitel Money',
  CASH_ON_DELIVERY = 'Pagamento na Entrega (Cash on Delivery)',
}

export interface PaymentMethod {
  id: string;
  name: PaymentMethodType;
  description: string;
  icon?: React.ReactNode; // Optional: for an SVG icon
}

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  province: string;
  phoneNumber: string;
}

// New interface for Product Reviews
export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  comment: string;
  date: string; // ISO string
}

// New interface for Orders
export interface Order {
  id: string;
  userId?: string; // Optional: if we ever simulate users
  items: CartItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  paymentMethod: string | null; // ID of the payment method
  orderDate: string; // ISO string
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'; // Example statuses
}