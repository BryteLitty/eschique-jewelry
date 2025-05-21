import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { formatCurrency } from '../../utils/format';
import { format } from 'date-fns';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  user: {
    email: string;
    full_name: string;
  };
}

interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
  recentOrders: Order[];
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    recentOrders: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Fetch total users
        const { count: userCount, error: userError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });

        if (userError) throw userError;

        // Fetch all orders with user details
        const { data: orders, error: orderError } = await supabase
          .from('orders')
          .select(`
            id,
            order_number,
            created_at,
            total_amount,
            status,
            payment_status,
            user:users (
              email,
              full_name
            )
          `)
          .order('created_at', { ascending: false });

        if (orderError) throw orderError;

        const formattedOrders: Order[] = (orders || []).map(order => {
          // Handle the user object from Supabase response
          const userData = Array.isArray(order.user) ? order.user[0] : order.user;
          return {
            id: order.id,
            order_number: order.order_number,
            created_at: order.created_at,
            total_amount: order.total_amount,
            status: order.status as Order['status'],
            payment_status: order.payment_status as Order['payment_status'],
            user: {
              email: userData?.email || 'Unknown',
              full_name: userData?.full_name || 'Unknown'
            }
          };
        });

        // Calculate metrics
        const totalRevenue = formattedOrders.reduce((sum, order) => sum + order.total_amount, 0);
        const pendingOrders = formattedOrders.filter(order => order.status === 'pending').length;
        const recentOrders = formattedOrders.slice(0, 5); // Get 5 most recent orders

        setMetrics({
          totalRevenue,
          totalOrders: formattedOrders.length,
          totalUsers: userCount || 0,
          pendingOrders,
          recentOrders
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.totalOrders}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.pendingOrders}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.recentOrders.map((order) => (
              <div key={order.id} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Order #{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                    <p className="text-sm">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'}`}>
                        {order.status}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Customer: {order.user.full_name} ({order.user.email})
                  </p>
                  <p className="text-sm text-gray-600">
                    Payment: {order.payment_status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 