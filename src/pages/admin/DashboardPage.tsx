import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  user: {
    email: string;
  };
}

export default function DashboardPage() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const { data: orders, error } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            total,
            status,
            user:user_id (
              email
            )
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;

        const formattedOrders: Order[] = (orders || []).map(order => ({
          id: order.id,
          created_at: order.created_at,
          total: order.total,
          status: order.status,
          user: {
            email: order.user?.[0]?.email || 'Unknown'
          }
        }));

        setRecentOrders(formattedOrders);
        
        // Calculate total revenue
        const revenue = formattedOrders.reduce((sum, order) => sum + order.total, 0);
        setTotalRevenue(revenue);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="border-b pb-2">
                  <p className="font-medium">Order #{order.id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm">${order.total.toFixed(2)}</p>
                  <p className="text-sm">Status: {order.status}</p>
                  <p className="text-sm">Customer: {order.user.email}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 