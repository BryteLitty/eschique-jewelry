import { useState, useEffect } from 'react';
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

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWishlistItems = async () => {
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
          product:products (
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
      setWishlistItems(data || []);
    } catch (err) {
      console.error('Error fetching wishlist items:', err);
      setError('Failed to fetch wishlist items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistItems();
  }, [user]);

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
      await fetchWishlistItems();
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError('Failed to add item to wishlist');
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('product_id', productId)
        .eq('user_id', user.id);

      if (error) throw error;
      await fetchWishlistItems();
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
    refreshWishlist: fetchWishlistItems
  };
}; 