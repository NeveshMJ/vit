import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCvE6g6v9Bc2jNG0LEK1v1QaWyFiO_cPag';

const WMO_CODES = {
  0: { desc: 'Clear sky', icon: '☀️' },
  1: { desc: 'Mainly clear', icon: '🌤️' },
  2: { desc: 'Partly cloudy', icon: '⛅' },
  3: { desc: 'Overcast', icon: '☁️' },
  45: { desc: 'Foggy', icon: '🌫️' },
  48: { desc: 'Depositing rime fog', icon: '🌫️' },
  51: { desc: 'Light drizzle', icon: '🌦️' },
  53: { desc: 'Moderate drizzle', icon: '🌦️' },
  55: { desc: 'Dense drizzle', icon: '🌧️' },
  56: { desc: 'Freezing drizzle', icon: '🌧️' },
  57: { desc: 'Heavy freezing drizzle', icon: '🌧️' },
  61: { desc: 'Slight rain', icon: '🌦️' },
  63: { desc: 'Moderate rain', icon: '🌧️' },
  65: { desc: 'Heavy rain', icon: '🌧️' },
  66: { desc: 'Freezing rain', icon: '🌧️' },
  67: { desc: 'Heavy freezing rain', icon: '🌧️' },
  71: { desc: 'Slight snow', icon: '🌨️' },
  73: { desc: 'Moderate snow', icon: '🌨️' },
  75: { desc: 'Heavy snow', icon: '❄️' },
  77: { desc: 'Snow grains', icon: '❄️' },
  80: { desc: 'Slight showers', icon: '🌦️' },
  81: { desc: 'Moderate showers', icon: '🌧️' },
  82: { desc: 'Violent showers', icon: '⛈️' },
  85: { desc: 'Slight snow showers', icon: '🌨️' },
  86: { desc: 'Heavy snow showers', icon: '🌨️' },
  95: { desc: 'Thunderstorm', icon: '⛈️' },
  96: { desc: 'Thunderstorm with hail', icon: '⛈️' },
  99: { desc: 'Thunderstorm with heavy hail', icon: '⛈️' }
};

const tamilNaduCities = [
  { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558 },
  { name: 'Madurai', lat: 9.9252, lng: 78.1198 },
  { name: 'Tiruchirappalli', lat: 10.7905, lng: 78.7047 },
  { name: 'Salem', lat: 11.6643, lng: 78.146 },
  { name: 'Tirunelveli', lat: 8.7139, lng: 77.7567 },
  { name: 'Erode', lat: 11.341, lng: 77.7172 },
  { name: 'Vellore', lat: 12.9165, lng: 79.1325 },
  { name: 'Thoothukudi', lat: 8.7642, lng: 78.1348 },
  { name: 'Dindigul', lat: 10.3673, lng: 77.9803 },
  { name: 'Thanjavur', lat: 10.787, lng: 79.1378 },
  { name: 'Ranipet', lat: 12.9321, lng: 79.3328 },
  { name: 'Sivaganga', lat: 10.0035, lng: 78.3633 },
  { name: 'Karur', lat: 10.9601, lng: 78.0766 },
  { name: 'Namakkal', lat: 11.2189, lng: 78.1674 },
  { name: 'Tiruppur', lat: 11.1085, lng: 77.3411 },
  { name: 'Cuddalore', lat: 11.748, lng: 79.7714 },
  { name: 'Kanchipuram', lat: 12.8342, lng: 79.7036 },
  { name: 'Tiruvannamalai', lat: 12.2253, lng: 79.0747 },
  { name: 'Villupuram', lat: 11.9401, lng: 79.4861 },
  { name: 'Nagapattinam', lat: 10.766, lng: 79.8424 },
  { name: 'Ramanathapuram', lat: 9.3639, lng: 78.8395 },
  { name: 'Virudhunagar', lat: 9.5681, lng: 77.9624 },
  { name: 'Krishnagiri', lat: 12.5186, lng: 78.2137 },
  { name: 'Dharmapuri', lat: 12.1211, lng: 78.1582 },
  { name: 'Perambalur', lat: 11.233, lng: 78.8807 },
  { name: 'Ariyalur', lat: 11.14, lng: 79.0756 },
  { name: 'Nilgiris', lat: 11.4916, lng: 76.7337 },
  { name: 'Pudukkottai', lat: 10.3833, lng: 78.82 },
  { name: 'Theni', lat: 10.0104, lng: 77.4768 },
  { name: 'Kanyakumari', lat: 8.0883, lng: 77.5385 },
  { name: 'Kallakurichi', lat: 11.7384, lng: 78.9617 },
  { name: 'Chengalpattu', lat: 12.6819, lng: 79.9888 },
  { name: 'Tiruvallur', lat: 13.1431, lng: 79.9088 },
  { name: 'Tenkasi', lat: 8.9604, lng: 77.3152 },
  { name: 'Tirupattur', lat: 12.4966, lng: 78.5732 },
  { name: 'Mayiladuthurai', lat: 11.1018, lng: 79.6491 }
];

