import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Homepage from './pages/Homepage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHomepage from './pages/dashboard/DashboardHomepage';
import ProductDetailPage from './pages/ProductDetailPage';
import AllProductsPage from './pages/AllProductsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import ProductsPage from './pages/dashboard/ProductsPage';
import CategoriesPage from './pages/dashboard/CategoriesPage';
import SettingsPage from './pages/dashboard/SettingsPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/products" element={<AllProductsPage />} />
              
              {/* Dashboard Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requireAdmin>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                <Route index element={<DashboardHomepage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="orders" element={<div>Orders Page</div>} />
                <Route path="wishlist" element={<div>Wishlist Page</div>} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Protected Routes */}
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

              {/* 404 Route - Must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)


