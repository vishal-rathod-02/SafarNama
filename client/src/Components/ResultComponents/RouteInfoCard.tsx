import { AnimatePresence, motion } from "framer-motion";
import { Navigation, Clock, ChevronDown, ChevronUp } from "lucide-react";
import React, { useState } from "react";

import RestaurantIcon from "@/Assets/MapIcons/restaurant.jpg";
import HotelIcon from "@/Assets/MapIcons/hotel.jpg";
import ScenicIcon from "@/Assets/MapIcons/scenic.jpg";

const formatDistance = (meters: number) =>
  meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters.toFixed(0)} m`;

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m} min`;
};

export const DesktopRouteInfo = ({
  distance,
  duration,
}: {
  distance: number;
  duration: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="
      hidden md:flex
      absolute bottom-5 left-5
      z-1000
      px-5 py-4 rounded-2xl
      bg-white/85 dark:bg-gray-800/85 backdrop-blur-xl
      border border-slate-100 dark:border-gray-700
      shadow-[0_12px_32px_rgba(0,0,0,.15)]
      items-center gap-6
    "
  >
    <div className="flex items-center gap-2">
      <Navigation className="w-5 h-5 text-green-600" />
      <span className="font-bold text-slate-800 dark:text-slate-200">
        {formatDistance(distance)}
      </span>
    </div>

    <div className="w-px h-6 bg-gray-300/60 dark:bg-gray-700" />

    <div className="flex items-center gap-2">
      <Clock className="w-5 h-5 text-blue-600" />
      <span className="font-bold text-slate-800 dark:text-slate-200">
        {formatDuration(duration)}
      </span>
    </div>
  </motion.div>
);

export const DesktopMiniLegend = ({
  activeCategory,
  onCategoryToggle,
}: {
  activeCategory: string | null;
  onCategoryToggle: (category: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
    className="
      hidden md:flex
      absolute bottom-5 right-5
      z-1000
      px-4 py-3 rounded-2xl
      bg-white/85 dark:bg-gray-800/85 backdrop-blur-xl
      border border-slate-100 dark:border-gray-700
      shadow-[0_12px_32px_rgba(0,0,0,.15)]
      items-center gap-4
    "
  >
    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">Filter Map:</div>
    {[
      { id: "restaurants", icon: RestaurantIcon, label: "Restaurants" },
      { id: "hotels", icon: HotelIcon, label: "Hotels" },
      { id: "scenic", icon: ScenicIcon, label: "Scenic Spots" },
    ].map((item) => {
      const isActive = activeCategory === item.id;
      return (
        <button
          key={item.id}
          onClick={() => onCategoryToggle(item.id)}
          className="relative group transition transform hover:scale-110 active:scale-95 cursor-pointer"
        >
          <img
            src={item.icon}
            alt={item.label}
            className={`w-9 h-9 rounded-full border-2 object-cover transition-all duration-200 shadow-md ${isActive
              ? "border-green-500 scale-110 ring-4 ring-green-100"
              : "border-white hover:border-green-300"
              }`}
          />

          <span
            className="
              absolute -top-10 left-1/2 -translate-x-1/2
              opacity-0 group-hover:opacity-100
              transition-all duration-300
              bg-slate-900/90 backdrop-blur-xs
              text-white font-semibold
              text-[10px] px-2 py-1 rounded-md
              shadow-md whitespace-nowrap
            "
          >
            {item.label} {isActive ? "(Active)" : ""}
          </span>
        </button>
      );
    })}
  </motion.div>
);

/* ---------------- Route Info Mobile Friendly ---------------- */
export const RouteInfoCard = ({
  distance,
  duration,
  activeCategory,
  onCategoryToggle,
}: {
  distance: number;
  duration: number;
  activeCategory: string | null;
  onCategoryToggle: (category: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 z-1000 w-[94%] sm:w-auto"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="
          mx-auto mb-2
          px-4 py-2
          rounded-full
          bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
          shadow-md border border-slate-100 dark:border-gray-700
          flex items-center gap-2
          text-xs font-bold text-slate-700 dark:text-slate-300
          cursor-pointer
        "
      >
        {open ? (
          <ChevronDown size={16} className="text-green-600 animate-pulse" />
        ) : (
          <ChevronUp size={16} className="text-green-600 animate-pulse" />
        )}
        Map Info & Legend
      </button>

      {/* Mobile Route Info + Legend */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="
              rounded-2xl
              bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
              border border-slate-100 dark:border-gray-700
              shadow-[0_10px_30px_rgba(0,0,0,.15)]
              px-5 py-4
              space-y-4
            "
          >
            {/* Distance + Time */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-green-600" />
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {formatDistance(distance)}
                </span>
              </div>

              <div className="w-px h-5 bg-gray-300/60 dark:bg-gray-700" />

              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {formatDuration(duration)}
                </span>
              </div>
            </div>

            {/* Mobile Legend */}
            <div className="flex justify-center items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter:</div>
              {[
                { id: "restaurants", icon: RestaurantIcon, label: "Eat" },
                { id: "hotels", icon: HotelIcon, label: "Stay" },
                { id: "scenic", icon: ScenicIcon, label: "Sight" },
              ].map((item) => {
                const isActive = activeCategory === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onCategoryToggle(item.id)}
                    className="flex items-center gap-1.5 transition transform hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className={`w-7 h-7 rounded-full border object-cover transition-all ${isActive
                        ? "border-green-500 scale-105 ring-2 ring-green-100"
                        : "border-slate-200"
                        }`}
                    />
                    <span className={`text-[11px] font-bold ${isActive ? "text-green-600" : "text-slate-500"}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
