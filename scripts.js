const CityInput = document.querySelector(".cityInput");
const searchButton = document.querySelector('.search-btn');
const weatherCardDiv = document.querySelector('.weather-cards');
const currentWeatherDiv = document.querySelector('.current-weather');
const CurrentGeolocationButton = document.querySelector('.location-btn');


const API_KEY = "2f72d2b4c845f1bd343c24e1bb01f913"; //API key for OpenWeatherMap API
const createWeatherCard = (cityName,weatherItem, index) => {
    const date = new Date(weatherItem.dt_txt);
    
    //Formatting date to dd.mm.yyyy
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let Hours = date.getHours();
    let Minutes = date.getUTCMinutes();

    if (day < 10) {
        day = '0' + day;
    }

    if (month < 10) {
        month = '0' + month;
    }
    if (Minutes < 10) {
        Minutes = '0' + Minutes;
    }

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayName = daysOfWeek[date.getDay()];

    const formattedDate = `${day}.${month}.${year}`;
    const formattedDateForMainCard = `${day}.${month}.${year} ${Hours}:${Minutes}`;
    
    const clockAndDate = `${dayName} ${formattedDate} ${Hours}:${Minutes}`;

    
    if(index === 0) { //HTML for main weather  card
        return `<div class="details">
                <div class="mainDATA">
                    <div class="weather-info">
                        <h2>${cityName} (${dayName} ${formattedDateForMainCard})</h2>
                        <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h4>
                        <h4>Wind Speed: ${weatherItem.wind.speed} M/S</h4>
                        <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                    </div>
                    <div class="weather-info">
                        <h4 style='margin-top:3.5rem;'>Pressure: ${(weatherItem.main.pressure )} kPa</h4>
                        <h4>Feels like: ${(weatherItem.main.feels_like - 273.15).toFixed(2)} °C</h4>
                        <h4>Wind degrees: ${(weatherItem.wind.deg - 273.15).toFixed(2)} °C</h4>
                    </div>
                </div>
                    <div class="icon">
                            <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="Weather Icon">
                            <h4>${weatherItem.weather[0].description}</h4>
                    </div>`;
        }else{ //HTML for forecast weather cards
            return `<li class="card">
                    <h2>(${dayName} ${formattedDate})</h2>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="Weather Icon">
                    <h4 class='desc'>${weatherItem.weather[0].description}</h4>
                    <h4>Temperature: ${(weatherItem.main.temp - 273.15).toFixed(2)} °C</h4>
                    <h4>Wind Speed: ${weatherItem.wind.speed} M/S</h4>
                    <h4>Humidity: ${weatherItem.main.humidity} %</h4>
                    
                </li>`;
        }
}

// Function to update the background image based on the main weather condition
const updateBackgroundImage = (weatherCondition) => {
    const body = document.body;

    // Define background images for different weather conditions
    const weatherBackgrounds = {
        Clear: "url('images/Clear.jpg')", // Replace with your image paths
        Clouds: "url('images/Clouds.jpg')",
        Rain: "url('images/Rain.jpg')",
        Snow: "url('images/Snow.jpg')",
        Thunderstorm: "url('images/Thunderstorm.jpg')",
        Drizzle: "url('images/Drizzle.jpg')",
        Mist: "url('images/Mist.jpg')",
   
    };

    // Set the background image based on the weather condition
    body.style.backgroundImage = weatherBackgrounds[weatherCondition] || weatherBackgrounds.Default;
    body.style.backgroundRepeat = "no-repeat";
    body.style.backgroundPosition = "center";
    body.style.backgroundSize = "cover";
};

const getWeatherDetails = (cityName, lat, lon) => {
    const WEATHER_API_URL = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
       
        // Filter weather forecast by date
        const uniqueForecastDays = [];
        const fiveDaysForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });

        // Clear previous weather data
        CityInput.value = "";
        weatherCardDiv.innerHTML = ""; 
        currentWeatherDiv.innerHTML = "";

        // Create weather cards and add them to the DOM
        fiveDaysForecast.forEach((weatherItem, index) => {
            if(index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
                // Update background image based on the main weather condition
                updateBackgroundImage(weatherItem.weather[0].main);
            } else {
                weatherCardDiv.insertAdjacentHTML("beforeend", createWeatherCard(cityName, weatherItem, index));
            }
        });

        console.log(fiveDaysForecast);

    }).catch(() => {
        alert("An error occurred while fetching the forecast weather data. Please try again.");
    });
};

const getCityCoordinates = () => {
    const cityName = CityInput.value.trim();
    if(!cityName) return;
    const GEOCODING_API_URL = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    // Getting data from entered city (latitude, longitude and cityname) By using openweathermap geocoding API
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityName}. Please try again.`);
        const { name,lat,lon } = data[0]; 
        getWeatherDetails(name,lat, lon);
        //console.log(name, lat, lon);
    }).catch(() => {
        alert("An error occurred while fetching the coordinates. Please try again.");
    });
    
}


const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition( 
        position => {
            const { latitude, longitude } = position.coords;
            const REVERSE_GEOCODING_URL = `http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            //Get cityname from coordinates using reverse geocoding API
            fetch(REVERSE_GEOCODING_URL).then(res => res.json()).then(data => {
               // console.log(data); //display the coordinates data in the console
               const { name} = data[0]; 
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
}



CurrentGeolocationButton.addEventListener("click",getUserCoordinates)
searchButton.addEventListener("click", getCityCoordinates);


