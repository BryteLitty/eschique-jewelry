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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { CreditCard, Truck, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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
  paymentMethod: z.enum(['card', 'paypal'], {
    required_error: 'Please select a payment method',
  }),
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
  const { cartItems, isLoading: cartLoading } = useCartQuery();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

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
      paymentMethod: 'card',
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
          paymentMethod: 'card',
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

  const totalItems = cartItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cartItems?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;
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
              // Show address confirmation view
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

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Payment Method
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                                  <SelectItem value="paypal">PayPal</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>

                    <Button
                      type="submit"
                      className="w-full bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90 h-12"
                      disabled={isProcessing}
                    >
                      {isProcessing ? 'Processing...' : `Pay GH₵ ${total.toFixed(2)}`}
                    </Button>
                  </form>
                </Form>
              </>
            ) : (
              // Show edit form
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