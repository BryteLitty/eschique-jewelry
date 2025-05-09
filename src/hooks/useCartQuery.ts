import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

interface SupabaseCartItem {
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
  }[];
}

const CART_STORAGE_KEY = 'cart_items';

export const useCartQuery = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartItems, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      if (!user) {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        return (savedCart ? JSON.parse(savedCart) : []) as CartItem[];
      }

      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
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

      // Transform the data to match CartItem interface
      const transformedData = (data || []).map((item: SupabaseCartItem) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: Array.isArray(item.product) ? item.product[0] : item.product
      }));

      return transformedData;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  // Update local storage when cart items change
  useEffect(() => {
    if (!user && cartItems) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  // Listen for real-time updates if user is logged in
  useEffect(() => {
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
            queryClient.invalidateQueries({ queryKey: ['cart'] });
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, queryClient]);

  const addToCart = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      // Fetch product details first to ensure it exists and is in stock
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (productError) throw productError;
      if (!productData.in_stock) throw new Error('Product is out of stock');

      const existingItem = cartItems?.find((item: CartItem) => item.product_id === productId);
      const newQuantity = existingItem ? existingItem.quantity + quantity : quantity;

      if (newQuantity > productData.stock_quantity) {
        throw new Error('Not enough stock available');
      }

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
      } else {
        // For non-logged in users, update localStorage
        const newCart = existingItem
          ? cartItems?.map((item: CartItem) =>
              item.product_id === productId
                ? { ...item, quantity: newQuantity }
                : item
            )
          : [
              ...(cartItems || []),
              {
                id: Date.now().toString(),
                product_id: productId,
                quantity,
                product: productData
              }
            ];

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
        queryClient.setQueryData(['cart'], newCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('product_id', productId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // For non-logged in users, update localStorage
        const newCart = cartItems?.map((item: CartItem) =>
          item.product_id === productId
            ? { ...item, quantity }
            : item
        );

        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
        queryClient.setQueryData(['cart'], newCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  const removeFromCart = useMutation({
    mutationFn: async (cartItemId: string) => {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', cartItemId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // For non-logged in users, update localStorage
        const newCart = cartItems?.filter((item: CartItem) => item.id !== cartItemId);
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
        queryClient.setQueryData(['cart'], newCart);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });

  return {
    cartItems,
    isLoading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart
  };
};