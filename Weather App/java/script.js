// Day 1 — Weather App
// Replace with your OpenWeatherMap API key:
const API_KEY = '7bf3f09e01f4eabee9483d21e48df0ed'; // <-- get a free key at openweathermap.org
const ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather';

// DOM refs
const cityInput = document.getElementById('city');
const searchBtn = document.getElementById('searchBtn');
const statusEl = document.getElementById('status');

const resultSection = document.getElementById('result');
const cityNameEl = document.getElementById('cityName');
const descEl = document.getElementById('desc');
const tempEl = document.getElementById('temp');
const iconEl = document.getElementById('icon');
const humidityEl = document.getElementById('humidity');
const windEl = document.getElementById('wind');
const sunriseEl = document.getElementById('sunrise');
const sunsetEl = document.getElementById('sunset');
const localTimeEl = document.getElementById('localTime');

// helpers
function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.style.color = isError ? '#ffbaba' : '';
}

function showResult() {
  resultSection.classList.remove('hidden');
}
function hideResult() {
  resultSection.classList.add('hidden');
}

// format unix timestamp + timezone offset to local time string
function formatTime(tsSeconds, tzOffsetSeconds) {
  // tsSeconds is in UTC, tzOffsetSeconds is offset from UTC in seconds
  const d = new Date((tsSeconds + tzOffsetSeconds) * 1000);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// format local time in city using timezone offset
function cityLocalTime(tzOffsetSeconds) {
  const nowUtcSec = Math.floor(Date.now() / 1000);
  return formatTime(nowUtcSec, tzOffsetSeconds);
}

// build icon URL from OpenWeatherMap
function iconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// fetch weather for a city
async function fetchWeather(city) {
  try {
    setStatus('Loading…');
    hideResult();
    const url = `${ENDPOINT}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) throw new Error('City not found');
      throw new Error(`Network error ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    throw err;
  }
}

// render data to UI
function renderWeather(data) {
  // data structure: see OpenWeatherMap docs
  const { name, sys, weather, main, wind, timezone } = data;
  const w = weather && weather[0];

  cityNameEl.textContent = `${name}, ${sys && sys.country ? sys.country : ''}`;
  descEl.textContent = w ? (w.description || '').replace(/\b\w/g, s => s.toUpperCase()) : '';
  tempEl.textContent = main ? Math.round(main.temp) : '—';
  iconEl.src = w ? iconUrl(w.icon) : '';
  iconEl.alt = w ? w.description : 'weather';
  humidityEl.textContent = main ? main.humidity : '—';
  windEl.textContent = wind ? (wind.speed + ' m/s') : '—';
  sunriseEl.textContent = sys && sys.sunrise ? formatTime(sys.sunrise, timezone) : '—';
  sunsetEl.textContent = sys && sys.sunset ? formatTime(sys.sunset, timezone) : '—';
  localTimeEl.textContent = cityLocalTime(timezone);

  showResult();
  setStatus('Weather loaded.');
}

// main search
async function doSearch() {
  const q = cityInput.value.trim();
  if (!q) {
    setStatus('Please enter a city.', true);
    return;
  }
  try {
    const data = await fetchWeather(q);
    renderWeather(data);
  } catch (err) {
    console.error(err);
    setStatus(err.message || 'Failed to fetch weather.', true);
  }
}

// events
searchBtn.addEventListener('click', doSearch);
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doSearch();
});

// quick demo: optional - load a default city on start
// (uncomment to auto-load)
// window.addEventListener('load', () => { cityInput.value = 'Mumbai'; doSearch(); });
