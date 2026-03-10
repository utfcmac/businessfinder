import { getDb } from './schema.js';

export interface Business {
  id: string;
  name: string;
  address: string | null;
  primary_type: string | null;
  primary_type_display: string | null;
  types: string | null;
  google_maps_url: string | null;
  latitude: number | null;
  longitude: number | null;
  website_url: string | null;
  phone_number: string | null;
  phone_international: string | null;
  rating: number | null;
  review_count: number | null;
  has_opening_hours: number | null;
  opening_hours_text: string | null;
  photo_count: number | null;
  business_status: string | null;
  price_level: string | null;
  short_address: string | null;
  address_components: string | null;
  editorial_summary: string | null;
  reviews_json: string | null;
  atmosphere: string | null;
  payment_options: string | null;
  parking_options: string | null;
  accessibility_options: string | null;
  photo_refs: string | null;
  search_query: string | null;
  scanned_at: string | null;
  details_fetched: number;
  problem_score: number;
  problems: string | null;
}

export function upsertBusiness(b: Partial<Business> & { id: string; name: string }): void {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM businesses WHERE id = ?').get(b.id);

  if (existing) {
    const fields = Object.entries(b)
      .filter(([k]) => k !== 'id')
      .map(([k]) => `${k} = @${k}`);
    if (fields.length === 0) return;
    db.prepare(`UPDATE businesses SET ${fields.join(', ')} WHERE id = @id`).run(b);
  } else {
    const keys = Object.keys(b);
    const placeholders = keys.map(k => `@${k}`);
    db.prepare(
      `INSERT INTO businesses (${keys.join(', ')}) VALUES (${placeholders.join(', ')})`
    ).run(b);
  }
}

export function getBusinessesWithoutDetails(limit = 50): Business[] {
  return getDb()
    .prepare('SELECT * FROM businesses WHERE details_fetched = 0 LIMIT ?')
    .all(limit) as Business[];
}

export function getTopProblems(limit = 50): Business[] {
  return getDb()
    .prepare('SELECT * FROM businesses WHERE problem_score > 0 ORDER BY problem_score DESC LIMIT ?')
    .all(limit) as Business[];
}

export function getAllBusinesses(search?: string): Business[] {
  const db = getDb();
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    return db.prepare(
      `SELECT * FROM businesses
       WHERE name LIKE ? OR address LIKE ? OR primary_type_display LIKE ? OR search_query LIKE ?
       ORDER BY problem_score DESC`
    ).all(term, term, term, term) as Business[];
  }
  return db.prepare('SELECT * FROM businesses ORDER BY problem_score DESC').all() as Business[];
}

export function getStats() {
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) as c FROM businesses').get() as { c: number }).c;
  const withDetails = (db.prepare('SELECT COUNT(*) as c FROM businesses WHERE details_fetched = 1').get() as { c: number }).c;
  const noWebsite = (db.prepare("SELECT COUNT(*) as c FROM businesses WHERE details_fetched = 1 AND (website_url IS NULL OR website_url = '')").get() as { c: number }).c;
  const avgScore = (db.prepare('SELECT AVG(problem_score) as a FROM businesses WHERE details_fetched = 1').get() as { a: number | null }).a;
  const queries = db.prepare('SELECT DISTINCT search_query FROM businesses WHERE search_query IS NOT NULL').all() as { search_query: string }[];

  return { total, withDetails, noWebsite, avgScore: avgScore ?? 0, queries: queries.map(q => q.search_query) };
}

// --- Scoring Config ---

export interface ScoringRule {
  code: string;
  label: string;
  points: number;
  enabled: boolean;
}

export function getScoringConfig(): ScoringRule[] {
  const rows = getDb().prepare('SELECT code, label, points, enabled FROM scoring_config ORDER BY points DESC').all() as { code: string; label: string; points: number; enabled: number }[];
  return rows.map(r => ({ ...r, enabled: r.enabled === 1 }));
}

export function saveScoringConfig(rules: ScoringRule[]): void {
  const db = getDb();
  const stmt = db.prepare('UPDATE scoring_config SET points = ?, enabled = ? WHERE code = ?');
  const tx = db.transaction(() => {
    for (const r of rules) {
      stmt.run(r.points, r.enabled ? 1 : 0, r.code);
    }
  });
  tx();
}

// --- API Usage Tracking ---

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7); // "2026-03"
}

export function trackApiCall(endpoint: 'text_search' | 'place_details', count = 1): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO api_usage (month, endpoint, count) VALUES (@month, @endpoint, @count)
    ON CONFLICT(month, endpoint) DO UPDATE SET count = count + @count
  `).run({ month: currentMonth(), endpoint, count });
}

export interface ApiUsage {
  textSearch: { used: number; limit: number };
  placeDetails: { used: number; limit: number };
  month: string;
}

export function getApiUsage(): ApiUsage {
  const db = getDb();
  const month = currentMonth();

  const textSearch = (db.prepare(
    "SELECT count as c FROM api_usage WHERE month = ? AND endpoint = 'text_search'"
  ).get(month) as { c: number } | undefined)?.c ?? 0;

  const placeDetails = (db.prepare(
    "SELECT count as c FROM api_usage WHERE month = ? AND endpoint = 'place_details'"
  ).get(month) as { c: number } | undefined)?.c ?? 0;

  return {
    textSearch: { used: textSearch, limit: 5000 },
    placeDetails: { used: placeDetails, limit: 1000 },
    month,
  };
}
