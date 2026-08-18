'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { loginSchema, type LoginFormValues } from '../../../lib/validations/auth.schema';
import { useAuth } from '../../../hooks/useAuth';
import { Button, Card, Input } from '../../../components/ui';

function LoginPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const { login, getDashboardRoute } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      // login() sets userRole cookie and updates the store
      const authUser = await login(data);

      toast.success('Welcome back!');
      // Pass authUser directly — getDashboardRoute() can't read the store update until re-render
      const destination = callbackUrl || getDashboardRoute(authUser);
      router.push(destination);
      router.refresh();
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data
          ?.error?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <Card padding="lg" className="rounded-sheet shadow-sm">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome back</h1>
          <p className="mt-1 text-sm text-text-muted">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label="Email address"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isLoading}
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[13px] font-semibold text-slate-700">Password</label>
              <Link href="/forgot-password" className="text-[13px] font-semibold text-brand-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isLoading}
              error={errors.password?.message}
              {...register('password')}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" loading={isLoading}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-brand-600 hover:underline">
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  );
}
