import { useState, useMemo } from 'react';
import type { Business } from '../api';
import ProblemsTag from './ProblemsTag';
import BusinessDetail from './BusinessDetail';

type SortKey = 'problem_score' | 'name' | 'rating' | 'review_count' | 'primary_type';

interface Props {
  businesses: Business[];
  onExportCsv: () => void;
}

export default function BusinessTable({ businesses, onExportCsv }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('problem_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [selected, setSelected] = useState<Business | null>(null);

  const sorted = useMemo(() => {
    return [...businesses].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortAsc ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [businesses, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const SortHeader = ({ k, label }: { k: SortKey; label: string }) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
      onClick={() => toggleSort(k)}
    >
      {label} {sortKey === k ? (sortAsc ? '\u2191' : '\u2193') : ''}
    </th>
  );

  if (businesses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        Noch keine Daten. Starte einen Scan!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="text-sm text-gray-600">{businesses.length} Businesses</span>
        <button
          onClick={onExportCsv}
          className="px-4 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-gray-700"
        >
          CSV Export
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <SortHeader k="problem_score" label="Score" />
              <SortHeader k="name" label="Name" />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
              <SortHeader k="primary_type" label="Typ" />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefon</th>
              <SortHeader k="rating" label="Bewertung" />
              <SortHeader k="review_count" label="Reviews" />
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Probleme</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sorted.map(b => (
              <tr key={b.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelected(b)}>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                      b.problem_score >= 50
                        ? 'bg-red-100 text-red-700'
                        : b.problem_score >= 30
                          ? 'bg-orange-100 text-orange-700'
                          : b.problem_score > 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {b.problem_score}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{b.name}</div>
                  {b.google_maps_url && (
                    <a
                      href={b.google_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                      onClick={e => e.stopPropagation()}
                    >
                      Google Maps
                    </a>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">{b.address ?? '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{b.primary_type ?? '-'}</td>
                <td className="px-4 py-3 text-sm">
                  {b.website_url ? (
                    <a
                      href={b.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate block max-w-[200px]"
                      onClick={e => e.stopPropagation()}
                    >
                      {new URL(b.website_url).hostname}
                    </a>
                  ) : b.details_fetched ? (
                    <span className="text-red-500 font-medium">KEINE</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{b.phone_number ?? '-'}</td>
                <td className="px-4 py-3 text-sm">
                  {b.rating != null ? (
                    <span className={b.rating < 3.5 ? 'text-red-600 font-medium' : 'text-gray-700'}>
                      {b.rating.toFixed(1)}
                    </span>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{b.review_count ?? '-'}</td>
                <td className="px-4 py-3">
                  <ProblemsTag problemsJson={b.problems} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && <BusinessDetail business={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
