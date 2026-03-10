import { useState, useEffect } from 'react';
import type { ScoringRule } from '../api';

interface Props {
  config: ScoringRule[];
  onSave: (rules: ScoringRule[]) => Promise<void>;
}

function ruleColor(points: number): string {
  if (points >= 20) return 'bg-red-100 text-red-700';
  if (points >= 15) return 'bg-orange-100 text-orange-700';
  return 'bg-yellow-100 text-yellow-700';
}

export default function ScoringConfig({ config, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [rules, setRules] = useState<ScoringRule[]>(config);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (config.length > 0) setRules(config);
  }, [config]);

  const updateRule = (code: string, update: Partial<ScoringRule>) => {
    setRules(prev => prev.map(r => r.code === code ? { ...r, ...update } : r));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await onSave(rules);
    setDirty(false);
    setSaving(false);
  };

  const maxScore = rules.filter(r => r.enabled).reduce((s, r) => s + r.points, 0);

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1"
      >
        <span>{open ? '\u25BC' : '\u25B6'}</span>
        Scoring konfigurieren
      </button>

      {open && (
        <div className="mt-2 bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600 mb-3">
            Der Score ergibt sich aus der Summe aller zutreffenden Probleme. Je hoeher der Score, desto mehr Optimierungspotenzial. Max. {maxScore} Punkte.
          </p>

          <div className="space-y-2">
            {rules.map(r => (
              <div key={r.code} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={r.enabled}
                  onChange={e => updateRule(r.code, { enabled: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <input
                  type="number"
                  value={r.points}
                  onChange={e => updateRule(r.code, { points: Math.max(0, parseInt(e.target.value) || 0) })}
                  className={`w-16 px-2 py-1 rounded text-sm font-bold text-center ${r.enabled ? ruleColor(r.points) : 'bg-gray-100 text-gray-400'}`}
                  min={0}
                  max={100}
                />
                <span className={`text-sm ${r.enabled ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                  {r.label}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex gap-4 text-xs text-gray-400">
              <span>0 = alles gut</span>
              <span>1-29 = kleine Luecken</span>
              <span>30-49 = deutliches Potenzial</span>
              <span>50+ = dringender Handlungsbedarf</span>
            </div>
            {dirty && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
              >
                {saving ? 'Berechne...' : 'Speichern & Neu berechnen'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
