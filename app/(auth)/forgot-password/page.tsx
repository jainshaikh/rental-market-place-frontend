'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../../../lib/validations/auth.schema';
import { authApi } from '../../../lib/api/auth.api';
import { Button, Card, Input } from '../../../components/ui';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data);
      setSubmitted(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto w-full max-w-md">
        <Card padding="lg" className="rounded-sheet text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-emerald-bg">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-ink">Check your email</h1>
          <p className="mb-6 text-sm text-text-muted">
            If an account exists with that email, we&apos;ve sent a link to reset your password. The link expires in 1
            hour.
          </p>
          <Link href="/login" className="text-sm font-semibold text-brand-600 hover:underline">
            Back to sign in
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Card padding="lg" className="rounded-sheet shadow-sm">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Forgot your password?</h1>
          <p className="mt-1 text-sm text-text-muted">Enter your email address and we&apos;ll send you a reset link.</p>
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

          <Button type="submit" size="lg" className="w-full" loading={isLoading}>
            Send reset link
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-brand-600 hover:underline">
            Back to sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
