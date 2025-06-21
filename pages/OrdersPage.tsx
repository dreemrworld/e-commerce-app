import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Order, CartItem as OrderItemType } from '../types'; // Renamed CartItem to OrderItemType for clarity here
import { CURRENCY_SYMBOL } from '../constants';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { useNotification } from '../context/NotificationContext';

// Define a type for orders fetched from Supabase, which includes 'order_items'
interface SupabaseOrder extends Omit<Order, 'items' | 'orderDate' | 'paymentMethod' | 'userId'> {
  user_id: string;
  created_at: string; // Supabase timestamp
  payment_method_id: string; // Matches table schema
  order_items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: number;
    // We'll need to fetch product details separately or join if possible
    // For now, assume we might need to map product details from ProductsContext or fetch them
    products?: { name: string; image_url?: string; category: string }; // Optional product details
  }>;
}


const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = ReactRouterDOM.useNavigate();
  const { user, session } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !session) {
        showNotification('Por favor, faça login para ver os seus pedidos.', 'info');
        navigate('/login', { state: { from: { pathname: '/orders' } } });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch orders and their items.
        // Note: This fetches all product details for all items in all orders.
        // For large numbers of orders/items, consider pagination or more optimized queries.
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            total_amount,
            status,
            shipping_address,
            payment_method_id,
            order_items (
              product_id,
              quantity,
              price_at_purchase,
              products ( name, image_url, category )
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedOrders: Order[] = data.map((order: SupabaseOrder) => ({
            id: order.id,
            userId: order.user_id,
            orderDate: order.created_at, // Use created_at from Supabase
            totalAmount: order.total_amount,
            status: order.status as Order['status'], // Cast status
            shippingAddress: order.shipping_address,
            paymentMethod: order.payment_method_id, // Store the ID or name
            items: order.order_items.map(item => ({
              // Map Supabase order_items to CartItem structure
              id: item.product_id, // Use product_id as the item's main id in this context
              name: item.products?.name || 'Produto Desconhecido',
              description: '', // Not directly available here, could be fetched if needed
              price: item.price_at_purchase,
              image_url: item.products?.image_url, // Use image_url from joined products
              imageUrls: item.products?.image_url ? [item.products.image_url] : [],
              category: item.products?.category || 'N/A',
              stock_quantity: 0, // Not relevant for past order item display
              quantity: item.quantity,
            })),
          }));
          setOrders(formattedOrders);
        }
      } catch (err: any) {
        console.error("Error loading orders from Supabase:", err);
        showNotification(err.message || "Erro ao carregar pedidos.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user, session, navigate, showNotification]);

  const handleViewOrderDetails = (order: Order) => {
    navigate('/confirmation', { state: { orderDetails: order, fromOrdersPage: true } });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner /> <p className="ml-2 text-textSecondary">A carregar pedidos...</p>
      </div>
    );
  }

  if (!user && !isLoading) { // If still not logged in after loading attempt
    return (
         <div className="text-center py-20 bg-surface rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-textPrimary mb-3">Acesso Restrito</h2>
            <p className="text-textSecondary mb-6">Por favor, faça login para ver o seu histórico de pedidos.</p>
            <ReactRouterDOM.Link to="/login" state={{ from: { pathname: '/orders' } }}>
                <Button className="bg-primary hover:bg-secondary text-white">Login</Button>
            </ReactRouterDOM.Link>
        </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-surface rounded-lg shadow-md">
        <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
        <h2 className="text-2xl font-semibold text-textPrimary mb-3">Ainda não tem pedidos.</h2>
        <p className="text-textSecondary mb-6">Todos os seus futuros pedidos aparecerão aqui.</p>
        <ReactRouterDOM.Link to="/products">
          <Button className="bg-primary hover:bg-secondary text-white">
            Começar a Comprar
          </Button>
        </ReactRouterDOM.Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold text-textPrimary mb-8">Meus Pedidos</h1>
      <div className="bg-surface shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Pedido ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Data</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-primary hover:underline cursor-pointer" onClick={() => handleViewOrderDetails(order)}>
                      #{order.id.substring(0, 8)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textSecondary">{new Date(order.orderDate).toLocaleDateString('pt-PT', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textSecondary">
                      {order.totalAmount.toLocaleString('pt-AO', { style: 'currency', currency: CURRENCY_SYMBOL })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800' // Pending, Processing
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="ghost" size="sm" onClick={() => handleViewOrderDetails(order)}>
                      Ver Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
