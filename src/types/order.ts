export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_address: {
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone: string;
  };
  created_at: string;
  user?: {
    email: string;
    full_name: string;
  };
  order_items?: Array<{
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    product: {
      name: string;
      image_url: string;
    };
  }>;
}

export interface CreateOrderData {
  user_id: string;
  order_number: string;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  shipping_address: Order['shipping_address'];
  order_items?: Array<{
    product_id: string;
    quantity: number;
    unit_price: number;
  }>;
} 