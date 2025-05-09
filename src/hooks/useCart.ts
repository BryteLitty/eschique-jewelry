import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    in_stock: boolean;
    stock_quantity: number;
  };
}

const CART_STORAGE_KEY = 'cart_items';

export const useCart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Initialize from local storage
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Update local storage whenever cart items change
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cartItems }));
  }, [cartItems]);

  const fetchCartItems = useCallback(async () => {
    if (!user) {
      // For non-logged in users, get cart from localStorage
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCartItems(parsedCart);
        } catch (err) {
          console.error('Error parsing cart from localStorage:', err);
          setCartItems([]);
        }
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
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

      const formattedData: CartItem[] = (data as unknown as CartItem[]).map(item => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.product
      }));

      setCartItems(formattedData);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCartItems();

    if (user) {
      const subscription = supabase
        .channel('cart_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchCartItems();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, fetchCartItems]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      // Check if product exists in cart
      const existingItem = cartItems.find(item => item.product_id === productId);
      let updatedItems: CartItem[];

      // Fetch product details first to ensure it exists and is in stock
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      if (!productData.in_stock) throw new Error('Product is out of stock');

      // Calculate new quantity
      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

      // Check if new quantity exceeds stock
      if (newQuantity > productData.stock_quantity) {
        throw new Error('Not enough stock available');
      }

      if (existingItem) {
        // Update existing item quantity
        updatedItems = cartItems.map(item =>
          item.product_id === productId
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          id: Date.now().toString(),
          product_id: productId,
          quantity,
          product: productData
        };
        updatedItems = [...cartItems, newItem];
      }

      // Update local state immediately for better UX
      setCartItems(updatedItems);

      // Sync with database for logged-in users
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .upsert(
            {
              user_id: user.id,
              product_id: productId,
              quantity: newQuantity
            },
            {
              onConflict: 'user_id,product_id'
            }
          );

        if (error) throw error;
      }

      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedItems }));
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to add item to cart');
      // Revert local state on error
      fetchCartItems();
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      // Update local state immediately
      const updatedItems = cartItems.map(item =>
        item.product_id === productId
          ? { ...item, quantity }
          : item
      );
      setCartItems(updatedItems);

      // Then sync with database if user is logged in
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('product_id', productId)
          .eq('user_id', user.id);

        if (error) throw error;
      }
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      setError('Failed to update cart quantity');
      // Revert local state on error
      fetchCartItems();
    }
  };

  const removeFromCart = async (itemId: string) => {
    try {
      const itemToRemove = cartItems.find(item => item.id === itemId);
      if (!itemToRemove) return;

      // First, update local state immediately
      const updatedItems = cartItems.filter(item => item.id !== itemId);
      setCartItems(updatedItems);

      // Then sync with database if user is logged in
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user.id);

        if (error) {
          // If database operation fails, revert local state
          setCartItems(cartItems);
          throw error;
        }
      }

      // Force a re-render by dispatching a custom event
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: updatedItems 
      }));
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove item from cart');
      // Revert local state on error
      fetchCartItems();
    }
  };

  const clearCart = async () => {
    try {
      // Update local state immediately
      setCartItems([]);

      // Then sync with database if user is logged in
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) throw error;
      }

      // Force a re-render by dispatching a custom event
      window.dispatchEvent(new CustomEvent('cartUpdated', { 
        detail: [] 
      }));
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
      // Revert local state on error
      fetchCartItems();
    }
  };

  return {
    cartItems,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCartItems
  };
};