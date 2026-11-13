import { setElementHTML, setElementText, showElement, hideElement } from './domUtils.js';
import { convertTemp, formatDate, formatTime } from './formatUtils.js';
import { customIcons } from './icons.js';
import {
  API_KEY,
  buildForecastUrl,
  buildGeocodingUrl,
  buildReverseGeocodingUrl,
  fetchJson
} from './weatherApi.js';
import {
  bindButtonHandlers,
  bindDayCardClickListeners,
  bindFavoriteControls,
  bindInputAutocomplete
} from './eventHandlers.js';

const cityInput = document.querySelector('.cityInput');
const searchButton = document.querySelector('.search-btn');
const weatherCardDiv = document.querySelector('.weather-cards');
const currentWeatherDiv = document.querySelector('.current-weather');
const currentGeolocationButton = document.querySelector('.location-btn');
const unitToggleButton = document.querySelector('.unit-toggle-btn');
const autocompleteList = document.getElementById('city-autocomplete');

let cityInputAlert = document.getElementById('city-input-alert');
if (!cityInputAlert && cityInput) {
  cityInputAlert = document.createElement('div');
  cityInputAlert.id = 'city-input-alert';
  cityInputAlert.className = 'city-input-alert';
  cityInput.parentNode.insertBefore(cityInputAlert, cityInput.nextSibling);
}

let isCelsius = true;
let lastForecastData = null;
let lastCityName = null;
let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities') || '[]');

