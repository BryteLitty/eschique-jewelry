import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, User, LogOut, Bell, LayoutDashboard } from 'lucide-react';
import Logo from '@/assets/logo.png';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import CartDropdown from '../cart/CartDropdown';

const Header = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
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
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:bg-gray-100 rounded-full"
          >
            <ShoppingBag className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#8B5E3C] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </button>

          {user ? (
            <>
              {isAdmin ? (
                <>
                  <Link 
                    to="/dashboard"
                    className="p-2 hover:text-[#8B5E3C] transition-colors"
                    aria-label="Dashboard"
                  >
                    <LayoutDashboard size={20} />
                  </Link>
                  <button 
                    className="p-2 hover:text-[#8B5E3C] transition-colors relative"
                    aria-label="Notifications"
                  >
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      3
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/wishlist"
                    className="p-2 hover:text-[#8B5E3C] transition-colors"
                    aria-label="Wishlist"
                  >
                    <Heart size={20} />
                  </Link>
                </>
              )}
              <div className="relative" ref={dropdownRef}>
                <button 
                  className="p-2 hover:text-[#8B5E3C] transition-colors"
                  aria-label="Account"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <User size={20} />
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-[#E5E5E5]">
                    <div className="px-4 py-2 text-sm text-[#1A1A1A] border-b border-[#E5E5E5]">
                      {fullName || user.email}
                      {isAdmin && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-[#8B5E3C] text-white rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                    {isAdmin ? (
                      <>
                        <Link 
                          to="/dashboard" 
                          className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F9F9F9]"
                        >
                          Dashboard
                        </Link>
                        <Link 
                          to="/dashboard/settings" 
                          className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F9F9F9]"
                        >
                          Settings
                        </Link>
                      </>
                    ) : (
                      <Link 
                        to="/profile" 
                        className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F9F9F9]"
                      >
                        Profile
                      </Link>
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
              className="px-4 py-2 text-[#1A1A1A] hover:text-[#8B5E3C] transition-colors"
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