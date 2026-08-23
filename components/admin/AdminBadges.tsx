import { cn } from '../../lib/utils/cn';

type Tone = 'slate' | 'blue' | 'violet' | 'emerald' | 'red' | 'amber' | 'teal';

const TONE: Record<Tone, string> = {
  slate: 'bg-status-slate-bg text-status-slate-fg border-status-slate-border',
  blue: 'bg-status-blue-bg text-status-blue-fg border-status-blue-border',
  violet: 'bg-status-violet-bg text-status-violet-fg border-status-violet-border',
  emerald: 'bg-status-emerald-bg text-status-emerald-fg border-status-emerald-border',
  red: 'bg-status-red-bg text-status-red-fg border-status-red-border',
  amber: 'bg-status-amber-bg text-status-amber-fg border-status-amber-border',
  teal: 'bg-status-teal-bg text-status-teal-fg border-status-teal-border',
};

const pill =
  'inline-flex items-center rounded-full border px-[9px] py-[3px] text-[11px] font-semibold tracking-wide';

// ── Role ────────────────────────────────────────────────────────────────
// A role is not a status: it is a different axis, so it gets its own map
// rather than being crammed into StatusBadge. It reuses the same frozen
// status.* tone palette so the two read as one family.
const ROLE_TONE: Record<string, Tone> = {
  USER: 'slate',
  PROVIDER: 'blue',
  ADMIN: 'violet',
  SUPER_ADMIN: 'violet',
};

const ROLE_LABEL: Record<string, string> = {
  USER: 'User',
  PROVIDER: 'Provider',
  ADMIN: 'Admin',
  SUPER_ADMIN: 'Super Admin',
};

export function RoleBadge({ role, className }: { role: string; className?: string }) {
  return (
    <span className={cn(pill, TONE[ROLE_TONE[role] ?? 'slate'], className)}>
      {ROLE_LABEL[role] ?? role}
    </span>
  );
}

// ── Audit action ────────────────────────────────────────────────────────
// Tone by outcome, derived from the action name, so new action types get a
// sensible colour without another lookup table to maintain.
export function ActionBadge({ action, className }: { action: string; className?: string }) {
  const tone: Tone = /_APPROVED$|_ACTIVATED$|_REACTIVATED$/.test(action)
    ? 'emerald'
    : /_REJECTED$|_SUSPENDED$/.test(action)
      ? 'red'
      : /^SETTINGS_/.test(action)
        ? 'amber'
        : /_CHANGED$|_UPDATED$/.test(action)
          ? 'blue'
          : 'slate';

  return (
    <span className={cn(pill, 'whitespace-nowrap', TONE[tone], className)}>
      {action
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())}
    </span>
  );
}

// ── Stat tile ───────────────────────────────────────────────────────────
export function AdminStat({
  label,
  value,
  loading,
  hint,
}: {
  label: string;
  value?: number;
  loading?: boolean;
  hint?: string;
}) {
  return (
    <div className="rounded-card border border-border-subtle bg-surface p-5 shadow-xs">
      <p className="text-xs font-medium text-text-muted">{label}</p>
      <p className="mt-1.5 font-mono text-[28px] font-semibold leading-none tracking-[-0.03em] text-ink">
        {loading ? <span className="text-text-faint">—</span> : (value ?? 0).toLocaleString()}
      </p>
      {hint && <p className="mt-2 text-[11px] text-text-faint">{hint}</p>}
    </div>
  );
}
