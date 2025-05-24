import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { useNavigate, useLocation } from 'react-router-dom';
import { Settings, ShoppingBag, Heart, Package, CreditCard, MapPin, User as UserIcon, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orderCount, setOrderCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchUserMetrics = async () => {
      if (!user) return;

      try {
        // Fetch order count
        const { count: orders, error: orderError } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (orderError) throw orderError;

        // Fetch wishlist count
        const { count: wishlist, error: wishlistError } = await supabase
          .from('wishlist_items')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (wishlistError) throw wishlistError;

        setOrderCount(orders || 0);
        setWishlistCount(wishlist || 0);
      } catch (error) {
        console.error('Error fetching user metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMetrics();

    // Subscribe to changes
    const ordersSubscription = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchUserMetrics();
        }
      )
      .subscribe();

    const wishlistSubscription = supabase
      .channel('wishlist_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlist_items',
          filter: `user_id=eq.${user?.id}`
        },
        () => {
          fetchUserMetrics();
        }
      )
      .subscribe();

    return () => {
      ordersSubscription.unsubscribe();
      wishlistSubscription.unsubscribe();
    };
  }, [user]);

  const quickActions = [
    {
      title: 'My Orders',
      description: 'View and track your orders',
      icon: Package,
      onClick: () => navigate('/profile/orders'),
      href: '/profile/orders',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Wishlist',
      description: 'View your saved items',
      icon: Heart,
      onClick: () => navigate('/wishlist'),
      href: '/wishlist',
      color: 'bg-pink-50 text-pink-600',
    },
    {
      title: 'Settings',
      description: 'Manage your account settings',
      icon: Settings,
      onClick: () => navigate('/profile/settings'),
      href: '/profile/settings',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  const stats = [
    {
      title: 'Total Orders',
      value: loading ? '...' : orderCount.toString(),
      icon: ShoppingBag,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Wishlist Items',
      value: loading ? '...' : wishlistCount.toString(),
      icon: Heart,
      color: 'bg-pink-50 text-pink-600',
    },
    {
      title: 'Saved Addresses',
      value: user?.user_metadata?.address ? '1' : '0',
      icon: MapPin,
      color: 'bg-blue-50 text-blue-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hamburger for Sidebar (Mobile)
      <div className="md:hidden flex justify-end mb-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md bg-[#8B5E3C] text-white focus:outline-none"
          aria-label="Open sidebar"
        >
          <Menu className="w-7 h-7" />
        </button>
      </div> */}
      {/* Sidebar Drawer */}
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
              <button onClick={() => {navigate('/profile'); setSidebarOpen(false);}} className="w-full text-left py-2 px-3 rounded hover:bg-gray-100">Profile</button>
              <button onClick={() => {navigate('/profile/orders'); setSidebarOpen(false);}} className="w-full text-left py-2 px-3 rounded hover:bg-gray-100">Orders</button>
              <button onClick={() => {navigate('/profile/settings'); setSidebarOpen(false);}} className="w-full text-left py-2 px-3 rounded hover:bg-gray-100">Settings</button>
            </nav>
          </aside>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#8B5E3C] to-[#A67B5B] rounded-lg p-8 text-white mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <UserIcon className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-[20px] md:text-3xl font-bold">Welcome back, {user?.user_metadata?.full_name || 'User'}</h1>
            <p className="text-white/80 mt-1">Manage your account and view your orders</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#666666]">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="bg-[#8B5E3C]/10 p-3 rounded-lg">
                  <UserIcon className="h-6 w-6 text-[#8B5E3C]" />
                </div>
                <div>
                  <p className="text-sm text-[#666666]">Full Name</p>
                  <p className="font-medium">{user?.user_metadata?.full_name || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-[#8B5E3C]/10 p-3 rounded-lg">
                  <CreditCard className="h-6 w-6 text-[#8B5E3C]" />
                </div>
                <div>
                  <p className="text-sm text-[#666666]">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-[#8B5E3C]/10 p-3 rounded-lg">
                  <MapPin className="h-6 w-6 text-[#8B5E3C]" />
                </div>
                <div>
                  <p className="text-sm text-[#666666]">Address</p>
                  <p className="font-medium">
                    {user?.user_metadata?.address ? (
                      <>
                        {user.user_metadata.address}
                        <br />
                        {user.user_metadata.city}, {user.user_metadata.state} {user.user_metadata.zip_code}
                      </>
                    ) : (
                      'Not set'
                    )}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => navigate('/profile/settings')}
                className="w-full"
              >
                Edit Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {quickActions.map((action) => (
                <button
                  key={action.title}
                  onClick={action.onClick}
                  className={cn(
                    "w-full flex items-center space-x-4 p-4 rounded-lg transition-colors",
                    location.pathname === action.href
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  )}
                >
                  <div className={`p-3 rounded-lg ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">{action.title}</h3>
                    <p className="text-sm text-[#666666]">{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-[#666666] mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {orderCount === 0 ? "No orders yet" : `You have ${orderCount} order${orderCount === 1 ? '' : 's'}`}
            </h3>
            <p className="text-[#666666] mb-6">
              {orderCount === 0 ? "Start shopping to see your orders here" : "View all your orders for more details"}
            </p>
            <Button 
              onClick={() => navigate(orderCount === 0 ? '/products' : '/orders')}
              className="bg-[#8B5E3C] hover:bg-[#8B5E3C]/90"
            >
              {orderCount === 0 ? 'Start Shopping' : 'View All Orders'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;