export interface Filters {
  website: 'all' | 'none' | 'has';
  rating: 'all' | 'gte45' | 'gte40' | 'lt35';
  reviews: 'all' | 'gte50' | 'gte10' | 'none';
  score: 'all' | 'gte50' | '30to49' | '1to29' | '0';
}

export const DEFAULT_FILTERS: Filters = {
  website: 'all',
  rating: 'all',
  reviews: 'all',
  score: 'all',
};

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  totalCount: number;
  filteredCount: number;
}

function SelectFilter({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const active = value !== 'all';
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-500">{label}</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`text-sm rounded px-2 py-1 border cursor-pointer ${
          active ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium' : 'border-gray-200 text-gray-700'
        }`}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

export default function FilterBar({ filters, onChange, totalCount, filteredCount }: Props) {
  const hasActive = Object.values(filters).some(v => v !== 'all');

  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="mb-4 bg-white rounded-lg shadow px-4 py-3 flex items-center gap-4 flex-wrap">
      <SelectFilter
        label="Website"
        value={filters.website}
        options={[
          { value: 'all', label: 'Alle' },
          { value: 'none', label: 'Keine Website' },
          { value: 'has', label: 'Hat Website' },
        ]}
        onChange={v => update('website', v)}
      />
      <SelectFilter
        label="Bewertung"
        value={filters.rating}
        options={[
          { value: 'all', label: 'Alle' },
          { value: 'gte45', label: 'ab 4.5' },
          { value: 'gte40', label: 'ab 4.0' },
          { value: 'lt35', label: 'unter 3.5' },
        ]}
        onChange={v => update('rating', v)}
      />
      <SelectFilter
        label="Reviews"
        value={filters.reviews}
        options={[
          { value: 'all', label: 'Alle' },
          { value: 'gte50', label: '50+' },
          { value: 'gte10', label: '10+' },
          { value: 'none', label: 'Keine' },
        ]}
        onChange={v => update('reviews', v)}
      />
      <SelectFilter
        label="Score"
        value={filters.score}
        options={[
          { value: 'all', label: 'Alle' },
          { value: 'gte50', label: '50+ (dringend)' },
          { value: '30to49', label: '30-49' },
          { value: '1to29', label: '1-29' },
          { value: '0', label: '0 (ok)' },
        ]}
        onChange={v => update('score', v)}
      />

      <div className="ml-auto flex items-center gap-3 text-sm">
        {hasActive && (
          <>
            <span className="text-blue-600 font-medium">{filteredCount} von {totalCount}</span>
            <button
              onClick={() => onChange({ ...DEFAULT_FILTERS })}
              className="text-gray-400 hover:text-gray-600 underline"
            >
              Zuruecksetzen
            </button>
          </>
        )}
      </div>
    </div>
  );
}
