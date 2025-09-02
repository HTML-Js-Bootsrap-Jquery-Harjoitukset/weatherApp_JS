
const CityInput = document.querySelector(".cityInput");
const searchButton = document.querySelector('.search-btn');
const weatherCardDiv = document.querySelector('.weather-cards');
const currentWeatherDiv = document.querySelector('.current-weather');
const CurrentGeolocationButton = document.querySelector('.location-btn');
const unitToggleButton = document.querySelector('.unit-toggle-btn');
const autocompleteList = document.getElementById('city-autocomplete');

// Live search: hae kaupunkiehdotukset


// Alert box element
let cityInputAlert = document.getElementById('city-input-alert');
if (!cityInputAlert) {
    cityInputAlert = document.createElement('div');
    cityInputAlert.id = 'city-input-alert';
    cityInputAlert.className = 'city-input-alert';
    CityInput.parentNode.insertBefore(cityInputAlert, CityInput.nextSibling);
}

CityInput.addEventListener('input', function() {
// Enter-näppäin käynnistää haun
CityInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        getCityCoordinates();
        autocompleteList.style.display = 'none';
    }
});
    // Sallitaan vain kirjaimet ja välilyönnit
    let raw = CityInput.value;
    let sanitized = raw.replace(/[^a-zA-ZäöåÄÖÅ\s]/g, '');
    if (raw !== sanitized) {
        CityInput.value = sanitized;
        cityInputAlert.textContent = 'Numerot ja erikoismerkit eivät ole sallittuja.';
        cityInputAlert.style.display = 'block';
    } else {
        cityInputAlert.style.display = 'none';
    }
    const query = sanitized.trim();
    if (query.length < 2) {
        autocompleteList.style.display = 'none';
        autocompleteList.innerHTML = '';
        return;
    }
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            autocompleteList.innerHTML = '';
            if (data.length === 0) {
                autocompleteList.style.display = 'none';
                return;
            }
            data.forEach(city => {
                const li = document.createElement('li');
                li.textContent = `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`;
                li.style.padding = '0.7em 1em';
                li.style.cursor = 'pointer';
                li.addEventListener('mousedown', function(e) {
                    e.preventDefault();
                    CityInput.value = city.name;
                    autocompleteList.style.display = 'none';
                    getWeatherDetails(city.name, city.lat, city.lon);
                });
                autocompleteList.appendChild(li);
            });
            autocompleteList.style.display = 'block';
        })
        .catch(() => {
            autocompleteList.style.display = 'none';
        });
});

// Piilota lista kun input menettää fokuksen
CityInput.addEventListener('blur', function() {
    setTimeout(() => {
        autocompleteList.style.display = 'none';
    }, 150);
});

const API_KEY = "2f72d2b4c845f1bd343c24e1bb01f913";
let isCelsius = true; // Default unit

const convertTemp = (tempK) => {
    return isCelsius 
        ? `${(tempK - 273.15).toFixed(2)} °C` 
        : `${((tempK - 273.15) * 9/5 + 32).toFixed(2)} °F`;
};

// Tallennetaan viimeisin haettu 5 päivän data ja koko data
let lastForecastData = null;
let lastCityName = null;

