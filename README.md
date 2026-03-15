<div align="center">

# 🔍 BusinessFinder

**Lead generation tool for finding local businesses with optimization potential**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-black?style=flat-square&logo=express)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Google Places API](https://img.shields.io/badge/Google_Places_API-New-4285F4?style=flat-square&logo=google)](https://developers.google.com/maps/documentation/places/web-service/overview)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

[Features](#-features) • [Quick Start](#-quick-start) • [API](#-api-reference) • [Architecture](#-architecture) • [Screenshots](#-screenshots)

![Main View](docs/main.png)

</div>

---

## 🎯 Overview

BusinessFinder is a lead generation tool that helps web developers and digital marketers identify local businesses with optimization potential. Using the Google Places API (New), it scans for businesses missing crucial online presence elements like websites, reviews, or contact information.

### Why BusinessFinder?

- 🎯 **Targeted leads**: Find businesses that actually need your services
- 📊 **Data-driven**: Customizable scoring system to prioritize prospects
- 🔍 **Comprehensive**: Scans business details, reviews, photos, and atmosphere data
- 💰 **Cost-aware**: Built-in API usage tracking to monitor costs
- 🎨 **Modern UI**: React frontend with filtering, sorting, and detailed business views
- 📥 **Export ready**: CSV export for CRM integration

> [!CAUTION]
> This tool uses the Google Places API, which becomes paid after the free tier. Text Search costs $0.032/call, Place Details $0.025/call. With intensive use, costs can add up quickly. Always monitor API consumption and set budget limits in the Google Cloud Console.

## ✨ Features

- 🔍 **Two-step scanning**: Text Search + Place Details for comprehensive data
- 🎯 **Problem detection**: Automatically identifies missing websites, poor reviews, incomplete data
- ⚙️ **Configurable scoring**: Adjust point values for different problem types
- 📊 **Real-time stats**: Monitor total businesses, average scores, and API usage
- 🔎 **Advanced filtering**: Filter by website status, rating, reviews, and problem score
- 📋 **Sortable table**: Click column headers to sort by any field
- 📄 **Detail modal**: View all business information including reviews and atmosphere data
- 📥 **CSV export**: Download complete business list with all fields
- 💾 **SQLite storage**: Local database with WAL mode for performance
- 📈 **Usage tracking**: Monitor monthly API consumption with visual progress bars

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- [Google Cloud API Key](https://developers.google.com/maps/documentation/places/web-service/get-api-key) with Places API (New) enabled

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/businessfinder.git
cd businessfinder

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies
cd frontend
npm install
cd ..

# 4. Configure API key
cp .env.example .env
# Edit .env and add your Google Places API key:
# GOOGLE_PLACES_API_KEY=your_key_here

# 5. Build frontend
cd frontend
npm run build
cd ..

# 6. Start the server
npm run server
# -> http://localhost:3001
```

### Development Mode

```bash
# Terminal 1: Backend (port 3001)
npm run server

# Terminal 2: Frontend (port 5173, proxies API to 3001)
cd frontend
npm run dev
```

## 📡 API Reference

### Scan for Businesses

```bash
POST /api/scan
Content-Type: application/json

{
  "query": "Hairdresser in Hamburg Langenhorn"
}
```

Searches Google Places and stores basic business information (name, address, rating, photo references).

**Response:**
```json
{
  "count": 42,
  "message": "42 Businesses gefunden."
}
```

### Fetch Business Details

```bash
POST /api/fetch-details
Content-Type: application/json

{
  "limit": 50
}
```

Loads detailed information for businesses that haven't been fully scanned yet (website, phone, opening hours, reviews, atmosphere data).

**Response:**
```json
{
  "count": 50,
  "message": "50 Details geladen."
}
```

### Get All Businesses

```bash
GET /api/businesses?q=search_term
```

Returns all businesses from database, optionally filtered by search term.

### Get Top Problems

```bash
GET /api/businesses/top?limit=50
```

Returns businesses with highest problem scores (default limit: 50).

### Get Statistics

```bash
GET /api/stats
```

**Response:**
```json
{
  "total": 150,
  "withDetails": 120,
  "avgScore": 25.5,
  "avgRating": 4.2,
  "noWebsiteCount": 45
}
```

### Get API Usage

```bash
GET /api/usage
```

**Response:**
```json
[
  {
    "endpoint": "textSearch",
    "count": 234,
    "month": "2025-03",
    "limit": 5000
  },
  {
    "endpoint": "placeDetails",
    "count": 567,
    "month": "2025-03",
    "limit": 1000
  }
]
```

### Get Scoring Configuration

```bash
GET /api/scoring-config
```

Returns current scoring rules.

### Update Scoring Configuration

```bash
PUT /api/scoring-config
Content-Type: application/json

[
  {
    "code": "NO_WEBSITE",
    "label": "No website",
    "points": 30,
    "active": true
  }
]
```

### Recalculate Scores

```bash
POST /api/recalculate
```

Recalculates problem scores for all businesses based on current scoring configuration.

### Export CSV

```bash
GET /api/export/csv
```

Downloads CSV file with all businesses and their data.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  BusinessFinder                      │
│                                                      │
│  ┌──────────────────┐         ┌─────────────────┐  │
│  │  React Frontend  │◄───────►│  Express API    │  │
│  │  (Port 5173/3001)│         │  (Port 3001)    │  │
│  └──────────────────┘         └─────────────────┘  │
│                                        │             │
│                                        ▼             │
│                              ┌─────────────────┐    │
│                              │  SQLite DB      │    │
│                              │  (WAL mode)     │    │
│                              └─────────────────┘    │
│                                        │             │
│                                        ▼             │
│                              ┌─────────────────┐    │
│                              │  Google Places  │    │
│                              │  API (New)      │    │
│                              └─────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Technology Stack

| Category | Technology |
|----------|-----------|
| Backend | [Express 4](https://expressjs.com/) + [TypeScript 5.7](https://www.typescriptlang.org/) |
| Frontend | [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/) |
| Database | [SQLite](https://www.sqlite.org/) (better-sqlite3, WAL mode) |
| API | [Google Places API (New)](https://developers.google.com/maps/documentation/places/web-service/overview) |
| Runtime | [tsx](https://github.com/esbuild-kit/tsx) for development |

## 📦 Project Structure

```
businessfinder/
├── src/
│   ├── server.ts              # Express API server (port 3001)
│   ├── scanner.ts             # Scan logic: Text Search + Detail Fetch
│   ├── analyzer.ts            # Problem-Score calculation
│   ├── config.ts              # Environment variables + paths
│   ├── api/
│   │   └── places.ts          # Google Places API client
│   └── db/
│       ├── schema.ts          # SQLite schema + migrations
│       └── repository.ts      # Database access (CRUD, stats, usage)
├── frontend/
│   └── src/
│       ├── App.tsx            # Main component, routing, state
│       ├── api.ts             # API client (fetch wrapper)
│       └── components/
│           ├── SearchBar.tsx      # Text search + navigation
│           ├── ImportPage.tsx     # Scan + fetch details workflow
│           ├── StatsPanel.tsx     # Statistics + scoring config
│           ├── UsagePanel.tsx     # API usage display
│           ├── FilterBar.tsx      # Combinable filters
│           ├── BusinessTable.tsx  # Sortable table
│           ├── BusinessDetail.tsx # Detail modal
│           ├── ScoringConfig.tsx  # Scoring rules editor
│           └── ProblemsTag.tsx    # Problem badges
├── data/
│   └── businessfinder.db      # SQLite database (auto-created)
├── package.json
├── tsconfig.json
└── .env.example               # API key template
```

## 💾 Database Schema

### `businesses`

Main table storing all business data:

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT PRIMARY KEY | Google Place ID |
| `name` | TEXT | Business name |
| `address` | TEXT | Full address |
| `location_lat` | REAL | Latitude |
| `location_lng` | REAL | Longitude |
| `rating` | REAL | Average rating (0-5) |
| `review_count` | INTEGER | Number of reviews |
| `primary_type` | TEXT | Business category |
| `google_maps_url` | TEXT | Google Maps link |
| `details_fetched` | INTEGER | 0=basic scan, 1=details loaded |
| `website_url` | TEXT | Website URL (if any) |
| `phone_number` | TEXT | Phone number |
| `has_opening_hours` | INTEGER | 0=no hours, 1=has hours |
| `photo_count` | INTEGER | Number of photos |
| `photo_refs` | TEXT | JSON array of photo references |
| `reviews_json` | TEXT | JSON array of reviews |
| `atmosphere` | TEXT | JSON object with service flags |
| `problem_score` | INTEGER | Calculated problem score (higher = more issues) |
| `problems` | TEXT | JSON array of detected problems |
| `search_query` | TEXT | Original search query |
| `created_at` | TEXT | Timestamp |

### `scoring_config`

Configurable scoring rules:

| Code | Default Points | Description |
|------|---------------|-------------|
| `NO_WEBSITE` | 30 | No website URL |
| `NO_REVIEWS` | 20 | Zero reviews |
| `NO_PHONE` | 15 | No phone number |
| `NO_HOURS` | 15 | No opening hours |
| `FEW_REVIEWS` | 10 | Less than 10 reviews |
| `FEW_PHOTOS` | 10 | Less than 3 photos |
| `LOW_RATING` | 10 | Rating below 3.5 |

Each rule can be activated/deactivated and points can be adjusted via the GUI.

### `api_usage`

Tracks monthly API consumption:

| Column | Type | Description |
|--------|------|-------------|
| `endpoint` | TEXT | 'textSearch' or 'placeDetails' |
| `month` | TEXT | YYYY-MM format |
| `count` | INTEGER | Number of API calls |

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Required: Google Places API Key
GOOGLE_PLACES_API_KEY=your_api_key_here

# Optional: Custom port (default: 3001)
PORT=3001
```

### Google Places API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable "Places API (New)"
4. Create credentials (API Key)
5. Copy the API key to your `.env` file

**Important:** The new Places API has a different pricing structure:
- Text Search (Pro tier): $0.032 per call, 5,000 free/month
- Place Details (Enterprise tier): $0.025 per call, 1,000 free/month

### API Usage Limits

Free tier limits (as of 2025):

| Endpoint | Free Calls/Month | Cost After Limit |
|----------|------------------|------------------|
| Text Search | 5,000 | $0.032/call |
| Place Details | 1,000 | $0.025/call |
| Photo API | 1,000 | Not yet implemented |

**Tip:** Set up billing alerts in Google Cloud Console to avoid unexpected charges.

## 📸 Screenshots

<p align="center">
  <img src="docs/import.png" width="32%" alt="Import Page" />
  <img src="docs/main.png" width="32%" alt="Main View" />
  <img src="docs/detail.png" width="32%" alt="Detail Modal" />
</p>

## 🎨 GUI Features

- **🔍 Text Search**: Search database by name, address, type, or search query (no API usage)
- **📥 Import Page**: Two-step workflow for scanning and fetching details
  - Search query input with examples
  - Limit slider for detail fetching
  - Status display with links to results
- **📊 Statistics Panel**:
  - Total businesses, average score, average rating
  - Businesses without website count
  - Expandable scoring configuration editor
- **📈 Usage Panel**:
  - Monthly API consumption
  - Progress bars showing usage vs. limits
  - Visual warnings when approaching limits
- **🎯 Filter Bar**:
  - Website status (all/with/without)
  - Rating filter (minimum rating)
  - Review count filter (minimum reviews)
  - Problem score filter (minimum score)
- **📋 Business Table**:
  - Click column headers to sort
  - Color-coded problem scores
  - Problem badges showing detected issues
  - Click row to open detail modal
- **📄 Detail Modal**:
  - All business information
  - Reviews with ratings and text
  - Atmosphere data (delivery, dine-in, etc.)
  - Google Maps link
- **📥 CSV Export**: Download complete business list

## 🔧 NPM Scripts

```bash
# Backend
npm run build              # Compile TypeScript
npm run start              # Run compiled code
npm run server             # Run with tsx (development)

# Frontend
cd frontend
npm run dev                # Vite dev server (port 5173)
npm run build              # Build production bundle
npm run preview            # Preview production build
```

## 🛡️ Security & Privacy

### Data Privacy

- All data is stored locally in SQLite database
- No data is sent to third parties (except Google Places API)
- Full control over your lead database

### Best Practices

- **Never commit** `.env` file (already in `.gitignore`)
- Set **budget alerts** in Google Cloud Console
- **Monitor API usage** regularly via the Usage Panel
- Consider **rate limiting** for production deployments
- Use **environment-specific** API keys (dev/prod)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### For Human Contributors

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for type safety
- Follow existing code style
- Test API changes manually
- Update README if adding features
- Consider API cost implications

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**TL;DR:** You can do whatever you want with this code! Use it, modify it, distribute it, even commercially. No restrictions.

## 🙏 Acknowledgments

- [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview) - Business data source
- [Express.js](https://expressjs.com/) - Backend framework
- [React](https://reactjs.org/) - Frontend library
- [Vite](https://vitejs.dev/) - Fast frontend tooling
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite for Node.js

---

<div align="center">

Made with ❤️ for lead generation

[Report Bug](https://github.com/yourusername/businessfinder/issues) • [Request Feature](https://github.com/yourusername/businessfinder/issues)

</div>
