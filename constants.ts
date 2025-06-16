
import { Product, PaymentMethod, PaymentMethodType, Review } from './types';

export const API_BASE_URL = '/api'; // Mock API base
export const CURRENCY_SYMBOL = 'AOA';
export const LOCAL_STORAGE_ORDERS_KEY = 'angoTechOrders';

export const CATEGORIES: string[] = ["Smartphones", "Laptops", "Audio", "TVs", "Acessórios", "Cuidados Pessoais"];

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'multicaixa', name: PaymentMethodType.MULTICAIXA, description: 'Pague de forma segura com o seu cartão Multicaixa.' },
  { id: 'bank_transfer', name: PaymentMethodType.BANK_TRANSFER, description: 'Detalhes da conta serão fornecidos após a encomenda.' },
  { id: 'unitel_money', name: PaymentMethodType.UNITEL_MONEY, description: 'Pague convenientemente com Unitel Money.' },
  { id: 'cod', name: PaymentMethodType.CASH_ON_DELIVERY, description: 'Pague em dinheiro no momento da entrega.' },
];

const commonReviews: Review[] = [
    { id: 'rev1', author: 'Cliente Satisfeito', rating: 5, comment: 'Excelente produto, superou as minhas expectativas!', date: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: 'rev2', author: 'Ana P.', rating: 4, comment: 'Muito bom, mas a entrega demorou um pouco.', date: new Date(Date.now() - 86400000 * 2).toISOString() },
];

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Smartphone X Pro', description: 'O mais recente smartphone com câmara tripla e ecrã OLED.', price: 250000, imageUrls: ['https://picsum.photos/seed/phone1/600/500'], category: 'Smartphones', stock: 15, reviews: [commonReviews[0], { id: 'rev3', author: 'Carlos M.', rating: 5, comment: 'Câmera incrível e design moderno. Recomendo!', date: new Date().toISOString() }] },
  { id: '2', name: 'Laptop Gamer Z', description: 'Performance extrema para jogos e trabalho pesado. Placa gráfica dedicada.', price: 750000, imageUrls: ['https://picsum.photos/seed/laptop1/600/500'], category: 'Laptops', stock: 8, reviews: [commonReviews[1]] },
  { id: '3', name: 'Auriculares BT MaxSound', description: 'Som imersivo com cancelamento de ruído e bateria de longa duração.', price: 45000, imageUrls: ['https://picsum.photos/seed/headphones1/600/500'], category: 'Audio', stock: 30, reviews: [{id: 'rev4', author: 'DJ Kapiro', rating: 5, comment: 'Qualidade de som profissional!', date: new Date(Date.now() - 86400000 * 10).toISOString() }] },
  { id: '4', name: 'Smart TV 4K 55"', description: 'Ecrã gigante com resolução 4K Ultra HD e funcionalidades Smart.', price: 450000, imageUrls: ['https://picsum.photos/seed/tv1/600/500'], category: 'TVs', stock: 12 },
  { id: '5', name: 'Carregador Rápido USB-C', description: 'Carregue os seus dispositivos rapidamente com este carregador de 65W.', price: 15000, imageUrls: ['https://picsum.photos/seed/charger1/600/500'], category: 'Acessórios', stock: 50, reviews: [commonReviews[0]]},
  { id: '6', name: 'Teclado Mecânico RGB', description: 'Experiência de digitação superior com iluminação RGB personalizável.', price: 35000, imageUrls: ['https://picsum.photos/seed/keyboard1/600/500'], category: 'Acessórios', stock: 25 },
  { id: '7', name: 'Webcam HD Pro', description: 'Vídeo chamadas nítidas com resolução Full HD e microfone integrado.', price: 25000, imageUrls: ['https://picsum.photos/seed/webcam1/600/500'], category: 'Acessórios', stock: 20 },
  { id: '8', name: 'Powerbank 20000mAh', description: 'Nunca fique sem bateria com esta powerbank de alta capacidade.', price: 20000, imageUrls: ['https://picsum.photos/seed/powerbank1/600/500'], category: 'Acessórios', stock: 40 },
  { id: '9', name: 'Rato Sem Fio Ergonómico', description: 'Conforto e precisão para longas horas de uso.', price: 18000, imageUrls: ['https://picsum.photos/seed/mouse1/600/500'], category: 'Acessórios', stock: 35 },
  { id: '10', name: 'Tablet Avançado 10"', description: 'Ecrã vibrante e performance rápida para entretenimento e produtividade.', price: 180000, imageUrls: ['https://picsum.photos/seed/tablet1/600/500'], category: 'Smartphones', stock: 10, reviews: [commonReviews[1]]},
  { id: '11', name: 'Coluna Bluetooth Portátil', description: 'Leve a sua música para qualquer lugar com som potente.', price: 30000, imageUrls: ['https://picsum.photos/seed/speaker1/600/500'], category: 'Audio', stock: 22 },
  { id: '12', name: 'Monitor Curvo 27"', description: 'Imersão total com este monitor curvo para trabalho ou jogos.', price: 220000, imageUrls: ['https://picsum.photos/seed/monitor1/600/500'], category: 'TVs', stock: 9 },
  {
    id: '13',
    name: 'Xiaomi Mijia Electric Shaver S500',
    description: 'Desfrute de um barbear suave e preciso com a máquina de barbear elétrica Xiaomi Mijia S500. Com lâminas flutuantes 360°, motor potente, ecrã LED e carregamento USB-C. Totalmente lavável para fácil limpeza.',
    price: 60000,
    imageUrls: [
      'https://m.media-amazon.com/images/I/61Z3rlLqc9L._AC_SL1500_.jpg', // Main product
      'https://m.media-amazon.com/images/I/71N4A8h+qNL._AC_SL1500_.jpg', // Head detail
      'https://m.media-amazon.com/images/I/61yGgY6pGCL._AC_SL1500_.jpg', // Charging port/back
      'https://m.media-amazon.com/images/I/71-Vq05cKOL._AC_SL1500_.jpg', // Blades/internal view
      'https://m.media-amazon.com/images/I/71s0X4qgqgL._AC_SL1500_.jpg', // IPX7/Waterproof feature
      'https://m.media-amazon.com/images/I/61PjO20tqWL._AC_SL1500_.jpg'  // LED Display/Angle
    ],
    category: 'Cuidados Pessoais',
    stock: 20,
    reviews: [
        { id: 'rev_xiaomi1', author: 'Pedro G.', rating: 5, comment: 'Excelente máquina de barbear, muito suave e eficiente. A bateria dura bastante.', date: new Date(Date.now() - 86400000 * 3).toISOString() },
        { id: 'rev_xiaomi2', author: 'Sofia A.', rating: 4, comment: 'Boa qualidade, mas um pouco cara. Funciona bem.', date: new Date(Date.now() - 86400000 * 7).toISOString() }
    ]
  },
];

export const FEATURED_PRODUCT_IDS: string[] = ['1', '2', '3', '4'];