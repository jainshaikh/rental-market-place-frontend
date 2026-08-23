'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import {
  usePendingProviders,
  useApproveProvider,
  useRejectProvider,
} from '../../../../hooks/useAdmin';
import type { AdminProviderSummary } from '../../../../lib/api/admin.api';
import { AdminPageHeader, ApproveDialog, AdminTableFooter } from '../../../../components/admin';
import { Button, Card, ConfirmDialog, EmptyState } from '../../../../components/ui';
import { cn } from '../../../../lib/utils/cn';

type ModalState = { type: 'approve' | 'reject'; provider: AdminProviderSummary } | null;

export default function AdminProvidersPage() {
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>(null);

  const { data, isFetching } = usePendingProviders(page);
  const approve = useApproveProvider();
  const reject = useRejectProvider();

  const providers = data?.data ?? [];
  const meta = data?.meta;
  const isPending = approve.isPending || reject.isPending;

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Moderation"
        title="Provider Approvals"
        subtitle={
          meta
            ? `${meta.total} application${meta.total !== 1 ? 's' : ''} awaiting review`
            : 'Review provider applications'
        }
      />

      {isFetching && providers.length === 0 ? (
        <div className="space-y-3.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[168px] animate-pulse rounded-card border border-border-subtle bg-surface"
            />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="All clear"
          description="No provider applications are waiting for review."
        />
      ) : (
        <div className={cn('space-y-3.5', isFetching && 'opacity-70 transition-opacity')}>
          {providers.map((p) => (
            <ProviderCard
              key={p.id}
              provider={p}
              onApprove={() => setModal({ type: 'approve', provider: p })}
              onReject={() => setModal({ type: 'reject', provider: p })}
            />
          ))}
        </div>
      )}

      {meta && (
        <AdminTableFooter
          page={page}
          totalPages={meta.totalPages}
          total={meta.total}
          onPageChange={setPage}
        />
      )}

      {/* Approve takes an OPTIONAL note → Modal. Reject requires a reason →
          ConfirmDialog with requireReason. */}
      <ApproveDialog
        open={modal?.type === 'approve'}
        onOpenChange={(open) => !open && setModal(null)}
        title="Approve provider?"
        subject={
          modal?.type === 'approve'
            ? `${modal.provider.businessName} (${modal.provider.user.email})`
            : undefined
        }
        confirmLabel="Approve provider"
        placeholder="Welcome message or any notes for the provider…"
        loading={isPending}
        onConfirm={async (note) => {
          if (modal?.type !== 'approve') return;
          await approve.mutateAsync({ id: modal.provider.id, note });
          setModal(null);
        }}
      />

      <ConfirmDialog
        open={modal?.type === 'reject'}
        onOpenChange={(open) => !open && setModal(null)}
        title="Reject application?"
        description={
          modal?.type === 'reject'
            ? `${modal.provider.businessName} (${modal.provider.user.email})`
            : undefined
        }
        requireReason
        reasonLabel="Reason for rejection"
        confirmLabel="Reject application"
        cancelLabel="Cancel"
        loading={isPending}
        onConfirm={async (reason) => {
          if (modal?.type !== 'reject' || !reason) return;
          await reject.mutateAsync({ id: modal.provider.id, reason });
          setModal(null);
        }}
      />
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="text-xs text-text-muted">
      <b className="text-ink-soft font-semibold">{label}:</b> {children}
    </span>
  );
}

function ProviderCard({
  provider,
  onApprove,
  onReject,
}: {
  provider: AdminProviderSummary;
  onApprove: () => void;
  onReject: () => void;
}) {
  const submitted = new Date(provider.updatedAt).toLocaleDateString('en-PK', {
    dateStyle: 'medium',
  });
  const joined = new Date(provider.user.createdAt).toLocaleDateString('en-PK', {
    dateStyle: 'medium',
  });

  return (
    <Card padding="lg" className="transition-shadow hover:shadow-sm" hover>
      <Link href={`/admin/providers/${provider.id}`} className="group flex flex-wrap items-start justify-between gap-5">
        <div className="flex min-w-0 items-start gap-4">
          {/* Business initial tile, matching the public provider directory */}
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-media border border-brand-100 bg-brand-50 text-lg font-bold text-brand-700">
            {provider.businessName.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h3 className="flex items-center gap-1.5 font-semibold tracking-tight text-ink group-hover:text-brand-700">
              {provider.businessName}
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-text-faint transition-transform group-hover:translate-x-0.5" />
            </h3>
            <p className="text-sm text-text-muted">{provider.businessType}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
              <span>
                {provider.user.name} · {provider.user.email}
              </span>
              {provider.user.phone && <span className="font-mono">{provider.user.phone}</span>}
              <span>Joined {joined}</span>
              <span>Submitted {submitted}</span>
            </div>
          </div>
        </div>
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border-subtle pt-4">
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Detail label="Showrooms">
            {provider.showrooms.map((s) => s.city).join(', ') || 'None'}
          </Detail>
          <Detail label="Documents">{provider.documents.length} uploaded</Detail>
          <Detail label="Vehicles">{provider._count.vehicles}</Detail>
        </div>

        <div className="flex flex-shrink-0 gap-2.5">
          <Button size="sm" onClick={onApprove}>
            Approve
          </Button>
          <Button size="sm" variant="danger-outline" onClick={onReject}>
            Reject
          </Button>
        </div>
      </div>
    </Card>
  );
}
