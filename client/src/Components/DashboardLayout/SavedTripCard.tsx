import React from "react";
import { motion } from "framer-motion";
import { Trash2, Calendar, Route, Flag, Share2, Printer } from "lucide-react";

interface SavedTripCardProps {
  trip: any;
  onDelete: (id: string) => void;
  onView?: (trip: any) => void;
  onShare?: (trip: any) => void;
  onPrint?: (trip: any) => void;
}

export const SavedTripCard: React.FC<SavedTripCardProps> = ({
  trip,
  onDelete,
  onView,
  onShare,
  onPrint,
}) => {
  const previewImage = `https://loremflickr.com/800/600/${encodeURIComponent(
    trip.destination.split(",")[0] + ",travel"
  )}`;

  return (
    <motion.div
      layout
      className="group bg-white dark:bg-slate-900 rounded-3xl shadow-lg overflow-hidden border border-slate-200/80 dark:border-slate-800 flex flex-col h-full relative hover:border-amber-500/50 dark:hover:border-amber-500/50 transition-colors"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{
        y: -6,
        boxShadow:
          "0 20px 25px -5px rgb(245 158 11 / 0.1), 0 8px 10px -6px rgb(245 158 11 / 0.05)",
      }}
    >
      <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={previewImage}
          alt={trip.destination}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=60";
          }}
        />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {onShare && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onShare(trip);
              }}
              className="p-2 text-white bg-slate-950/50 backdrop-blur-xs rounded-xl hover:bg-amber-500 hover:text-slate-950 transition transform hover:scale-105 cursor-pointer"
              title="Share Trip"
              aria-label="Share trip"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onPrint && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onPrint(trip);
              }}
              className="p-2 text-white bg-slate-950/50 backdrop-blur-xs rounded-xl hover:bg-amber-500 hover:text-slate-950 transition transform hover:scale-105 cursor-pointer"
              title="Print or Export PDF"
              aria-label="Print or export PDF"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(trip._id);
            }}
            className="p-2 text-white bg-slate-950/50 backdrop-blur-xs rounded-xl hover:bg-red-500 hover:text-white transition transform hover:scale-105 cursor-pointer"
            title="Delete Trip"
            aria-label="Delete trip"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col grow">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug line-clamp-1">
          {trip.source}
        </h3>

        <div className="flex items-center gap-2 my-2 text-slate-500 dark:text-slate-400 text-sm">
          <Route className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-semibold text-xs text-slate-400">to</span>
          <Flag className="w-4 h-4 text-emerald-500 shrink-0" />
          <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate">{trip.destination}</h4>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {trip.places ? trip.places.length : 0} stops &bull;{" "}
          {trip.distance
            ? `${(trip.distance / 1000).toFixed(1)} km`
            : "Distance N/A"}
        </p>

        <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-500" />
          <span>
            Saved:{" "}
            {new Date(trip.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            onClick={() => onView && onView(trip)}
            className="w-full flex items-center justify-center gap-2 bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2.5 px-4 rounded-xl shadow-md shadow-amber-500/20 hover:shadow-lg hover:shadow-amber-500/30 transition transform hover:scale-[1.01] cursor-pointer text-xs tracking-wide"
          >
            <span>View Details</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};
