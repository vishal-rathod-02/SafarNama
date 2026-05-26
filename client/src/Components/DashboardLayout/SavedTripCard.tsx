import React from "react";
import { motion } from "framer-motion";
import { Trash2, Calendar, Route, Flag } from "lucide-react";

interface SavedTripCardProps {
  trip: any;
  onDelete: (id: string) => void;
}

export const SavedTripCard: React.FC<SavedTripCardProps> = ({ trip, onDelete }) => {
  return (
    <motion.div
      layout
      className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full relative"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ 
        y: -8, 
        boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" 
      }}
    >
      <div className="relative h-32 bg-green-50 rounded-t-2xl flex items-center justify-center">
        {/* Optionally add an image or map preview here */}
        <span className="text-green-600 font-bold">{trip.source} → {trip.destination}</span>
        <div className="absolute top-2 right-2">
          <button
            onClick={() => onDelete(trip._id)}
            className="p-2 text-white/70 bg-black/20 rounded-full hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
            title="Delete Trip"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-2 my-1 text-gray-500">
          <Route className="w-4 h-4" />
          <span className="font-bold">to</span>
          <Flag className="w-4 h-4" />
          <h4 className="font-bold text-gray-800">{trip.destination}</h4>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {trip.places?.length || 0} stops &bull; {trip.distance || 0} km
        </p>
        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          <span>Saved on: {new Date(trip.createdAt).toLocaleDateString()}</span>
        </div>
        <button className="mt-auto w-full flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-green-600 transition transform hover:scale-105">
          View Details
        </button>
      </div>
    </motion.div>
  );
};
