import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  Sun, 
  CloudDrizzle,
  Wind,
  Droplets,
  Thermometer,
  CloudFog,
  CloudLightning,
  Loader
} from 'lucide-react';

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState('Airoli, IN'); // Default location

  // Replace with your OpenWeatherMap API key
  const API_KEY = '1298ab0bf055e5c20c1b2c147162fe78'; // 👈 ADD YOUR KEY HERE

  useEffect(() => {
    fetchWeather();
    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);   
  }, []);

  const fetchWeather = async () => {
    try {
      setLoading(true);
      
      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeatherData(latitude, longitude);
          },
          async (err) => {
            // Fallback to default location if geolocation fails
            console.log('Geolocation error, using default location');
            await fetchWeatherByCity('Airoli,IN');
          }
        );
      } else {
        // Fallback if geolocation not supported
        await fetchWeatherByCity('Airoli,IN');
      }
    } catch (err) {
      setError('Unable to fetch weather');
      setLoading(false);
    }
  };

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      
      if (!response.ok) throw new Error('Weather data unavailable');
      
      const data = await response.json();
      setWeather(data);
      setLocation(`${data.name}, ${data.sys.country}`);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Weather unavailable');
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (city) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );
      
      if (!response.ok) throw new Error('Weather data unavailable');
      
      const data = await response.json();
      setWeather(data);
      setLocation(`${data.name}, ${data.sys.country}`);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Weather unavailable');
      setLoading(false);
    }
  };

  const getWeatherIcon = (weatherCode, isDay = true) => {
    const iconClass = "w-6 h-6";
    
    // Weather codes from OpenWeatherMap
    if (weatherCode >= 200 && weatherCode < 300) {
      return <CloudLightning className={`${iconClass} text-yellow-400`} />;
    } else if (weatherCode >= 300 && weatherCode < 400) {
      return <CloudDrizzle className={`${iconClass} text-blue-300`} />;
    } else if (weatherCode >= 500 && weatherCode < 600) {
      return <CloudRain className={`${iconClass} text-blue-500`} />;
    } else if (weatherCode >= 600 && weatherCode < 700) {
      return <CloudSnow className={`${iconClass} text-blue-200`} />;
    } else if (weatherCode >= 700 && weatherCode < 800) {
      return <CloudFog className={`${iconClass} text-gray-400`} />;
    } else if (weatherCode === 800) {
      return <Sun className={`${iconClass} text-yellow-400`} />;
    } else if (weatherCode > 800) {
      return <Cloud className={`${iconClass} text-gray-400`} />;
    }
    
    return <Sun className={`${iconClass} text-yellow-400`} />;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-lg">
        <Loader className="w-5 h-5 text-white animate-spin" />
        <span className="text-white text-sm">Loading weather...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-lg">
        <Cloud className="w-5 h-5 text-white" />
        <span className="text-white text-sm">Weather unavailable</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-lg">
      {/* Weather Icon */}
      <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
        {getWeatherIcon(weather.weather[0].id)}
      </div>
      
      {/* Weather Info */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-lg">
            {Math.round(weather.main.temp)}°C
          </span>
        </div>
        <span className="text-white/80 text-xs">
          {weather.weather[0].description}
        </span>
      </div>

      {/* Additional Info */}
      <div className="hidden md:flex items-center gap-3 ml-2 pl-3 border-l border-white/30">
        <div className="flex items-center gap-1">
          <Droplets className="w-4 h-4 text-blue-200" />
          <span className="text-white text-sm">{weather.main.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind className="w-4 h-4 text-white" />
          <span className="text-white text-sm">{Math.round(weather.wind.speed)} km/h</span>
        </div>
      </div>

      {/* Location */}
      <div className="hidden lg:block ml-2 pl-3 border-l border-white/30">
        <span className="text-white/80 text-xs">{location}</span>
      </div>
    </div>
  );
}