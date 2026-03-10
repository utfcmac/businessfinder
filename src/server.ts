import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { scanQuery, fetchDetails } from './scanner.js';
import { getAllBusinesses, getTopProblems, getStats, getApiUsage, getScoringConfig, saveScoringConfig, upsertBusiness } from './db/repository.js';
import { analyzeProblems } from './analyzer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve built frontend in production
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// --- API Routes ---

app.post('/api/scan', async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string') {
    res.status(400).json({ error: 'query ist erforderlich' });
    return;
  }
  try {
    const count = await scanQuery(query);
    res.json({ count, message: `${count} Businesses gefunden.` });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unbekannter Fehler' });
  }
});

app.post('/api/fetch-details', async (req, res) => {
  const limit = req.body.limit || 50;
  try {
    const count = await fetchDetails(limit);
    res.json({ count, message: `${count} Details geladen.` });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unbekannter Fehler' });
  }
});

app.get('/api/businesses', (req, res) => {
  const search = req.query.q as string | undefined;
  const businesses = getAllBusinesses(search);
  res.json(businesses);
});

app.get('/api/businesses/top', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const businesses = getTopProblems(limit);
  res.json(businesses);
});

app.get('/api/stats', (_req, res) => {
  const stats = getStats();
  res.json(stats);
});

app.get('/api/usage', (_req, res) => {
  const usage = getApiUsage();
  res.json(usage);
});

app.get('/api/scoring-config', (_req, res) => {
  res.json(getScoringConfig());
});

app.put('/api/scoring-config', (req, res) => {
  const rules = req.body;
  if (!Array.isArray(rules)) {
    res.status(400).json({ error: 'Array von Regeln erwartet' });
    return;
  }
  saveScoringConfig(rules);
  res.json({ ok: true });
});

app.post('/api/recalculate', (_req, res) => {
  const config = getScoringConfig();
  const businesses = getAllBusinesses();
  let updated = 0;
  for (const b of businesses) {
    if (!b.details_fetched) continue;
    const { score, problems } = analyzeProblems(b, config);
    upsertBusiness({ id: b.id, name: b.name, problem_score: score, problems: JSON.stringify(problems) });
    updated++;
  }
  res.json({ updated, message: `${updated} Businesses neu berechnet.` });
});

app.get('/api/export/csv', (_req, res) => {
  const businesses = getAllBusinesses();
  const header = 'Name,Adresse,Typ,Website,Telefon,Bewertung,Reviews,Fotos,Oeffnungszeiten,Score,Probleme,Google Maps';
  const rows = businesses.map(b => {
    const problems = b.problems ? JSON.parse(b.problems).map((p: { label: string }) => p.label).join('; ') : '';
    return [
      csvEscape(b.name),
      csvEscape(b.address ?? ''),
      csvEscape(b.primary_type ?? ''),
      csvEscape(b.website_url ?? ''),
      csvEscape(b.phone_number ?? ''),
      b.rating ?? '',
      b.review_count ?? '',
      b.photo_count ?? '',
      b.has_opening_hours ? 'Ja' : 'Nein',
      b.problem_score,
      csvEscape(problems),
      csvEscape(b.google_maps_url ?? ''),
    ].join(',');
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=businesses.csv');
  res.send([header, ...rows].join('\n'));
});

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

app.listen(PORT, () => {
  console.log(`BusinessFinder API laeuft auf http://localhost:${PORT}`);
});
