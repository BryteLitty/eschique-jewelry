import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Logo from '@/assets/logo.png';

import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import { Input } from "../components/ui/input";
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/card";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        form.setError("root", {
          message: error.message
        });
      } else {
        setIsSuccess(true);
      }
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Failed to send reset email"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F9F9] px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <img
              src={Logo}
              alt="Eschique Logo"
              className="h-12 w-auto mx-auto"
            />
          </Link>
        </div>
        <Card className="w-full">
          <CardHeader>
            <h2 className="text-2xl font-montserrat font-bold text-center text-[#1A1A1A]">
              Reset Password
            </h2>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center space-y-4">
                <p className="text-[#1A1A1A]">
                  Check your email for password reset instructions.
                </p>
                <Button asChild variant="link" className="text-[#8B5E3C]">
                  <Link to="/login">Back to Login</Link>
                </Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {form.formState.errors.root && (
                    <div className="text-[#D32F2F] text-sm text-center">
                      {form.formState.errors.root.message}
                    </div>
                  )}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#1A1A1A]">Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            className="border-[#E5E5E5] focus:border-[#8B5E3C] focus:ring-[#8B5E3C]"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage className="text-[#D32F2F]" />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-[#1A1A1A] text-white hover:bg-[#1A1A1A]/90 font-montserrat"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Send Reset Instructions"}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-[#1A1A1A] text-sm sm:text-base">
              Remember your password?{" "}
              <Link to="/login" className="text-[#8B5E3C] hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 