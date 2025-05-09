import { useState, useEffect } from 'react';
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

// Create a custom event for cart updates
const CART_UPDATED_EVENT = 'cartUpdated';

export const useCart = () => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Initialize from local storage
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = (event: CustomEvent) => {
      const newCartItems = event.detail;
      setCartItems(newCartItems);
    };

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate as EventListener);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate as EventListener);
    };
  }, []);

  // Save to local storage and notify other components
  const updateCartState = (newItems: CartItem[]) => {
    setCartItems(newItems);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail: newItems }));
  };

  const fetchCartItems = async () => {
    if (!user) {
      updateCartState([]);
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
      updateCartState(data || []);
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError('Failed to fetch cart items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();

    if (user) {
      const cartSubscription = supabase
        .channel('cart_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'cart_items',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Cart change received:', payload);
            fetchCartItems();
          }
        )
        .subscribe();

      return () => {
        cartSubscription.unsubscribe();
      };
    }
  }, [user]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) return;

    try {
      // Get product details for optimistic update
      const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (!product) throw new Error('Product not found');

      // Check if item already exists in cart
      const existingItem = cartItems.find(item => item.product_id === productId);

      if (existingItem) {
        // Optimistically update UI
        const updatedItems = cartItems.map(item =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        updateCartState(updatedItems);

        // Update quantity in database
        const { error } = await supabase
          .from('cart_items')
          .update({ 
            quantity: existingItem.quantity + quantity,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        // Optimistically update UI with temporary ID
        const tempId = `temp-${Date.now()}`;
        const newItem = {
          id: tempId,
          product_id: productId,
          quantity,
          product
        };
        updateCartState([newItem, ...cartItems]);

        // Insert new item in database
        const { data: newCartItem, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity
          })
          .select()
          .single();

        if (error) throw error;

        // Update the temporary ID with the real one
        const updatedItems = cartItems.map(item =>
          item.id === tempId ? { ...item, id: newCartItem.id } : item
        );
        updateCartState(updatedItems);
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart');
      // Revert optimistic update on error
      fetchCartItems();
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (!user) return;

    try {
      // Optimistically update UI
      const updatedItems = cartItems.map(item =>
        item.id === cartItemId ? { ...item, quantity } : item
      );
      updateCartState(updatedItems);

      const { error } = await supabase
        .from('cart_items')
        .update({ 
          quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError('Failed to update cart item');
      // Revert optimistic update on error
      fetchCartItems();
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (!user) return;

    try {
      // Optimistically update UI
      const updatedItems = cartItems.filter(item => item.id !== cartItemId);
      updateCartState(updatedItems);

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', cartItemId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove item from cart');
      // Revert optimistic update on error
      fetchCartItems();
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      // Optimistically update UI
      updateCartState([]);

      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
      // Revert optimistic update on error
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