const createWeatherCard = (cityName, weatherItem, index, countryCode = '') => {
    const date = new Date(weatherItem.dt_txt);
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let Hours = date.getHours();
    let Minutes = date.getUTCMinutes();

    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;
    if (Minutes < 10) Minutes = '0' + Minutes;

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = daysOfWeek[date.getDay()];
    const formattedDate = `${day}.${month}.${year}`;
    const formattedDateForMainCard = `${day}.${month}.${year} ${Hours}:${Minutes}`;

    // Map weather "main" to custom icon file names
    const customIcons = {
        Clear: "icons/Clear.png",
        Clouds: "icons/clouds.png",
        Rain: "icons/Rain.png",
        Snow: "icons/snow.png",
        Thunderstorm: "icons/Thunderstorm.png",
        Drizzle: "icons/Drizzle.png",
        Mist: "icons/Mist.png",
        Fog: "icons/Fog.png",
        Haze: "icons/Haze.png"
    };
    const weatherMain = weatherItem.weather[0].main;
    const iconSrc = customIcons[weatherMain] || customIcons.Default;

    if(index === 0) {
        return `<div class="details">
            <div class="mainDATA" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1em; align-items: start;">
                <div class="weather-info">
                    <h2>${cityName}${countryCode ? ', ' + countryCode : ''} (${dayName} ${formattedDateForMainCard})</h2>
                    <br />
                    <h4>Temperature: ${convertTemp(weatherItem.main.temp)}</h4>
                    <h4>Feels like: ${convertTemp(weatherItem.main.feels_like)}</h4>
                    <h4>Temp max/min: ${convertTemp(weatherItem.main.temp_max)} / ${convertTemp(weatherItem.main.temp_min)}</h4>
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
                    <h4>Sunrise: ${typeof lastForecastData?.city?.sunrise !== 'undefined' ? new Date(lastForecastData.city.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</h4>
                    <h4>Sunset: ${typeof lastForecastData?.city?.sunset !== 'undefined' ? new Date(lastForecastData.city.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</h4>
                    <h4>Sea Level: ${typeof weatherItem.main.sea_level !== 'undefined' ? weatherItem.main.sea_level + ' hPa' : 'N/A'}</h4>
                    <h4>Ground Level: ${typeof weatherItem.main.grnd_level !== 'undefined' ? weatherItem.main.grnd_level + ' hPa' : 'N/A'}</h4>
                    </div>
            </div>
            <div class="icon">
                <img src="${iconSrc}" alt="Weather Icon">
                <h4> ${weatherItem.weather[0].main} | ${weatherItem.weather[0].description}</h4>
            </div>
        </div>`;
    } else {
        return `
            <li class="card forecast-day-card" data-date="${year}-${month}-${day}">
                <h2>(${dayName} ${formattedDate})</h2>
                <img src="${iconSrc}" alt="Weather Icon" style="width: 60px; height: 60px; display: block; margin: 0 auto;margin-top: 10px;">
                <h4 class='desc' style='margin-top:25px;'>${weatherItem.weather[0].main} | ${weatherItem.weather[0].description}</h4>
                <h4>Temperature: ${convertTemp(weatherItem.main.temp)}</h4>
                <h4>Feels like: ${convertTemp(weatherItem.main.feels_like)} </h4>
                <h4>Wind Speed: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity} %</h4>
            </li> `;
        
    }
};

// Set default background on initial load
document.addEventListener("DOMContentLoaded", () => {
    updateBackgroundImage("Default"); // or any default condition you prefer
});

const updateBackgroundImage = (weatherCondition) => {
    const body = document.body;
    // Map weather conditions to their background files and types
    const weatherBackgrounds = {
        Clear: { type: "video", src: "images/Clear.mp4" },
        Clouds: { type: "video", src: "images/Clouds.mp4" },
        Rain: { type: "image", src: "images/Rain.jpg" },
        Snow: { type: "image", src: "images/Snow.jpg" },
        Thunderstorm: { type: "image", src: "images/Thunderstorm.jpg" },
        Drizzle: { type: "image", src: "images/Drizzle.jpg" },
        Mist: { type: "image", src: "images/Mist.jpg" },
        Fog: { type: "image", src: "images/Mist.jpg" },
        Haze: { type: "image", src: "images/Mist.jpg" },
        Default: { type: "image", src: "images/default.jpg" }
    };

    // Remove any existing video background
    const existingVideo = document.getElementById('weather-bg-video');
    if (existingVideo) {
        existingVideo.remove();
    }

    const bg = weatherBackgrounds[weatherCondition];
    if (bg && bg.type === "video") {
        // Use video background
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

    } else if (bg && bg.type === "image") {
        // Use image background
        body.style.backgroundImage = `url('${bg.src}')`;
    } else {
        // Default background if condition not matched
        body.style.backgroundImage = "";
    }

    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundPosition = "center";
    body.style.backgroundSize = "cover";
    body.style.height = "100vh";
};


