# 🌤️ Weather Dashboard

A beautiful, responsive weather dashboard that shows real-time weather data, 5-day forecast, and hourly temperature charts. Built with vanilla JavaScript, Tailwind CSS, and WeatherAPI.com.

---

## ✨ Features

- 🔍 **City Search** — Search any city with debouncing (800ms delay)
- 📍 **Geolocation** — Auto-detect your location and show weather
- 🌡️ **Current Weather** — Temperature, humidity, wind speed, feels like, visibility
- 📅 **5-Day Forecast** — Daily forecast with min/max temperature and icons
- 📊 **Hourly Chart** — Line chart showing 8-hour temperature trend (Chart.js)
- ❤️ **Favourites** — Save cities to localStorage with one click
- 🌙 **Dark/Light Mode** — Toggle themes with persistent storage
- 🍞 **Toast Notifications** — Success, error, info, warning with auto-dismiss
- ⏳ **Loading Skeletons** — Animated placeholders while data loads
- 🔄 **Error Handling** — Retry button on API failures
- 📱 **Responsive** — Works on all screen sizes

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **HTML5** | Structure |
| **Tailwind CSS** | Styling (CDN) |
| **Vanilla JavaScript** | Logic| 
| **WeatherAPI.com** | Weather data API |
| **Chart.js** | Temperature charts (CDN) |
| **Font Awesome** | Icons |

---

## 🏗️ Project Structure

```
weather-dashboard/
├── index.html          # Main HTML file
├── config.js           # API key configuration
├── main.js             # All JavaScript logic
├── README.md           # Project documentation
```

---

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/weather-dashboard.git
cd weather-dashboard
```

### 2. Get API Key
1. Go to [WeatherAPI.com](https://www.weatherapi.com)
2. Sign up for a **free account**
3. Copy your **API key** from the dashboard

### 3. Add API Key
Open `config.js` and add your key:
```javascript
const API_KEY = "YOUR_API_KEY_HERE";
```

### 4. Run Locally
Simply open `index.html` in your browser, or use Live Server:
```bash
# Using VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

---

## 📦 API Endpoints Used

| Endpoint | Purpose |
|----------|---------|
| `/v1/current.json` | Current weather data |
| `/v1/forecast.json` | 5-day forecast (with hourly data) |

**Example URLs:**
```javascript
// Current Weather
https://api.weatherapi.com/v1/current.json?key=API_KEY&q=Karachi

// Forecast
https://api.weatherapi.com/v1/forecast.json?key=API_KEY&q=Karachi&days=5
```

---

## 🎯 Features in Detail

### Search with Debouncing
- User types city name
- Waits 800ms after typing stops
- Only searches if city name > 2 characters

### Toast Notifications
- **Success** (green) — "Karachi added to favourites"
- **Error** (red) — "City not found. Please try again."
- **Info** (blue) — "Fetching your location..."
- **Warning** (amber) — "Karachi already in favourites"
- Auto-dismiss after 3 seconds
- Multiple toasts stack vertically

### Favourites
- Click heart icon to save city
- Saved to browser localStorage
- Click saved city to load weather
- Trash icon to remove from favourites
- Heart turns red when city is saved

### Dark Mode
- Toggle with moon/sun icon
- Preference saved in localStorage
- Smooth transitions on all elements

### Geolocation
- Click location button
- Browser asks for permission
- Auto-fetches weather for current location
- Shows error if permission denied

---