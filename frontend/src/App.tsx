import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import SearchBar from './components/SearchBar';
import ImportPage from './components/ImportPage';
import StatsPanel from './components/StatsPanel';
import UsagePanel from './components/UsagePanel';
import FilterBar, { DEFAULT_FILTERS } from './components/FilterBar';
import type { Filters } from './components/FilterBar';
import BusinessTable from './components/BusinessTable';
import * as api from './api';
import type { Business, Stats, ApiUsage, ScoringRule } from './api';

function applyFilters(businesses: Business[], f: Filters): Business[] {
  return businesses.filter(b => {
    if (f.website === 'none' && b.website_url) return false;
    if (f.website === 'has' && !b.website_url) return false;

    if (f.rating === 'gte45' && (b.rating == null || b.rating < 4.5)) return false;
    if (f.rating === 'gte40' && (b.rating == null || b.rating < 4.0)) return false;
    if (f.rating === 'lt35' && (b.rating == null || b.rating >= 3.5)) return false;

    if (f.reviews === 'gte50' && (b.review_count == null || b.review_count < 50)) return false;
    if (f.reviews === 'gte10' && (b.review_count == null || b.review_count < 10)) return false;
    if (f.reviews === 'none' && b.review_count !== 0 && b.review_count != null) return false;

    if (f.score === 'gte50' && b.problem_score < 50) return false;
    if (f.score === '30to49' && (b.problem_score < 30 || b.problem_score > 49)) return false;
    if (f.score === '1to29' && (b.problem_score < 1 || b.problem_score > 29)) return false;
    if (f.score === '0' && b.problem_score !== 0) return false;

    return true;
  });
}

export default function App() {
  const [page, setPage] = useState<'main' | 'import'>('main');
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [usage, setUsage] = useState<ApiUsage | null>(null);
  const [scoringConfig, setScoringConfig] = useState<ScoringRule[]>([]);
  const [filters, setFilters] = useState<Filters>({ ...DEFAULT_FILTERS });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const filtered = useMemo(() => applyFilters(businesses, filters), [businesses, filters]);

  const refreshMeta = useCallback(async () => {
    const [s, u] = await Promise.all([api.getStats(), api.getApiUsage()]);
    setStats(s);
    setUsage(u);
  }, []);

  const loadBusinesses = useCallback(async (search?: string) => {
    const b = await api.getBusinesses(search);
    setBusinesses(b);
  }, []);

  const loadScoringConfig = useCallback(async () => {
    const c = await api.getScoringConfig();
    setScoringConfig(c);
  }, []);

  useEffect(() => {
    refreshMeta();
    loadBusinesses();
    loadScoringConfig();
  }, [refreshMeta, loadBusinesses, loadScoringConfig]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      loadBusinesses(query);
    }, 300);
  };

  const handleScan = async (query: string) => {
    setLoading(true);
    setStatus(`Scanne "${query}"...`);
    try {
      const result = await api.scan(query);
      setStatus(result.message);
      await refreshMeta();
    } catch (err) {
      setStatus(`Fehler: ${err instanceof Error ? err.message : 'Unbekannt'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDetails = async (limit: number) => {
    setLoading(true);
    setStatus(`Lade Details (max. ${limit})...`);
    try {
      const result = await api.fetchDetails(limit);
      setStatus(result.message);
      await refreshMeta();
    } catch (err) {
      setStatus(`Fehler: ${err instanceof Error ? err.message : 'Unbekannt'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMain = () => {
    setPage('main');
    setStatus(null);
    loadBusinesses(searchQuery);
    refreshMeta();
  };

  const handleSaveScoringConfig = async (rules: ScoringRule[]) => {
    await api.saveScoringConfig(rules);
    const result = await api.recalculateScores();
    setStatus(result.message);
    setScoringConfig(rules);
    await Promise.all([loadBusinesses(searchQuery), refreshMeta()]);
  };

  const handleExportCsv = () => {
    window.open(api.getCsvExportUrl(), '_blank');
  };

  if (page === 'import') {
    return (
      <ImportPage
        usage={usage}
        loading={loading}
        status={status}
        onScan={handleScan}
        onFetchDetails={handleFetchDetails}
        onBack={handleBackToMain}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SearchBar
        onSearch={handleSearch}
        onNavigateImport={() => { setStatus(null); setPage('import'); }}
      />
      <UsagePanel usage={usage} />
      <StatsPanel
        stats={stats}
        scoringConfig={scoringConfig}
        onSaveScoringConfig={handleSaveScoringConfig}
      />
      <FilterBar
        filters={filters}
        onChange={setFilters}
        totalCount={businesses.length}
        filteredCount={filtered.length}
      />
      <BusinessTable businesses={filtered} onExportCsv={handleExportCsv} />
    </div>
  );
}
