'use client';

import { useState } from 'react';
import { useAuditLogs } from '../../../../hooks/useAdmin';
import { cn } from '../../../../lib/utils/cn';

const ENTITY_TYPE_OPTS = [
  { value: '', label: 'All entities' },
  { value: 'USER', label: 'User' },
  { value: 'PROVIDER', label: 'Provider' },
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'BOOKING_REQUEST', label: 'Booking' },
  { value: 'PLATFORM_SETTING', label: 'Setting' },
];

const ACTION_COLORS: Record<string, string> = {
  PROVIDER_APPROVED: 'bg-green-100 text-green-700',
  PROVIDER_REJECTED: 'bg-red-100 text-red-700',
  VEHICLE_APPROVED: 'bg-green-100 text-green-700',
  VEHICLE_REJECTED: 'bg-red-100 text-red-700',
  USER_SUSPENDED: 'bg-red-100 text-red-700',
  USER_ACTIVATED: 'bg-green-100 text-green-700',
  BOOKING_STATUS_CHANGED: 'bg-blue-100 text-blue-700',
  SETTINGS_UPDATED: 'bg-amber-100 text-amber-700',
  ADMIN_LOGIN: 'bg-slate-100 text-slate-600',
};

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [entityIdInput, setEntityIdInput] = useState('');

  const { data, isFetching } = useAuditLogs({
    entityType: entityType || undefined,
    entityId: entityId || undefined,
    page,
  });

  const logs = data?.data ?? [];
  const meta = data?.meta;

  const applyEntityId = () => {
    setEntityId(entityIdInput.trim());
    setPage(1);
  };

  const clearFilters = () => {
    setEntityType('');
    setEntityId('');
    setEntityIdInput('');
    setPage(1);
  };

  const hasFilters = !!entityType || !!entityId;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="text-slate-500 text-sm mt-1">Append-only record of all admin actions.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5 items-end">
        <select
          value={entityType}
          onChange={(e) => { setEntityType(e.target.value); setPage(1); }}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          {ENTITY_TYPE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Entity ID…"
            value={entityIdInput}
            onChange={(e) => setEntityIdInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyEntityId()}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 w-52"
          />
          <button
            onClick={applyEntityId}
            className="text-sm px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Filter
          </button>
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="text-sm text-slate-400 hover:text-slate-700">
            Clear
          </button>
        )}

        {meta && (
          <p className="text-xs text-slate-400 ml-auto self-center">
            {meta.total.toLocaleString()} entries
          </p>
        )}
      </div>

      {/* Log entries */}
      <div className={cn('bg-white rounded-xl border border-slate-200 overflow-hidden', isFetching && 'opacity-70 transition-opacity')}>
        {logs.length === 0 && !isFetching ? (
          <div className="text-center py-12 text-slate-400 text-sm">No log entries found</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="px-5 py-4 flex gap-4 items-start hover:bg-slate-50 transition-colors">
                {/* Action badge */}
                <div className="flex-shrink-0 pt-0.5">
                  <span className={cn(
                    'text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap',
                    ACTION_COLORS[log.actionType] ?? 'bg-slate-100 text-slate-600',
                  )}>
                    {log.actionType.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="text-sm font-medium text-slate-800">
                      {log.adminUser.name}
                    </span>
                    <span className="text-xs text-slate-400">{log.adminUser.email}</span>
                    <span className="text-xs text-slate-300">·</span>
                    <span className="text-xs text-slate-500 font-mono">{log.entityType}/{log.entityId.slice(0, 12)}…</span>
                  </div>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {Object.entries(log.metadata)
                        .filter(([, v]) => v != null && v !== '')
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </p>
                  )}

                  {log.ipAddress && (
                    <p className="text-xs text-slate-400 mt-0.5">IP: {log.ipAddress}</p>
                  )}
                </div>

                <div className="flex-shrink-0 text-xs text-slate-400 whitespace-nowrap pt-0.5">
                  {new Date(log.createdAt).toLocaleString('en-AE', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Page {page} of {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((n) => n - 1)} disabled={page <= 1}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Previous
              </button>
              <button onClick={() => setPage((n) => n + 1)} disabled={page >= meta.totalPages}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
