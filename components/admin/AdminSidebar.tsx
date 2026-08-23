'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BadgeCheck,
  Car,
  FileClock,
  LayoutDashboard,
  LogOut,
  Route,
  Settings,
  Store,
  Users,
} from 'lucide-react';
import { cn } from '../../lib/utils/cn';

// Was eight hand-inlined SVG blobs (~90 lines) in app/(admin)/layout.tsx.
export const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/providers', label: 'Providers', icon: Store },
  { href: '/admin/vehicles', label: 'Vehicles', icon: Car },
  { href: '/admin/trips', label: 'Trips', icon: Route },
  { href: '/admin/user-vehicles', label: 'Vehicle Verifications', icon: BadgeCheck },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileClock },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
] as const;

interface AdminSidebarProps {
  email?: string;
  onLogout: () => void;
  /** Called after a nav link is tapped — closes the mobile drawer. */
  onNavigate?: () => void;
}

export function AdminSidebar({ email, onLogout, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="border-b border-white/10 px-5 py-[18px]">
        <Link href="/admin/dashboard" onClick={onNavigate} className="group flex items-center gap-2.5">
          <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] bg-brand text-[15px] font-bold text-white shadow-coral transition-transform duration-200 ease-spring group-hover:-rotate-6 group-hover:scale-105">
            R
          </span>
          <span>
            <span className="block text-[13px] font-bold leading-none text-white">RentalMarket</span>
            <span className="mt-1 block text-[11px] font-medium leading-none text-white/40">Admin</span>
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'group relative flex items-center gap-2.5 rounded-control px-3 py-2 text-sm transition-all duration-200',
                active
                  ? 'bg-white/[0.09] font-semibold text-white'
                  : 'font-medium text-white/55 hover:bg-white/[0.05] hover:text-white',
              )}
            >
              {/* Active marker is a gradient bar, not a flat grey fill */}
              {active && (
                <span className="absolute left-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-full bg-brand" />
              )}
              <Icon
                className={cn(
                  'h-4 w-4 flex-shrink-0 transition-colors',
                  active ? 'text-brand-600' : 'text-white/40 group-hover:text-white/70',
                )}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-4">
        {email && <p className="mb-2 truncate px-3 text-[11px] text-white/35">{email}</p>}
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-2.5 rounded-control px-3 py-2 text-sm font-medium text-white/55 transition-colors hover:bg-white/[0.05] hover:text-white"
        >
          <LogOut className="h-4 w-4 flex-shrink-0 text-white/40" />
          Sign out
        </button>
      </div>
    </div>
  );
}
