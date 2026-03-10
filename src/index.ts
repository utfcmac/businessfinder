import { scanQuery, fetchDetails } from './scanner.js';
import { getTopProblems, getAllBusinesses, getStats } from './db/repository.js';
import { writeFileSync } from 'fs';

const [command, ...args] = process.argv.slice(2);

async function main() {
  switch (command) {
    case 'scan': {
      const query = args.join(' ');
      if (!query) {
        console.error('Usage: npx tsx src/index.ts scan "Elektriker in Berlin"');
        process.exit(1);
      }
      const count = await scanQuery(query);
      console.log(`\n${count} Businesses gespeichert.`);
      console.log('Fuehre "fetch-details" aus, um Website/Telefon/Bewertungen zu laden.');
      break;
    }

    case 'fetch-details': {
      const limit = args[0] ? parseInt(args[0], 10) : 50;
      const count = await fetchDetails(limit);
      console.log(`\n${count} Details geladen.`);
      console.log('Fuehre "report" aus, um die Ergebnisse zu sehen.');
      break;
    }

    case 'report': {
      const limit = args[0] ? parseInt(args[0], 10) : 30;
      const businesses = getTopProblems(limit);

      if (businesses.length === 0) {
        console.log('Keine Ergebnisse. Fuehre zuerst "scan" und "fetch-details" aus.');
        break;
      }

      console.log(`\n${'='.repeat(80)}`);
      console.log(' BUSINESS FINDER - Problem Report');
      console.log(`${'='.repeat(80)}\n`);

      for (const b of businesses) {
        const problems = b.problems ? JSON.parse(b.problems) : [];
        console.log(`  Score: ${b.problem_score.toString().padStart(3)}  |  ${b.name}`);
        console.log(`         |  ${b.address ?? 'Keine Adresse'}`);
        console.log(`         |  Typ: ${b.primary_type ?? '-'}  |  Bewertung: ${b.rating ?? '-'} (${b.review_count ?? 0} Reviews)`);
        console.log(`         |  Website: ${b.website_url ?? 'KEINE'}  |  Tel: ${b.phone_number ?? 'KEINE'}`);
        console.log(`         |  Probleme: ${problems.map((p: { label: string }) => p.label).join(', ')}`);
        console.log(`         |  Maps: ${b.google_maps_url ?? '-'}`);
        console.log(`  ${'-'.repeat(78)}`);
      }

      console.log(`\n  ${businesses.length} Businesses mit Problemen angezeigt.\n`);
      break;
    }

    case 'export': {
      const filename = args[0] || 'results.csv';
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

      writeFileSync(filename, [header, ...rows].join('\n'), 'utf-8');
      console.log(`${businesses.length} Businesses nach "${filename}" exportiert.`);
      break;
    }

    case 'stats': {
      const s = getStats();
      console.log(`\n  Businesses gesamt:     ${s.total}`);
      console.log(`  Mit Details geladen:   ${s.withDetails}`);
      console.log(`  Ohne Website:          ${s.noWebsite}`);
      console.log(`  Durchschn. Score:      ${s.avgScore.toFixed(1)}`);
      console.log(`  Suchbegriffe:          ${s.queries.length > 0 ? s.queries.join(', ') : '-'}\n`);
      break;
    }

    default:
      console.log(`
BusinessFinder - Finde Businesses mit Verbesserungspotenzial

Befehle:
  scan <query>           Suche Businesses (z.B. "Friseur in Berlin")
  fetch-details [limit]  Lade Details fuer gescannte Businesses (Standard: 50)
  report [limit]         Zeige Businesses mit Problemen (Standard: 30)
  export [dateiname]     Exportiere als CSV (Standard: results.csv)
  stats                  Zeige Statistiken

Beispiel:
  npx tsx src/index.ts scan "Elektriker in Muenchen"
  npx tsx src/index.ts fetch-details
  npx tsx src/index.ts report
`);
  }
}

function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

main().catch(err => {
  console.error('Fehler:', err instanceof Error ? err.message : err);
  process.exit(1);
});
