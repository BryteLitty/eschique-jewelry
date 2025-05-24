import { Outlet, NavLink } from 'react-router-dom';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import { User, Settings, ShoppingBag, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function UserLayout() {
  const navigation = [
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      end: true
    },
    {
      name: 'Orders',
      href: '/profile/orders',
      icon: ShoppingBag
    },
    {
      name: 'Settings',
      href: '/profile/settings',
      icon: Settings
    }
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hamburger for Sidebar (Mobile) */}
      <div className="md:hidden flex justify-start px-4 pt-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md bg-[#8B5E3C] text-white focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-7 h-7" />
        </button>
      </div>
      {/* Sidebar Drawer for Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white h-full shadow-xl p-6 flex flex-col">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-[#8B5E3C]"
              aria-label="Close sidebar"
            >
              <X className="w-6 h-6" />
            </button>
            <nav className="mt-8 space-y-4">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden md:block w-full md:w-64 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </aside>
          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}