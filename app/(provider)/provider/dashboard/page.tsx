'use client';

import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Store,
  Inbox,
  User,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { useProviderProfile } from '../../../../hooks/useProviderProfile';
import { StatusBadge } from '../../../../components/common/StatusBadge';
import { Card } from '../../../../components/ui';
import { cn } from '../../../../lib/utils/cn';

function StatCard({ label, value, sub, icon: Icon }: { label: string; value: React.ReactNode; sub?: string; icon: LucideIcon }) {
  return (
    <Card className="flex items-start gap-3.5">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-control border border-border-subtle bg-page text-text-muted">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
        <div className="mt-0.5 font-mono text-2xl font-semibold leading-tight text-ink">{value}</div>
        {sub && <p className="mt-0.5 text-xs text-text-faint">{sub}</p>}
      </div>
    </Card>
  );
}

function CompletenessBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-600">Profile completeness</span>
        <span className="font-mono text-xs font-semibold text-ink">{score}%</span>
      </div>
      <div className="h-[7px] overflow-hidden rounded-full bg-surface-hover">
        <div className={cn('h-full rounded-full transition-all duration-500', color)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

const STATUS_BANNERS: Record<
  string,
  { tone: 'amber' | 'blue' | 'red' | 'emerald'; icon: LucideIcon; title: string; body: string; cta?: { href: string; label: string } }
> = {
  PENDING: {
    tone: 'amber',
    icon: AlertCircle,
    title: 'Complete your provider profile',
    body: 'Fill in your business details, add a showroom, and upload the required documents to submit for review.',
    cta: { href: '/provider/profile', label: 'Complete profile →' },
  },
  PENDING_REVIEW: {
    tone: 'blue',
    icon: Clock,
    title: 'Profile under review',
    body: "Our team is reviewing your application. This usually takes 1–2 business days. We'll notify you by email once a decision is made.",
  },
  REJECTED: {
    tone: 'red',
    icon: AlertCircle,
    title: 'Profile not approved',
    body: 'Your application was rejected. Please review the feedback on your documents, update your profile, and resubmit.',
    cta: { href: '/provider/profile', label: 'Update and resubmit →' },
  },
  APPROVED: {
    tone: 'emerald',
    icon: CheckCircle2,
    title: "You're approved!",
    body: 'Your provider profile is live. Start adding vehicles to your fleet to appear in search results.',
    cta: { href: '/provider/vehicles/new', label: 'Add your first vehicle →' },
  },
};

const TONE_CLS: Record<'amber' | 'blue' | 'red' | 'emerald', string> = {
  amber: 'bg-status-amber-bg border-status-amber-border text-status-amber-fg',
  blue: 'bg-status-blue-bg border-status-blue-border text-status-blue-fg',
  red: 'bg-status-red-bg border-status-red-border text-status-red-fg',
  emerald: 'bg-status-emerald-bg border-status-emerald-border text-status-emerald-fg',
};

const QUICK_ACTIONS: { href: string; label: string; icon: LucideIcon; gated?: boolean }[] = [
  { href: '/provider/profile', label: 'Edit profile', icon: User },
  { href: '/provider/vehicles/new', label: 'Add a vehicle', icon: Plus, gated: true },
  { href: '/provider/vehicles', label: 'Manage vehicles', icon: Store, gated: true },
  { href: '/provider/inquiries', label: 'View inquiries', icon: Inbox, gated: true },
];

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProviderProfile();

  const status = profile?.verificationStatus ?? 'PENDING';
  const completeness = profile?.completenessScore?.score ?? 0;
  const showrooms = profile?.showrooms?.length ?? 0;
  const documents = profile?.documents?.length ?? 0;
  const banner = STATUS_BANNERS[status] ?? STATUS_BANNERS.PENDING;
  const BannerIcon = banner.icon;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">
            {isLoading ? (
              <span className="inline-block h-7 w-48 animate-pulse rounded-control bg-surface-hover" />
            ) : profile?.businessName ? (
              profile.businessName
            ) : (
              `Welcome, ${user?.name?.split(' ')[0]}`
            )}
          </h1>
          <p className="mt-1 text-sm text-text-muted">Provider Dashboard</p>
        </div>

        {!isLoading && profile && <StatusBadge status={status} />}
      </div>

      {/* Status Banner */}
      {!isLoading && (
        <div className={cn('flex items-start gap-3 rounded-card border p-4', TONE_CLS[banner.tone])}>
          <BannerIcon className="h-5 w-5 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{banner.title}</p>
            <p className="mt-0.5 text-sm opacity-90">{banner.body}</p>
            {banner.cta && (
              <Link href={banner.cta.href} className="mt-2 inline-block text-sm font-semibold hover:underline">
                {banner.cta.label}
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Profile Status"
          value={isLoading ? <span className="inline-block h-6 w-20 animate-pulse rounded-control bg-surface-hover" /> : <StatusBadge status={status} />}
          icon={User}
        />
        <StatCard
          label="Showrooms"
          value={isLoading ? <span className="inline-block h-6 w-8 animate-pulse rounded-control bg-surface-hover" /> : showrooms}
          sub={showrooms === 0 ? 'None added yet' : showrooms === 1 ? '1 location' : `${showrooms} locations`}
          icon={Store}
        />
        <StatCard
          label="Documents"
          value={isLoading ? <span className="inline-block h-6 w-8 animate-pulse rounded-control bg-surface-hover" /> : documents}
          sub={documents === 0 ? 'None uploaded' : `${documents} uploaded`}
          icon={FileText}
        />
        <StatCard label="Total Vehicles" value="—" sub="Available in next phase" icon={Store} />
      </div>

      {/* Completeness + Quick Actions */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        {/* Completeness card */}
        <Card className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">Profile completeness</p>
            <Link href="/provider/profile" className="text-xs font-semibold text-brand-600 hover:underline">
              Edit profile
            </Link>
          </div>

          {isLoading ? (
            <div className="h-2 w-full animate-pulse rounded-full bg-surface-hover" />
          ) : (
            <CompletenessBar score={completeness} />
          )}

          {!isLoading && profile?.completenessScore?.missing && profile.completenessScore.missing.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-text-muted">Still needed</p>
              <ul className="space-y-1">
                {profile.completenessScore.missing.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {!isLoading && completeness === 100 && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              All required information provided
            </p>
          )}
        </Card>

        {/* Quick Actions */}
        <Card>
          <p className="mb-3 text-sm font-semibold text-ink">Quick actions</p>
          <nav className="space-y-1">
            {QUICK_ACTIONS.map((action) => {
              const disabled = action.gated && status !== 'APPROVED';
              const Icon = action.icon;
              if (disabled) {
                return (
                  <span
                    key={action.label}
                    title="Available after profile is approved"
                    className="flex cursor-not-allowed select-none items-center gap-2.5 rounded-control px-3 py-2 text-sm text-text-faint"
                  >
                    <Icon className="h-4 w-4" />
                    {action.label}
                  </span>
                );
              }
              return (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex items-center gap-2.5 rounded-control px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-surface-hover hover:text-brand-600"
                >
                  <Icon className="h-4 w-4" />
                  {action.label}
                </Link>
              );
            })}
          </nav>
        </Card>
      </div>
    </div>
  );
}
