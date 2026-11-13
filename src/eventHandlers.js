export function bindInputAutocomplete({ cityInput, cityInputAlert, autocompleteList, onSearch, onSelect }) {
  if (!cityInput) return;

  cityInput.addEventListener('input', () => {
    const raw = cityInput.value;
    const sanitized = raw.replace(/[^a-zA-ZäöåÄÖÅ\s]/g, '');

    if (raw !== sanitized) {
      cityInput.value = sanitized;
      if (cityInputAlert) {
        cityInputAlert.textContent = 'Numbers and special characters are not allowed.';
        cityInputAlert.style.display = 'block';
      }
    } else if (cityInputAlert) {
      cityInputAlert.style.display = 'none';
    }

    const query = sanitized.trim();
    if (query.length < 2) {
      if (autocompleteList) {
        autocompleteList.style.display = 'none';
        autocompleteList.innerHTML = '';
      }
      return;
    }

    if (typeof onSearch === 'function') {
      onSearch(query);
    }
  });

  cityInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      if (autocompleteList) autocompleteList.style.display = 'none';
      const value = cityInput.value.trim();
      if (value && typeof onSelect === 'function') {
        onSelect(value);
      }
    }
  });

  cityInput.addEventListener('blur', () => {
    setTimeout(() => {
      if (autocompleteList) autocompleteList.style.display = 'none';
    }, 150);
  });
}

export function bindButtonHandlers({ searchButton, currentGeolocationButton, unitToggleButton, onSearch, onLocation, onToggle }) {
  if (searchButton && typeof onSearch === 'function') {
    searchButton.addEventListener('click', onSearch);
  }

  if (currentGeolocationButton && typeof onLocation === 'function') {
    currentGeolocationButton.addEventListener('click', onLocation);
  }

  if (unitToggleButton && typeof onToggle === 'function') {
    unitToggleButton.addEventListener('click', onToggle);
  }
}

export function bindFavoriteControls({ addFavoriteBtn, favoriteCityInput, onAddFavorite, onSelectFavorite }) {
  if (addFavoriteBtn && favoriteCityInput && typeof onAddFavorite === 'function') {
    addFavoriteBtn.addEventListener('click', () => {
      onAddFavorite(favoriteCityInput.value);
    });
  }

  if (favoriteCityInput) {
    favoriteCityInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && typeof onAddFavorite === 'function') {
        onAddFavorite(favoriteCityInput.value);
      }
    });
  }

  const favoriteButtons = document.querySelectorAll('.favorite-city-btn');
  favoriteButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (typeof onSelectFavorite === 'function') {
        onSelectFavorite(button.textContent);
      }
    });
  });
}

export function bindDayCardClickListeners(cards, onSelectDate) {
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const date = card.getAttribute('data-date');
      if (date && typeof onSelectDate === 'function') {
        onSelectDate(date);
      }
    });
  });
}
