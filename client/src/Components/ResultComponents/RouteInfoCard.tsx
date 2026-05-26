import { AnimatePresence, motion } from "framer-motion";
import { Navigation, Clock, ChevronDown, ChevronUp } from "lucide-react";

import RestaurantIcon from "@/Assets/MapIcons/restaurant.jpg";
import HotelIcon from "@/Assets/MapIcons/hotel.jpg";
import ScenicIcon from "@/Assets/MapIcons/scenic.jpg";
import { useState } from "react";

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
      z-[1000]
      px-5 py-4 rounded-2xl
      bg-white/85 backdrop-blur-xl
      border border-white/40
      shadow-[0_12px_32px_rgba(0,0,0,.18)]
      items-center gap-6
    "
  >
    <div className="flex items-center gap-2">
      <Navigation className="w-5 h-5 text-green-600" />
      <span className="font-semibold text-gray-800">
        {(distance / 1000).toFixed(1)} km
      </span>
    </div>

    <div className="w-px h-6 bg-gray-300/60" />

    <div className="flex items-center gap-2">
      <Clock className="w-5 h-5 text-blue-600" />
      <span className="font-semibold text-gray-800">
        {(duration / 60).toFixed(0)} min
      </span>
    </div>
  </motion.div>
);


export const DesktopMiniLegend = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
    className="
      hidden md:flex
      absolute bottom-5 right-5
      z-[1000]
      px-4 py-3 rounded-2xl
      bg-white/85 backdrop-blur-xl
      border border-white/40
      shadow-[0_12px_32px_rgba(0,0,0,.18)]
      items-center gap-4
    "
  >
    {[
      { icon: RestaurantIcon, label: "Restaurants" },
      { icon: HotelIcon, label: "Hotels" },
      { icon: ScenicIcon, label: "Scenic Spots" },
    ].map((item, i) => (
      <div key={i} className="relative group">
        <img
          src={item.icon}
          alt={item.label}
          className="w-9 h-9 rounded-full border-2 border-white shadow-md object-cover"
        />

        <span
          className="
            absolute -top-9 left-1/2 -translate-x-1/2
            opacity-0 group-hover:opacity-100
            transition-all duration-300
            bg-white/90 backdrop-blur-lg
            text-green-700 font-semibold
            text-xs px-3 py-1.5 rounded-lg
            shadow-lg whitespace-nowrap
          "
        >
          {item.label}
        </span>
      </div>
    ))}
  </motion.div>
);


/* ---------------- Route Info Mobile Friendly ---------------- */

 export const RouteInfoCard = ({
  distance,
  duration,
}: {
  distance: number;
  duration: number;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 md:left-5 md:translate-x-0
                z-[1000] w-[94%] sm:w-auto" >
      {/* 🔽 Toggle Button (Mobile only) */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="
          md:hidden mx-auto mb-2
          px-3 py-1.5
          rounded-full
          bg-white/95 backdrop-blur-xl
          shadow-lg
          flex items-center gap-2
          text-sm text-gray-700
        "
      >
        {open ? (
          <ChevronDown size={18} className="text-green-600" />
        ) : (
          <ChevronUp size={18} className="text-green-600" />
        )}
        Route info
      </button>

      {/* 🧭 Route Info + Legend */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="
              rounded-2xl
              bg-white/95 backdrop-blur-xl
              shadow-[0_10px_30px_rgba(0,0,0,.18)]
              px-5 py-4
              space-y-4
            "
          >
            {/* 🚗 Distance + Time */}
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <Navigation className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-800">
                  {(distance / 1000).toFixed(1)} km
                </span>
              </div>

              <div className="w-px h-6 bg-gray-300/50" />

              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-800">
                  {(duration / 60).toFixed(0)} min
                </span>
              </div>
            </div>

            {/* 🗺️ Mini Legend (Mobile collapsible style) */}
            <div className="flex justify-center gap-4 pt-2 border-t border-gray-200/60">
              {[
                { icon: RestaurantIcon, label: "Restaurants" },
                { icon: HotelIcon, label: "Hotels" },
                { icon: ScenicIcon, label: "Scenic Spots" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="relative group flex flex-col items-center"
                >
                  <img
                    src={item.icon}
                    alt={item.label}
                    className="
                      w-8 h-8 rounded-full
                      border-2 border-white
                      shadow-md
                      object-cover
                    "
                  />

                  {/* Tooltip */}
                  <span
                    className="absolute -top-8 opacity-0 group-hover:opacity-100 transition bg-black/90 backdrop-blur-lg text-white font-semibold text-xs px-2 py-1 rounded-lg whitespace-nowrap ">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
