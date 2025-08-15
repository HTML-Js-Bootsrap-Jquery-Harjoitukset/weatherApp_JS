// Formatting utility functions for WeatherApp

export function convertTemp(tempK, isCelsius = true) {
    return isCelsius
        ? `${(tempK - 273.15).toFixed(2)} °C`
        : `${((tempK - 273.15) * 9/5 + 32).toFixed(2)} °F`;
}

export function formatDate(date) {
    const d = new Date(date);
    let day = d.getDate();
    let month = d.getMonth() + 1;
    let year = d.getFullYear();
    if (day < 10) day = '0' + day;
    if (month < 10) month = '0' + month;
    return `${day}.${month}.${year}`;
}
