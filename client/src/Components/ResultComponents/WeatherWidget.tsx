import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cloud, Sun, CloudRain, Wind, ThermometerSun } from "lucide-react";
import { WeatherData, WeatherWidgetProps } from "@/hooks/types";


const WeatherWidget: React.FC<WeatherWidgetProps> = ({ label, coords }) => {
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${coords[0]}&longitude=${coords[1]}&current_weather=true`
        );
        const json = await res.json();
        setData(json.current_weather);
      } catch (err) {
        console.error("Weather fetch failed:", err);
      }
    };
    fetchWeather();
  }, [coords]);

  const getIcon = (code: number) => {
    if (code === 0) return <Sun className="text-yellow-400 w-6 h-6" />;
    if (code < 4) return <Cloud className="text-gray-400 w-6 h-6" />;
    if (code >= 51 && code <= 67) return <CloudRain className="text-blue-400 w-6 h-6" />;
    return <ThermometerSun className="text-orange-500 w-6 h-6" />;
  };

  if (!data)
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <span>Loading weather...</span>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-between bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl px-4 py-3 border border-white/30 shadow-md w-full sm:w-[280px]"
    >
      <div className="flex items-center gap-3">
        {getIcon(data.weathercode)}
        <div>
          <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">{data.temperature}°C</p>
        </div>
      </div>
      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
        <Wind className="w-4 h-4" />
        <span>{data.windspeed} km/h</span>
      </div>
    </motion.div>
  );
};

export default WeatherWidget;
