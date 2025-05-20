import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { useCartQuery } from '../hooks/useCartQuery';
import { supabase } from '../lib/supabase';
import Header from '../components/shared/Header';
import Footer from '../components/shared/Footer';
import { Button } from '../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Truck, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePaystack } from '../hooks/usePaystack';
import { useQueryClient } from '@tanstack/react-query';

const shippingFormSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().min(1, 'Phone number is required'),
  whatsappNumber: z.string().optional(),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
});

// Add interface for user profile
interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  whatsapp_number: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  is_admin: boolean;
  updated_at: string | null;
}

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cartItems, isLoading: cartLoading } = useCartQuery();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const { initializePayment } = usePaystack();

  const form = useForm<z.infer<typeof shippingFormSchema>>({
    resolver: zodResolver(shippingFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      whatsappNumber: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
    },
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setUserProfile(data);
        
        // If user has address info, don't go into edit mode
        if (data.address && data.city && data.country) {
          setIsEditingAddress(false);
        } else {
          setIsEditingAddress(true);
        }

        // Update form with user data
        form.reset({
          fullName: data.full_name || '',
          email: user.email || '',
          phoneNumber: data.phone_number || '',
          whatsappNumber: data.whatsapp_number || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          postalCode: data.postal_code || '',
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load user information');
        setIsEditingAddress(true); // Enable editing if there's an error
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchUserProfile();
  }, [user, form]);

  const totalItems = cartItems?.reduce((sum: number, item) => sum + item.quantity, 0) || 0;
  const subtotal = cartItems?.reduce((sum: number, item) => sum + (item.product.price * item.quantity), 0) || 0;
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const onSubmit = async (data: z.infer<typeof shippingFormSchema>) => {
    try {
      setIsProcessing(true);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Update user profile with shipping information
      const { error: updateError } = await supabase
        .from('users')
        .update({
          phone_number: data.phoneNumber,
          whatsapp_number: data.whatsappNumber,
          address: data.address,
          city: data.city,
          state: data.state,
          country: data.country,
          postal_code: data.postalCode,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh user profile
      const { data: updatedProfile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (fetchError) throw fetchError;
      setUserProfile(updatedProfile);
      setIsEditingAddress(false);

      toast.success('Shipping information updated successfully');

      // TODO: Implement payment processing
      console.log('Processing payment with data:', data);
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process checkout');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearUserCart = async () => {
    if (!user) return;
    
    try {
      // Delete all cart items for the user
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Invalidate cart query to refresh UI
      await queryClient.invalidateQueries({ queryKey: ['cart'] });
    } catch (error) {
      console.error('Error clearing cart:', error);
      // Don't show error to user since payment was successful
    }
  };

  const handlePayment = async () => {
    if (!user?.email) {
      toast.error('Please log in to continue');
      return;
    }

    try {
      setIsProcessing(true);
      // Create order with shipping information
      const orderData = {
        user_id: user.id,
        order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        total_amount: total,
        status: 'pending' as const,
        payment_status: 'pending' as const,
        shipping_address: {
          full_name: userProfile?.full_name || '',
          address_line1: userProfile?.address || '',
          address_line2: '',
          city: userProfile?.city || '',
          state: userProfile?.state || '',
          postal_code: userProfile?.postal_code || '',
          country: userProfile?.country || '',
          phone: userProfile?.phone_number || '',
        },
      };

      const { transaction, order } = await initializePayment({
        email: user.email,
        amount: Math.round(total * 100), // Convert to pesewas
        metadata: {
          order_items: cartItems?.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.product.price
          })),
          shipping_address: orderData.shipping_address
        }
      });

      // Clear the cart after successful payment
      await clearUserCart();

      // Reset processing state before navigation
      setIsProcessing(false);

      // Redirect to success page with order details
      navigate('/order-success', {
        replace: true,
        state: {
          orderId: order.id,
          transactionRef: transaction.reference
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  if (cartLoading || isLoadingUserData) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Your Cart is Empty</h1>
            <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
            <Button
              onClick={() => navigate('/products')}
              className="bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90"
            >
              Continue Shopping
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#1A1A1A]">Checkout</h1>
              {userProfile?.address && !isEditingAddress && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingAddress(true)}
                >
                  Edit Shipping Info
                </Button>
              )}
            </div>

            {!isEditingAddress && userProfile?.address ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Shipping Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <p className="font-medium">{userProfile.full_name}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm">Phone: {userProfile.phone_number}</p>
                        {userProfile.whatsapp_number && (
                          <p className="text-sm">WhatsApp: {userProfile.whatsapp_number}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm">{userProfile.address}</p>
                        <p className="text-sm">
                          {userProfile.city}, {userProfile.state} {userProfile.postal_code}
                        </p>
                        <p className="text-sm">{userProfile.country}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handlePayment}
                  className="w-full bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90 h-12"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing Payment...</span>
                    </div>
                  ) : (
                    `Pay GH₵ ${total.toFixed(2)}`
                  )}
                </Button>
              </>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input {...field} type="email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} type="tel" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="whatsappNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WhatsApp Number (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} type="tel" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Shipping Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    type="submit"
                    className="w-full bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90 h-12"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Updating...' : 'Update Shipping Information'}
                  </Button>
                </form>
              </Form>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-96">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems?.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="flex-1">
                        {item.product.name} × {item.quantity}
                      </span>
                      <span className="font-medium">
                        GH₵ {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({totalItems} items)</span>
                    <span>GH₵ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (10%)</span>
                    <span>GH₵ {tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>GH₵ {total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span>Free shipping on all orders</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;