'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle } from 'lucide-react';
import { authApi } from '../../../lib/api/auth.api';
import { Button, Card } from '../../../components/ui';

type VerifyState = 'loading' | 'success' | 'error' | 'missing';

function VerifyEmailContent() {
  const [state, setState] = useState<VerifyState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setState('missing');
      return;
    }

    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        setState('success');
      } catch (error: unknown) {
        const message =
          (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data
            ?.error?.message || 'Verification failed. The link may have expired.';
        setErrorMessage(message);
        setState('error');
      }
    };

    verify();
  }, [token]);

  return (
    <div className="mx-auto w-full max-w-md">
      <Card padding="lg" className="rounded-sheet text-center shadow-sm">
        {state === 'loading' && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
            <h1 className="mb-2 text-xl font-bold text-ink">Verifying your email...</h1>
            <p className="text-sm text-text-muted">Please wait a moment.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-emerald-bg">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <h1 className="mb-2 text-xl font-bold text-ink">Email verified!</h1>
            <p className="mb-6 text-sm text-text-muted">
              Your email has been successfully verified. You can now sign in to your account.
            </p>
            <Link href="/login">
              <Button>Sign in to your account</Button>
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-status-red-bg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="mb-2 text-xl font-bold text-ink">Verification failed</h1>
            <p className="mb-6 text-sm text-text-muted">{errorMessage}</p>
            <Link href="/login" className="text-sm font-semibold text-brand-600 hover:underline">
              Back to sign in
            </Link>
          </>
        )}

        {state === 'missing' && (
          <>
            <h1 className="mb-2 text-xl font-bold text-ink">Missing verification token</h1>
            <p className="mb-4 text-sm text-text-muted">
              Please click the link in your verification email, or request a new one.
            </p>
            <Link href="/login" className="text-sm font-semibold text-brand-600 hover:underline">
              Back to sign in
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
