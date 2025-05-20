import { supabase } from '../lib/supabase';
import type { CreateOrderData, Order, PaymentStatus } from '../types/order';

export const orderService = {
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    // Start a transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: orderData.user_id,
        order_number: orderData.order_number,
        total_amount: orderData.total_amount,
        status: orderData.status,
        payment_status: orderData.payment_status,
        shipping_address: orderData.shipping_address
      }])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      throw new Error('Failed to create order');
    }

    // Create order items if they exist
    if (orderData.order_items && orderData.order_items.length > 0) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          orderData.order_items.map(item => ({
            order_id: order.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price
          }))
        );

      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        throw new Error('Failed to create order items');
      }
    }

    // Fetch the complete order with items
    const { data: completeOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        user:users (
          email,
          full_name
        ),
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          product:products (
            name,
            image_url
          )
        )
      `)
      .eq('id', order.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete order:', fetchError);
      throw new Error('Failed to fetch complete order');
    }

    return completeOrder;
  },

  async getOrderById(orderId: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        user:users (
          email,
          full_name
        ),
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          product:products (
            name,
            image_url
          )
        )
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }

    return data;
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
    try {
      // First update the status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating order status:', updateError);
        throw new Error('Failed to update order status');
      }

      // Then fetch the updated order
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          user:users (
            email,
            full_name
          ),
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            product:products (
              name,
              image_url
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (fetchError) {
        console.error('Error fetching updated order:', fetchError);
        throw new Error('Failed to fetch updated order');
      }

      return data;
    } catch (error) {
      console.error('Error in updateOrderStatus:', error);
      throw error;
    }
  },

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
    try {
      // First update the payment status
      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_status: paymentStatus })
        .eq('id', orderId);

      if (updateError) {
        console.error('Error updating payment status:', updateError);
        throw new Error('Failed to update payment status');
      }

      // Then fetch the updated order with all relations
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          user:users (
            email,
            full_name
          ),
          order_items (
            id,
            product_id,
            quantity,
            unit_price,
            product:products (
              name,
              image_url
            )
          )
        `)
        .eq('id', orderId)
        .single();

      if (fetchError) {
        console.error('Error fetching updated order:', fetchError);
        throw new Error('Failed to fetch updated order');
      }

      return data;
    } catch (error) {
      console.error('Error in updatePaymentStatus:', error);
      throw error;
    }
  }
}; 