function WeatherReport() {
  const [selectedCity, setSelectedCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [myLocationWeather, setMyLocationWeather] = useState(null);
  const [myLocationName, setMyLocationName] = useState('');
  const [myLocationCoords, setMyLocationCoords] = useState(null);
  const [myLocationAccuracy, setMyLocationAccuracy] = useState(null);
  const [myLocationLoading, setMyLocationLoading] = useState(false);
  const [myLocationSource, setMyLocationSource] = useState('');

  // Retry wrapper for network requests (handles ERR_NETWORK_CHANGED)
  const fetchWithRetry = useCallback(async (url, retries = 3, delay = 1500) => {
    for (let i = 0; i < retries; i++) {
      try {
        const res = await fetch(url);
        if (res.ok) return res;
        throw new Error(`HTTP ${res.status}`);
      } catch (err) {
        if (i < retries - 1) {
          await new Promise(r => setTimeout(r, delay * (i + 1)));
        } else {
          throw err;
        }
      }
    }
  }, []);

  // Reverse-geocode with Google Maps Geocoding API to get real city/state name
  const reverseGeocode = useCallback(async (latitude, longitude) => {
    try {
      const res = await fetchWithRetry(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=en`
      );
      const data = await res.json();
      if (data.status === 'OK' && data.results.length > 0) {
        const components = data.results[0].address_components;
        let city = '', state = '';
        for (const c of components) {
          if (c.types.includes('locality')) city = c.long_name;
          if (c.types.includes('administrative_area_level_1')) state = c.long_name;
          if (!city && c.types.includes('administrative_area_level_2')) city = c.long_name;
          if (!city && c.types.includes('sublocality_level_1')) city = c.long_name;
        }
        if (city && state) return `${city}, ${state}`;
        if (city) return city;
        if (state) return state;
        return data.results[0].formatted_address.split(',').slice(0, 2).join(',').trim();
      }
    } catch (err) {
      // Reverse geocode failed — fall back to raw coordinates
    }
    return `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E`;
  }, [fetchWithRetry]);

  const fetchWeatherData = useCallback(async (lat, lng) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset,uv_index_max&timezone=Asia/Kolkata&forecast_days=7`;
    const res = await fetchWithRetry(url);
    return res.json();
  }, [fetchWithRetry]);

  // Update weather for given coordinates
  const updateLocationWeather = useCallback(async (latitude, longitude, accuracy, source) => {
    try {
      setMyLocationCoords({ lat: latitude, lng: longitude });
      setMyLocationAccuracy(Math.round(accuracy || 0));
      setMyLocationSource(source);

      const placeName = await reverseGeocode(latitude, longitude);
      setMyLocationName(placeName);

      const weatherData = await fetchWeatherData(latitude, longitude);
      setMyLocationWeather(weatherData);
    } catch (err) {
      // Weather fetch failed — UI shows retry option
    } finally {
      setMyLocationLoading(false);
    }
  }, [reverseGeocode, fetchWeatherData]);

  // Auto-detect location — GPS/browser geolocation only (no IP fallback)
  const detectLocation = useCallback(() => {
    setMyLocationLoading(true);
    setMyLocationName('');
    setMyLocationWeather(null);
    setMyLocationCoords(null);
    setMyLocationSource('');
    setMyLocationAccuracy(null);

    let watchId = null;
    let cancelled = false;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          if (cancelled) return;
          const { latitude, longitude, accuracy } = pos.coords;
          await updateLocationWeather(latitude, longitude, accuracy, `GPS (±${Math.round(accuracy)}m)`);

          // Once we get a good fix (< 500m accuracy), stop watching
          if (accuracy < 500 && watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
          }
        },
        (err) => {
          if (cancelled) return;
          setMyLocationLoading(false);
          setMyLocationName('Location access denied or unavailable. Please allow location access and try again.');
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0
        }
      );

      // Auto-stop watching after 60 seconds
      setTimeout(() => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
      }, 60000);
    } else {
      setMyLocationLoading(false);
      setMyLocationName('Geolocation is not supported by your browser.');
    }

    // Return cleanup
    return () => {
      cancelled = true;
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
    };
  }, [updateLocationWeather]);

  // Run on mount
  useEffect(() => {
    const cleanup = detectLocation();
    return cleanup;
  }, [detectLocation]);

  const selectCity = async (city) => {
    setSelectedCity(city);
    setLoading(true);
    setError('');
    try {
      const data = await fetchWeatherData(city.lat, city.lng);
      setWeather(data);
      setForecast(data.daily);
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherInfo = (code) => WMO_CODES[code] || { desc: 'Unknown', icon: '🌡️' };

  const windDirection = (deg) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return dirs[Math.round(deg / 45) % 8];
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="user" />
      <div className="main-content">
        <div className="page-header">
          <div>
            <h1>🌤️ Live Weather Report</h1>
            <p>Search for any town or area and view the live weather conditions</p>
          </div>
        </div>

        {/* My Location Weather (auto-detected) */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '16px', padding: '24px', marginBottom: '24px', color: 'white',
          boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <p style={{ fontSize: '13px', opacity: 0.8, fontWeight: 500, margin: 0 }}>📡 YOUR CURRENT LOCATION</p>
            <button onClick={() => detectLocation()} disabled={myLocationLoading}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.4)',
                background: myLocationLoading ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                color: '#fff', cursor: myLocationLoading ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => !myLocationLoading && (e.target.style.background = 'rgba(255,255,255,0.35)')}
              onMouseLeave={e => (e.target.style.background = 'rgba(255,255,255,0.2)')}
            >
              {myLocationLoading ? '⏳ Detecting...' : '🔄 Refresh Location'}
            </button>
          </div>
          {myLocationLoading && !myLocationWeather ? (
            <div style={{ textAlign: 'center', padding: '12px' }}>
              <div className="spinner" style={{ margin: '0 auto 8px', borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}></div>
              <p style={{ opacity: 0.8, margin: 0 }}>Detecting your location...</p>
              <p style={{ opacity: 0.5, fontSize: '11px', margin: '4px 0 0' }}>Using GPS for accurate location — please allow location access</p>
            </div>
          ) : myLocationWeather ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px' }}>📍 {myLocationName}</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '48px' }}>{getWeatherInfo(myLocationWeather.current.weather_code).icon}</span>
                    <div>
                      <p style={{ fontSize: '36px', fontWeight: 800, margin: 0 }}>{Math.round(myLocationWeather.current.temperature_2m)}°C</p>
                      <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>{getWeatherInfo(myLocationWeather.current.weather_code).desc}</p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', opacity: 0.9 }}>
                  <span>💧 Humidity: {myLocationWeather.current.relative_humidity_2m}%</span>
                  <span>💨 Wind: {myLocationWeather.current.wind_speed_10m} km/h</span>
                  <span>🌡️ Feels: {Math.round(myLocationWeather.current.apparent_temperature)}°C</span>
                  <span>☔ Rain: {myLocationWeather.current.precipitation}mm</span>
                </div>
              </div>
              {/* Debug info: coordinates, accuracy, source */}
              <div style={{
                marginTop: '12px', padding: '8px 12px', background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px', fontSize: '11px', opacity: 0.7, display: 'flex', gap: '16px', flexWrap: 'wrap'
              }}>
                {myLocationCoords && (
                  <span>🌐 {myLocationCoords.lat.toFixed(4)}°N, {myLocationCoords.lng.toFixed(4)}°E</span>
                )}
                {myLocationAccuracy !== null && <span>🎯 Accuracy: ±{myLocationAccuracy}m</span>}
                {myLocationSource && <span>📶 Source: {myLocationSource}</span>}
                {myLocationLoading && <span>🔄 Improving...</span>}
              </div>
            </div>
          ) : (
            <div>
              <p style={{ opacity: 0.7, fontSize: '13px', margin: '0 0 8px' }}>
                ⚠️ Unable to detect location — network may be unstable.
              </p>
              <button onClick={() => detectLocation()}
                style={{
                  padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.4)',
                  background: 'rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer',
                  fontSize: '13px', fontWeight: 600
                }}>
                🔄 Try Again
              </button>
            </div>
          )}
        </div>

        {/* Location Dropdown */}
        <div style={{ ...cardStyle, marginBottom: '24px' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 700, color: '#1e3a8a' }}>📍 Select Location Weather</h3>
          <select
            value={selectedCity?.name || ''}
            onChange={(e) => {
              const city = tamilNaduCities.find(c => c.name === e.target.value);
              if (city) selectCity(city);
            }}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: '12px',
              border: '2px solid #e5e7eb', fontSize: '15px', outline: 'none',
              background: '#fff', color: selectedCity ? '#1e3a8a' : '#6b7280',
              cursor: 'pointer', fontWeight: selectedCity ? 600 : 400,
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#2563eb'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          >
            <option value="" disabled>— Choose a city or district —</option>
            {tamilNaduCities.map(city => (
              <option key={city.name} value={city.name}>{city.name}</option>
            ))}
          </select>
        </div>

        {error && <div className="error-msg" style={{ marginBottom: '16px' }}>{error}</div>}

        {loading && (
          <div className="loading" style={{ padding: '40px' }}>
            <div className="spinner"></div> Fetching live weather...
          </div>
        )}

        {/* Weather Detail for selected city */}
        {weather && selectedCity && !loading && (
          <>
            {/* Current Weather Card */}
            <div style={{
              background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 50%, #0ea5e9 100%)',
              borderRadius: '16px', padding: '28px', marginBottom: '20px', color: 'white',
              boxShadow: '0 8px 30px rgba(30, 58, 138, 0.25)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px' }}>{selectedCity.name}</h2>
                  <p style={{ fontSize: '13px', opacity: 0.7 }}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                    <span style={{ fontSize: '64px' }}>{getWeatherInfo(weather.current.weather_code).icon}</span>
                    <div>
                      <p style={{ fontSize: '52px', fontWeight: 900, margin: 0, lineHeight: 1 }}>{Math.round(weather.current.temperature_2m)}°C</p>
                      <p style={{ fontSize: '16px', opacity: 0.9, margin: '4px 0 0', fontWeight: 500 }}>
                        {getWeatherInfo(weather.current.weather_code).desc}
                      </p>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {[
                    { label: 'Feels Like', val: `${Math.round(weather.current.apparent_temperature)}°C`, icon: '🌡️' },
                    { label: 'Humidity', val: `${weather.current.relative_humidity_2m}%`, icon: '💧' },
                    { label: 'Wind', val: `${weather.current.wind_speed_10m} km/h ${windDirection(weather.current.wind_direction_10m)}`, icon: '💨' },
                    { label: 'Precipitation', val: `${weather.current.precipitation} mm`, icon: '☔' },
                    { label: 'Pressure', val: `${weather.current.surface_pressure} hPa`, icon: '📊' },
                    { label: 'UV Index', val: weather.current.uv_index, icon: '☀️' },
                  ].map((item, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 14px', minWidth: '120px' }}>
                      <p style={{ fontSize: '11px', opacity: 0.7, margin: 0 }}>{item.icon} {item.label}</p>
                      <p style={{ fontSize: '16px', fontWeight: 700, margin: '2px 0 0' }}>{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Sunrise / Sunset */}
              {forecast && (
                <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '13px', opacity: 0.8 }}>
                  <span>🌅 Sunrise: {new Date(forecast.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>🌇 Sunset: {new Date(forecast.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>

            {/* Hourly Forecast (next 24h) */}
            {weather.hourly && (
              <div style={{ ...cardStyle, marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 700 }}>⏰ Hourly Forecast (Next 24 Hours)</h3>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {weather.hourly.time.slice(0, 24).map((time, i) => {
                    const hour = new Date(time).getHours();
                    const isNow = i === new Date().getHours();
                    return (
                      <div key={i} style={{
                        flex: '0 0 70px', textAlign: 'center', padding: '10px 6px',
                        borderRadius: '12px',
                        background: isNow ? 'linear-gradient(135deg, #1e3a8a, #2563eb)' : '#f9fafb',
                        color: isNow ? '#fff' : '#374151', border: isNow ? 'none' : '1px solid #f3f4f6'
                      }}>
                        <p style={{ fontSize: '11px', fontWeight: 600, margin: 0, opacity: isNow ? 1 : 0.6 }}>
                          {isNow ? 'Now' : `${hour}:00`}
                        </p>
                        <p style={{ fontSize: '20px', margin: '4px 0' }}>{getWeatherInfo(weather.hourly.weather_code[i]).icon}</p>
                        <p style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>{Math.round(weather.hourly.temperature_2m[i])}°</p>
                        {weather.hourly.precipitation_probability[i] > 0 && (
                          <p style={{ fontSize: '10px', color: isNow ? 'rgba(255,255,255,0.8)' : '#3b82f6', margin: '2px 0 0' }}>
                            💧{weather.hourly.precipitation_probability[i]}%
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 7-Day Forecast */}
            {forecast && (
              <div style={{ ...cardStyle, marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '16px', fontWeight: 700 }}>📅 7-Day Forecast</h3>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {forecast.time.map((date, i) => {
                    const day = new Date(date);
                    const isToday = i === 0;
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px', borderRadius: '10px',
                        background: isToday ? '#f0f9ff' : '#fafbfc',
                        border: isToday ? '1px solid #bae6fd' : '1px solid #f3f4f6',
                        gap: '12px', flexWrap: 'wrap'
                      }}>
                        <div style={{ flex: '0 0 100px' }}>
                          <p style={{ fontSize: '14px', fontWeight: isToday ? 700 : 600, margin: 0, color: '#374151' }}>
                            {isToday ? 'Today' : day.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div style={{ flex: '0 0 40px', textAlign: 'center' }}>
                          <span style={{ fontSize: '24px' }}>{getWeatherInfo(forecast.weather_code[i]).icon}</span>
                        </div>
                        <p style={{ flex: '1 1 120px', fontSize: '13px', color: '#6b7280', margin: 0 }}>
                          {getWeatherInfo(forecast.weather_code[i]).desc}
                        </p>
                        <div style={{ flex: '0 0 100px', textAlign: 'right' }}>
                          <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '14px' }}>{Math.round(forecast.temperature_2m_max[i])}°</span>
                          <span style={{ color: '#9ca3af', margin: '0 4px' }}>/</span>
                          <span style={{ fontWeight: 600, color: '#3b82f6', fontSize: '14px' }}>{Math.round(forecast.temperature_2m_min[i])}°</span>
                        </div>
                        <div style={{ flex: '0 0 60px', textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
                          ☔ {forecast.precipitation_sum[i]}mm
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Quick City Grid if nothing selected */}
        {!weather && !loading && (
          <div style={{ ...cardStyle }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700 }}>🏙️ Quick Weather - Major Cities</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {tamilNaduCities.slice(0, 12).map(city => (
                <button key={city.name} onClick={() => selectCity(city)} style={{
                  padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb',
                  background: '#fafbfc', cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.2s'
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(30,58,138,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a', margin: 0 }}>📍 {city.name}</p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>Click to view weather</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WeatherReport;


