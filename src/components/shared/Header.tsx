import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, User, LogOut } from 'lucide-react';
import Logo from '@/assets/logo.png';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          {user ? (
            <>
              <Link 
                to="/wishlist"
                className="p-2 hover:text-[#8B5E3C] transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>
              <Link 
                to="/cart"
                className="p-2 hover:text-[#8B5E3C] transition-colors"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
              </Link>
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
                      {user.email}
                    </div>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F9F9F9]"
                    >
                      Profile
                    </Link>
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
    </header>
  );
};

export default Header;