function sanitizeCityName(input) {
  return String(input || '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/[^a-zA-Z0-9äöåÄÖÅ\-\s]/g, '')
    .trim();
}

function updateToggleButtonText() {
  if (unitToggleButton) {
    unitToggleButton.textContent = isCelsius ? 'Switch to °F' : 'Switch to °C';
  }
}

function initializeUnitPreference() {
  const stored = localStorage.getItem('isCelsius');
  if (stored !== null) {
    isCelsius = stored === 'true';
  }
  updateToggleButtonText();
}

function isCityFavorite(cityName) {
  const city = sanitizeCityName(cityName);
  if (!city) return false;

  return favoriteCities.some((savedCity) => sanitizeCityName(savedCity).toLowerCase() === city.toLowerCase());
}

function toggleCurrentCityFavorite() {
  const activeCity = lastCityName || (cityInput ? cityInput.value.trim() : '');
  const city = sanitizeCityName(activeCity);

  if (!city) return;

  const alreadyFavorite = isCityFavorite(city);

  if (alreadyFavorite) {
    favoriteCities = favoriteCities.filter((savedCity) => sanitizeCityName(savedCity).toLowerCase() !== city.toLowerCase());
  } else {
    favoriteCities.push(city);
  }

  localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
  renderFavorites();
  syncCurrentFavoriteButton();
}

function syncCurrentFavoriteButton() {
  const currentCity = sanitizeCityName(lastCityName || (cityInput ? cityInput.value.trim() : ''));
  let title = document.querySelector('.current-weather .city-title-line');
  let button = document.getElementById('add-current-favorite-btn');

  if (!button && title) {
    button = document.createElement('button');
    button.id = 'add-current-favorite-btn';
    button.type = 'button';
    button.className = 'add-current-favorite-btn';
    title.appendChild(button);
  }

  if (!button) {
    const fallbackButton = document.querySelector('.current-weather .add-current-favorite-btn');
    if (fallbackButton) {
      button = fallbackButton;
    }
  }

  if (!button) return;

  if (!title && currentCity) {
    const details = document.querySelector('.current-weather .details');
    const existingH2 = details && details.querySelector('h2');
    if (details && existingH2) {
      title = document.createElement('h2');
      title.className = 'city-title-line';
      details.insertBefore(title, existingH2);
      existingH2.parentNode.replaceChild(title, existingH2);
      title.appendChild(button);
    }
  }

  if (!currentCity) {
    button.style.display = 'none';
    button.textContent = 'Add to Favorites';
    return;
  }

  const isFavorite = isCityFavorite(currentCity);
  button.textContent = isFavorite ? 'Remove from Favorites' : 'Add to Favorites';
  button.onclick = toggleCurrentCityFavorite;
  button.style.display = 'inline-flex';
  button.dataset.favorite = String(isFavorite);
  button.classList.toggle('is-favorite', isFavorite);
  button.classList.toggle('is-not-favorite', !isFavorite);

  const background = isFavorite
    ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
    : 'linear-gradient(135deg, #2ecc71 0%, #27ae60 100%)';

  const border = isFavorite ? '1px solid rgba(166, 42, 42, 0.5)' : '1px solid rgba(18,95,45,0.4)';
  const shadow = isFavorite
    ? '0 4px 12px rgba(192, 57, 43, 0.25)'
    : '0 4px 12px rgba(39, 174, 96, 0.22)';

  Object.assign(button.style, {
    alignItems: 'center',
    justifyContent: 'center',
    width: 'auto',
    minWidth: '130px',
    marginTop: '0',
    padding: '0.55rem 0.8rem',
    border,
    borderRadius: '999px',
    color: '#fff',
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '0.02em',
    lineHeight: '1.2',
    cursor: 'pointer',
    boxShadow: shadow,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease',
    textTransform: 'none',
    background
  });
}

function renderFavorites() {
  const list = document.getElementById('favorites-list');
  if (!list) return;

  list.innerHTML = '';
  favoriteCities.forEach((city) => {
    const li = document.createElement('li');
    li.style.display = 'flex';
    li.style.alignItems = 'center';
    li.style.marginBottom = '6px';

    const btn = document.createElement('button');
    btn.textContent = city;
    btn.className = 'favorite-city-btn';
    btn.style.padding = '0.3rem 0.7rem';
    btn.style.borderRadius = '1rem';
    btn.style.border = '1px solid #888';
    btn.style.background = '#f5f5f5';
    btn.style.cursor = 'pointer';
    btn.onclick = () => getCityCoordinates(city);

    const removeBtn = document.createElement('span');
    removeBtn.textContent = '✕';
    removeBtn.title = 'Remove';
    removeBtn.style.marginLeft = '8px';
    removeBtn.style.color = '#d32f2f';
    removeBtn.style.cursor = 'pointer';
    removeBtn.onclick = (event) => {
      event.stopPropagation();
      favoriteCities = favoriteCities.filter((savedCity) => savedCity !== city);
      localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
      renderFavorites();
    };

    li.appendChild(btn);
    li.appendChild(removeBtn);
    list.appendChild(li);
  });
}

function getAnalyticsEntries() {
  try {
    return JSON.parse(localStorage.getItem('weatherSearchAnalytics') || '[]');
  } catch (error) {
    return [];
  }
}

function renderAnalyticsReport() {
  const list = document.getElementById('analytics-list');
  const total = document.getElementById('analytics-total-searches');
  if (!list) return;

  const entries = getAnalyticsEntries();
  if (total) total.textContent = String(entries.length);

  if (!entries.length) {
    list.innerHTML = '<li class="analytics-empty">No search analytics yet.</li>';
  } else {
    list.innerHTML = entries.slice(0, 8).map((entry) => {
      const date = entry.date ? new Date(entry.date).toLocaleString([], {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Unknown';

      return `
        <li class="analytics-item">
          <strong>${entry.city}</strong> • ${date}<br>
          Temp: ${entry.temperature || '--'} • ${entry.condition || 'N/A'}<br>
          Humidity: ${entry.humidity || 'N/A'}% • Wind: ${entry.wind || 'N/A'} m/s
        </li>
      `;
    }).join('');
  }

  renderTopCitiesReport();
}

function getTopSearchedCities() {
  const entries = getAnalyticsEntries();
  const counts = {};

  entries.forEach((entry) => {
    const city = sanitizeCityName(entry.city || '');
    if (!city) return;
    counts[city] = (counts[city] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([city, count], index) => ({ city, count, rank: index + 1 }));
}

function renderTopCitiesReport() {
  const list = document.getElementById('top-cities-list');
  if (!list) return;

  const topCities = getTopSearchedCities();
  if (!topCities.length) {
    list.innerHTML = '<li class="analytics-empty">No city searches yet.</li>';
    return;
  }

  list.innerHTML = topCities.map(({ city, count, rank }) => `
    <li class="analytics-item top-city-item">
      <strong>#${rank}</strong>
      <span>${city}</span>
      <span>(${count})</span>
    </li>
  `).join('');
}

function exportAnalyticsAsCsv() {
  const entries = getAnalyticsEntries();
  if (!entries.length) {
    alert('No analytics to export yet.');
    return;
  }

  const header = ['City', 'Date', 'Temperature', 'Condition', 'Humidity', 'Wind'];
  const rows = entries.map((entry) => [
    entry.city || '',
    entry.date || '',
    entry.temperature || '',
    entry.condition || '',
    entry.humidity || '',
    entry.wind || ''
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'weather-search-analytics.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function clearAnalyticsData() {
  localStorage.removeItem('weatherSearchAnalytics');
  renderAnalyticsReport();
}

function recordSearchAnalytics(cityName, weatherData) {
  const city = sanitizeCityName(cityName || '');
  if (!city) return;

  const firstForecast = weatherData && weatherData.list && weatherData.list.length ? weatherData.list[0] : null;
  const entry = {
    city,
    date: new Date().toISOString(),
    temperature: firstForecast ? convertTemp(firstForecast.main.temp, isCelsius) : 'N/A',
    condition: firstForecast ? firstForecast.weather[0].main : 'N/A',
    humidity: firstForecast ? firstForecast.main.humidity : 'N/A',
    wind: firstForecast ? firstForecast.wind.speed : 'N/A'
  };

  const entries = getAnalyticsEntries();
  entries.unshift(entry);
  const trimmedEntries = entries.slice(0, 12);

  try {
    localStorage.setItem('weatherSearchAnalytics', JSON.stringify(trimmedEntries));
  } catch (error) {}

  renderAnalyticsReport();
}

function updateBackgroundImage(weatherCondition) {
  const body = document.body;
  const weatherBackgrounds = {
    Clear: { type: 'video', src: 'images/Clear.mp4' },
    Clouds: { type: 'video', src: 'images/Clouds.mp4' },
    Rain: { type: 'image', src: 'images/Rain.jpg' },
    Snow: { type: 'image', src: 'images/Snow.jpg' },
    Thunderstorm: { type: 'image', src: 'images/Thunderstorm.jpg' },
    Drizzle: { type: 'image', src: 'images/Drizzle.jpg' },
    Mist: { type: 'image', src: 'images/Mist.jpg' },
    Fog: { type: 'image', src: 'images/Mist.jpg' },
    Haze: { type: 'image', src: 'images/Mist.jpg' },
    Default: { type: 'image', src: 'images/default.jpg' }
  };

  const existingVideo = document.getElementById('weather-bg-video');
  if (existingVideo) existingVideo.remove();

  const bg = weatherBackgrounds[weatherCondition] || weatherBackgrounds.Default;

  if (bg.type === 'video') {
    const video = document.createElement('video');
    video.id = 'weather-bg-video';
    video.src = bg.src;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.style.position = 'fixed';
    video.style.top = '0';
    video.style.left = '0';
    video.style.width = '100vw';
    video.style.height = '100vh';
    video.style.objectFit = 'cover';
    video.style.zIndex = '-1';
    document.body.prepend(video);
    body.style.backgroundImage = '';
  } else {
    body.style.backgroundImage = `url('${bg.src}')`;
  }

  body.style.backgroundRepeat = 'no-repeat';
  body.style.backgroundPosition = 'center';
  body.style.backgroundSize = 'cover';
  body.style.height = '100vh';
}

function createWeatherCard(cityName, weatherItem, index, countryCode = '') {
  const date = new Date(weatherItem.dt_txt);
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  let hours = date.getHours();
  let minutes = date.getMinutes();

  if (day < 10) day = '0' + day;
  if (month < 10) month = '0' + month;
  if (minutes < 10) minutes = '0' + minutes;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayName = daysOfWeek[date.getDay()];
  const formattedDate = `${day}.${month}.${year}`;
  const formattedDateForMainCard = `${day}.${month}.${year} ${hours}:${minutes}`;

  const weatherMain = weatherItem.weather[0].main;
  const iconSrc = customIcons[weatherMain] || customIcons.Default;

  if (index === 0) {
    return `
      <div class="details">
        <h2 class="city-title-line">${cityName}${countryCode ? ', ' + countryCode : ''} (${dayName} ${formattedDateForMainCard})</h2>
        <div class="mainDATA" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1em; align-items: start;">
          <div class="weather-info">
            <br />
            <h4>Temperature: ${convertTemp(weatherItem.main.temp, isCelsius)}</h4>
            <h4>Feels like: ${convertTemp(weatherItem.main.feels_like, isCelsius)}</h4>
            <h4>Temp max/min: ${convertTemp(weatherItem.main.temp_max, isCelsius)} / ${convertTemp(weatherItem.main.temp_min, isCelsius)}</h4>
            <h4>Humidity: ${weatherItem.main.humidity} %</h4>
            <h4>Pressure: ${weatherItem.main.pressure} hPa</h4>
          </div>
          <div class="weather-info" style="margin-top: 1.5rem;">
            <br />
            <h4>Wind Speed: ${weatherItem.wind.speed} M/S</h4>
            <h4>Wind Gust: ${typeof weatherItem.wind.gust !== 'undefined' ? weatherItem.wind.gust + ' M/S' : 'N/A'}</h4>
            <h4>Cloudiness: ${weatherItem.clouds && typeof weatherItem.clouds.all !== 'undefined' ? weatherItem.clouds.all + ' %' : 'N/A'}</h4>
            <h4>Rain: ${weatherItem.rain && weatherItem.rain['3h'] ? weatherItem.rain['3h'] + ' mm' : 'N/A'}</h4>
            <h4>Snow: ${weatherItem.snow && weatherItem.snow['3h'] ? weatherItem.snow['3h'] + ' mm' : 'N/A'}</h4>
          </div>
          <div class="weather-info" style="margin-top: 1.5rem;">
            <br />
            <h4>Visibility: ${typeof weatherItem.visibility !== 'undefined' ? (weatherItem.visibility / 1000).toFixed(1) + ' km' : 'N/A'}</h4>
            <h4>Sunrise: ${typeof lastForecastData?.city?.sunrise !== 'undefined' ? new Date(lastForecastData.city.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</h4>
            <h4>Sunset: ${typeof lastForecastData?.city?.sunset !== 'undefined' ? new Date(lastForecastData.city.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</h4>
            <h4>Sea Level: ${typeof weatherItem.main.sea_level !== 'undefined' ? weatherItem.main.sea_level + ' hPa' : 'N/A'}</h4>
            <h4>Ground Level: ${typeof weatherItem.main.grnd_level !== 'undefined' ? weatherItem.main.grnd_level + ' hPa' : 'N/A'}</h4>
          </div>
        </div>
        <div class="icon">
          <img src="${iconSrc}" alt="Weather Icon">
          <h4>${weatherItem.weather[0].main} | ${weatherItem.weather[0].description}</h4>
        </div>
      </div>
    `;
  }

  return `
    <li class="card forecast-day-card" data-date="${year}-${month}-${day}">
      <h2>(${dayName} ${formattedDate})</h2>
      <img src="${iconSrc}" alt="Weather Icon" style="width: 60px; height: 60px; display: block; margin: 0 auto; margin-top: 10px;">
      <h4 class='desc' style='margin-top:25px;'>${weatherItem.weather[0].main} | ${weatherItem.weather[0].description}</h4>
      <h4>Temperature: ${convertTemp(weatherItem.main.temp, isCelsius)}</h4>
      <h4>Feels like: ${convertTemp(weatherItem.main.feels_like, isCelsius)}</h4>
      <h4>Wind Speed: ${weatherItem.wind.speed} M/S</h4>
      <h4>Humidity: ${weatherItem.main.humidity} %</h4>
    </li>
  `;
}

function createHourlyForecastCard(dateString, cityName, forecastList) {
  const hours = forecastList.filter((item) => {
    const d = new Date(item.dt_txt);
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}` === dateString;
  });

  if (hours.length === 0) return '';

  const [year, month, day] = dateString.split('-');
  const formattedDate = `${parseInt(day)}.${parseInt(month)}.${year}`;
  let html = `
    <div class="hourly-forecast-card" style="background:rgb(108, 117, 125,0.5);margin:1rem 0;padding:1rem;box-shadow:0 2px 8px #0002;">
      <h3 style="margin-bottom:1rem;">Hourly forecast for: ${cityName} (${formattedDate})</h3>
      <div class="hourly-cards-row">
  `;

  hours.forEach((item) => {
    const d = new Date(item.dt_txt);
    const hour = d.getHours().toString().padStart(2, '0');
    const min = d.getMinutes().toString().padStart(2, '0');
    const weatherMain = item.weather[0].main;
    const iconSrc = customIcons[weatherMain] || customIcons.Default;
    const noData = '<span style="color:#d32f2f;">N/A</span>';

    html += `
      <div class="hour-card">
        <div class="hour-time">${hour}:${min}</div>
        <img class="hour-icon" src="${iconSrc}" alt="icon">
        <div class="hour-main">${item.weather[0].main}</div>
        <div class="hour-desc">${item.weather[0].description}</div>
        <div class="hour-data-table">
          <div class="hour-data-row"><span class="hour-data-label">Temperature:</span><span class="hour-data-value">${typeof item.main.temp !== 'undefined' ? convertTemp(item.main.temp, isCelsius) : noData}</span></div>
          <div class="hour-data-row"><span class="hour-data-label">Feels like:</span><span class="hour-data-value">${typeof item.main.feels_like !== 'undefined' ? convertTemp(item.main.feels_like, isCelsius) : noData}</span></div>
          <div class="hour-data-row"><span class="hour-data-label">Wind speed:</span><span class="hour-data-value">${typeof item.wind.speed !== 'undefined' ? item.wind.speed + ' m/s' : noData}</span></div>
          <div class="hour-data-row"><span class="hour-data-label">Humidity:</span><span class="hour-data-value">${typeof item.main.humidity !== 'undefined' ? item.main.humidity + ' %' : noData}</span></div>
          <div class="hour-data-row"><span class="hour-data-label">Air pressure:</span><span class="hour-data-value">${typeof item.main.pressure !== 'undefined' ? item.main.pressure + ' hPa' : noData}</span></div>
          <div class="hour-data-row"><span class="hour-data-label">Cloudy:</span><span class="hour-data-value">${item.clouds && typeof item.clouds.all !== 'undefined' ? item.clouds.all + ' %' : noData}</span></div>
          <div class="hour-data-row"><span class="hour-data-label">Visibility:</span><span class="hour-data-value">${typeof item.visibility !== 'undefined' ? (item.visibility / 1000).toFixed(1) + ' km' : noData}</span></div>
          <div class="hour-data-row"><span class="hour-data-label">Rain (3h):</span><span class="hour-data-value">${item.rain && item.rain['3h'] ? item.rain['3h'] + ' mm' : noData}</span></div>
          <div class="hour-data-row"><span class="hour-data-label">Snow (3h):</span><span class="hour-data-value">${item.snow && item.snow['3h'] ? item.snow['3h'] + ' mm' : noData}</span></div>
        </div>
      </div>
    `;
  });

  html += '</div>';
  html += '<button class="close-hourly-btn" style="margin-top:1rem;">Close</button>';
  html += '</div>';
  return html;
}

function getWeatherDetails(cityName, lat, lon) {
  const WEATHER_API_URL = buildForecastUrl(lat, lon);

  fetchJson(WEATHER_API_URL)
    .then((data) => {
      lastForecastData = data;
      lastCityName = cityName;
      recordSearchAnalytics(cityName, data);

      const uniqueForecastDays = [];
      const fiveDaysForecast = data.list.filter((forecast) => {
        const forecastDate = new Date(forecast.dt_txt).getDate();
        if (!uniqueForecastDays.includes(forecastDate)) {
          uniqueForecastDays.push(forecastDate);
          return true;
        }
        return false;
      });

      if (cityInput) cityInput.value = '';
      if (weatherCardDiv) weatherCardDiv.innerHTML = '';
      if (currentWeatherDiv) currentWeatherDiv.innerHTML = '';

      const hourlyContainer = document.getElementById('hourly-forecast-container');
      if (hourlyContainer) hourlyContainer.innerHTML = '';

      const daysForecastDiv = document.querySelector('.days-forecast');
      if (daysForecastDiv && !document.getElementById('hourly-instruction')) {
        const info = document.createElement('div');
        info.id = 'hourly-instruction';
        info.textContent = 'Click daily forecast cards to view hourly details.';
        daysForecastDiv.insertBefore(info, daysForecastDiv.querySelector('.weather-cards'));
      } else if (daysForecastDiv && document.getElementById('hourly-instruction')) {
        document.getElementById('hourly-instruction').style.display = '';
      }

      let countryCode = data.city && data.city.country ? data.city.country : '';

      fiveDaysForecast.forEach((weatherItem, index) => {
        if (index === 0) {
          currentWeatherDiv.insertAdjacentHTML('beforeend', createWeatherCard(cityName, weatherItem, index, countryCode));
          syncCurrentFavoriteButton();
          updateBackgroundImage(weatherItem.weather[0].main);
        } else {
          weatherCardDiv.insertAdjacentHTML('beforeend', createWeatherCard(cityName, weatherItem, index, countryCode));
        }
      });

      const cards = document.querySelectorAll('.forecast-day-card');
      bindDayCardClickListeners(cards, (date) => {
        const container = document.getElementById('hourly-forecast-container');
        if (!container || !lastForecastData || !lastForecastData.list) return;

        if (container.firstChild && container.firstChild.getAttribute && container.firstChild.getAttribute('data-date') === date) {
          container.innerHTML = '';
          const hourlyInstruction = document.getElementById('hourly-instruction');
          if (hourlyInstruction) hourlyInstruction.style.display = '';
          return;
        }

        container.innerHTML = '';
        const hourlyCard = createHourlyForecastCard(date, lastCityName, lastForecastData.list);
        const hourlyInstruction = document.getElementById('hourly-instruction');
        if (hourlyInstruction) hourlyInstruction.style.display = 'none';

        const wrapper = document.createElement('div');
        wrapper.innerHTML = hourlyCard;
        if (wrapper.firstChild) {
          wrapper.firstChild.setAttribute('data-date', date);
          container.appendChild(wrapper.firstChild);
        }

        const closeBtn = container.querySelector('.close-hourly-btn');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            container.innerHTML = '';
            if (hourlyInstruction) hourlyInstruction.style.display = '';
          });
        }
      });
    })
    .catch(() => {
      alert('An error occurred while fetching the forecast weather data. Please try again.');
    });
}

function getCityCoordinates(cityNameFromToggle = null) {
  const cityNameRaw = cityNameFromToggle || (cityInput ? cityInput.value.trim() : '');
  const cityName = sanitizeCityName(cityNameRaw);

  if (!cityName) return;

  const GEOCODING_API_URL = buildGeocodingUrl(cityName, 1);

  fetchJson(GEOCODING_API_URL)
    .then((data) => {
      if (!data.length) {
        alert(`No coordinates found for ${cityName}. Please try again.`);
        return;
      }
      const { name, lat, lon } = data[0];
      getWeatherDetails(name, lat, lon);
    })
    .catch(() => {
      alert('An error occurred while fetching the coordinates. Please try again.');
    });
}

function getUserCoordinates() {
  if (!('geolocation' in navigator)) {
    alert('Geolocation is not available in this browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const REVERSE_GEOCODING_URL = buildReverseGeocodingUrl(latitude, longitude);

      fetchJson(REVERSE_GEOCODING_URL)
        .then((data) => {
          if (!data || !data.length) return;
          const { name } = data[0];
          getWeatherDetails(name, latitude, longitude);
        })
        .catch(() => {
          alert('An error occurred while fetching the city. Please try again.');
        });
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert('Geoposition access denied. Please allow location access in your browser settings.');
      }
    }
  );
}

function attemptAutoDetectOnLoad() {
  try {
    const pref = localStorage.getItem('autoDetectLocation');
    if (pref === 'false') return;
  } catch (error) {}

  if (!('geolocation' in navigator)) return;
  setTimeout(() => {
    getUserCoordinates();
  }, 500);
}

function setupApp() {
  initializeUnitPreference();
  renderFavorites();
  renderAnalyticsReport();

  const clearAnalyticsBtn = document.getElementById('analytics-clear-btn');
  const exportAnalyticsBtn = document.getElementById('analytics-export-btn');

  if (clearAnalyticsBtn) {
    clearAnalyticsBtn.addEventListener('click', clearAnalyticsData);
  }

  if (exportAnalyticsBtn) {
    exportAnalyticsBtn.addEventListener('click', exportAnalyticsAsCsv);
  }

  bindInputAutocomplete({
    cityInput,
    cityInputAlert,
    autocompleteList,
    onSearch: (query) => {
      const city = sanitizeCityName(query);
      if (!city) return;
      const geocodingUrl = buildGeocodingUrl(city, 5);
      fetchJson(geocodingUrl)
        .then((data) => {
          if (!autocompleteList) return;
          autocompleteList.innerHTML = '';
          if (!data.length) {
            autocompleteList.style.display = 'none';
            return;
          }

          data.forEach((cityData) => {
            const li = document.createElement('li');
            li.textContent = `${cityData.name}${cityData.state ? ', ' + cityData.state : ''}, ${cityData.country}`;
            li.style.padding = '0.7em 1em';
            li.style.cursor = 'pointer';
            li.addEventListener('mousedown', (event) => {
              event.preventDefault();
              if (cityInput) cityInput.value = cityData.name;
              if (autocompleteList) autocompleteList.style.display = 'none';
              getWeatherDetails(cityData.name, cityData.lat, cityData.lon);
            });
            autocompleteList.appendChild(li);
          });

          autocompleteList.style.display = 'block';
        })
        .catch(() => {
          if (autocompleteList) autocompleteList.style.display = 'none';
        });
    },
    onSelect: (cityName) => getCityCoordinates(cityName)
  });

  bindButtonHandlers({
    searchButton,
    currentGeolocationButton,
    unitToggleButton,
    onSearch: () => {
      getCityCoordinates();
      const hourlyInstruction = document.getElementById('hourly-instruction');
      if (hourlyInstruction) hourlyInstruction.style.display = 'none';
    },
    onLocation: () => {
      getUserCoordinates();
      const hourlyInstruction = document.getElementById('hourly-instruction');
      if (hourlyInstruction) hourlyInstruction.style.display = 'none';
    },
    onToggle: () => {
      isCelsius = !isCelsius;
      updateToggleButtonText();
      localStorage.setItem('isCelsius', String(isCelsius));

      const h2 = document.querySelector('.current-weather h2')?.textContent;
      let cityName = '';
      if (h2) cityName = h2.split(',')[0].trim();
      if (cityName) getCityCoordinates(cityName);
    }
  });

  const addFavoriteBtn = document.getElementById('add-favorite-btn');
  const favoriteCityInput = document.getElementById('favorite-city-input');
  const addCurrentFavoriteBtn = document.getElementById('add-current-favorite-btn');

  bindFavoriteControls({
    addFavoriteBtn,
    favoriteCityInput,
    onAddFavorite: (city) => {
      const nextCity = sanitizeCityName(city);
      if (nextCity && !favoriteCities.includes(nextCity)) {
        favoriteCities.push(nextCity);
        localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
        renderFavorites();
      }
      if (favoriteCityInput) favoriteCityInput.value = '';
    },
    onSelectFavorite: (city) => getCityCoordinates(city)
  });

  if (addCurrentFavoriteBtn) {
    addCurrentFavoriteBtn.onclick = toggleCurrentCityFavorite;
  }

  syncCurrentFavoriteButton();
  attemptAutoDetectOnLoad();
}

document.addEventListener('DOMContentLoaded', () => {
  updateBackgroundImage('Default');
  setupApp();
});

window.weatherApp = {
  getCityCoordinates,
  getUserCoordinates,
  getWeatherDetails,
  isCelsius
};
