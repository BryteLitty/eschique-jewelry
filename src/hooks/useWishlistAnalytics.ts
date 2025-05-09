import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface WishlistAnalytics {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    in_stock: boolean;
    stock_quantity: number;
  };
  wishlistCount: number;
  users: {
    id: string;
    wishlisted_at: string;
  }[];
}

export const useWishlistAnalytics = () => {
  const [analytics, setAnalytics] = useState<WishlistAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      const { data: wishlistItems, error: wishlistError } = await supabase
        .from('wishlist_items')
        .select('*');

      if (wishlistError) {
        console.error('Error fetching wishlist items:', wishlistError);
        throw wishlistError;
      }

      if (!wishlistItems || wishlistItems.length === 0) {
        setAnalytics([]);
        setLoading(false);
        return;
      }

      const productIds = [...new Set(wishlistItems.map(item => item.product_id))];

      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (productsError) {
        console.error('Error fetching products:', productsError);
        throw productsError;
      }

      const productMap = new Map();
      
      wishlistItems.forEach(item => {
        const product = products?.find(p => p.id === item.product_id);
        if (!product) return;

        if (!productMap.has(item.product_id)) {
          productMap.set(item.product_id, {
            product: {
              id: product.id,
              name: product.name,
              price: product.price,
              image_url: product.image_url,
              in_stock: product.in_stock,
              stock_quantity: product.stock_quantity
            },
            wishlistCount: 0,
            users: []
          });
        }
        
        const productData = productMap.get(item.product_id);
        productData.wishlistCount++;
        productData.users.push({
          id: item.user_id,
          wishlisted_at: item.created_at
        });
      });

      const sortedData = Array.from(productMap.values())
        .sort((a, b) => b.wishlistCount - a.wishlistCount);
      
      setAnalytics(sortedData);
    } catch (err) {
      console.error('Error fetching wishlist analytics:', err);
      setError('Failed to fetch wishlist analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAnalytics();

    // Subscribe to changes
    const wishlistSubscription = supabase
      .channel('wishlist_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wishlist_items'
        },
        (payload) => {
          console.log('Wishlist change detected:', payload);
          // Refresh data when any change occurs
          fetchAnalytics();
        }
      )
      .subscribe();

    // Subscribe to product changes
    const productSubscription = supabase
      .channel('product_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          console.log('Product change detected:', payload);
          // Refresh data when any product changes
          fetchAnalytics();
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      wishlistSubscription.unsubscribe();
      productSubscription.unsubscribe();
    };
  }, []);

  return {
    analytics,
    loading,
    error,
    refreshAnalytics: fetchAnalytics
  };
}; 