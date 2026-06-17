
// RENDER LAYOUT
const app = document.getElementById("app");
renderLayout();
function renderLayout() {
    app.innerHTML = `
    <div class="max-w-7xl mx-auto">
        <div class="rounded-3xl p-5 md:p-6 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm border border-blue-200/50 dark:border-blue-400/20 shadow-2xl">
            <div class="grid lg:grid-cols-4 gap-6">
                <div class="lg:col-span-3 space-y-6">
                    <div class="grid md:grid-cols-12 gap-4">
                        <div class="md:col-span-8 relative">
                            <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-400"></i>
                            <input id="searchInput" type="text" placeholder="Search City..." class="w-full pl-12 pr-4 py-3 rounded-xl border bg-white/80 dark:bg-white/5 border-blue-200 dark:border-blue-400/20 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300">
                        </div>
                        <button id="locationBtn" class="md:col-span-2 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-white py-3 transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-400/20"><i class="fa-solid fa-location-dot"></i></button>
                        <button id="darkModeBtn" class="md:col-span-2 rounded-xl bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-800 dark:text-white py-3 transition-all duration-300 hover:scale-105"><i class="fa-solid fa-moon"></i></button>
                    </div>
                    <div id="weatherCard"></div>
                    <div>
                        <h2 class="text-gray-800 dark:text-white text-xl font-semibold mb-4"><i class="fa-regular fa-calendar text-blue-400"></i> 5 Day Forecast</h2>
                        <div id="forecastContainer" class="grid grid-cols-2 md:grid-cols-5 gap-4"></div>
                    </div>
                    <div class="rounded-3xl p-5 bg-white/80 dark:bg-slate-900/50 border border-blue-200 dark:border-blue-400/20">
                        <h2 class="text-gray-800 dark:text-white text-xl font-semibold mb-4"><i class="fa-solid fa-chart-line text-blue-400"></i> Hourly Temperature Chart</h2>
                        <canvas id="tempChart"></canvas>
                    </div>
                    <div id="errorContainer" class="hidden rounded-3xl p-5 bg-red-500/10 border border-red-500/20 text-center">
                        <h3 class="text-red-600 dark:text-red-300 text-xl mb-3"><i class="fa-solid fa-triangle-exclamation"></i> Unable To Fetch Weather Data</h3>
                        <p class="text-red-500/80 dark:text-red-400/80 mb-3">Please check your connection or try again</p>
                        <button id="retryBtn" class="bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 px-5 py-2 rounded-lg text-white transition-all duration-300 hover:scale-105"><i class="fa-solid fa-rotate-right"></i> Retry</button>
                    </div>
                </div>
                <div>
                    <div class="rounded-3xl p-5 h-full bg-white/80 dark:bg-slate-900/50 border border-blue-200 dark:border-blue-400/20">
                        <h2 class="text-gray-800 dark:text-white text-xl font-semibold mb-5"><i class="fa-solid fa-bookmark text-blue-400"></i> Saved Cities</h2>
                        <div id="savedCities" class="space-y-3"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}
// VARIABLES
const toastContainer = document.getElementById("toastContainer");
const darkModeBtn = document.getElementById("darkModeBtn");
const locationBtn = document.getElementById("locationBtn");
const errorContainer = document.getElementById("errorContainer");
let debounceTimer;
let tempChart = null;
let lastSearchedCity = "Karachi";
let favourites = JSON.parse(localStorage.getItem("favourites")) || [];

// DARK MODE
let isDarkMode = localStorage.getItem("darkMode") === "true";
function applyDarkMode(isDark) {
    if (isDark) {
        document.documentElement.classList.add("dark");
        darkModeBtn.innerHTML = `<i class="fa-solid fa-sun"></i>`;
    } else {
        document.documentElement.classList.remove("dark");
        darkModeBtn.innerHTML = `<i class="fa-solid fa-moon"></i>`;
    }
    localStorage.setItem("darkMode", isDark);
    isDarkMode = isDark;
    
    if (lastSearchedCity) {
        getForecast(lastSearchedCity);
    }
}
applyDarkMode(isDarkMode);
darkModeBtn.addEventListener("click", () => { applyDarkMode(!isDarkMode); });

// TOAST
function showToast(message, type = "info") {
    const colors = {
        success: "bg-gradient-to-r from-green-400 to-emerald-500",
        error: "bg-gradient-to-r from-red-400 to-rose-500",
        info: "bg-gradient-to-r from-blue-400 to-indigo-500",
        warning: "bg-gradient-to-r from-amber-400 to-orange-500"
    };
    const icons = {
        success: "fa-circle-check",
        error: "fa-circle-xmark",
        info: "fa-circle-info",
        warning: "fa-triangle-exclamation"
    };
    const toast = document.createElement("div");
    toast.className = `${colors[type]} text-white px-5 py-3 rounded-xl shadow-lg transition-all duration-300 transform translate-x-0 flex items-center gap-2 min-w-[280px] max-w-[400px]`;
    toast.innerHTML = `<i class="fa-solid ${icons[type]} text-lg"></i> ${message}`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(100px)";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// FORMAT TIME WITH AM/PM
function formatTime(timeStr) {
    const date = new Date(timeStr);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

// WEATHER CARD
function renderCurrentWeather(data) {
    const weatherCard = document.getElementById("weatherCard");
    const lastUpdated = formatTime(data.current.last_updated);
    weatherCard.innerHTML = `
    <div class="rounded-3xl p-8 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-400 dark:from-blue-600 dark:via-indigo-600 dark:to-purple-600 shadow-2xl transition-all duration-500">
        <div class="flex justify-between items-start">
            <div>
                <p class="text-white/90 text-lg font-medium"><i class="fa-solid fa-location-dot mr-2"></i> ${data.location.name}, ${data.location.country}</p>
                <p class="text-xs text-white/70 mt-1">Lat: ${data.location.lat}° | Lon: ${data.location.lon}°</p>
                <h1 class="text-7xl font-bold text-white mt-3">${data.current.temp_c}°</h1>
                <p class="text-xl text-white/90 mt-1">${data.current.condition.text}</p>
                <p class="text-sm text-white/70 mt-1"><i class="fa-regular fa-clock mr-1"></i> Last updated: ${lastUpdated}</p>
            </div>
            <div class="text-right">
                <img src="https:${data.current.condition.icon}" class="w-24 h-24 md:w-28 md:h-28 -mt-4">
                <button id="favBtn" class="block mt-2 text-3xl text-white ml-auto hover:scale-110 transition-transform duration-300">
                    <i class="fa-regular fa-heart"></i>
                </button>
            </div>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div class="bg-white/20 dark:bg-white/10 rounded-xl p-3 text-center text-white backdrop-blur-sm hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300">
                <i class="fa-solid fa-droplet text-2xl block mb-1"></i>
                <p class="text-xs opacity-80">Humidity</p>
                <p class="font-bold text-lg">${data.current.humidity}%</p>
            </div>
            <div class="bg-white/20 dark:bg-white/10 rounded-xl p-3 text-center text-white backdrop-blur-sm hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300">
                <i class="fa-solid fa-wind text-2xl block mb-1"></i>
                <p class="text-xs opacity-80">Wind</p>
                <p class="font-bold text-lg">${data.current.wind_kph} km/h</p>
            </div>
            <div class="bg-white/20 dark:bg-white/10 rounded-xl p-3 text-center text-white backdrop-blur-sm hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300">
                <i class="fa-solid fa-temperature-half text-2xl block mb-1"></i>
                <p class="text-xs opacity-80">Feels Like</p>
                <p class="font-bold text-lg">${data.current.feelslike_c}°</p>
            </div>
            <div class="bg-white/20 dark:bg-white/10 rounded-xl p-3 text-center text-white backdrop-blur-sm hover:bg-white/30 dark:hover:bg-white/20 transition-all duration-300">
                <i class="fa-solid fa-eye text-2xl block mb-1"></i>
                <p class="text-xs opacity-80">Visibility</p>
                <p class="font-bold text-lg">${data.current.vis_km} km</p>
            </div>
        </div>
    </div>
    `;
    const favBtn = document.getElementById("favBtn");
    const city = data.location.name;
    if (favourites.includes(city)) {
        favBtn.innerHTML = `<i class="fa-solid fa-heart" style="color: #ef4444;"></i>`;
    }
    favBtn.addEventListener("click", () => {
        if (favourites.includes(city)) {
            showToast(`${city} already in favourites`, "warning");
            return;
        }
        favourites.push(city);
        localStorage.setItem("favourites", JSON.stringify(favourites));
        renderFavourites();
        favBtn.innerHTML = `<i class="fa-solid fa-heart" style="color: #ef4444;"></i>`;
        showToast(`${city} added to favourites`, "success");
    });
}

// SKELETON
function showForecastSkeleton() {
    const forecastContainer = document.getElementById("forecastContainer");
    let html = "";
    for (let i = 0; i < 5; i++) {
        html += `<div class="animate-pulse rounded-2xl h-44 bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600"></div>`;
    }
    forecastContainer.innerHTML = html;
}
function showWeatherSkeleton() {
    const weatherCard = document.getElementById("weatherCard");
    weatherCard.innerHTML = `
        <div class="rounded-3xl p-8 animate-pulse bg-gray-200 dark:bg-slate-700/50 border border-gray-300 dark:border-slate-600">
            <div class="flex justify-between">
                <div>
                    <div class="h-6 w-40 bg-gray-300 dark:bg-slate-600 rounded mb-4"></div>
                    <div class="h-20 w-24 bg-gray-300 dark:bg-slate-600 rounded mb-4"></div>
                    <div class="h-6 w-32 bg-gray-300 dark:bg-slate-600 rounded"></div>
                </div>
                <div>
                    <div class="h-24 w-24 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
                </div>
            </div>
        </div>
    `;
}

// WEATHER API
async function getWeather(city) {
    try {
        showWeatherSkeleton();
        showForecastSkeleton();
        errorContainer.classList.add("hidden");
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`);
        if (!response.ok) throw new Error("City not found");
        const data = await response.json();
        renderCurrentWeather(data);
        lastSearchedCity = city;
        getForecast(city);
        showToast(`${city} weather loaded`, "success");
    } catch (error) {
        errorContainer.classList.remove("hidden");
        showToast("City not found. Please try again.", "error");
    }
}

