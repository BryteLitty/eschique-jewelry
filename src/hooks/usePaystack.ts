import { useState } from 'react';
import PaystackPop from '@paystack/inline-js';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import type { Order, CreateOrderData, PaymentStatus, OrderStatus } from '../types/order';

interface PaystackConfig {
  email: string;
  amount: number; // amount in pesewas
  currency?: string;
  reference?: string;
  metadata?: {
    order_items?: Array<{
      product_id: string;
      quantity: number;
      price: number;
    }>;
    shipping_address?: {
      full_name: string;
      address_line1: string;
      address_line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
      phone: string;
    };
    [key: string]: unknown;
  };
}

interface PaystackTransaction {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
}

export interface PaystackError {
  message: string;
  issues?: Array<{ message: string }>;
}

interface UsePaystackReturn {
  initializePayment: (config: PaystackConfig) => Promise<{ transaction: PaystackTransaction; order: Order }>;
  isProcessing: boolean;
}

export function usePaystack(): UsePaystackReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const initializePayment = async (config: PaystackConfig): Promise<{ transaction: PaystackTransaction; order: Order }> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!config.email) throw new Error('Email is required');
    if (!config.amount) throw new Error('Amount is required');
    if (config.amount < 100) throw new Error('Amount must be at least 100 pesewas (1 GHS)');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) throw new Error('Invalid email format');
    
    // Validate Paystack public key
    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
      throw new Error('Paystack public key is not configured');
    }

    setIsProcessing(true);

    try {
      // Generate order reference
      const orderRef = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Initialize Paystack payment
      const handler = new PaystackPop();
      return new Promise<{ transaction: PaystackTransaction; order: Order }>((resolve, reject) => {
        handler.newTransaction({
          key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
          email: config.email,
          amount: config.amount,
          currency: config.currency || 'GHS',
          ref: orderRef,
          metadata: {
            ...config.metadata,
            order_ref: orderRef
          },
          onSuccess: async (transaction) => {
            try {
              // Create order with paid status after successful payment
              const orderData: CreateOrderData = {
                user_id: user.id,
                order_number: orderRef,
                total_amount: config.amount / 100, // Convert from pesewas to cedis
                status: 'processing' as OrderStatus, // Set to processing immediately
                payment_status: 'paid' as PaymentStatus, // Set to paid immediately
                shipping_address: config.metadata?.shipping_address || {
                  full_name: '',
                  address_line1: '',
                  address_line2: '',
                  city: '',
                  state: '',
                  postal_code: '',
                  country: '',
                  phone: '',
                },
                order_items: config.metadata?.order_items?.map(item => ({
                  product_id: item.product_id,
                  quantity: item.quantity,
                  unit_price: item.price
                })) || []
              };

              console.log('Creating order after successful payment:', orderData);
              const order = await orderService.createOrder(orderData);
              console.log('Order created successfully:', order);
              
              resolve({ transaction, order });
            } catch (error) {
              console.error('Error creating order after successful payment:', error);
              reject(error);
            }
          },
          onCancel: () => {
            console.log('Payment cancelled');
            reject(new Error('Payment cancelled'));
          },
        });
      });
    } catch (error) {
      console.error('Error in payment process:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    initializePayment,
    isProcessing,
  };
} 