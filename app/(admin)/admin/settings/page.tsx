'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, SlidersHorizontal, X } from 'lucide-react';
import { usePlatformSettings, useUpsertSetting } from '../../../../hooks/useAdmin';
import type { PlatformSetting } from '../../../../lib/api/admin.api';
import { AdminPageHeader } from '../../../../components/admin';
import { Button, Card, EmptyState, Input } from '../../../../components/ui';
import { cn } from '../../../../lib/utils/cn';

const PRESET_KEYS = [
  {
    key: 'platform.maintenance_mode',
    value: false,
    description: 'Put the platform in maintenance mode',
  },
  {
    key: 'platform.max_vehicles_per_provider',
    value: 50,
    description: 'Maximum vehicles a provider can list',
  },
  {
    key: 'platform.inquiry_expiry_days',
    value: 30,
    description: 'Days before an unanswered inquiry expires',
  },
  {
    key: 'platform.featured_listings_count',
    value: 6,
    description: 'Number of featured vehicles on homepage',
  },
];

/** Parses the JSON value field, surfacing failures as a toast instead of a
 * blocking window.alert() (which the old page used in two places). */
function parseJsonValue(raw: string): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    toast.error('Value must be valid JSON', {
      description: 'e.g. true, 42, "text", or {"key":"value"}',
    });
    return { ok: false };
  }
}

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = usePlatformSettings();
  const upsert = useUpsertSetting();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const saveEdit = async (setting: PlatformSetting) => {
    const parsed = parseJsonValue(editValue);
    if (!parsed.ok) return;
    await upsert.mutateAsync({
      key: setting.key,
      value: parsed.value,
      description: setting.description ?? undefined,
    });
    toast.success(`Updated ${setting.key}`);
    setEditingKey(null);
  };

  const saveNew = async () => {
    if (!newKey.trim()) return;
    const parsed = parseJsonValue(newValue);
    if (!parsed.ok) return;
    await upsert.mutateAsync({
      key: newKey.trim(),
      value: parsed.value,
      description: newDesc || undefined,
    });
    toast.success(`Added ${newKey.trim()}`);
    setNewKey('');
    setNewValue('');
    setNewDesc('');
    setShowAdd(false);
  };

  const unusedPresets = PRESET_KEYS.filter((p) => !settings?.some((s) => s.key === p.key));

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Platform Settings"
        subtitle="Key-value configuration store."
        actions={
          <Button variant={showAdd ? 'secondary' : 'primary'} onClick={() => setShowAdd((v) => !v)}>
            {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAdd ? 'Cancel' : 'Add setting'}
          </Button>
        }
      />

      {/* Add form */}
      {showAdd && (
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-ink">New setting</h2>

          {unusedPresets.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.07em] text-text-faint">
                Start from a preset
              </p>
              <div className="flex flex-wrap gap-2">
                {unusedPresets.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => {
                      setNewKey(p.key);
                      setNewValue(JSON.stringify(p.value));
                      setNewDesc(p.description);
                    }}
                    className="rounded-full border border-border-subtle bg-surface px-3 py-1.5 font-mono text-[11px] text-text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-600 hover:text-brand-700"
                  >
                    {p.key}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Key"
              placeholder="platform.feature_x"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="font-mono text-xs"
            />
            <Input
              label="Value"
              helper="JSON"
              placeholder='true, 42, "text"'
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="font-mono text-xs"
            />
            <Input
              label="Description"
              placeholder="Optional"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>

          <Button
            onClick={saveNew}
            disabled={!newKey.trim() || !newValue.trim()}
            loading={upsert.isPending}
          >
            Save setting
          </Button>
        </Card>
      )}

      {/* Settings list */}
      {isLoading ? (
        <div className="overflow-hidden rounded-card border border-border-subtle bg-surface">
          <div className="divide-y divide-border-subtle">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4">
                <div className="h-4 w-64 animate-pulse rounded-chip bg-page" />
              </div>
            ))}
          </div>
        </div>
      ) : !settings || settings.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="No settings yet"
          description="Add a key-value pair, or start from one of the presets."
          action={!showAdd ? { label: 'Add setting', onClick: () => setShowAdd(true) } : undefined}
        />
      ) : (
        <div className="overflow-hidden rounded-card border border-border-subtle bg-surface shadow-xs">
          <div className="divide-y divide-border-subtle">
            {settings.map((s) => {
              const editing = editingKey === s.key;
              const isBool = typeof s.value === 'boolean';

              return (
                <div key={s.key} className="px-5 py-4 transition-colors hover:bg-surface-hover">
                  {editing ? (
                    <div className="flex flex-wrap items-end gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="mb-1.5 font-mono text-sm font-semibold text-ink">{s.key}</p>
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="font-mono text-xs"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" loading={upsert.isPending} onClick={() => saveEdit(s)}>
                          Save
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditingKey(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-mono text-sm font-semibold text-ink">{s.key}</span>
                          {/* Boolean true/false reads as on/off, so it keeps the
                              emerald/slate split; other types are neutral blue. */}
                          <span
                            className={cn(
                              'rounded-full border px-[9px] py-[3px] font-mono text-[11px] font-semibold',
                              isBool
                                ? s.value
                                  ? 'border-status-emerald-border bg-status-emerald-bg text-status-emerald-fg'
                                  : 'border-status-slate-border bg-status-slate-bg text-status-slate-fg'
                                : 'border-status-blue-border bg-status-blue-bg text-status-blue-fg',
                            )}
                          >
                            {JSON.stringify(s.value)}
                          </span>
                        </div>
                        {s.description && (
                          <p className="mt-1 text-xs text-text-muted">{s.description}</p>
                        )}
                        <p className="mt-1 font-mono text-[11px] text-text-faint">
                          Updated{' '}
                          {new Date(s.updatedAt).toLocaleDateString('en-PK', {
                            dateStyle: 'medium',
                          })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingKey(s.key);
                          setEditValue(JSON.stringify(s.value));
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
