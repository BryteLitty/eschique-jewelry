import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import HomePage from './pages/Homepage'
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { WishlistProvider } from './contexts/WishlistContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import UserLayout from './layouts/UserLayout';
import DashboardHomepage from './pages/dashboard/DashboardHomepage';
import ProductDetailPage from './pages/ProductDetailPage';
import AllProductsPage from './pages/AllProductsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import ProductsPage from './pages/dashboard/ProductsPage';
import CategoriesPage from './pages/dashboard/CategoriesPage';
import SettingsPage from './pages/dashboard/SettingsPage';
import WishlistAnalyticsPage from './pages/dashboard/WishlistAnalyticsPage';
import UserDashboard from './pages/dashboard/UserDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import CheckoutPage from './pages/CheckoutPage';
// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes (garbage collection time)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Toaster position="top-right" />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/products" element={<AllProductsPage />} />
              
              {/* Admin Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requireAdmin>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardHomepage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="orders" element={<div>Orders Page</div>} />
                <Route path="wishlist" element={<WishlistAnalyticsPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Protected User Routes */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              }>
                <Route index element={<UserDashboard />} />
              </Route>
              <Route path="/cart" element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              } />
              <Route path="/wishlist" element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/checkout" element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              } />


              {/* 404 Route - Must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ReactQueryDevtools initialIsOpen={false} />
          </BrowserRouter>
        </WishlistProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)


