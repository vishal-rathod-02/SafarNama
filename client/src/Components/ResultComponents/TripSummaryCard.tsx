import React from "react";
import { MapPin, Flag, Clock, Car, Navigation } from "lucide-react";
import { TripSummaryCardProps } from "@/hooks/types";
import WeatherWidget from "./WeatherWidget";
import { motion, AnimatePresence } from "framer-motion";

const TripSummaryCard: React.FC<TripSummaryCardProps> = ({
  tripData,
  sourceCoords: propSourceCoords,
  destinationCoords: propDestinationCoords
}) => {
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

  // Resolve coordinates: props coordinates are already [lat, lng], route coordinates are [lng, lat]
  const resolvedSourceCoords = propSourceCoords || (tripData.route?.[0] ? normalizeCoords(tripData.route[0]) : null);
  const resolvedDestinationCoords = propDestinationCoords || (tripData.route?.[tripData.route.length - 1] ? normalizeCoords(tripData.route[tripData.route.length - 1]) : null);

  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-100 dark:border-gray-700 p-6 md:p-8 mb-8 transition-all duration-300">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">

        {/* Source Panel */}
        <motion.div
          className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100/50 w-full md:w-auto"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
            <MapPin className="w-6 h-6 text-blue-500" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 truncate max-w-[200px]" title={tripData.source}>
              {tripData.source.split(",")[0]}
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Source Point</p>
          </div>
        </motion.div>

        {/* Visual Progress Connector Line */}
        <div className="hidden md:flex flex-col items-center grow mx-6 relative">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cruising Path</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDistance(tripData.distance)}</span>
          </div>

          {/* Dashed Line */}
          <div className="w-full h-1 bg-linear-to-r from-blue-400 via-green-400 to-red-400 rounded-full relative">
            {/* Animating Car */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white z-10"
              animate={{ left: ["5%", "95%", "5%"] }}
              transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
            >
              <Car className="w-4 h-4" />
            </motion.div>
          </div>

          <div className="flex gap-3 mt-3">
            <div className="flex items-center gap-1 bg-green-50 dark:bg-green-950/30 px-2.5 py-1 rounded-lg border border-green-100/50">
              <Navigation className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-bold text-green-700 dark:text-green-400">
                {formatDistance(tripData.distance)}
              </span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-1 rounded-lg border border-blue-100/50">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                {formatDuration(tripData.duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Info Badges */}
        <div className="flex md:hidden gap-3 w-full justify-center">
          <div className="flex items-center gap-1.5 bg-green-50 dark:bg-green-950/30 px-3 py-1.5 rounded-xl border border-green-100/50">
            <Car className="w-4 h-4 text-green-600" />
            <span className="text-xs font-bold text-green-700 dark:text-green-400">{formatDistance(tripData.distance)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-xl border border-blue-100/50">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">{formatDuration(tripData.duration)}</span>
          </div>
        </div>

        {/* Destination Panel */}
        <motion.div
          className="flex items-center gap-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-100/50 w-full md:w-auto md:text-right"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-full min-w-0 md:order-1 order-2">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 truncate max-w-[200px]" title={tripData.destination}>
              {tripData.destination.split(",")[0]}
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Destination Point</p>
          </div>
          <div className="w-12 h-12 bg-red-500/10 dark:bg-red-500/20 rounded-xl flex items-center justify-center shrink-0 md:order-2 order-1">
            <Flag className="w-6 h-6 text-red-500" />
          </div>
        </motion.div>

      </div>

      {/* Weather Indicator Section */}
      <AnimatePresence>
        {(resolvedSourceCoords || resolvedDestinationCoords) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            {resolvedSourceCoords && (
              <WeatherWidget
                label={`${tripData.source.split(",")[0]} Weather`}
                coords={resolvedSourceCoords}
              />
            )}

            {resolvedDestinationCoords && (
              <WeatherWidget
                label={`${tripData.destination.split(",")[0]} Weather`}
                coords={resolvedDestinationCoords}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TripSummaryCard;