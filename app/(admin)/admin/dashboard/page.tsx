'use client';

import Link from 'next/link';
import { useAdminOverview } from '../../../../hooks/useAdmin';

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
      urgent: (data?.pendingProviders ?? 0) > 0,
      description: 'Applications awaiting review',
    },
    {
      label: 'Vehicle approvals',
      count: data?.pendingVehicles,
      href: '/admin/vehicles',
      urgent: (data?.pendingVehicles ?? 0) > 0,
      description: 'Listings awaiting review',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Admin Overview</h1>
      <p className="text-slate-500 text-sm mb-8">Platform health and moderation queues.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const card = (
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors">
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900 mt-1">
                {isLoading ? '—' : (stat.value ?? 0).toLocaleString()}
              </p>
            </div>
          );
          return stat.href ? (
            <Link key={stat.label} href={stat.href}>{card}</Link>
          ) : (
            <div key={stat.label}>{card}</div>
          );
        })}
      </div>

      {/* Approval queues */}
      <h2 className="text-base font-semibold text-slate-800 mb-3">Pending approvals</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {queues.map((q) => (
          <Link key={q.label} href={q.href}>
            <div className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition-colors flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">{q.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{q.description}</p>
              </div>
              <div className={`text-2xl font-bold ${q.urgent ? 'text-amber-600' : 'text-slate-400'}`}>
                {isLoading ? '—' : q.count ?? 0}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-base font-semibold text-slate-800 mb-3">Quick links</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Audit Logs', href: '/admin/audit-logs' },
          { label: 'Platform Settings', href: '/admin/settings' },
          { label: 'All Users', href: '/admin/users' },
        ].map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-primary/40 hover:text-primary transition-colors"
          >
            {link.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
