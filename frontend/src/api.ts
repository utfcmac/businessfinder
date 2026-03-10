const BASE = '/api';

export interface Business {
  id: string;
  name: string;
  address: string | null;
  short_address: string | null;
  address_components: string | null;
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
  editorial_summary: string | null;
  reviews_json: string | null;
  atmosphere: string | null;
  payment_options: string | null;
  parking_options: string | null;
  accessibility_options: string | null;
  search_query: string | null;
  scanned_at: string | null;
  details_fetched: number;
  problem_score: number;
  problems: string | null;
}

export interface Stats {
  total: number;
  withDetails: number;
  noWebsite: number;
  avgScore: number;
  queries: string[];
}

export async function scan(query: string): Promise<{ count: number; message: string }> {
  const res = await fetch(`${BASE}/scan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Scan fehlgeschlagen');
  return res.json();
}

export async function fetchDetails(limit = 50): Promise<{ count: number; message: string }> {
  const res = await fetch(`${BASE}/fetch-details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ limit }),
  });
  if (!res.ok) throw new Error((await res.json()).error || 'Details laden fehlgeschlagen');
  return res.json();
}

export async function getBusinesses(search?: string): Promise<Business[]> {
  const params = search ? `?q=${encodeURIComponent(search)}` : '';
  const res = await fetch(`${BASE}/businesses${params}`);
  return res.json();
}

export async function getStats(): Promise<Stats> {
  const res = await fetch(`${BASE}/stats`);
  return res.json();
}

export interface ApiUsage {
  textSearch: { used: number; limit: number };
  placeDetails: { used: number; limit: number };
  month: string;
}

export async function getApiUsage(): Promise<ApiUsage> {
  const res = await fetch(`${BASE}/usage`);
  return res.json();
}

export function getCsvExportUrl(): string {
  return `${BASE}/export/csv`;
}

export interface ScoringRule {
  code: string;
  label: string;
  points: number;
  enabled: boolean;
}

export async function getScoringConfig(): Promise<ScoringRule[]> {
  const res = await fetch(`${BASE}/scoring-config`);
  return res.json();
}

export async function saveScoringConfig(rules: ScoringRule[]): Promise<void> {
  await fetch(`${BASE}/scoring-config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rules),
  });
}

export async function recalculateScores(): Promise<{ updated: number; message: string }> {
  const res = await fetch(`${BASE}/recalculate`, { method: 'POST' });
  return res.json();
}
