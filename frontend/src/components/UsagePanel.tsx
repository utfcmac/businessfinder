import type { ApiUsage } from '../api';

interface Props {
  usage: ApiUsage | null;
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min((used / limit) * 100, 100);
  const color =
    pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-800">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-0.5 text-right">
        {(limit - used).toLocaleString()} verbleibend
      </p>
    </div>
  );
}

export default function UsagePanel({ usage }: Props) {
  if (!usage) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">
        API-Verbrauch ({usage.month})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UsageBar
          label="Text Search (Pro)"
          used={usage.textSearch.used}
          limit={usage.textSearch.limit}
        />
        <UsageBar
          label="Place Details (Enterprise)"
          used={usage.placeDetails.used}
          limit={usage.placeDetails.limit}
        />
      </div>
    </div>
  );
}
