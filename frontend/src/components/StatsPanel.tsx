import type { Stats, ScoringRule } from '../api';
import ScoringConfig from './ScoringConfig';

interface Props {
  stats: Stats | null;
  scoringConfig: ScoringRule[];
  onSaveScoringConfig: (rules: ScoringRule[]) => Promise<void>;
}

export default function StatsPanel({ stats, scoringConfig, onSaveScoringConfig }: Props) {
  if (!stats) return null;

  const cards = [
    { label: 'Businesses gesamt', value: stats.total, color: 'text-blue-600' },
    { label: 'Mit Details', value: stats.withDetails, color: 'text-green-600' },
    { label: 'Ohne Website', value: stats.noWebsite, color: 'text-red-600' },
    { label: 'Durchschn. Score', value: stats.avgScore.toFixed(1), color: 'text-orange-600' },
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
          </div>
        ))}
      </div>

      <ScoringConfig config={scoringConfig} onSave={onSaveScoringConfig} />
    </div>
  );
}
