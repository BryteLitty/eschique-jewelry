import { useState } from 'react';
import PaystackPop from '@paystack/inline-js';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import type { Order } from '../types/order';

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
      full_name?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      postal_code?: string;
      phone_number?: string;
    };
    [key: string]: unknown;
  };
}

export interface PaystackError {
  message: string;
  issues?: Array<{ message: string }>;
}

interface PaystackTransaction {
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  message: string;
}

interface UsePaystackReturn {
  initializePayment: (config: PaystackConfig) => Promise<{ transaction: PaystackTransaction; order: Order }>;
  isProcessing: boolean;
}

export const usePaystack = (): UsePaystackReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();

  const validateConfig = (config: PaystackConfig) => {
    if (!config.email) throw new Error('Email is required');
    if (!config.amount) throw new Error('Amount is required');
    if (config.amount < 100) throw new Error('Amount must be at least 100 pesewas (1 GHS)');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)) throw new Error('Invalid email format');
    
    // Validate Paystack public key
    if (!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY) {
      throw new Error('Paystack public key is not configured');
    }
  };

  const createOrder = async (
    amount: number,
    userId: string
  ) => {
    try {
      const order = await orderService.createOrder({
        user_id: userId,
        total_amount: amount / 100, // Convert pesewas to GHS
        status: 'Paid',
      });

      console.log('Order created successfully:', order);
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order after payment');
    }
  };

  const initializePayment = async (config: PaystackConfig): Promise<{ transaction: PaystackTransaction; order: Order }> => {
    if (!user) throw new Error('User must be authenticated to make payment');
    
    try {
      validateConfig(config);
      setIsProcessing(true);
      
      const paystack = new PaystackPop();
      console.log('Payment configuration:', {
        email: config.email,
        amount: config.amount,
        currency: config.currency || 'GHS',
        metadata: config.metadata
      });

      const transaction = await new Promise<PaystackTransaction>((resolve, reject) => {
        try {
          const paystackOptions = {
            key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
            email: config.email,
            amount: Math.round(config.amount), // Ensure amount is a whole number
            currency: config.currency || 'GHS',
            ref: config.reference || generateReference(),
            metadata: {
              ...config.metadata,
              user_id: user.id,
            },
            onSuccess: (transaction: PaystackTransaction) => {
              console.log('Payment successful:', transaction);
              resolve(transaction);
            },
            onCancel: () => {
              console.log('Payment cancelled by user');
              reject(new Error('Payment cancelled by user'));
            },
          };

          console.log('Initializing Paystack with options:', paystackOptions);
          paystack.newTransaction(paystackOptions);
        } catch (error) {
          console.error('Paystack initialization error:', error);
          reject(new Error(`Failed to initialize payment: ${(error as Error).message}`));
        }
      });

      // Create order after successful payment
      const order = await createOrder(config.amount, user.id);

      return { transaction, order };
    } catch (error) {
      console.error('Payment error:', error);
      throw error instanceof Error ? error : new Error('Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    initializePayment,
    isProcessing,
  };
};

// Helper function to generate a unique reference
const generateReference = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 15);
  return `TRX-${timestamp}-${random}`;
}; 