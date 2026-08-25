'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Building2, Car } from 'lucide-react';

import { registerSchema, type RegisterFormValues } from '../../../lib/validations/auth.schema';
import { useAuth } from '../../../hooks/useAuth';
import { Role } from '../../../types/enums';
import { Button, Input, RadioCard } from '../../../components/ui';
import { Logo } from '../../../components/common/Logo';

function RegisterPageContent() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: Role.USER },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const { confirmPassword: _skip, ...payload } = data;
      await registerUser(payload);
      toast.success('Account created! Please check your email to verify your account.');
      // Carries the caller's intent (e.g. "send inquiry on this vehicle")
      // through registration -> login, instead of dropping it here.
      router.push(loginHref);
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
          ?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-full max-w-[900px] grid-cols-1 overflow-hidden rounded-sheet border border-border-subtle bg-surface shadow-md md:grid-cols-2">
      {/* Left — brand panel */}
      <div className="hidden flex-col justify-between bg-ink p-10 text-white md:flex">
        <div className="flex items-center">
          <Logo theme="dark" className="h-6" />
        </div>
        <div>
          <p className="mb-3.5 max-w-[15ch] text-[30px] font-bold leading-tight tracking-tight">
            Rent a car, or fill the empty seats in yours.
          </p>
          <p className="max-w-[34ch] text-[15px] leading-relaxed text-slate-400">
            Verified providers, verified drivers, and a direct line to both. No booking fees.
          </p>
        </div>
        <div className="flex gap-6">
          <div>
            <div className="font-mono text-[22px] font-semibold">1,240</div>
            <div className="mt-1.5 text-xs text-slate-500">vehicles listed</div>
          </div>
          <div>
            <div className="font-mono text-[22px] font-semibold">380</div>
            <div className="mt-1.5 text-xs text-slate-500">verified providers</div>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="p-8 sm:p-10">
        <h1 className="mb-1.5 text-[26px] font-bold tracking-tight text-ink">
          Create your account
        </h1>
        <p className="mb-6 text-sm text-text-muted">
          Already have one?{' '}
          <Link href={loginHref} className="font-semibold text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>

        {/* Account type toggle */}
        <div className="mb-5">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
            I want to
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <RadioCard
              selected={selectedRole === Role.USER}
              onClick={() => setValue('role', Role.USER)}
              icon={Car}
              title="Rent a vehicle"
              description="Browse listings and send inquiries."
            />
            <RadioCard
              selected={selectedRole === Role.PROVIDER}
              onClick={() => setValue('role', Role.PROVIDER)}
              icon={Building2}
              title="List my fleet"
              description="Requires business verification."
            />
            <input type="hidden" {...register('role')} />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
          <Input
            label="Full name"
            autoComplete="name"
            placeholder="Ahmed Al Rashid"
            disabled={isLoading}
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              disabled={isLoading}
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone"
              required
              type="tel"
              autoComplete="tel"
              placeholder="+92 300 1234567"
              disabled={isLoading}
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>

          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            disabled={isLoading}
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            disabled={isLoading}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button type="submit" size="lg" className="mt-1 w-full" loading={isLoading}>
            Create account
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-text-faint">
          By continuing you agree to the Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageContent />
    </Suspense>
  );
}
