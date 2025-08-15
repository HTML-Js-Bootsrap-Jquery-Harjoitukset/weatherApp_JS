// Weather API functions for WeatherApp
// This file contains helper functions for building OpenWeatherMap API URLs

const API_KEY = "2f72d2b4c845f1bd343c24e1bb01f913"; // Your OpenWeatherMap API key

// Returns the forecast API URL for given latitude and longitude
export function getForecastUrl(lat, lon) {
    return `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`; // Build forecast URL
}

// Returns the geocoding API URL for a city name
export function getGeocodingUrl(cityName) {
    return `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`; // Build geocoding URL
}

// Returns the reverse geocoding API URL for given latitude and longitude
export function getReverseGeocodingUrl(lat, lon) {
    return `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`; // Build reverse geocoding URL
}
