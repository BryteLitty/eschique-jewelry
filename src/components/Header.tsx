import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserDropdown from './UserDropdown';
import { ShoppingCart } from 'lucide-react';
import { useCartQuery } from '../hooks/useCartQuery';

const Header = () => {
  const { user } = useAuth();
  const { cartItems } = useCartQuery();
  const totalItems = (cartItems ?? []).reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-[#8B5E3C]">
            Eschique
          </Link>

          <nav className="hidden md:flex space-x-8">
            <Link to="/products" className="text-gray-600 hover:text-[#8B5E3C]">
              Products
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-[#8B5E3C]">
              Categories
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/cart" className="relative p-2 text-gray-600 hover:text-[#8B5E3C]">
                  <ShoppingCart className="h-6 w-6" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#8B5E3C] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
                <UserDropdown />
              </>
            ) : (
              <div className="space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-[#8B5E3C]"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-[#8B5E3C] text-white px-4 py-2 rounded-md hover:bg-[#8B5E3C]/90"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;