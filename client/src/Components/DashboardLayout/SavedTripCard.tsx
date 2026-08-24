import React from "react";
import { motion } from "framer-motion";
import { Trash2, Calendar, Route, Flag } from "lucide-react";

interface SavedTripCardProps {
  trip: any;
  onDelete: (id: string) => void;
  onView?: (trip: any) => void;
}

export const SavedTripCard: React.FC<SavedTripCardProps> = ({
  trip,
  onDelete,
  onView,
}) => {
  const previewImage = `https://loremflickr.com/800/600/${encodeURIComponent(
    trip.destination.split(",")[0] + ",travel"
  )}`;

  return (
    <motion.div
      layout
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col h-full relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{
        y: -8,
        boxShadow:
          "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      }}
    >
      <div className="relative h-48 bg-slate-100 dark:bg-gray-700 overflow-hidden">
        <img
          src={previewImage}
          alt={trip.destination}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=60";
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(trip._id);
            }}
            className="p-2 text-white/80 bg-black/30 backdrop-blur-xs rounded-full hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 cursor-pointer"
            title="Delete Trip"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col grow">
        <h3 className="text-lg font-bold text-gray-800 dark:text-slate-100 leading-snug line-clamp-1">
          {trip.source}
        </h3>

        <div className="flex items-center gap-2 my-2 text-gray-500 dark:text-gray-400 text-sm">
          <Route className="w-4 h-4 text-green-500 shrink-0" />
          <span className="font-semibold text-xs text-gray-400">to</span>
          <Flag className="w-4 h-4 text-red-500 shrink-0" />
          <h4 className="font-bold text-gray-700 dark:text-slate-200 truncate">{trip.destination}</h4>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {trip.places ? trip.places.length : 0} stops &bull;{" "}
          {trip.distance
            ? `${(trip.distance / 1000).toFixed(1)} km`
            : "Distance N/A"}
        </p>

        <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            Saved:{" "}
            {new Date(trip.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => onView && onView(trip)}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow-sm hover:shadow-md transition transform hover:scale-102 cursor-pointer animate-fade-in"
          >
            <span>View Details</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
