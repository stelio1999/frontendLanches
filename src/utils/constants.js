// src/utils/constants.js//
export const APP_NAME = 'Delivery Food';
export const APP_VERSION = '1.0.0';

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY: '/auth/verify',
    PROFILE: '/auth/profile',
  },
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders/client',
    DETAILS: (id) => `/orders/${id}`,
    STATUS: (id) => `/orders/${id}/status`,
    CANCEL: (id) => `/orders/${id}/cancel`,
    KITCHEN: '/orders/kitchen',
    DELIVERY: '/orders/delivery',
    DELIVER: (id) => `/orders/${id}/deliver`,
  },
  PRODUCTS: {
    LIST: '/products',
    DETAILS: (id) => `/products/${id}`,
    CATEGORIES: '/products/categories',
    SEARCH: '/products/search',
    TOGGLE: (id) => `/products/${id}/toggle`,
  },
  PAYMENTS: {
    METHODS: '/payments/methods',
    BANKS: '/payments/banks',
    WALLETS: '/payments/wallets',
    PROOF: (id) => `/payments/${id}/proof`,
    VERIFY: (id) => `/payments/${id}/verify`,
  },
};

// Status constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  RECEIVED: 'received',
  PREPARING: 'preparing',
  READY: 'ready',
  SENT: 'sent',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  PAYMENT_VERIFICATION: 'payment_verification',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pendente',
  [ORDER_STATUS.RECEIVED]: 'Recebido',
  [ORDER_STATUS.PREPARING]: 'Em Preparação',
  [ORDER_STATUS.READY]: 'Pronto',
  [ORDER_STATUS.SENT]: 'Enviado',
  [ORDER_STATUS.DELIVERED]: 'Entregue',
  [ORDER_STATUS.CANCELLED]: 'Cancelado',
  [ORDER_STATUS.PAYMENT_VERIFICATION]: 'Verificando Pagamento',
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: '#FFA500',
  [ORDER_STATUS.RECEIVED]: '#4CAF50',
  [ORDER_STATUS.PREPARING]: '#2196F3',
  [ORDER_STATUS.READY]: '#9C27B0',
  [ORDER_STATUS.SENT]: '#FF9800',
  [ORDER_STATUS.DELIVERED]: '#4CAF50',
  [ORDER_STATUS.CANCELLED]: '#F44336',
  [ORDER_STATUS.PAYMENT_VERIFICATION]: '#FFC107',
};

// Payment methods
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_TRANSFER: 'mobile_transfer',
  IN_PERSON: 'in_person',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.BANK_TRANSFER]: 'Transferência Bancária',
  [PAYMENT_METHODS.MOBILE_TRANSFER]: 'Transferência Móvel',
  [PAYMENT_METHODS.IN_PERSON]: 'Pagamento Presencial',
};

// User types
export const USER_TYPES = {
  CLIENT: 'client',
  KITCHEN: 'kitchen',
  DELIVERY: 'delivery',
};

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  CART: 'cart',
  NOTIFICATIONS: 'notifications',
};

// Default values
export const DEFAULT = {
  DELIVERY_FREE_DISTANCE: 3, // km
  DELIVERY_RATE_PER_KM: 50, // MZN
  MAX_DELIVERY_DISTANCE: 20, // km
  ORDER_HISTORY_LIMIT: 50,
  PRODUCTS_PER_PAGE: 20,
};

// Regex patterns
export const PATTERNS = {
  PHONE: /^(8|84|85|82|83|86|87)\d{8}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^.{6,}$/,
  URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Sessão expirada. Faça login novamente.',
  NOT_FOUND: 'Recurso não encontrado.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente.',
  VALIDATION_ERROR: 'Verifique os dados informados.',
  PHONE_INVALID: 'Número de telefone inválido.',
  EMAIL_INVALID: 'Email inválido.',
  PASSWORD_WEAK: 'A senha deve ter pelo menos 6 caracteres.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  ORDER_CREATED: 'Pedido criado com sucesso!',
  ORDER_UPDATED: 'Status do pedido atualizado!',
  PAYMENT_APPROVED: 'Pagamento aprovado!',
  PAYMENT_REJECTED: 'Pagamento rejeitado.',
  PROFILE_UPDATED: 'Perfil atualizado com sucesso!',
  PRODUCT_CREATED: 'Produto criado com sucesso!',
  PRODUCT_UPDATED: 'Produto atualizado com sucesso!',
  PRODUCT_DELETED: 'Produto removido com sucesso!',
};