const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        lastForecastData = data; // Talletetaan koko data myöhempää käyttöä varten
        lastCityName = cityName;
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });

        CityInput.value = "";
        weatherCardDiv.innerHTML = ""; 
        currentWeatherDiv.innerHTML = "";

        document.getElementById('hourly-forecast-container').innerHTML = '';

        // Lisää ohjeteksti vain kun päiväkortit näytetään
        const daysForecastDiv = document.querySelector('.days-forecast');
        if (daysForecastDiv && !document.getElementById('hourly-instruction')) {
            const info = document.createElement('div');
            info.id = 'hourly-instruction';
            info.textContent = 'Click daily forecast cards to view hourly details.';
            daysForecastDiv.insertBefore(info, daysForecastDiv.querySelector('.weather-cards'));
        } else if (daysForecastDiv && document.getElementById('hourly-instruction')) {
            document.getElementById('hourly-instruction').style.display = '';
        }

        // Etsi maakoodi datasta
        let countryCode = '';
        if (data.city && data.city.country) {
            countryCode = data.city.country;
        }
        fiveDaysForecast.forEach((weatherItem, index) => {
            if(index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index, countryCode));
                updateBackgroundImage(weatherItem.weather[0].main);
            } else {
                weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index, countryCode));
            }
        });

        // Lisätään klikkauskuuntelijat päivän korteille
        addDayCardClickListeners();

    }).catch(() => {
        alert("An error occurred while fetching the forecast weather data. Please try again.");
    });
};

