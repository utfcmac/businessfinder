# BusinessFinder

[![en](https://img.shields.io/badge/lang-en-red.svg)](README.md)
[![de](https://img.shields.io/badge/lang-de-blue.svg)](README.de.md)

Tool for finding businesses with optimization potential (no website, missing data, poor reviews) via Google Places API (New). Intended as a lead source for web development / online marketing.

> [!CAUTION]
> This tool uses the Google Places API, which becomes paid after the free tier. Text Search costs $0.032/call, Place Details $0.025/call. With intensive use, double-digit amounts can quickly accumulate. Always keep an eye on API consumption and, if necessary, set budget limits in the Google Cloud Console.

## Setup

```bash
# Install dependencies
npm install
cd frontend && npm install && cd ..

# Configure API Key
cp .env.example .env
# Enter GOOGLE_PLACES_API_KEY=your_key

# Build frontend + start server
cd frontend && npm run build && cd ..
npm run server
# -> http://localhost:3001
```

For development: `cd frontend && npm run dev` (Vite on port 5173, proxy on 3001).

## Architecture

```
src/
  server.ts          Express API Server (Port 3001)
  scanner.ts         Scan logic: Text Search + Detail Fetch
  analyzer.ts        Problem-Score calculation (configurable)
  config.ts          Environment variables + paths
  api/places.ts      Google Places API (New) Client
  db/schema.ts       SQLite Schema + Migrations
  db/repository.ts   Database access (CRUD, Stats, Usage)

frontend/src/
  App.tsx             Main component, State Management, Routing
  api.ts              API Client (fetch wrapper)
  components/
    SearchBar.tsx      Text search (DB) + navigation to import page
    ImportPage.tsx     Dedicated page for Scan + loading Details
    StatsPanel.tsx     Statistics cards + Scoring Config
    UsagePanel.tsx     API consumption display
    FilterBar.tsx      Combinable filter dropdowns
    BusinessTable.tsx  Sortable table with detail modal
    BusinessDetail.tsx Detail view (modal) with all fields
    ScoringConfig.tsx  Configurable scoring rules
    ProblemsTag.tsx    Colored problem badges
```

## Google Places API

Uses the **Google Places API (New)** (POST-based, Field Masks determine pricing tier).

### Two-Step Scan

1. **Text Search** (Pro tier, 5,000 free/month)
   - Searches for query (e.g. "Hairdresser in Hamburg Langenhorn")
   - Paginates up to 3 pages (max. 60 results per query)
   - Stores basic data + photo references

2. **Place Details** (Enterprise + Atmosphere, 1,000 free/month)
   - Loads details for scanned businesses
   - Website, phone, reviews, opening hours, reviews
   - Atmosphere flags (delivery, dineIn, reservable, etc.)
   - Payment/Parking/Accessibility options

### API Usage

Tracked in `api_usage` table and displayed in the frontend. Limits:

| Endpoint | Free/Month |
|----------|-------------|
| Text Search (Pro) | 5,000 |
| Place Details (Enterprise) | 1,000 |

**Photo references** are stored for free from the Text Search (Enterprise Photo API for retrieval: 1,000 free/month, not yet implemented).

## Database

SQLite with WAL mode (`data/businessfinder.db`). Tables:

### businesses
All business data. Important fields:
- `id` (PK) - Google Place ID
- `details_fetched` - 0=text search only, 1=details loaded
- `problem_score` - calculated score (higher = more problems)
- `problems` - JSON array of detected problems
- `atmosphere` - JSON with service flags (delivery, reservable, etc.)
- `reviews_json` - JSON array of Google Reviews
- `photo_refs` - JSON array of photo references

### scoring_config
Configurable scoring rules:

| Code | Default Points | Description |
|------|---------------|-------------|
| NO_WEBSITE | 30 | No website |
| NO_REVIEWS | 20 | No reviews |
| NO_PHONE | 15 | No phone number |
| NO_HOURS | 15 | No opening hours |
| FEW_REVIEWS | 10 | Less than 10 reviews |
| FEW_PHOTOS | 10 | Less than 3 photos |
| LOW_RATING | 10 | Rating below 3.5 |

Points and active/inactive status are configurable via the GUI. After modification, all businesses are recalculated.

### api_usage
Monthly API consumption per endpoint.

## API Endpoints

| Method | Path | Description |
|---------|------|-------------|
| POST | `/api/scan` | Start new scan (costs API calls) |
| POST | `/api/fetch-details` | Load details for unscanned businesses |
| GET | `/api/businesses?q=` | Load businesses from DB (optional search text) |
| GET | `/api/businesses/top?limit=` | Top businesses by score |
| GET | `/api/stats` | Statistics (count, average, etc.) |
| GET | `/api/usage` | API usage current month |
| GET | `/api/scoring-config` | Current scoring rules |
| PUT | `/api/scoring-config` | Save scoring rules |
| POST | `/api/recalculate` | Recalculate all scores |
| GET | `/api/export/csv` | CSV export of all businesses |

## Screenshots

<p>
  <img src="docs/import.png" width="280" alt="Import page" />
  <img src="docs/main.png" width="280" alt="Main view with filters" />
  <img src="docs/detail.png" width="280" alt="Detail modal" />
</p>

## GUI Features

- **Text Search**: Search DB by name, address, type, search query (no API usage)
- **Import Page**: Dedicated page with two-step workflow (Scan + load details), limit slider, examples
- **Status Display**: Noticeable result box with link to overview after scan/details
- **Filters**: Combinable dropdowns (website, rating, reviews, score)
- **Sorting**: Click on column headers (score, name, rating, reviews, type)
- **Detail Modal**: Click on table row shows all details
- **Scoring Config**: Expandable panel for adjusting scoring rules
- **CSV Export**: Download all businesses as CSV
- **API Usage**: Live display with progress bars
