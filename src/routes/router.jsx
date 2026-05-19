import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import PageSkeleton from '../components/feedback/PageSkeleton';

const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const InventoryListPage = lazy(() => import('../pages/Inventory/InventoryListPage'));
const ItemDetailPage = lazy(() => import('../pages/Inventory/ItemDetailPage'));
const ItemFormPage = lazy(() => import('../pages/Inventory/ItemFormPage'));
const SalesListPage = lazy(() => import('../pages/Sales/SalesListPage'));
const NewSalePage = lazy(() => import('../pages/Sales/NewSalePage'));
const ExpensesListPage = lazy(() => import('../pages/Expenses/ExpensesListPage'));
const ExpenseFormPage = lazy(() => import('../pages/Expenses/ExpenseFormPage'));
const ReportsPage = lazy(() => import('../pages/Reports/ReportsPage'));
const RequestsPage = lazy(() => import('../pages/Requests/RequestsPage'));
const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage'));
const CategoriesPage = lazy(() => import('../pages/Settings/CategoriesPage'));
const VendorsPage = lazy(() => import('../pages/Settings/VendorsPage'));
const SeedPage = lazy(() => import('../pages/Dev/SeedPage'));

const lazyWrap = (element) => <Suspense fallback={<PageSkeleton />}>{element}</Suspense>;

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      { index: true, element: lazyWrap(<LoginPage />) },
    ],
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: lazyWrap(<DashboardPage />) },

      // Inventory
      { path: 'items', element: lazyWrap(<InventoryListPage />) },
      { path: 'items/new', element: lazyWrap(<ItemFormPage mode="create" />) },
      { path: 'items/:id', element: lazyWrap(<ItemDetailPage />) },
      { path: 'items/:id/edit', element: lazyWrap(<ItemFormPage mode="edit" />) },

      // Sales
      { path: 'sales', element: lazyWrap(<SalesListPage />) },
      { path: 'sales/new', element: lazyWrap(<NewSalePage />) },

      // Expenses
      { path: 'expenses', element: lazyWrap(<ExpensesListPage />) },
      { path: 'expenses/new', element: lazyWrap(<ExpenseFormPage />) },

      // Requests
      { path: 'requests', element: lazyWrap(<RequestsPage />) },

      // Reports
      { path: 'reports', element: lazyWrap(<ReportsPage />) },

      // Settings
      { path: 'settings', element: lazyWrap(<SettingsPage />) },
      { path: 'settings/categories', element: lazyWrap(<CategoriesPage />) },
      { path: 'settings/vendors', element: lazyWrap(<VendorsPage />) },

      // Dev tools
      // { path: 'seed', element: lazyWrap(<SeedPage />) },

      // Fallback
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
