// Kielivalinta ja UI-käännökset
const LANGUAGES = {
    fi: {
        mainTitle: "Sääsovellus",
        cityPlaceholder: "Esim. Helsinki, Tokyo, New York",
        searchBtn: "Hae sää",
        locationBtn: "Käytä nykyinen sijainti",
        unitToggle: "Vaihda °F",
        forecastTitle: "5 päivän ennuste",
        alertInvalid: "Numerot ja erikoismerkit eivät ole sallittuja.",
        autocomplete: "Hae kaupunkiehdotuksia...",
    },
    en: {
        mainTitle: "Weather App",
        cityPlaceholder: "E.g., Helsinki, Tokyo, New York",
        searchBtn: "Get Weather",
        locationBtn: "Use current location",
        unitToggle: "Switch to °F",
        forecastTitle: "5 days forecast",
        alertInvalid: "Numbers and special characters are not allowed.",
        autocomplete: "Search city suggestions...",
    },
    sv: {
        mainTitle: "Väderapp",
        cityPlaceholder: "T.ex. Helsingfors, Tokyo, New York",
        searchBtn: "Hämta väder",
        locationBtn: "Använd nuvarande plats",
        unitToggle: "Byt till °F",
        forecastTitle: "5 dagars prognos",
        alertInvalid: "Siffror och specialtecken är inte tillåtna.",
        autocomplete: "Sök stad...",
    }
};
let currentLang = 'en';
function updateUILanguage() {
    const lang = LANGUAGES[currentLang];
    document.getElementById('main-title').textContent = lang.mainTitle;
    document.querySelector('.cityInput').placeholder = lang.cityPlaceholder;
    document.querySelector('.search-btn').textContent = lang.searchBtn;
    document.querySelector('.location-btn').textContent = lang.locationBtn;
    document.querySelector('.unit-toggle-btn').textContent = lang.unitToggle;
    
    const forecastTitle = document.querySelector('.days-forecast > h2');
    if (forecastTitle) forecastTitle.textContent = lang.forecastTitle;
    const cityInputAlert = document.getElementById('city-input-alert');
    if (cityInputAlert) cityInputAlert.textContent = lang.alertInvalid;
}
window.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.addEventListener('change', function() {
            currentLang = langSelect.value;
            updateUILanguage();
        });
    }
    updateUILanguage();
});
