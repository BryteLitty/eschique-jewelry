import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../utils/format';
import { format } from 'date-fns';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useToast } from '../../hooks/useToast';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  id: string;
  email: string;
  full_name: string;
}

interface Order {
  id: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
  user: {
    email: string;
    full_name: string;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    console.log('Auth state:', { 
      isAdmin, 
      userId: user?.id,
      email: user?.email,
      role: user?.role
    });
    
    if (isAdmin) {
      fetchOrders();
    } else {
      console.log('Not admin, skipping fetch');
    }
  }, [isAdmin, user]);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders as admin...');
      
      // First, verify admin status in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin, email')
        .eq('id', user?.id)
        .single();

      if (userError) {
        console.error('Error checking admin status:', userError);
        throw userError;
      }

      console.log('Admin status check:', {
        userData,
        userId: user?.id
      });

      if (!userData?.is_admin) {
        console.error('User is not an admin in the database');
        return;
      }

      // Try using the get_all_orders function first
      console.log('Attempting to fetch orders using get_all_orders function...');
      const { data: allOrders, error: funcError } = await supabase
        .rpc('get_all_orders');

      console.log('get_all_orders attempt:', {
        success: !funcError,
        error: funcError,
        orderCount: allOrders?.length || 0
      });

      if (!funcError && allOrders && allOrders.length > 0) {
        // Transform the data to match the expected Order interface
        const formattedOrders = allOrders.map((order: {
          id: string;
          order_number: string;
          user_id: string;
          total_amount: number;
          status: Order['status'];
          created_at: string;
          user_email: string;
          user_full_name: string;
        }) => ({
          ...order,
          user: {
            email: order.user_email,
            full_name: order.user_full_name
          }
        }));
        setOrders(formattedOrders);
        setLoading(false);
        return;
      }

      // If function call fails, try regular query
      console.log('Falling back to regular query...');
      const { data, error } = await supabase
        .from('orders')
        .select('*, user:users(email, full_name)')
        .order('created_at', { ascending: false });

      console.log('Orders fetch attempt:', {
        success: !error,
        error,
        orderCount: data?.length || 0
      });

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        // Try without the join as a last resort
        console.log('Trying simplified query without join...');
        const { data: basicData, error: basicError } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('Basic orders fetch:', {
          success: !basicError,
          error: basicError,
          orderCount: basicData?.length || 0
        });

        if (basicError) throw basicError;
        if (basicData && basicData.length > 0) {
          // Fetch user details separately
          const userIds = [...new Set(basicData.map(order => order.user_id))];
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, full_name')
            .in('id', userIds);

          if (usersError) throw usersError;

          const userMap = (users || []).reduce<Record<string, User>>((acc, user) => {
            acc[user.id] = user;
            return acc;
          }, {});

          const ordersWithUsers = basicData.map(order => ({
            ...order,
            user: userMap[order.user_id] || { email: 'Unknown', full_name: 'Unknown' }
          }));

          setOrders(ordersWithUsers);
          return;
        }
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: 'Success',
        description: 'Order status updated successfully',
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
        <div className="flex gap-4">
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
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
                <TableHead>Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link to={`/dashboard/orders/${order.id}`} className="text-blue-600 hover:underline">
                      {order.order_number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.user.full_name}</div>
                      <div className="text-sm text-gray-500">{order.user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}
                  </TableCell>
                  <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                      {order.payment_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Select
                        value={order.status}
                        onValueChange={(value: Order['status']) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Update status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" asChild>
                        <Link to={`/dashboard/orders/${order.id}`}>View Details</Link>
                      </Button>
                    </div>
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