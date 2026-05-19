// App-wide constants. Keep these centralized so feature modules stay in sync.

export const DEFAULT_CATEGORIES = [
  { id: 'sarees', name: 'Sarees', icon: '🥻' },
  { id: '1gram-gold', name: '1 Gram Gold', icon: '💍' },
  { id: 'maggam-blouse', name: 'Maggam Work Blouse', icon: '👚' },
  { id: 'normal-blouse', name: 'Normal Blouse', icon: '👕' },
  { id: 'langalu', name: 'Langalu (Saree Inner)', icon: '🩱' },
  { id: 'nighties', name: 'Nighties', icon: '👗' },
  { id: 'matti-gajulu', name: 'Matti Gajulu (Glass Bangles)', icon: '💫' },
];

export const EXPENSE_TYPES = [
  { id: 'fuel', name: 'Fuel' },
  { id: 'food', name: 'Food' },
  { id: 'travel', name: 'Travel' },
  { id: 'textile-purchase', name: 'Textile Purchases' },
  { id: 'jewellery-purchase', name: 'Jewellery Purchases' },
  { id: 'misc', name: 'Miscellaneous' },
];

export const PAYMENT_TYPES = [
  { id: 'cash', name: 'Cash' },
  { id: 'upi', name: 'UPI' },
  { id: 'card', name: 'Card' },
  { id: 'bank', name: 'Bank Transfer' },
  { id: 'credit', name: 'Credit (Pending)' },
];

export const STOCK_STATUS = {
  IN_STOCK: 'in_stock',
  LOW: 'low',
  OUT: 'out',
};

export const LOW_STOCK_THRESHOLD = 3; // pieces remaining
export const OLD_STOCK_DAYS = 90;     // days since added

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/',
  ITEMS: '/items',
  ITEM_NEW: '/items/new',
  ITEM_EDIT: (id) => `/items/${id}/edit`,
  ITEM_DETAIL: (id) => `/items/${id}`,
  SALES: '/sales',
  SALE_NEW: '/sales/new',
  EXPENSES: '/expenses',
  EXPENSE_NEW: '/expenses/new',
  REQUESTS: '/requests',
  REPORTS: '/reports',
  SETTINGS: '/settings',
  CATEGORIES: '/settings/categories',
  VENDORS: '/settings/vendors',
};

export const REQUEST_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
};

export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  ACCOUNTANT: 'accountant',
};

// Firestore collection names — single source of truth
export const COLLECTIONS = {
  USERS: 'users',
  CATEGORIES: 'categories',
  INVENTORY: 'inventory',
  SALES: 'sales',
  EXPENSES: 'expenses',
  REQUESTED_ITEMS: 'requestedItems',
  VENDORS: 'vendors',
  SETTINGS: 'settings',
  REPORTS_CACHE: 'reportsCache',
};
