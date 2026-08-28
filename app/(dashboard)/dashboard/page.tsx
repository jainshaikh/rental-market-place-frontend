'use client';

import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { useMyBookingCounts } from '../../../hooks/useBookings';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: counts, isLoading } = useMyBookingCounts();

  const stats = [
    {
      label: 'Active Inquiries',
      value: isLoading ? '—' : String(counts?.active ?? 0),
      href: '/dashboard/inquiries',
    },
    {
      label: 'Completed Bookings',
      value: isLoading ? '—' : String(counts?.completed ?? 0),
      href: '/dashboard/inquiries',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 mb-1">
        Welcome back, {user?.name?.split(' ')[0] ?? 'there'}
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        Here&apos;s an overview of your account.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:border-primary/40 hover:shadow-sm transition-all"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick actions</h2>
        <div className="flex flex-col gap-2">
          <Link
            href="/rent-a-car"
            className="text-sm text-primary hover:underline"
          >
            Browse vehicles →
          </Link>
          <Link
            href="/dashboard/inquiries"
            className="text-sm text-primary hover:underline"
          >
            View all inquiries →
          </Link>
        </div>
      </div>
    </div>
  );
}
