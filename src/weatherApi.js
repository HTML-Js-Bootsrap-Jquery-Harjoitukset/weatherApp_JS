export const API_KEY = '2f72d2b4c845f1bd343c24e1bb01f913';

export function buildGeocodingUrl(cityName, limit = 1) {
  return `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=${limit}&appid=${API_KEY}`;
}

export function buildForecastUrl(lat, lon) {
  return `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
}

export function buildReverseGeocodingUrl(lat, lon) {
  return `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
}

export async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}