// Luo tuntiennustekortti valitulle päivälle
function createHourlyForecastCard(dateString, cityName, forecastList) {
    // Suodatetaan kaikki tunnit tälle päivälle
    const hours = forecastList.filter(item => {
        const d = new Date(item.dt_txt);
        const y = d.getFullYear();
        const m = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${day}` === dateString;
    });
    if (hours.length === 0) return '';

    // Muodosta d.m.y
    const [year, month, day] = dateString.split('-');
    const formattedDate = `${parseInt(day)}.${parseInt(month)}.${year}`;
    let html = `<div class="hourly-forecast-card" style="background:rgb(108, 117, 125,0.5);margin:1rem 0;padding:1rem;box-shadow:0 2px 8px #0002;">
        <h3 style="margin-bottom:1rem;">Hourly forecast for: ${cityName} (${formattedDate})</h3>
        <div class="hourly-cards-row">
    `;
    hours.forEach(item => {
        const d = new Date(item.dt_txt);
        const hour = d.getHours().toString().padStart(2, '0');
        const min = d.getMinutes().toString().padStart(2, '0');
        const weatherMain = item.weather[0].main;
        const customIcons = {
            Clear: "icons/Clear.png",
            Clouds: "icons/clouds.png",
            Rain: "icons/Rain.png",
            Snow: "icons/snow.png",
            Thunderstorm: "icons/Thunderstorm.png",
            Drizzle: "icons/Drizzle.png",
            Mist: "icons/Mist.png",
            Fog: "icons/Fog.png",
            Haze: "icons/Haze.png"
        };
        const iconSrc = customIcons[weatherMain] || customIcons.Default;
        const noData = '<span style="color:#d32f2f;">N/A</span>';
        html += `<div class="hour-card">
            <div class="hour-time">${hour}:${min}</div>
            <img class="hour-icon" src="${iconSrc}" alt="icon">
            <div class="hour-main">${item.weather[0].main}</div>
            <div class="hour-desc">${item.weather[0].description}</div>
            <div class="hour-data-table">
                <div class="hour-data-row"><span class="hour-data-label" id='Temperature'>Temperature:</span><span class="hour-data-value">${typeof item.main.temp !== 'undefined' ? convertTemp(item.main.temp) : noData}</span></div>
                <div class="hour-data-row"><span class="hour-data-label">Feels like:</span><span class="hour-data-value">${typeof item.main.feels_like !== 'undefined' ? convertTemp(item.main.feels_like) : noData}</span></div>
                <div class="hour-data-row"><span class="hour-data-label">Wind speed:</span><span class="hour-data-value">${typeof item.wind.speed !== 'undefined' ? item.wind.speed + ' m/s' : noData}</span></div>
                <div class="hour-data-row"><span class="hour-data-label">Humidity:</span><span class="hour-data-value">${typeof item.main.humidity !== 'undefined' ? item.main.humidity + ' %' : noData}</span></div>
                <div class="hour-data-row"><span class="hour-data-label">Air pressure:</span><span class="hour-data-value">${typeof item.main.pressure !== 'undefined' ? item.main.pressure + ' hPa' : noData}</span></div>
                <div class="hour-data-row"><span class="hour-data-label">Cloudy:</span><span class="hour-data-value">${item.clouds && typeof item.clouds.all !== 'undefined' ? item.clouds.all + ' %' : noData}</span></div>
                <div class="hour-data-row"><span class="hour-data-label">Visibility:</span><span class="hour-data-value">${typeof item.visibility !== 'undefined' ? (item.visibility / 1000).toFixed(1) + ' km' : noData}</span></div>
                <div class="hour-data-row"><span class="hour-data-label">Rain (3h):</span><span class="hour-data-value">${item.rain && item.rain['3h'] ? item.rain['3h'] + ' mm' : noData}</span></div>
                <div class="hour-data-row"><span class="hour-data-label">Snow (3h):</span><span class="hour-data-value">${item.snow && item.snow['3h'] ? item.snow['3h'] + ' mm' : noData}</span></div>
            </div>
        </div>`;
    });
    html += '</div>';
    html += '<button class="close-hourly-btn" style="margin-top:1rem;">Sulje</button>';
    html += '</div>';
    return html;
}

// Lisää klikkauskuuntelijat päivän korteille
function addDayCardClickListeners() {
    const cards = document.querySelectorAll('.forecast-day-card');
    cards.forEach(card => {
        card.addEventListener('click', function() {
            const date = card.getAttribute('data-date');
            // Jos hourly-forecast-containerissa on jo kortti tälle päivälle, piilota se (toggle)
            const container = document.getElementById('hourly-forecast-container');
            if (!container) return;
            if (container.firstChild && container.firstChild.getAttribute && container.firstChild.getAttribute('data-date') === date) {
                container.innerHTML = '';
                // Näytä ohjeteksti takaisin
                const hourlyInstruction = document.getElementById('hourly-instruction');
                if (hourlyInstruction) hourlyInstruction.style.display = '';
                return;
            }
            // Poista mahdollinen vanha tuntikortti
            container.innerHTML = '';
            // Luo ja lisää uusi tuntikortti
            if (lastForecastData && lastForecastData.list) {
                const hourlyCard = createHourlyForecastCard(date, lastCityName, lastForecastData.list);
                // Piilota ohjeteksti kun tuntikortti näkyy
                const hourlyInstruction = document.getElementById('hourly-instruction');
                if (hourlyInstruction) hourlyInstruction.style.display = 'none';
                // Lisää data-date attribuutti wrapperiin tunnistusta varten
                const wrapper = document.createElement('div');
                wrapper.innerHTML = hourlyCard;
                if (wrapper.firstChild) wrapper.firstChild.setAttribute('data-date', date);
                container.appendChild(wrapper.firstChild);
                // Sulje-nappi
                const closeBtn = container.querySelector('.close-hourly-btn');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        container.innerHTML = '';
                        // Näytä ohjeteksti takaisin
                        const hourlyInstruction = document.getElementById('hourly-instruction');
                        if (hourlyInstruction) hourlyInstruction.style.display = '';
                    });
                }
            }
        });
    });
}
// Syötteen validointi ja XSS-suojaus
function sanitizeCityName(input) {
    // Poista HTML-tagit ja erikoismerkit
    return input.replace(/<[^>]*>?/gm, '').replace(/[^a-zA-Z0-9äöåÄÖÅ\-\s]/g, '').trim();
}
// --- Favorite Cities Feature ---
let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities') || '[]');

function renderFavorites() {
    const list = document.getElementById('favorites-list');
    if (!list) return;
    list.innerHTML = '';
    favoriteCities.forEach(city => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.marginBottom = '6px';
        // City button
        const btn = document.createElement('button');
        btn.textContent = city;
        btn.className = 'favorite-city-btn';
        btn.style.padding = '0.3rem 0.7rem';
        btn.style.borderRadius = '1rem';
        btn.style.border = '1px solid #888';
        btn.style.background = '#f5f5f5';
        btn.style.cursor = 'pointer';
        btn.onclick = () => {
            getCityCoordinates(city);
        };
        // Remove button
        const removeBtn = document.createElement('span');
        removeBtn.textContent = '✕';
        removeBtn.title = 'Remove';
        removeBtn.style.marginLeft = '8px';
        removeBtn.style.color = '#d32f2f';
        removeBtn.style.cursor = 'pointer';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            favoriteCities = favoriteCities.filter(c => c !== city);
            localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
            renderFavorites();
        };
        li.appendChild(btn);
        li.appendChild(removeBtn);
        list.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderFavorites();
    const addBtn = document.getElementById('add-favorite-btn');
    const input = document.getElementById('favorite-city-input');
    if (addBtn && input) {
        addBtn.onclick = () => {
            const city = sanitizeCityName(input.value);
            if (city && !favoriteCities.includes(city)) {
                favoriteCities.push(city);
                localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
                renderFavorites();
                input.value = '';
            }
        };
    }
});

const getCityCoordinates = (cityNameFromToggle = null) => {
    let cityNameRaw = cityNameFromToggle || CityInput.value.trim();
    let cityName = sanitizeCityName(cityNameRaw);
    if(!cityName) return;
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${API_KEY}`;

    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityName}. Please try again.`);
        const { name,lat,lon } = data[0]; 
        getWeatherDetails(name,lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates. Please try again.");
    });
};

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition( 
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
               const { name } = data[0]; 
               getWeatherDetails(name,latitude, longitude);
            }).catch(() => {
                alert("An error occurred while fetching the city. Please try again.");
            });

        },
        error =>{
            if(error.code === error.PERMISSION_DENIED) {
                alert("Geoposition access denied. Please allow location access in your browser settings.");
            }
        }
    );
};

searchButton.addEventListener("click", () => {
    getCityCoordinates();
    // Piilota ohjeteksti kun haku tehdään
    const hourlyInstruction = document.getElementById('hourly-instruction');
    if (hourlyInstruction) hourlyInstruction.style.display = 'none';
});
CurrentGeolocationButton.addEventListener("click", () => {
    getUserCoordinates();
    // Piilota ohjeteksti kun haku tehdään
    const hourlyInstruction = document.getElementById('hourly-instruction');
    if (hourlyInstruction) hourlyInstruction.style.display = 'none';
});

unitToggleButton.addEventListener("click", () => {
    isCelsius = !isCelsius;
    unitToggleButton.textContent = isCelsius ? "Switch to °F" : "Switch to °C";

    // Ota kaupungin nimi ilman maakoodia
    const h2 = document.querySelector(".current-weather h2")?.textContent;
    let cityName = '';
    if (h2) {
        // Esim. "Espoo, FI (Mon 25.8.2025 14:00)" => "Espoo"
        cityName = h2.split(',')[0].trim();
    }
    if (cityName) {
        getCityCoordinates(cityName);
    }
});
