import React from "react";
import { MapPin, Flag, ArrowRight, Clock, Car } from "lucide-react";
import { TripSummaryCardProps } from "@/hooks/types";
import WeatherWidget from "./WeatherWidget";
import { motion } from "framer-motion";

const TripSummaryCard: React.FC<TripSummaryCardProps> = ({ tripData }) => {
  const formatDistance = (meters: number) =>
    meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters.toFixed(0)} m`;

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m} min`;
  };

  function normalizeCoords(
    coords?: number[]
  ): [number, number] | null {
    if (!coords || coords.length !== 2) return null;

    const [lng, lat] = coords;
    return [lat, lng];
  }

  const sourceCoords = tripData.route?.[0];
  const destinationCoords = tripData.route?.[tripData.route.length - 1];

  return (
    <div className="bg-white/95 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 mb-12 transition-all duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6">

        {/* Source */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{tripData.source}</h3>
            <p className="text-sm text-gray-500">Source Point</p>
          </div>
        </div>

        {/* Route Info */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <ArrowRight className="w-6 h-6 text-gray-400 rotate-90 sm:rotate-0" />
          <div className="flex gap-2">
            <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
              <Car className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold">
                {formatDistance(tripData.distance)}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold">
                {formatDuration(tripData.duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <h3 className="font-bold text-lg">{tripData.destination}</h3>
            <p className="text-sm text-gray-500">Destination Point</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Flag className="w-6 h-6 text-red-500" />
          </div>
        </div>
      </div>

      {/* Weather */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex flex-col sm:flex-row justify-center gap-4"
      >
        {normalizeCoords(sourceCoords) && (
          <WeatherWidget
            label="Source Weather"
            coords={normalizeCoords(sourceCoords)!}
          />
        )}

        {normalizeCoords(destinationCoords) && (
          <WeatherWidget
            label="Destination Weather"
            coords={normalizeCoords(destinationCoords)!}
          />
        )}
      </motion.div>
    </div>
  );
};

export default TripSummaryCard;