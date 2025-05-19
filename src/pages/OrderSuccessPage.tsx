import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { CheckCircle } from 'lucide-react';

interface OrderSuccessState {
  orderId: string;
  transactionRef: string;
}

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as OrderSuccessState;

  useEffect(() => {
    // If someone tries to access this page directly without state, redirect to home
    if (!state?.orderId) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  if (!state?.orderId) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Order Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed.
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Order ID: {state.orderId}</p>
            <p>Transaction Reference: {state.transactionRef}</p>
          </div>
        </div>

        <div className="space-y-4 pt-6">
          <Button
            onClick={() => navigate('/orders')}
            variant="outline"
            className="w-full"
          >
            View My Orders
          </Button>
          <Button
            onClick={() => navigate('/shop')}
            className="w-full"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
} 