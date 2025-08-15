// DOM utility functions for WeatherApp

export function setElementHTML(selector, html) {
    const el = document.querySelector(selector);
    if (el) el.innerHTML = html;
}

export function setElementText(selector, text) {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
}

export function showElement(selector) {
    const el = document.querySelector(selector);
    if (el) el.style.display = '';
}

export function hideElement(selector) {
    const el = document.querySelector(selector);
    if (el) el.style.display = 'none';
}

