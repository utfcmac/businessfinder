import type { Business, ScoringRule } from './db/repository.js';

interface Problem {
  code: string;
  label: string;
  points: number;
}

export function analyzeProblems(b: Business, config?: ScoringRule[]): { score: number; problems: Problem[] } {
  const problems: Problem[] = [];

  function rule(code: string): { points: number; enabled: boolean } | null {
    if (!config) return null;
    const r = config.find(c => c.code === code);
    return r ? { points: r.points, enabled: r.enabled } : null;
  }

  function check(code: string, defaultPoints: number, defaultLabel: string, condition: boolean, labelOverride?: string) {
    const r = rule(code);
    const enabled = r ? r.enabled : true;
    const points = r ? r.points : defaultPoints;
    if (enabled && condition) {
      problems.push({ code, label: labelOverride ?? defaultLabel, points });
    }
  }

  check('NO_WEBSITE', 30, 'Keine Website', !b.website_url);
  check('NO_PHONE', 15, 'Keine Telefonnummer', !b.phone_number);
  check('NO_HOURS', 15, 'Keine Oeffnungszeiten', !b.has_opening_hours);
  check('FEW_PHOTOS', 10, 'Weniger als 3 Fotos', b.photo_count !== null && b.photo_count < 3, `Nur ${b.photo_count} Foto(s)`);

  if (b.review_count !== null && b.review_count === 0) {
    check('NO_REVIEWS', 20, 'Keine Bewertungen', true);
  } else if (b.review_count !== null && b.review_count < 10) {
    check('FEW_REVIEWS', 10, 'Weniger als 10 Bewertungen', true, `Nur ${b.review_count} Bewertung(en)`);
  }

  check('LOW_RATING', 10, 'Bewertung unter 3.5', b.rating !== null && b.rating < 3.5 && (b.review_count ?? 0) > 0, `Bewertung nur ${b.rating}`);

  const score = problems.reduce((sum, p) => sum + p.points, 0);
  return { score, problems };
}
