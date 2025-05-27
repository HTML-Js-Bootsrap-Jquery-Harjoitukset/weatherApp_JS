const CityInput = document.querySelector(".cityInput");
const searchButton = document.querySelector('.search-btn');
const weatherCardDiv = document.querySelector('.weather-cards');
const currentWeatherDiv = document.querySelector('.current-weather');
const CurrentGeolocationButton = document.querySelector('.location-btn');
const unitToggleButton = document.querySelector('.unit-toggle-btn');

const API_KEY = "2f72d2b4c845f1bd343c24e1bb01f913";
let isCelsius = true; // Default unit

const convertTemp = (tempK) => {
    return isCelsius 
        ? `${(tempK - 273.15).toFixed(2)} °C` 
        : `${((tempK - 273.15) * 9/5 + 32).toFixed(2)} °F`;
};

const createWeatherCard = (cityName, weatherItem, index) => {
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
                <div class="mainDATA">
                    <div class="weather-info">
                        <h2>${cityName} (${dayName} ${formattedDateForMainCard})</h2>
                        <h4>Temperature: ${convertTemp(weatherItem.main.temp)}</h4>
                        <h4>Wind Speed: ${weatherItem.wind.speed} M/S</h4>
                        <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                    </div>
                    <div class="weather-info">
                        <h4 style='margin-top:3.5rem;'>Pressure: ${weatherItem.main.pressure} kPa</h4>
                        <h4>Feels like: ${convertTemp(weatherItem.main.feels_like)}</h4>
                        <h4>Wind degrees: ${weatherItem.wind.deg}°</h4>
                    </div>
                </div>
                <div class="icon">
                    <img src="${iconSrc}" alt="Weather Icon">
                    <h4> ${weatherItem.weather[0].main} | ${weatherItem.weather[0].description}</h4>
                </div>`;
    } else {
        return `<li class="card">
                <h2>(${dayName} ${formattedDate})</h2>
                <img src="${iconSrc}" alt="Weather Icon" style="width: 60px; height: 60px;">
                <h4 class='desc' style='margin-top:25px;' >${weatherItem.weather[0].main} | ${weatherItem.weather[0].description}</h4>
                <h4>Temperature: ${convertTemp(weatherItem.main.temp)}</h4>
                <h4>Wind Speed: ${weatherItem.wind.speed} M/S</h4>
                <h4>Humidity: ${weatherItem.main.humidity} %</h4>
            </li>`;
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

        fiveDaysForecast.forEach((weatherItem, index) => {
            if(index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                updateBackgroundImage(weatherItem.weather[0].main);
            } else {
                weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });

    }).catch(() => {
        alert("An error occurred while fetching the forecast weather data. Please try again.");
    });
};

const getCityCoordinates = (cityNameFromToggle = null) => {
    const cityName = cityNameFromToggle || CityInput.value.trim();
    if(!cityName) return;
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

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

searchButton.addEventListener("click", () => getCityCoordinates());
CurrentGeolocationButton.addEventListener("click", getUserCoordinates);

unitToggleButton.addEventListener("click", () => {
    isCelsius = !isCelsius;
    unitToggleButton.textContent = isCelsius ? "Switch to °F" : "Switch to °C";

    const cityName = document.querySelector(".current-weather h2")?.textContent?.split(" (")[0];
    if (cityName) {
        getCityCoordinates(cityName);
    }
});
