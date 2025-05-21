import { Routes, Route, Outlet } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardHomepage from './pages/dashboard/DashboardHomepage';
import CategoriesPage from './pages/dashboard/CategoriesPage';
import WishlistAnalyticsPage from './pages/dashboard/WishlistAnalyticsPage';
import DashboardPage from './pages/admin/DashboardPage';
import OrdersPage from './pages/admin/OrdersPage';
import CheckoutPage from './pages/CheckoutPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
      </Route>

      {/* Admin Dashboard Routes */}
      <Route path="/dashboard" element={<ProtectedRoute requireAdmin><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardHomepage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="wishlist-analytics" element={<WishlistAnalyticsPage />} />
      </Route>

      <Route path="/admin" element={<DashboardPage />} />
      <Route path="/admin/orders" element={<OrdersPage />} />
      <Route path="/admin/products" element={<ProductsPage />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;