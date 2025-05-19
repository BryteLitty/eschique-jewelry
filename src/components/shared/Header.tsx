import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, User, LogOut, LayoutDashboard } from 'lucide-react';
import Logo from '@/assets/logo.png';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useCartCount } from '../../hooks/useCartCount';
import CartDropdown from '../cart/CartDropdown';

const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const cartCount = useCartCount();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fullName, setFullName] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setFullName(data.full_name);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white border-b py-2 border-[#E5E5E5] sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-montserrat text-xl font-bold text-[#1A1A1A]">
          <img src={Logo} alt="Logo" className="h-16" />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/categories" className="text-[#1A1A1A] hover:text-[#8B5E3C] transition-colors">
            Categories
          </Link>
          <Link to="/new-arrivals" className="text-[#1A1A1A] hover:text-[#8B5E3C] transition-colors">
            New Arrivals
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {!isAdmin && (
            <>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-full"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#8B5E3C] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
              <Link to="/wishlist" className="p-2 hover:bg-gray-100 rounded-full">
                <Heart className="w-6 h-6" />
              </Link>
            </>
          )}

          {user ? (
            <>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full"
                  title="User Menu"
                >
                  <User className="w-6 h-6" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {fullName || user.email}
                    </div>
                    {isAdmin ? (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F9F9F9]"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <div className="flex items-center gap-2">
                          <LayoutDashboard size={16} />
                          Dashboard
                        </div>
                      </Link>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F9F9F9]"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="flex items-center gap-2">
                            <User size={16} />
                            My Account
                          </div>
                        </Link>
                        <Link
                          to="/profile/orders"
                          className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F9F9F9]"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <div className="flex items-center gap-2">
                            <ShoppingBag size={16} />
                            My Orders
                          </div>
                        </Link>
                      </>
                    )}
                    <button
                      onClick={() => {
                        signOut();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F9F9F9] flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link 
              to="/login" 
              className="px-4 py-2 text-[#1A1A1A] hover:text-[#8B5E3C] transition-colors cursor-pointer"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Cart Dropdown */}
      <CartDropdown isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;