import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  apiKey: process.env.GOOGLE_PLACES_API_KEY || '',
  dbPath: path.join(__dirname, '..', 'data', 'businessfinder.db'),
  // Rate limiting
  requestDelayMs: 200,
  // API endpoints
  textSearchUrl: 'https://places.googleapis.com/v1/places:searchText',
  placeDetailsUrl: 'https://places.googleapis.com/v1/places',
};
