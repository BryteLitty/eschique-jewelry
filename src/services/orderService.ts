import { supabase } from '../lib/supabase';
import type { CreateOrderData, Order } from '../types/order';

export const orderService = {
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }

    return data;
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }

    return data;
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }

    return data;
  }
}; 