import Database from 'better-sqlite3';
import { config } from '../config.js';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(config.dbPath);
    db.pragma('journal_mode = WAL');
    migrate(db);
  }
  return db;
}

function migrate(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      primary_type TEXT,
      primary_type_display TEXT,
      types TEXT,
      google_maps_url TEXT,
      latitude REAL,
      longitude REAL,
      website_url TEXT,
      phone_number TEXT,
      phone_international TEXT,
      rating REAL,
      review_count INTEGER,
      has_opening_hours INTEGER,
      opening_hours_text TEXT,
      photo_count INTEGER,
      business_status TEXT,
      price_level TEXT,
      search_query TEXT,
      scanned_at TEXT,
      details_fetched INTEGER DEFAULT 0,
      problem_score INTEGER DEFAULT 0,
      problems TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_problem_score ON businesses(problem_score DESC);
    CREATE INDEX IF NOT EXISTS idx_primary_type ON businesses(primary_type);
    CREATE INDEX IF NOT EXISTS idx_details_fetched ON businesses(details_fetched);

    -- Add new columns to existing DBs (ALTER TABLE IF NOT EXISTS workaround)
  `);

  // Add columns that may not exist yet (SQLite has no IF NOT EXISTS for ALTER TABLE)
  const newColumns = [
    ['primary_type_display', 'TEXT'],
    ['types', 'TEXT'],
    ['latitude', 'REAL'],
    ['longitude', 'REAL'],
    ['phone_international', 'TEXT'],
    ['opening_hours_text', 'TEXT'],
    ['price_level', 'TEXT'],
    ['short_address', 'TEXT'],
    ['address_components', 'TEXT'],  // JSON
    ['editorial_summary', 'TEXT'],
    ['reviews_json', 'TEXT'],        // JSON array of reviews
    ['atmosphere', 'TEXT'],          // JSON: delivery, dineIn, outdoorSeating, etc.
    ['payment_options', 'TEXT'],     // JSON
    ['parking_options', 'TEXT'],     // JSON
    ['accessibility_options', 'TEXT'], // JSON
    ['photo_refs', 'TEXT'],            // JSON array of photo resource names
  ];
  for (const [col, type] of newColumns) {
    try {
      db.exec(`ALTER TABLE businesses ADD COLUMN ${col} ${type}`);
    } catch {
      // Column already exists
    }
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS api_usage (
      month TEXT NOT NULL,
      endpoint TEXT NOT NULL,
      count INTEGER DEFAULT 0,
      PRIMARY KEY (month, endpoint)
    );

    CREATE TABLE IF NOT EXISTS scoring_config (
      code TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      points INTEGER NOT NULL,
      enabled INTEGER DEFAULT 1
    );
  `);

  // Seed scoring_config with defaults if empty
  const count = (db.prepare('SELECT COUNT(*) as c FROM scoring_config').get() as { c: number }).c;
  if (count === 0) {
    const defaults = [
      ['NO_WEBSITE', 'Keine Website', 30],
      ['NO_REVIEWS', 'Keine Bewertungen', 20],
      ['NO_PHONE', 'Keine Telefonnummer', 15],
      ['NO_HOURS', 'Keine Oeffnungszeiten', 15],
      ['FEW_REVIEWS', 'Weniger als 10 Bewertungen', 10],
      ['FEW_PHOTOS', 'Weniger als 3 Fotos', 10],
      ['LOW_RATING', 'Bewertung unter 3.5', 10],
    ] as const;
    const insert = db.prepare('INSERT INTO scoring_config (code, label, points) VALUES (?, ?, ?)');
    for (const [code, label, points] of defaults) {
      insert.run(code, label, points);
    }
  }
}
