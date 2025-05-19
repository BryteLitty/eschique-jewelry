export type OrderStatus = 'Pending' | 'Paid' | 'Shipped';

export interface Order {
  id: string;
  user_id: string | null;
  total_amount: number;
  status: OrderStatus;
  created_at?: string;
}

export interface CreateOrderData {
  user_id: string;
  total_amount: number;
  status: OrderStatus;
} 