// FORECAST
async function getForecast(city) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=5`);
        if (!response.ok) throw new Error();
        const data = await response.json();
        renderForecast(data);
        renderChart(data);
    } catch (error) {
        showToast("Unable to load forecast", "error");
    }
}
function renderForecast(data) {
    const forecastContainer = document.getElementById("forecastContainer");
    let html = "";
    data.forecast.forecastday.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const dayDate = date.getDate();
        html += `
        <div class="rounded-2xl p-4 h-44 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-200 dark:border-blue-400/20 flex flex-col items-center justify-center text-center hover:shadow-lg hover:scale-105 transition-all duration-300">
            <p class="font-medium text-gray-700 dark:text-white">${dayName} <span class="text-sm opacity-60">${dayDate}</span></p>
            <img src="https:${day.day.condition.icon}" class="w-14 h-14 my-1">
            <p class="font-bold text-gray-800 dark:text-white text-lg">${Math.round(day.day.maxtemp_c)}°</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">${Math.round(day.day.mintemp_c)}°</p>
        </div>
        `;
    });
    forecastContainer.innerHTML = html;
}

// render chart
function renderChart(data) {
    const ctx = document.getElementById("tempChart");
    const hours = data.forecast.forecastday[0].hour.slice(0, 8);
    const labels = hours.map(h => formatTime(h.time));
    const temps = hours.map(h => h.temp_c);
    if (tempChart) tempChart.destroy();
    

    const isDark = document.documentElement.classList.contains("dark");
    
    tempChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature °C",
                data: temps,
                borderColor: "#60a5fa",
                backgroundColor: "rgba(96, 165, 250, 0.15)",
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: "#60a5fa",
                pointBorderColor: "white",
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 9
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: isDark ? "#ffffff" : "#1e293b",
                        font: { size: 14, weight: "bold" }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { 
                        color: isDark ? "#ffffff" : "#1e293b",
                        font: { size: 12 }
                    },
                    grid: { 
                        color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)" 
                    }
                },
                y: {
                    ticks: { 
                        color: isDark ? "#ffffff" : "#1e293b",
                        font: { size: 12 }
                    },
                    grid: { 
                        color: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.08)" 
                    }
                }
            }
        }
    });
}

// FAVOURITES
function renderFavourites() {
    const savedCities = document.getElementById("savedCities");
    savedCities.innerHTML = "";
    if (favourites.length === 0) {
        savedCities.innerHTML = `
            <div class="text-center py-6 text-gray-400 dark:text-gray-500 text-sm">
                <i class="fa-regular fa-heart text-3xl block mb-2"></i>
                No saved cities yet
            </div>
        `;
        return;
    }
    favourites.forEach(city => {
        const btn = document.createElement("button");
        btn.className = `w-full text-left rounded-xl p-3 bg-white/60 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/20 text-gray-800 dark:text-white hover:bg-blue-50 dark:hover:bg-blue-500/20 transition-all duration-300 flex justify-between items-center group`;
        btn.innerHTML = `
            <span class="flex items-center gap-2">
                <i class="fa-solid fa-location-dot text-blue-400"></i>
                ${city}
            </span>
            <i class="fa-solid fa-trash-can text-red-400/50 hover:text-red-500 transition-all duration-300 opacity-0 group-hover:opacity-100 text-sm"></i>
        `;
        btn.addEventListener("click", (e) => {
            if (e.target.classList.contains("fa-trash-can")) {
                e.stopPropagation();
                favourites = favourites.filter(c => c !== city);
                localStorage.setItem("favourites", JSON.stringify(favourites));
                renderFavourites();
                showToast(`${city} removed from favourites`, "info");
            } else {
                getWeather(city);
                showToast(`Loading ${city}...`, "info");
            }
        });
        savedCities.appendChild(btn);
    });
}
renderFavourites();

// GEOLOCATION
locationBtn.addEventListener("click", () => {
    showToast("Fetching your location...", "info");
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            try {
                showWeatherSkeleton();
                showForecastSkeleton();
                const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}`);
                if (!response.ok) throw new Error();
                const data = await response.json();
                renderCurrentWeather(data);
                const cityName = data.location.name;
                getForecast(cityName);
                lastSearchedCity = cityName;
                showToast("Location weather loaded", "success");
            } catch (error) {
                showToast("Unable to fetch location weather", "error");
            }
        },
        () => {
            showToast("Location access denied. Please search manually.", "error");
        }
    );
});

// RETRY BUTTON
const retryBtn = document.getElementById("retryBtn");
retryBtn.addEventListener("click", () => {
    const searchInput = document.getElementById("searchInput");
    const city = searchInput.value.trim() || lastSearchedCity;
    if (city) {
        getWeather(city);
        showToast("Retrying...", "info");
    } else {
        showToast("Please enter a city name", "warning");
    }
});
// SEARCH
const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const city = searchInput.value.trim();
    debounceTimer = setTimeout(() => {
        if (city.length > 2) getWeather(city);
    }, 800);
});
searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const city = searchInput.value.trim();
        if (city.length > 2) {
            clearTimeout(debounceTimer);
            getWeather(city);
        } else {
            showToast("Please enter at least 3 characters", "warning");
        }
    }
});
// DEFAULT CITY
getWeather("Karachi");