import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import PageSkeleton from '../components/feedback/PageSkeleton';
import { ROUTES } from '../constants';

// Lazy-loaded — each becomes its own chunk for fast initial paint on mobile
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'));
const LoginPage = lazy(() => import('../pages/Auth/LoginPage'));
const PlaceholderPage = lazy(() => import('../pages/PlaceholderPage'));
const InventoryListPage = lazy(() => import('../pages/Inventory/InventoryListPage'));
const ItemDetailPage = lazy(() => import('../pages/Inventory/ItemDetailPage'));
const ItemFormPage = lazy(() => import('../pages/Inventory/ItemFormPage'));

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

      // Inventory routes
      { path: 'items', element: lazyWrap(<InventoryListPage />) },
      { path: 'items/new', element: lazyWrap(<ItemFormPage mode="create" />) },
      { path: 'items/:id', element: lazyWrap(<ItemDetailPage />) },
      { path: 'items/:id/edit', element: lazyWrap(<ItemFormPage mode="edit" />) },

      // Sales routes
      { path: 'sales', element: lazyWrap(<PlaceholderPage title="Sales" description="Recent sales history with filters." />) },
      { path: 'sales/new', element: lazyWrap(<PlaceholderPage title="New Sale" back description="Quick sale entry — search item, set price, record." />) },

      // Expense routes
      { path: 'expenses', element: lazyWrap(<PlaceholderPage title="Expenses" description="Day-wise expenses + bulk purchase tracking." />) },
      { path: 'expenses/new', element: lazyWrap(<PlaceholderPage title="Add Expense" back />) },

      // Requests
      { path: 'requests', element: lazyWrap(<PlaceholderPage title="Customer Requests" description="Out-of-stock notes for market planning." />) },

      // Reports
      { path: 'reports', element: lazyWrap(<PlaceholderPage title="Reports" description="Sales, inventory, profit, and expense reports." />) },

      // Settings
      { path: 'settings', element: lazyWrap(<PlaceholderPage title="Settings" />) },
      { path: 'settings/categories', element: lazyWrap(<PlaceholderPage title="Categories" back />) },
      { path: 'settings/vendors', element: lazyWrap(<PlaceholderPage title="Vendors" back />) },

      // Fallback
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
