import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import inventoryReducer from './slices/inventorySlice';
import categoriesReducer from './slices/categoriesSlice';
import salesReducer from './slices/salesSlice';
import expensesReducer from './slices/expensesSlice';
import requestsReducer from './slices/requestsSlice';
import vendorsReducer from './slices/vendorsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    inventory: inventoryReducer,
    categories: categoriesReducer,
    sales: salesReducer,
    expenses: expensesReducer,
    requests: requestsReducer,
    vendors: vendorsReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      // Firestore Timestamps + Dayjs are non-serializable; ignore data paths
      // that we know carry them. Action checks stay on.
      serializableCheck: {
        ignoredPaths: [
          'inventory.items', 'inventory.byId',
          'sales.recent',
          'expenses.recent',
          'requests.list',
          'vendors.list',
        ],
        ignoredActionPaths: ['payload.createdAt', 'payload.updatedAt', 'payload.soldAt'],
      },
    }),
  devTools: import.meta.env.DEV,
});
