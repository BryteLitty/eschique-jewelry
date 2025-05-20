import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  user: {
    email: string;
  };
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  averageOrderValue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    averageOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch recent orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          total_amount,
          status,
          created_at,
          user:users (
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (ordersError) throw ordersError;

      // Get total orders count
      const { count: totalOrders, error: countError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      // Get pending orders count
      const { count: pendingOrders, error: pendingError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      // Get total revenue from paid orders
      const { data: paidOrders, error: paidError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('payment_status', 'paid');

      if (paidError) throw paidError;

      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total_amount, 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setStats({
        totalOrders: totalOrders || 0,
        totalRevenue,
        pendingOrders: pendingOrders || 0,
        averageOrderValue,
      });

      setRecentOrders(orders || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageOrderValue)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Recent Orders</CardTitle>
            <Link to="/dashboard/orders" className="text-sm text-blue-600 hover:underline">
              View All Orders
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link to={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:underline">
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell>{order.user.email}</TableCell>
                  <TableCell>{format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}</TableCell>
                  <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 