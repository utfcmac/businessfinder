import { useState } from 'react';
import UsagePanel from './UsagePanel';
import type { ApiUsage } from '../api';

interface Props {
  usage: ApiUsage | null;
  loading: boolean;
  status: string | null;
  onScan: (query: string) => void;
  onFetchDetails: (limit: number) => void;
  onBack: () => void;
}

export default function ImportPage({ usage, loading, status, onScan, onFetchDetails, onBack }: Props) {
  const [query, setQuery] = useState('');
  const [detailLimit, setDetailLimit] = useState(50);

  const handleScan = () => {
    if (query.trim()) onScan(query.trim());
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={onBack}
        className="text-sm text-gray-400 hover:text-gray-600 mb-6 flex items-center gap-1"
      >
        &larr; Zurueck zur Uebersicht
      </button>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Daten importieren</h1>

      {/* Step 1: Scan */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="bg-blue-600 text-white text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0">1</span>
          <div>
            <h2 className="font-semibold text-gray-800">Businesses suchen</h2>
            <p className="text-sm text-gray-500 mt-1">
              Gib eine Suchanfrage ein, wie du sie auch bei Google Maps eingeben wuerdest.
              Kombiniere <strong>Branche + Ort</strong> fuer gezielte Ergebnisse.
            </p>
            <div className="mt-2 text-xs text-gray-400 space-y-1">
              <p>Beispiele:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>"Friseur in Hamburg Langenhorn"</li>
                <li>"Zahnarzt Hamburg Eimsbuettel"</li>
                <li>"Restaurant Berlin Kreuzberg"</li>
                <li>"Autowerkstatt Muenchen Schwabing"</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleScan()}
            placeholder='z.B. "Friseur in Hamburg Langenhorn"'
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            disabled={loading}
          />
          <button
            onClick={handleScan}
            disabled={loading || !query.trim()}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            Scannen
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-400">
          Pro Scan werden bis zu 60 Businesses gefunden (3 Seiten). Verbraucht Text Search Kontingent.
        </p>
      </div>

      {/* Step 2: Details */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="bg-green-600 text-white text-sm font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0">2</span>
          <div>
            <h2 className="font-semibold text-gray-800">Details laden</h2>
            <p className="text-sm text-gray-500 mt-1">
              Fuer gefundene Businesses werden Website, Telefon, Bewertungen, Oeffnungszeiten
              und weitere Details von Google abgerufen. Erst danach ist eine Analyse moeglich.
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Anzahl Eintraege</span>
            <span className="font-mono font-bold text-gray-800">{detailLimit}</span>
          </label>
          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={detailLimit}
            onChange={e => setDetailLimit(parseInt(e.target.value))}
            className="w-full accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>5</span>
            <span>50</span>
            <span>100</span>
            <span>200</span>
          </div>
        </div>

        <button
          onClick={() => onFetchDetails(detailLimit)}
          disabled={loading}
          className="w-full px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          {detailLimit} Details laden
        </button>

        <p className="mt-2 text-xs text-gray-400">
          Verbraucht Place Details Kontingent ({detailLimit} von 1.000 gratis/Monat).
        </p>
      </div>

      {/* Status */}
      {status && (
        <div className={`rounded-lg p-5 mb-6 border-2 ${loading ? 'bg-blue-50 border-blue-300 animate-pulse' : 'bg-green-50 border-green-400'}`}>
          <p className={`text-base font-semibold ${loading ? 'text-blue-800' : 'text-green-800'}`}>
            {status}
          </p>
          {!loading && (
            <button
              onClick={onBack}
              className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              Ergebnisse ansehen &rarr;
            </button>
          )}
        </div>
      )}

      {/* Usage */}
      <UsagePanel usage={usage} />
    </div>
  );
}
