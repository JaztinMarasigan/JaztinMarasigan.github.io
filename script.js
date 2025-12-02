const API_KEY = "de3a1e9cae36dba21356a792776a4642";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

const cityInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const saveFavoriteBtn = document.getElementById("save-favorite-btn");
const favoritesList = document.getElementById("favorites-list");

const currentWeatherSection = document.getElementById("current-weather");
const cityNameEl = document.getElementById("city-name");
const weatherDescEl = document.getElementById("weather-description");
const temperatureEl = document.getElementById("temperature");
const weatherIconEl = document.getElementById("weather-icon");
const humidityEl = document.getElementById("humidity");
const windSpeedEl = document.getElementById("wind-speed");

const forecastSection = document.getElementById("forecast");
const forecastGrid = document.getElementById("forecast-grid");

let favorites = [];

// ---- Event listeners ----
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city) {
    fetchWeather(city);
  }
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

saveFavoriteBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city && !favorites.includes(city)) {
    favorites.push(city);
    saveFavorites();
    renderFavorites();
  }
});

// ---- Fetch functions ----
async function fetchWeather(city) {
  try {
    const currentUrl = `${BASE_URL}/weather?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=metric`;
    const forecastUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(
      city
    )}&appid=${API_KEY}&units=metric`;

    const [currentRes, forecastRes] = await Promise.all([
      fetch(currentUrl),
      fetch(forecastUrl),
    ]);

    if (!currentRes.ok || !forecastRes.ok) {
      alert("City not found or API error.");
      return;
    }

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    displayCurrentWeather(currentData);
    displayForecast(forecastData);
  } catch (error) {
    console.error(error);
    alert("Something went wrong. Check the console for details.");
  }
}

// ---- Display current weather ----
function displayCurrentWeather(data) {
  const city = `${data.name}, ${data.sys.country}`;
  const description = data.weather[0].description;
  const temp = Math.round(data.main.temp);
  const iconCode = data.weather[0].icon;
  const humidity = data.main.humidity;
  const wind = data.wind.speed;

  cityNameEl.textContent = city;
  weatherDescEl.textContent = description;
  temperatureEl.textContent = temp;
  humidityEl.textContent = humidity;
  windSpeedEl.textContent = wind;
  weatherIconEl.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  weatherIconEl.alt = description;

  currentWeatherSection.classList.remove("hidden");
}

// ---- Display 5-day forecast ----
function displayForecast(data) {
  // Forecast data is in 3-hour intervals. Choose one entry per day (e.g., around 12:00).
  const dailyMap = {};

  data.list.forEach((entry) => {
    const date = entry.dt_txt.split(" ")[0]; // "YYYY-MM-DD"
    const time = entry.dt_txt.split(" ")[1]; // "HH:MM:SS"

    if (!dailyMap[date] && time.startsWith("12:00")) {
      dailyMap[date] = entry;
    }
  });

  // If fewer than 5 entries chosen (sometimes missing 12:00), fill with first occurrences.
  const dates = Object.keys(dailyMap);
  if (dates.length < 5) {
    data.list.forEach((entry) => {
      const date = entry.dt_txt.split(" ")[0];
      if (!dailyMap[date]) {
        dailyMap[date] = entry;
      }
    });
  }

  const sortedDates = Object.keys(dailyMap).slice(0, 5);

  forecastGrid.innerHTML = "";

  sortedDates.forEach((date) => {
    const entry = dailyMap[date];
    const temp = Math.round(entry.main.temp);
    const description = entry.weather[0].description;
    const iconCode = entry.weather[0].icon;

    const dateObj = new Date(date);
    const options = { weekday: "short", month: "short", day: "numeric" };
    const label = dateObj.toLocaleDateString(undefined, options);

    const card = document.createElement("div");
    card.className = "forecast-day";
    card.innerHTML = `
      <p>${label}</p>
      <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" alt="${description}" />
      <p>${temp}°C</p>
      <p>${description}</p>
    `;

    forecastGrid.appendChild(card);
  });

  forecastSection.classList.remove("hidden");
}

// ---- Favorites (localStorage) ----
function saveFavorites() {
  localStorage.setItem("weatherFavorites", JSON.stringify(favorites));
}

function loadFavorites() {
  const stored = localStorage.getItem("weatherFavorites");
  if (stored) {
    favorites = JSON.parse(stored);
  } else {
    favorites = [];
  }
}

function renderFavorites() {
  favoritesList.innerHTML = "";
  favorites.forEach((city) => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => {
      cityInput.value = city;
      fetchWeather(city);
    });
    favoritesList.appendChild(li);
  });
}

// ---- Init ----
loadFavorites();
renderFavorites();
