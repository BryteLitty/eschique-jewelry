import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Eye, EyeOff } from 'lucide-react';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  current_password: z.string().optional(),
  new_password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  confirm_password: z.string().optional(),
}).refine((data) => {
  if (data.new_password && !data.current_password) {
    return false;
  }
  return true;
}, {
  message: "Current password is required to set a new password",
  path: ["current_password"],
}).refine((data) => {
  if (data.new_password && data.new_password !== data.confirm_password) {
    return false;
  }
  return true;
}, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

const storeSchema = z.object({
  store_name: z.string().min(1, 'Store name is required'),
  store_description: z.string().min(1, 'Store description is required'),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
});

export default function SettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: '',
      email: user?.email || '',
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const storeForm = useForm({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      store_name: '',
      store_description: '',
      contact_email: '',
      contact_phone: '',
      address: '',
    },
  });

  const onProfileSubmit = async (data: z.infer<typeof profileSchema>) => {
    try {
      setIsLoading(true);
      setMessage(null);

      // Update profile in users table
      const { error: profileError } = await supabase
        .from('users')
        .update({ full_name: data.full_name })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // Update email if changed
      if (data.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        if (emailError) throw emailError;
      }

      // Update password if provided
      if (data.new_password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: data.new_password,
        });
        if (passwordError) throw passwordError;
      }

      setMessage({ type: 'success', text: 'Profile updated successfully' });
      profileForm.reset();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  const onStoreSubmit = async (data: z.infer<typeof storeSchema>) => {
    try {
      setIsLoading(true);
      setMessage(null);

      const { error } = await supabase
        .from('store_settings')
        .upsert({
          id: 1, // Assuming single store setup
          ...data,
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Store settings updated successfully' });
    } catch (error) {
      console.error('Error updating store settings:', error);
      setMessage({ type: 'error', text: 'Failed to update store settings' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <Input
                  {...profileForm.register('full_name')}
                  className="focus:ring-primary/20 focus:border-primary"
                />
                {profileForm.formState.errors.full_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileForm.formState.errors.full_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  {...profileForm.register('email')}
                  type="email"
                  className="focus:ring-primary/20 focus:border-primary"
                />
                {profileForm.formState.errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <div className="relative">
                  <Input
                    {...profileForm.register('current_password')}
                    type={showPassword ? 'text' : 'password'}
                    className="focus:ring-primary/20 focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {profileForm.formState.errors.current_password && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileForm.formState.errors.current_password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <div className="relative">
                  <Input
                    {...profileForm.register('new_password')}
                    type={showNewPassword ? 'text' : 'password'}
                    className="focus:ring-primary/20 focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {profileForm.formState.errors.new_password && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileForm.formState.errors.new_password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                <div className="relative">
                  <Input
                    {...profileForm.register('confirm_password')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="focus:ring-primary/20 focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {profileForm.formState.errors.confirm_password && (
                  <p className="text-red-500 text-sm mt-1">
                    {profileForm.formState.errors.confirm_password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Store Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Store Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={storeForm.handleSubmit(onStoreSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Store Name</label>
                <Input
                  {...storeForm.register('store_name')}
                  className="focus:ring-primary/20 focus:border-primary"
                />
                {storeForm.formState.errors.store_name && (
                  <p className="text-red-500 text-sm mt-1">
                    {storeForm.formState.errors.store_name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Store Description</label>
                <Input
                  {...storeForm.register('store_description')}
                  className="focus:ring-primary/20 focus:border-primary"
                />
                {storeForm.formState.errors.store_description && (
                  <p className="text-red-500 text-sm mt-1">
                    {storeForm.formState.errors.store_description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <Input
                  {...storeForm.register('contact_email')}
                  type="email"
                  className="focus:ring-primary/20 focus:border-primary"
                />
                {storeForm.formState.errors.contact_email && (
                  <p className="text-red-500 text-sm mt-1">
                    {storeForm.formState.errors.contact_email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <Input
                  {...storeForm.register('contact_phone')}
                  className="focus:ring-primary/20 focus:border-primary"
                />
                {storeForm.formState.errors.contact_phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {storeForm.formState.errors.contact_phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <Input
                  {...storeForm.register('address')}
                  className="focus:ring-primary/20 focus:border-primary"
                />
                {storeForm.formState.errors.address && (
                  <p className="text-red-500 text-sm mt-1">
                    {storeForm.formState.errors.address.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 