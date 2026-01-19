// Day 1 — Weather App
const API_KEY = '7bf3f09e01f4eabee9483d21e48df0ed';
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

//: format unix time correctly (NO double timezone)
function formatTime(tsSeconds, tzOffsetSeconds) {
  const d = new Date((tsSeconds + tzOffsetSeconds) * 1000);
  return d.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC' // 🔥 IMPORTANT
  });
}

// city local time
function cityLocalTime(tzOffsetSeconds) {
  const nowUtcSec = Math.floor(Date.now() / 1000);
  return formatTime(nowUtcSec, tzOffsetSeconds);
}

// weather icon
function iconUrl(iconCode) {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// fetch weather
async function fetchWeather(city) {
  setStatus('Loading…');
  hideResult();

  const url = `${ENDPOINT}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
  const res = await fetch(url);

  if (!res.ok) {
    if (res.status === 404) throw new Error('City not found');
    throw new Error('Something went wrong');
  }

  return await res.json();
}

// render UI
function renderWeather(data) {
  const { name, sys, weather, main, wind, timezone } = data;
  const w = weather[0];

  cityNameEl.textContent = `${name}, ${sys.country}`;
  descEl.textContent = w.description;
  tempEl.textContent = Math.round(main.temp);
  iconEl.src = iconUrl(w.icon);
  humidityEl.textContent = main.humidity;
  windEl.textContent = wind.speed + ' m/s';

  //  sunrise & sunset
  sunriseEl.textContent = formatTime(sys.sunrise, timezone);
  sunsetEl.textContent = formatTime(sys.sunset, timezone);
  localTimeEl.textContent = cityLocalTime(timezone);

  showResult();
  setStatus('Weather loaded.');
}

// search
async function doSearch() {
  const city = cityInput.value.trim();
  if (!city) {
    setStatus('Please enter a city', true);
    return;
  }

  try {
    const data = await fetchWeather(city);
    renderWeather(data);
  } catch (err) {
    setStatus(err.message, true);
  }
}

// events
searchBtn.addEventListener('click', doSearch);
cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doSearch();
});


