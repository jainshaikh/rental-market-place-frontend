'use client';

import Link from 'next/link';
import { ArrowRight, FileClock, Settings, Store, Users } from 'lucide-react';
import { useAdminOverview } from '../../../../hooks/useAdmin';
import { AdminPageHeader, AdminStat } from '../../../../components/admin';
import { cn } from '../../../../lib/utils/cn';

export default function AdminDashboardPage() {
  const { data, isLoading } = useAdminOverview();

  const stats = [
    { label: 'Total Users', value: data?.totalUsers, href: '/admin/users' },
    { label: 'Active Providers', value: data?.totalProviders, href: '/admin/providers' },
    { label: 'Active Vehicles', value: data?.totalVehicles, href: '/admin/vehicles' },
    { label: 'Active Bookings', value: data?.activeBookings, href: null },
  ];

  const queues = [
    {
      label: 'Provider approvals',
      count: data?.pendingProviders,
      href: '/admin/providers',
      description: 'Applications awaiting review',
    },
    {
      label: 'Vehicle approvals',
      count: data?.pendingVehicles,
      href: '/admin/vehicles',
      description: 'Listings awaiting review',
    },
  ];

  const quickLinks = [
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: FileClock },
    { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
    { label: 'All Users', href: '/admin/users', icon: Users },
    { label: 'Providers', href: '/admin/providers', icon: Store },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Admin"
        title="Overview"
        subtitle="Platform health and moderation queues."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) =>
          stat.href ? (
            <Link
              key={stat.label}
              href={stat.href}
              className="rounded-card transition-all duration-200 ease-spring hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <AdminStat label={stat.label} value={stat.value} loading={isLoading} />
            </Link>
          ) : (
            <AdminStat key={stat.label} label={stat.label} value={stat.value} loading={isLoading} />
          ),
        )}
      </div>

      {/* Approval queues */}
      <section>
        <h2 className="mb-3.5 text-[15px] font-semibold text-ink">Pending approvals</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {queues.map((q) => {
            const urgent = (q.count ?? 0) > 0;
            return (
              <Link
                key={q.label}
                href={q.href}
                className={cn(
                  'group flex items-center justify-between gap-4 rounded-card border bg-surface p-5 shadow-xs',
                  'transition-all duration-200 ease-spring hover:-translate-y-1 hover:shadow-md',
                  // A non-zero queue is the one thing on this page that wants
                  // attention, so it gets the warm border and tinted count.
                  urgent
                    ? 'border-status-amber-border hover:border-status-amber-dot'
                    : 'border-border-subtle hover:border-brand-100',
                )}
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{q.label}</p>
                  <p className="mt-0.5 text-xs text-text-faint">{q.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'font-mono text-2xl font-semibold tracking-[-0.03em]',
                      urgent ? 'text-status-amber-fg' : 'text-text-faint',
                    )}
                  >
                    {isLoading ? '—' : (q.count ?? 0)}
                  </span>
                  <ArrowRight className="h-4 w-4 text-text-faint transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-600" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 className="mb-3.5 text-[15px] font-semibold text-ink">Quick links</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="text-ink-soft group flex items-center gap-2.5 rounded-card border border-border-subtle bg-surface px-4 py-3.5 text-sm font-medium shadow-xs transition-all duration-200 ease-spring hover:-translate-y-1 hover:border-brand-100 hover:text-brand-700 hover:shadow-sm"
            >
              <Icon className="h-4 w-4 flex-shrink-0 text-text-faint transition-colors group-hover:text-brand-600" />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
