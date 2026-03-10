import type { Business } from '../api';
import ProblemsTag from './ProblemsTag';

interface Props {
  business: Business;
  onClose: () => void;
}

function JsonBadges({ json, colorClass }: { json: string | null; colorClass: string }) {
  if (!json) return <span className="text-gray-400">-</span>;
  try {
    const obj = JSON.parse(json);
    return (
      <div className="flex flex-wrap gap-1">
        {Object.entries(obj).map(([k, v]) => (
          <span
            key={k}
            className={`px-2 py-0.5 rounded text-xs ${
              v ? colorClass : 'bg-gray-100 text-gray-400 line-through'
            }`}
          >
            {k}
          </span>
        ))}
      </div>
    );
  } catch {
    return <span className="text-gray-500 text-sm">{json}</span>;
  }
}

function ReviewsList({ json }: { json: string | null }) {
  if (!json) return <span className="text-gray-400">Keine Reviews</span>;
  try {
    const reviews = JSON.parse(json) as {
      rating: number;
      text?: { text: string };
      relativePublishTimeDescription: string;
      authorAttribution?: { displayName: string };
    }[];
    return (
      <div className="space-y-3">
        {reviews.map((r, i) => (
          <div key={i} className="border-l-2 border-gray-200 pl-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{r.authorAttribution?.displayName ?? 'Anonym'}</span>
              <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              <span className="text-gray-400">{r.relativePublishTimeDescription}</span>
            </div>
            {r.text?.text && <p className="text-sm text-gray-600 mt-1">{r.text.text}</p>}
          </div>
        ))}
      </div>
    );
  } catch {
    return null;
  }
}

function OpeningHours({ json }: { json: string | null }) {
  if (!json) return <span className="text-gray-400">-</span>;
  try {
    const days = JSON.parse(json) as string[];
    return (
      <div className="text-sm space-y-0.5">
        {days.map((d, i) => (
          <div key={i} className="text-gray-600">{d}</div>
        ))}
      </div>
    );
  } catch {
    return <span className="text-gray-500 text-sm">{json}</span>;
  }
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-2 border-b border-gray-100 grid grid-cols-[160px_1fr] gap-3">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div className="text-sm text-gray-800">{children}</div>
    </div>
  );
}

export default function BusinessDetail({ business: b, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-10 z-50 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-10 mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{b.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{b.primary_type_display ?? b.primary_type ?? ''}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-1 max-h-[70vh] overflow-y-auto">
          {/* Basis */}
          <Row label="Adresse">{b.address ?? '-'}</Row>
          {b.short_address && <Row label="Kurz-Adresse">{b.short_address}</Row>}
          <Row label="Google Maps">
            {b.google_maps_url ? (
              <a href={b.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Auf Google Maps oeffnen
              </a>
            ) : '-'}
          </Row>
          {b.latitude != null && (
            <Row label="Koordinaten">{b.latitude.toFixed(6)}, {b.longitude?.toFixed(6)}</Row>
          )}

          {/* Kontakt */}
          <div className="pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Kontakt</div>
          <Row label="Website">
            {b.website_url ? (
              <a href={b.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
                {b.website_url}
              </a>
            ) : <span className="text-red-500 font-medium">Keine Website</span>}
          </Row>
          <Row label="Telefon">{b.phone_number ?? '-'}</Row>
          {b.phone_international && <Row label="International">{b.phone_international}</Row>}

          {/* Bewertungen */}
          <div className="pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Bewertungen</div>
          <Row label="Bewertung">
            {b.rating != null ? (
              <span>
                <span className="text-yellow-500">{'★'.repeat(Math.round(b.rating))}{'☆'.repeat(5 - Math.round(b.rating))}</span>
                {' '}{b.rating.toFixed(1)} ({b.review_count ?? 0} Reviews)
              </span>
            ) : '-'}
          </Row>
          {b.editorial_summary && <Row label="Beschreibung">{b.editorial_summary}</Row>}

          {/* Oeffnungszeiten */}
          <div className="pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Oeffnungszeiten</div>
          <Row label="Oeffnungszeiten">
            <OpeningHours json={b.opening_hours_text} />
          </Row>

          {/* Atmosphere */}
          <div className="pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Atmosphere / Service</div>
          <Row label="Angebote">
            <JsonBadges json={b.atmosphere} colorClass="bg-blue-100 text-blue-700" />
          </Row>

          {/* Optionen */}
          <Row label="Bezahlung">
            <JsonBadges json={b.payment_options} colorClass="bg-green-100 text-green-700" />
          </Row>
          <Row label="Parken">
            <JsonBadges json={b.parking_options} colorClass="bg-purple-100 text-purple-700" />
          </Row>
          <Row label="Barrierefreiheit">
            <JsonBadges json={b.accessibility_options} colorClass="bg-teal-100 text-teal-700" />
          </Row>

          {/* Probleme */}
          <div className="pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Analyse</div>
          <Row label="Problem-Score">
            <span className={`font-bold text-lg ${
              b.problem_score >= 50 ? 'text-red-600' : b.problem_score >= 30 ? 'text-orange-600' : b.problem_score > 0 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {b.problem_score}
            </span>
          </Row>
          <Row label="Probleme">
            <ProblemsTag problemsJson={b.problems} />
          </Row>

          {/* Reviews */}
          {b.reviews_json && (
            <>
              <div className="pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Google Reviews</div>
              <ReviewsList json={b.reviews_json} />
            </>
          )}

          {/* Meta */}
          <div className="pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">Meta</div>
          <Row label="Status">{b.business_status ?? '-'}</Row>
          <Row label="Preisniveau">{b.price_level ?? '-'}</Row>
          <Row label="Fotos">{b.photo_count ?? '-'}</Row>
          <Row label="Suchquery">{b.search_query ?? '-'}</Row>
          <Row label="Gescannt">{b.scanned_at ?? '-'}</Row>
        </div>
      </div>
    </div>
  );
}
