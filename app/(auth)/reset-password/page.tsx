'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '../../../lib/validations/auth.schema';
import { authApi } from '../../../lib/api/auth.api';
import { Button, Card, Input } from '../../../components/ui';

function ResetPasswordContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setIsLoading(true);
    try {
      await authApi.resetPassword(data);
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data
          ?.error?.message || 'Reset failed. The link may have expired.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-md">
        <Card padding="lg" className="rounded-sheet text-center shadow-sm">
          <h1 className="mb-2 text-xl font-bold text-ink">Invalid reset link</h1>
          <p className="mb-4 text-sm text-text-muted">This reset link is missing or invalid. Please request a new one.</p>
          <Link href="/forgot-password" className="text-sm font-semibold text-brand-600 hover:underline">
            Request new reset link
          </Link>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="mx-auto w-full max-w-md">
        <Card padding="lg" className="rounded-sheet text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-emerald-bg">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-ink">Password reset!</h1>
          <p className="text-sm text-text-muted">Redirecting you to sign in...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <Card padding="lg" className="rounded-sheet shadow-sm">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Set a new password</h1>
          <p className="mt-1 text-sm text-text-muted">Choose a strong password for your account.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <input type="hidden" {...register('token')} />

          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            disabled={isLoading}
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            disabled={isLoading}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" size="lg" className="w-full" loading={isLoading}>
            Reset password
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  );
}
