const apiKey = "fcc8de7015bbb202209bbf0261babf4c";
const baseApi = "https://api.openweathermap.org/data/2.5/";

const searchBox = document.getElementById('search-box');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityElem = document.querySelector('.city');
const dateElem = document.querySelector('.date');
const tempElem = document.querySelector('.temp');
const weatherElem = document.querySelector('.weather');
const hiLowElem = document.querySelector('.hi-low');
const weatherIconElem = document.getElementById('weather-icon');
const forecastElem = document.getElementById('forecast');
const errorMessage = document.getElementById('error-message');

searchBtn.addEventListener('click', () => fetchWeather(searchBox.value));
searchBox.addEventListener('keypress', (e) => {
    if (e.key === "Enter") fetchWeather(searchBox.value);
});
locationBtn.addEventListener('click', getCurrentLocation);

function fetchWeather(query) {
    if (!query) {
        showError("Please enter a city name.");
        return;
    }

    fetch(`${baseApi}weather?q=${query}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(displayWeather)
        .catch(() => showError("City not found. Try again."));
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetch(`${baseApi}weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`)
                    .then(response => response.json())
                    .then(displayWeather)
                    .catch(() => showError("Location not found."));
            },
            () => showError("Location access denied.")
        );
    } else {
        showError("Geolocation is not supported by this browser.");
    }
}

function displayWeather(weather) {
    if (weather.cod !== 200) {
        showError("City not found. Try again.");
        return;
    }

    errorMessage.classList.add('hidden');
    
    cityElem.innerText = `${weather.name}, ${weather.sys.country}`;
    dateElem.innerText = new Date().toDateString();
    tempElem.innerHTML = `${Math.round(weather.main.temp)}°C`;
    weatherElem.innerText = weather.weather[0].main;
    hiLowElem.innerText = `${Math.round(weather.main.temp_min)}°C / ${Math.round(weather.main.temp_max)}°C`;

    weatherIconElem.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;

    fetch(`${baseApi}forecast?q=${weather.name}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(displayForecast);
}

function displayForecast(forecast) {
    forecastElem.innerHTML = '';
    const dailyData = {};

    forecast.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dailyData[date]) dailyData[date] = item;
    });

    Object.values(dailyData).slice(0, 5).forEach(day => {
        const forecastDiv = document.createElement('div');
        forecastDiv.classList.add('text-center', 'bg-gray-200', 'p-2', 'rounded');

        forecastDiv.innerHTML = `
            <p>${new Date(day.dt_txt).toLocaleDateString('en-US', { weekday: 'short' })}</p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="Weather icon" class="w-10 mx-auto">
            <p>${Math.round(day.main.temp)}°C</p>
        `;

        forecastElem.appendChild(forecastDiv);
    });
}

function showError(message) {
    errorMessage.innerText = message;
    errorMessage.classList.remove('hidden');
}
