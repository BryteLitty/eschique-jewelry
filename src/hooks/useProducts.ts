import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  in_stock: boolean;
  stock_quantity: number;
  category_id: string;
  created_at: string;
  featured: boolean;
}

export function useProducts(options?: {
  featured?: boolean;
  categoryId?: string;
  limit?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        let query = supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (options?.featured) {
          query = query.eq('featured', true);
        }

        if (options?.categoryId) {
          query = query.eq('category_id', options.categoryId);
        }

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [options?.featured, options?.categoryId, options?.limit]);

  return { products, loading, error };
} 