'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, LogIn, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const callbackUrl = searchParams?.get('callbackUrl') || '/';

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error('Invalid email or password');
      } else {
        toast.success('Logged in successfully!');
        router.refresh();
        router.push(callbackUrl);
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight text-white text-center">
          BFG International
        </CardTitle>
        <CardDescription className="text-white/60 text-center">
          Enter your credentials to access the ECR system
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-white/80">Email</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-white/40 group-focus-within:text-white/70 transition-colors" />
                      <Input
                        placeholder="james.porter@bfg-int.com"
                        {...field}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-500/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-white/80">Password</FormLabel>
                  <FormControl>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-white/40 group-focus-within:text-white/70 transition-colors" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-blue-500/50"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white border-none transition-all active:scale-[0.98] mt-2 shadow-lg shadow-blue-900/40"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-center w-full text-white/40 font-mono">
          ENGINEERING CHANGE REQUEST v2.4.1
        </p>
      </CardFooter>
    </Card>
  );
}
