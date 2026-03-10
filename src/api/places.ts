import { config } from '../config.js';
import { trackApiCall } from '../db/repository.js';

// Text Search: Enterprise + Atmosphere tier
// Grab everything - first 1,000/month free per tier
const SEARCH_FIELDS = [
  // Essentials
  'places.id',
  'places.formattedAddress',
  'places.addressComponents',
  'places.location',
  'places.photos',
  'places.types',
  // Pro
  'places.displayName',
  'places.primaryType',
  'places.primaryTypeDisplayName',
  'places.businessStatus',
  'places.googleMapsUri',
  'places.priceLevel',
  'places.shortFormattedAddress',
  'places.utcOffsetMinutes',
].join(',');

// Place Details: Enterprise + Atmosphere tier - ALL available fields
const DETAIL_FIELDS = [
  // Essentials
  'formattedAddress',
  'addressComponents',
  'location',
  'types',
  'shortFormattedAddress',
  'utcOffsetMinutes',
  // Pro
  'displayName',
  'primaryType',
  'primaryTypeDisplayName',
  'businessStatus',
  'googleMapsUri',
  'priceLevel',
  // Enterprise
  'websiteUri',
  'nationalPhoneNumber',
  'internationalPhoneNumber',
  'regularOpeningHours',
  'rating',
  'userRatingCount',
  // Atmosphere
  'editorialSummary',
  'reviews',
  'delivery',
  'dineIn',
  'takeout',
  'curbsidePickup',
  'servesBreakfast',
  'servesLunch',
  'servesDinner',
  'servesBrunch',
  'servesBeer',
  'servesWine',
  'servesCocktails',
  'servesCoffee',
  'servesDessert',
  'servesVegetarianFood',
  'outdoorSeating',
  'liveMusic',
  'menuForChildren',
  'goodForChildren',
  'goodForGroups',
  'goodForWatchingSports',
  'allowsDogs',
  'restroom',
  'reservable',
  'paymentOptions',
  'parkingOptions',
  'accessibilityOptions',
].join(',');

interface AddressComponent {
  longText: string;
  shortText: string;
  types: string[];
  languageCode: string;
}

interface Review {
  name: string;
  relativePublishTimeDescription: string;
  rating: number;
  text?: { text: string; languageCode: string };
  authorAttribution?: { displayName: string; uri: string };
  publishTime: string;
}

export interface PlaceSearchResult {
  id: string;
  displayName?: { text: string; languageCode: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  addressComponents?: AddressComponent[];
  location?: { latitude: number; longitude: number };
  businessStatus?: string;
  primaryType?: string;
  primaryTypeDisplayName?: { text: string };
  types?: string[];
  photos?: { name: string }[];
  googleMapsUri?: string;
  priceLevel?: string;
  utcOffsetMinutes?: number;
}

export interface PlaceDetails {
  displayName?: { text: string };
  formattedAddress?: string;
  shortFormattedAddress?: string;
  addressComponents?: AddressComponent[];
  location?: { latitude: number; longitude: number };
  types?: string[];
  primaryType?: string;
  primaryTypeDisplayName?: { text: string };
  businessStatus?: string;
  googleMapsUri?: string;
  priceLevel?: string;
  utcOffsetMinutes?: number;
  // Enterprise
  websiteUri?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  regularOpeningHours?: {
    openNow?: boolean;
    periods?: { open: { day: number; hour: number; minute: number }; close?: { day: number; hour: number; minute: number } }[];
    weekdayDescriptions?: string[];
  };
  rating?: number;
  userRatingCount?: number;
  // Atmosphere
  editorialSummary?: { text: string; languageCode: string };
  reviews?: Review[];
  delivery?: boolean;
  dineIn?: boolean;
  takeout?: boolean;
  curbsidePickup?: boolean;
  servesBreakfast?: boolean;
  servesLunch?: boolean;
  servesDinner?: boolean;
  servesBrunch?: boolean;
  servesBeer?: boolean;
  servesWine?: boolean;
  servesCocktails?: boolean;
  servesCoffee?: boolean;
  servesDessert?: boolean;
  servesVegetarianFood?: boolean;
  outdoorSeating?: boolean;
  liveMusic?: boolean;
  menuForChildren?: boolean;
  goodForChildren?: boolean;
  goodForGroups?: boolean;
  goodForWatchingSports?: boolean;
  allowsDogs?: boolean;
  restroom?: boolean;
  reservable?: boolean;
  paymentOptions?: Record<string, boolean>;
  parkingOptions?: Record<string, boolean>;
  accessibilityOptions?: Record<string, boolean>;
}

interface TextSearchResponse {
  places?: PlaceSearchResult[];
  nextPageToken?: string;
}

function ensureApiKey(): void {
  if (!config.apiKey) {
    console.error('\nFehler: Kein API-Key gefunden!');
    console.error('1. Kopiere .env.example nach .env');
    console.error('2. Trage deinen Google Places API Key ein');
    console.error('   GOOGLE_PLACES_API_KEY=dein_key_hier\n');
    process.exit(1);
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function textSearch(
  query: string,
  pageToken?: string
): Promise<TextSearchResponse> {
  ensureApiKey();

  const body: Record<string, unknown> = {
    textQuery: query,
    pageSize: 20,
  };
  if (pageToken) body.pageToken = pageToken;

  const res = await fetch(config.textSearchUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': config.apiKey,
      'X-Goog-FieldMask': SEARCH_FIELDS + ',nextPageToken',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Text Search fehlgeschlagen (${res.status}): ${err}`);
  }

  trackApiCall('text_search');
  await delay(config.requestDelayMs);
  return res.json() as Promise<TextSearchResponse>;
}

export async function textSearchAll(query: string): Promise<PlaceSearchResult[]> {
  const all: PlaceSearchResult[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < 3; page++) {
    const result = await textSearch(query, pageToken);
    if (result.places) all.push(...result.places);
    pageToken = result.nextPageToken;
    if (!pageToken) break;
  }

  return all;
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  ensureApiKey();

  const res = await fetch(`${config.placeDetailsUrl}/${placeId}`, {
    headers: {
      'X-Goog-Api-Key': config.apiKey,
      'X-Goog-FieldMask': DETAIL_FIELDS,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Place Details fehlgeschlagen (${res.status}): ${err}`);
  }

  trackApiCall('place_details');
  await delay(config.requestDelayMs);
  return res.json() as Promise<PlaceDetails>;
}
