import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface WishlistItem {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    in_stock: boolean;
    stock_quantity: number;
  };
}

interface WishlistData {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    in_stock: boolean;
    stock_quantity: number;
  };
}

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('wishlist_items')
        .select(`
          id,
          product_id,
          product:products!inner (
            id,
            name,
            price,
            image_url,
            in_stock,
            stock_quantity
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // First cast to unknown then to our interface to safely handle the type conversion
      const formattedData = ((data as unknown) as WishlistData[]).map(item => ({
        id: item.id,
        product_id: item.product_id,
        product: item.product
      }));

      setWishlistItems(formattedData);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();

    if (user) {
      const subscription = supabase
        .channel('wishlist_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'wishlist_items',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchWishlist();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, fetchWishlist]);

  const addToWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: productId
        });

      if (error) throw error;
      await fetchWishlist();
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError('Failed to add item to wishlist');
    }
  };

  const removeFromWishlist = async (id: string) => {
    if (!user) return;

    try {
      // Check if the ID is a wishlist item ID or a product ID
      const isWishlistItemId = wishlistItems.some(item => item.id === id);
      
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq(isWishlistItemId ? 'id' : 'product_id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchWishlist();
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError('Failed to remove item from wishlist');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product_id === productId);
  };

  return {
    wishlistItems,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist: fetchWishlist
  };
};