import { useWishlistAnalytics } from '../../hooks/useWishlistAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Loader2, Heart } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface User {
  id: string;
  full_name: string;
}

const WishlistAnalyticsPage = () => {
  const { analytics, loading, error } = useWishlistAnalytics();
  const [users, setUsers] = useState<Record<string, User>>({});
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name');

        if (error) throw error;

        const usersMap = data.reduce((acc, user) => {
          acc[user.id] = user;
          return acc;
        }, {} as Record<string, User>);

        setUsers(usersMap);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading || loadingUsers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!analytics.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">No wishlist data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wishlist Analytics</h1>
        <div className="flex items-center gap-2 text-gray-500">
          <Heart className="w-5 h-5" />
          <span>Total Products: {analytics.length}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Wishlist Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Wishlist Count</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Last Wishlisted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.map((item) => (
                <TableRow key={item.product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <span className="font-medium">{item.product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>GH₵ {item.product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`font-medium ${item.product.in_stock ? 'text-green-600' : 'text-red-600'}`}>
                      {item.product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 text-red-500" />
                      {item.wishlistCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {item.users.slice(0, 3).map((user) => (
                        <div key={user.id} className="text-sm">
                          {users[user.id]?.full_name || `User ${user.id.slice(0, 8)}...`}
                        </div>
                      ))}
                      {item.users.length > 3 && (
                        <div className="text-sm text-gray-500">
                          +{item.users.length - 3} more users
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {item.users.slice(0, 3).map((user) => (
                        <div key={user.id} className="text-sm text-gray-500">
                          {format(new Date(user.wishlisted_at), 'MMM d, yyyy')}
                        </div>
                      ))}
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
};

export default WishlistAnalyticsPage; 