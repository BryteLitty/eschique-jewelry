import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Heart, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Orders',
      href: '/dashboard/orders',
      icon: ShoppingBag
    },
    {
      name: 'Wishlist',
      href: '/dashboard/wishlist',
      icon: Heart
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings
    }
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r border-[#E5E5E5] bg-white">
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h2 className="text-xl font-semibold text-[#1A1A1A]">Dashboard</h2>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                  isActive
                    ? 'bg-[#8B5E3C] text-white'
                    : 'text-[#1A1A1A] hover:bg-[#F9F9F9]'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5',
                    isActive ? 'text-white' : 'text-[#1A1A1A] group-hover:text-[#8B5E3C]'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex-shrink-0 flex border-t border-[#E5E5E5] p-4">
        <button
          onClick={() => signOut()}
          className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-[#1A1A1A] hover:bg-[#F9F9F9] w-full"
        >
          <LogOut className="mr-3 h-5 w-5 text-[#1A1A1A] group-hover:text-[#8B5E3C]" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;