'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CarFront, Car, Inbox, LayoutDashboard, LogOut, MessageSquare, Route, Star, User, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProviderProfile } from '../../hooks/useProviderProfile';
import { StatusBadge } from '../common/StatusBadge';
import { Avatar } from '../ui';
import { cn } from '../../lib/utils/cn';

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon; requiresApproval: boolean }[] = [
  { href: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard, requiresApproval: false },
  { href: '/provider/profile', label: 'My Profile', icon: User, requiresApproval: false },
  { href: '/provider/vehicles', label: 'Vehicles', icon: Car, requiresApproval: true },
  { href: '/provider/inquiries', label: 'Inquiries', icon: Inbox, requiresApproval: true },
  // No business verification needed — identity is verified per-vehicle via uploaded documents
  { href: '/provider/trips', label: 'Trips', icon: Route, requiresApproval: false },
  { href: '/provider/my-vehicles', label: 'My Vehicles', icon: CarFront, requiresApproval: false },
  { href: '/provider/trip-inquiries', label: 'Trip Requests', icon: MessageSquare, requiresApproval: false },
  { href: '/provider/reviews', label: 'Reviews', icon: Star, requiresApproval: false },
];

export function ProviderSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { data: profile } = useProviderProfile();
  const isApproved = profile?.verificationStatus === 'APPROVED';

  return (
    <aside className="flex min-h-screen w-64 flex-col bg-ink">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-[18px]">
        <div className="flex h-[26px] w-[26px] items-center justify-center rounded-control bg-brand-600 text-[13px] font-bold text-white">
          R
        </div>
        <div>
          <Link href="/" className="block text-[13px] font-semibold leading-tight text-white">
            RentalMarket
          </Link>
          <p className="mt-0.5 text-[11px] leading-tight text-slate-400">Provider Portal</p>
        </div>
      </div>

      {/* Provider identity */}
      <div className="border-b border-white/10 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={profile?.businessName ?? user?.name ?? 'Provider'} tone="brand" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{profile?.businessName ?? user?.name ?? 'Provider'}</p>
            {profile && <StatusBadge status={profile.verificationStatus} size="sm" />}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isLocked = item.requiresApproval && !isApproved;
          const Icon = item.icon;

          if (isLocked) {
            return (
              <span
                key={item.href}
                title="Available after profile is approved"
                className="flex cursor-not-allowed select-none items-center gap-[11px] rounded-control px-3 py-2.5 text-[13px] text-slate-600"
              >
                <Icon className="h-[17px] w-[17px]" />
                {item.label}
              </span>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-[11px] rounded-control px-3 py-2.5 text-[13px] transition-colors',
                isActive ? 'bg-white/10 font-semibold text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white',
              )}
            >
              <Icon className="h-[17px] w-[17px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-0.5 border-t border-white/10 px-3 py-4">
        <div className="px-3 py-1.5">
          <p className="truncate text-xs text-slate-500">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-[11px] rounded-control px-3 py-2.5 text-[13px] text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-[17px] w-[17px]" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
