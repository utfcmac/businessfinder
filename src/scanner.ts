import { textSearchAll, getPlaceDetails } from './api/places.js';
import type { PlaceDetails } from './api/places.js';
import { upsertBusiness, getBusinessesWithoutDetails } from './db/repository.js';
import { analyzeProblems } from './analyzer.js';

export async function scanQuery(query: string): Promise<number> {
  console.log(`\nSuche: "${query}"`);

  const places = await textSearchAll(query);
  console.log(`${places.length} Businesses gefunden.`);

  const now = new Date().toISOString();

  for (const p of places) {
    upsertBusiness({
      id: p.id,
      name: p.displayName?.text ?? 'Unbekannt',
      address: p.formattedAddress ?? null,
      short_address: p.shortFormattedAddress ?? null,
      address_components: p.addressComponents ? JSON.stringify(p.addressComponents) : null,
      primary_type: p.primaryType ?? null,
      primary_type_display: p.primaryTypeDisplayName?.text ?? null,
      types: p.types ? JSON.stringify(p.types) : null,
      google_maps_url: p.googleMapsUri ?? null,
      latitude: p.location?.latitude ?? null,
      longitude: p.location?.longitude ?? null,
      photo_count: p.photos?.length ?? 0,
      photo_refs: p.photos ? JSON.stringify(p.photos.map(ph => ph.name)) : null,
      business_status: p.businessStatus ?? null,
      price_level: p.priceLevel ?? null,
      search_query: query,
      scanned_at: now,
      details_fetched: 0,
    });
  }

  return places.length;
}

function buildAtmosphere(d: PlaceDetails): Record<string, boolean> {
  const atmo: Record<string, boolean> = {};
  const flags = [
    'delivery', 'dineIn', 'takeout', 'curbsidePickup',
    'servesBreakfast', 'servesLunch', 'servesDinner', 'servesBrunch',
    'servesBeer', 'servesWine', 'servesCocktails', 'servesCoffee',
    'servesDessert', 'servesVegetarianFood',
    'outdoorSeating', 'liveMusic', 'menuForChildren',
    'goodForChildren', 'goodForGroups', 'goodForWatchingSports',
    'allowsDogs', 'restroom', 'reservable',
  ] as const;

  for (const flag of flags) {
    if (d[flag] != null) atmo[flag] = d[flag]!;
  }
  return atmo;
}

export async function fetchDetails(limit = 50): Promise<number> {
  const businesses = getBusinessesWithoutDetails(limit);

  if (businesses.length === 0) {
    console.log('Keine Businesses ohne Details gefunden.');
    return 0;
  }

  console.log(`\nLade Details fuer ${businesses.length} Businesses...`);
  let count = 0;

  for (const b of businesses) {
    try {
      process.stdout.write(`  [${count + 1}/${businesses.length}] ${b.name}...`);
      const d = await getPlaceDetails(b.id);

      const atmosphere = buildAtmosphere(d);

      const updated = {
        ...b,
        address: d.formattedAddress ?? b.address,
        short_address: d.shortFormattedAddress ?? null,
        address_components: d.addressComponents ? JSON.stringify(d.addressComponents) : null,
        website_url: d.websiteUri ?? null,
        phone_number: d.nationalPhoneNumber ?? null,
        phone_international: d.internationalPhoneNumber ?? null,
        rating: d.rating ?? null,
        review_count: d.userRatingCount ?? null,
        has_opening_hours: d.regularOpeningHours ? 1 : 0,
        opening_hours_text: d.regularOpeningHours?.weekdayDescriptions
          ? JSON.stringify(d.regularOpeningHours.weekdayDescriptions)
          : null,
        price_level: d.priceLevel ?? b.price_level ?? null,
        editorial_summary: d.editorialSummary?.text ?? null,
        reviews_json: d.reviews ? JSON.stringify(d.reviews) : null,
        atmosphere: Object.keys(atmosphere).length > 0 ? JSON.stringify(atmosphere) : null,
        payment_options: d.paymentOptions ? JSON.stringify(d.paymentOptions) : null,
        parking_options: d.parkingOptions ? JSON.stringify(d.parkingOptions) : null,
        accessibility_options: d.accessibilityOptions ? JSON.stringify(d.accessibilityOptions) : null,
        details_fetched: 1,
      };

      const { score, problems } = analyzeProblems(updated);
      updated.problem_score = score;
      updated.problems = JSON.stringify(problems);

      upsertBusiness(updated);
      console.log(` Score: ${score}`);
      count++;
    } catch (err) {
      console.error(` Fehler: ${err instanceof Error ? err.message : err}`);
    }
  }

  return count;
}
