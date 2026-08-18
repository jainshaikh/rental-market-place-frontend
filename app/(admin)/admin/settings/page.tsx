'use client';

import { useState } from 'react';
import { usePlatformSettings, useUpsertSetting } from '../../../../hooks/useAdmin';
import type { PlatformSetting } from '../../../../lib/api/admin.api';
import { cn } from '../../../../lib/utils/cn';

// Seed defaults — shown in the "Add setting" form as quick picks
const PRESET_KEYS = [
  { key: 'platform.maintenance_mode', value: false, description: 'Put the platform in maintenance mode' },
  { key: 'platform.max_vehicles_per_provider', value: 50, description: 'Maximum vehicles a provider can list' },
  { key: 'platform.inquiry_expiry_days', value: 30, description: 'Days before an unanswered inquiry expires' },
  { key: 'platform.featured_listings_count', value: 6, description: 'Number of featured vehicles on homepage' },
];

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = usePlatformSettings();
  const upsert = useUpsertSetting();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const startEdit = (setting: PlatformSetting) => {
    setEditingKey(setting.key);
    setEditValue(JSON.stringify(setting.value));
  };

  const saveEdit = async (setting: PlatformSetting) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(editValue);
    } catch {
      alert('Value must be valid JSON (e.g. true, 42, "text", or {"key":"value"})');
      return;
    }
    await upsert.mutateAsync({ key: setting.key, value: parsed, description: setting.description ?? undefined });
    setEditingKey(null);
  };

  const handleAddPreset = (preset: typeof PRESET_KEYS[0]) => {
    setNewKey(preset.key);
    setNewValue(JSON.stringify(preset.value));
    setNewDesc(preset.description);
    setShowAdd(true);
  };

  const saveNew = async () => {
    if (!newKey.trim()) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(newValue);
    } catch {
      alert('Value must be valid JSON');
      return;
    }
    await upsert.mutateAsync({ key: newKey.trim(), value: parsed, description: newDesc || undefined });
    setNewKey('');
    setNewValue('');
    setNewDesc('');
    setShowAdd(false);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Key-value configuration store.</p>
        </div>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="text-sm font-semibold px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          {showAdd ? 'Cancel' : '+ Add setting'}
        </button>
      </div>

      {/* Add setting form */}
      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-5">
          <h2 className="text-sm font-semibold text-slate-800 mb-3">New setting</h2>

          {/* Preset keys */}
          <div className="flex flex-wrap gap-2 mb-4">
            {PRESET_KEYS.filter((p) => !settings?.some((s) => s.key === p.key)).map((p) => (
              <button
                key={p.key}
                onClick={() => handleAddPreset(p)}
                className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition-colors"
              >
                {p.key}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="Key (e.g. platform.feature_x)"
              value={newKey}
              onChange={(e) => setNewKey(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              placeholder='Value (JSON: true, 42, "text")'
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button
            onClick={saveNew}
            disabled={!newKey.trim() || !newValue.trim() || upsert.isPending}
            className="text-sm font-semibold px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            {upsert.isPending ? 'Saving…' : 'Save setting'}
          </button>
        </div>
      )}

      {/* Settings table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4 animate-pulse flex gap-4">
                <div className="h-4 bg-slate-100 rounded w-56" />
                <div className="h-4 bg-slate-100 rounded w-24" />
                <div className="h-4 bg-slate-100 rounded flex-1" />
              </div>
            ))}
          </div>
        ) : !settings || settings.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            No settings yet. Add one above or click a preset.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {settings.map((s) => (
              <div key={s.key} className="px-5 py-4 hover:bg-slate-50 transition-colors">
                {editingKey === s.key ? (
                  <div className="flex gap-3 items-start flex-wrap">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-mono font-semibold text-slate-800 mb-1">{s.key}</p>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full text-sm border border-primary/50 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div className="flex gap-2 pt-6">
                      <button
                        onClick={() => saveEdit(s)}
                        disabled={upsert.isPending}
                        className="text-xs font-semibold px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-60"
                      >
                        {upsert.isPending ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingKey(null)}
                        className="text-xs font-semibold px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-mono font-semibold text-slate-800">{s.key}</span>
                        <span className={cn(
                          'text-xs font-semibold px-2 py-0.5 rounded-full',
                          typeof s.value === 'boolean'
                            ? s.value ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                            : 'bg-blue-100 text-blue-700',
                        )}>
                          {JSON.stringify(s.value)}
                        </span>
                      </div>
                      {s.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{s.description}</p>
                      )}
                      <p className="text-xs text-slate-300 mt-0.5">
                        Updated {new Date(s.updatedAt).toLocaleDateString('en-AE', { dateStyle: 'medium' })}
                      </p>
                    </div>
                    <button
                      onClick={() => startEdit(s)}
                      className="text-xs font-semibold text-primary hover:underline flex-shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
