import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ResultsPanelProps, FilterState } from "@/hooks/types";
import { PlaceCard } from "./PlaceCard";
import {
  BedDouble as HotelIcon,
  Palmtree as MustVisitIcon,
  SlidersHorizontal,
  X,
  Compass,
  UtensilsCrossed,
  Sparkles,
  Calendar,
  Users,
  Car,
  Heart,
} from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import { FloatingFilterButton } from "./FloatingFilter";
import TripSummaryCard from "./TripSummaryCard";

const TabButton: React.FC<{
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
  Icon: React.ElementType;
}> = ({ label, count, isActive, onClick, Icon }) => (
  <button
    onClick={onClick}
    className={`group flex items-center gap-2 px-4 py-2 text-sm sm:text-base font-semibold rounded-lg transition-all duration-300 transform hover:scale-104 ${isActive
      ? "bg-green-600 text-white shadow-lg"
      : "bg-gray-100 text-gray-700 hover:bg-amber-300"
      }`}
  >
    <Icon className="w-5 h-5" />
    {label}
    {count !== undefined && (
      <span
        className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${isActive
          ? "bg-green-500"
          : "bg-gray-300 text-gray-600 group-hover:bg-amber-100"
          }`}
      >
        {count}
      </span>
    )}
  </button>
);

// ---------- Filter Drawer ----------
const FilterDrawer: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState & { category: string };
  setFilters: React.Dispatch<
    React.SetStateAction<FilterState & { category: string }>
  >;
  tripData: ResultsPanelProps["tripData"];
  categories: Array<{
    id: string;
    label: string;
    count: number;
  }>;
}> = ({ isOpen, onClose, filters, setFilters, tripData, categories }) => {
  const handleKeywordChange = (keyword: string) => {
    setFilters((prev) => ({
      ...prev,
      keywords: prev.keywords.includes(keyword)
        ? prev.keywords.filter((k) => k !== keyword)
        : [...prev.keywords, keyword],
    }));
  };

  const resetFilters = () => {
    setFilters({
      location: "all",
      keywords: [],
      minRating: 0,
      category: "all",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-100 flex justify-end bg-black/40 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-sm h-full flex flex-col rounded-l-3xl shadow-2xl overflow-hidden
              bg-linear-to-b from-white/95 to-white/80 backdrop-blur-2xl border-l border-white/30"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-6 py-5 bg-linear-to-r from-green-600 via-emerald-500 to-teal-400 text-white shadow-md">
              <h3 className="text-2xl font-bold drop-shadow-sm">Filters</h3>
              <button
                onClick={onClose}
                className="absolute top-5 right-6 text-white/80 hover:text-white transition"
                aria-label="Close Filter Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8 text-gray-800">
              {/* Category Filter */}
              <section>
                <h4 className="font-semibold mb-3 text-gray-700">Categories</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setFilters((f) => ({ ...f, category: "guide" }))
                    }
                    className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200 
                      ${filters.category === "guide"
                        ? "bg-linear-to-r from-green-600 to-emerald-500 text-white shadow-md"
                        : "bg-white/60 hover:bg-green-50 border border-gray-200"
                      }`}
                  >
                    AI Trip Guide ✨
                  </button>

                  <button
                    onClick={() =>
                      setFilters((f) => ({ ...f, category: "all" }))
                    }
                    className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200 
                      ${filters.category === "all"
                        ? "bg-linear-to-r from-green-600 to-emerald-500 text-white shadow-md"
                        : "bg-white/60 hover:bg-green-50 border border-gray-200"
                      }`}
                  >
                    All ({tripData.places.length})
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setFilters((f) => ({ ...f, category: cat.id }))
                      }
                      className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200
                        ${filters.category === cat.id
                          ? "bg-linear-to-r from-green-600 to-emerald-500 text-white shadow-md"
                          : "bg-white/60 hover:bg-green-50 border border-gray-200"
                        }`}
                    >
                      {cat.label} ({cat.count})
                    </button>
                  ))}
                </div>
              </section>

              {/* Location Filter */}
              <section>
                <h4 className="font-semibold mb-3 text-gray-700">Location</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      setFilters((f) => ({ ...f, location: "all" }))
                    }
                    className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200 
                      ${filters.location === "all"
                        ? "bg-linear-to-r from-green-600 to-emerald-500 text-white shadow-md"
                        : "bg-white/60 hover:bg-green-50 border border-gray-200"
                      }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() =>
                      setFilters((f) => ({ ...f, location: "source" }))
                    }
                    className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200 
                      ${filters.location === "source"
                        ? "bg-linear-to-r from-green-600 to-emerald-500 text-white shadow-md"
                        : "bg-white/60 hover:bg-green-50 border border-gray-200"
                      }`}
                  >
                    Near Source
                  </button>
                  <button
                    onClick={() =>
                      setFilters((f) => ({ ...f, location: "destination" }))
                    }
                    className={`px-4 py-2 text-sm rounded-lg font-semibold transition-all duration-200 
                      ${filters.location === "destination"
                        ? "bg-linear-to-r from-green-600 to-emerald-500 text-white shadow-md"
                        : "bg-white/60 hover:bg-green-50 border border-gray-200"
                      }`}
                  >
                    Near Destination
                  </button>
                </div>
              </section>

              {/* Rating Filter */}
              <section>
                <h4 className="font-semibold mb-3 text-gray-700">
                  Minimum Rating
                </h4>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={filters.minRating}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        minRating: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full h-2 accent-green-500 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="font-bold text-green-700 w-14 text-center">
                    {filters.minRating > 0
                      ? `${filters.minRating.toFixed(1)}+`
                      : "Any"}
                  </span>
                </div>
              </section>

              {/* Keywords */}
              <section>
                <h4 className="font-semibold mb-3 text-gray-700">
                  Place Types
                </h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Heritage",
                    "Temple",
                    "Museum",
                    "Cafe",
                    "Restaurant",
                    "Park",
                    "Scenic",
                  ].map((kw) => (
                    <button
                      key={kw}
                      onClick={() => handleKeywordChange(kw.toLowerCase())}
                      className={`px-3 py-1.5 text-sm rounded-lg font-semibold transition-all duration-200
                        ${filters.keywords.includes(kw.toLowerCase())
                          ? "bg-linear-to-r from-green-600 to-emerald-500 text-white shadow-md"
                          : "bg-white/60 hover:bg-green-50 border border-gray-200"
                        }`}
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Footer Buttons */}
            <div className="sticky bottom-0 px-6 py-4 bg-white/70 backdrop-blur-md border-t border-gray-200 flex gap-3">
              <button
                onClick={resetFilters}
                className="flex-1 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition"
              >
                Reset
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-linear-to-r from-green-600 to-emerald-500 text-white font-semibold rounded-xl hover:opacity-90 transition"
              >
                Show Results
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ---------- Motion variants ----------
const panelVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" } as any,
  },
};

const gridVariants = {
  visible: { transition: { staggerChildren: 0.08 } as any },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" } as any,
  },
};

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ 
  tripData,
  sourceCoords,
  destinationCoords,
  travelDate,
  travelCompanions,
  vehicleMode,
  tripPreference
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState & { category: string }>({
    location: "all",
    keywords: [],
    minRating: 0,
    category: "guide", // Open with the curated AI Trip Guide by default
  });

  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // 🔹 Parse the dynamic day-by-day itinerary text into Day timeline sections
  const parsedItinerary = useMemo(() => {
    if (!tripData.itinerary) return [];
    
    const sections = tripData.itinerary.split(/\n+/);
    return sections
      .map((sec) => sec.trim())
      .filter((sec) => sec.length > 0)
      .map((sec, idx) => {
        // Format date if available
        let dateStr = "";
        if (travelDate) {
          try {
            const dateObj = new Date(travelDate);
            dateObj.setDate(dateObj.getDate() + idx);
            dateStr = " — " + dateObj.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
          } catch (e) {
            console.error("Error parsing travelDate:", e);
          }
        }

        // Find if it starts with "Day X:"
        const dayMatch = sec.match(/^(Day\s+\d+:?)(.*)$/i);
        if (dayMatch) {
          return {
            title: `${dayMatch[1].replace(":", "").trim()}${dateStr}`,
            content: dayMatch[2].trim(),
            index: idx,
          };
        }
        return {
          title: `Step ${idx + 1}${dateStr}`,
          content: sec,
          index: idx,
        };
      });
  }, [tripData.itinerary, travelDate]);

  // 🔹 Categories + safe counts (category may be missing)
  const filterCategories = useMemo(
    () =>
      [
        {
          id: "attractions",
          label: "Must-Visit",
          keywords: [
            "museum",
            "historic",
            "park",
            "scenic",
            "temple",
            "landmark",
            "city",
            "attraction",
          ],
          icon: MustVisitIcon,
        },
        {
          id: "restaurants",
          label: "Restaurants",
          keywords: ["restaurant", "food", "cafe"],
          icon: UtensilsCrossed,
        },
        {
          id: "hotels",
          label: "Hotels",
          keywords: ["hotel"],
          icon: HotelIcon,
        },
      ].map((cat) => ({
        ...cat,
        count: tripData.places.filter((p) => {
          const category = (p.category || "").toLowerCase();
          return cat.keywords.some((kw) => category.includes(kw));
        }).length,
      })),
    [tripData.places],
  );

  // 🔹 Filtered places (safe for missing location/category/rating) and deduplicated
  const displayedPlaces = useMemo(() => {
    const seen = new Set<string>();

    return tripData.places.filter((place) => {
      // Deduplicate check
      const uniqueKey = `${place.name.trim().toLowerCase()}-${(place.location || "").trim().toLowerCase()}`;
      if (seen.has(uniqueKey)) {
        return false;
      }

      const sourceName = tripData.source.split(",")[0].trim().toLowerCase();
      const destName = tripData.destination.split(",")[0].trim().toLowerCase();

      const placeLocation = (place.location || "").toLowerCase();
      const placeCategory = (place.category || "").toLowerCase();
      const placeRating =
        typeof place.rating === "number"
          ? place.rating
          : typeof place.rating === "string"
            ? parseFloat(place.rating)
            : 0;

      const activeCategory = filterCategories.find(
        (c) => c.id === filters.category,
      );

      // Category filter
      if (
        activeCategory &&
        !activeCategory.keywords.some((kw) => placeCategory.includes(kw))
      ) {
        return false;
      }

      // Source / destination location filter
      if (
        filters.location === "source" &&
        !placeLocation.includes(sourceName)
      ) {
        return false;
      }

      if (
        filters.location === "destination" &&
        !placeLocation.includes(destName)
      ) {
        return false;
      }

      // Rating filter
      if (placeRating < filters.minRating) {
        return false;
      }

      // Keywords filter
      if (filters.keywords.length > 0) {
        if (
          !filters.keywords.some((kw) =>
            placeCategory.includes(kw.toLowerCase()),
          )
        ) {
          return false;
        }
      }

      seen.add(uniqueKey);
      return true;
    });
  }, [tripData, filters, filterCategories]);


  // 🔹 Active filters badge count (for FloatingFilterButton)
  const activeFiltersCount =
    (filters.category !== "guide" && filters.category !== "all" ? 1 : 0) +
    (filters.keywords.length > 0 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0);

  return (
    <motion.div
      className="space-y-12"
      variants={panelVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Title */}
      <motion.div variants={fadeInUp}>
        <div className="mb-8 mt-10 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Your Curated Trip Plan
          </h2>
          <p className="text-gray-500">
            Discover the best stops on your route from {tripData.source} to{" "}
            {tripData.destination}.
          </p>
          
          {/* Configuration Summary Badge Row */}
          {(travelDate || travelCompanions || vehicleMode || tripPreference) && (
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              {travelDate && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100 shadow-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Date: {new Date(travelDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
              )}
              {travelCompanions && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100 shadow-xs">
                  <Users className="w-3.5 h-3.5" />
                  <span>Companions: {travelCompanions}</span>
                </div>
              )}
              {vehicleMode && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-100 shadow-xs">
                  <Car className="w-3.5 h-3.5" />
                  <span>Vehicle: {vehicleMode === "Driving" ? "Car/SUV 🚗" : vehicleMode === "Motorcycle" ? "Motorcycle 🏍️" : "Transit 🚌"}</span>
                </div>
              )}
              {tripPreference && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100 shadow-xs animate-pulse">
                  <Heart className="w-3.5 h-3.5" />
                  <span>Preference: {tripPreference === "Food-Focused" ? "Food Trails 🍕" : tripPreference === "Nature" ? "Nature & Peace 🍃" : tripPreference === "Heritage" ? "Heritage & Culture 🏛️" : "Scenic Trails 🏞️"}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Summary Card */}
      <motion.div variants={fadeInUp}>
        <TripSummaryCard
          tripData={tripData}
          sourceCoords={sourceCoords}
          destinationCoords={destinationCoords}
        />
      </motion.div>

      {/* Tabs + Filters */}
      <motion.div
        variants={fadeInUp}
        className="flex justify-between items-center sticky top-24 z-20 bg-gray-50/80 backdrop-blur-md py-4 rounded-xl"
      >
        {isDesktop ? (
          // Desktop view
          <div className="flex items-center gap-2 px-4 w-full">
            <TabButton
              label="AI Trip Guide"
              isActive={filters.category === "guide"}
              onClick={() => setFilters((f) => ({ ...f, category: "guide" }))}
              Icon={Sparkles}
            />
            <TabButton
              label="All Stops"
              count={tripData.places.length}
              isActive={filters.category === "all"}
              onClick={() => setFilters((f) => ({ ...f, category: "all" }))}
              Icon={Compass}
            />
            {filterCategories.map(
              (cat) => {
                const isPreferred = 
                  (tripPreference === "Food-Focused" && cat.id === "restaurants") || 
                  ((tripPreference === "Heritage" || tripPreference === "Nature") && cat.id === "attractions");
                
                return cat.count > 0 && (
                  <TabButton
                    key={cat.id}
                    label={isPreferred ? `${cat.label} ✨` : cat.label}
                    count={cat.count}
                    isActive={filters.category === cat.id}
                    onClick={() =>
                      setFilters((f) => ({ ...f, category: cat.id }))
                    }
                    Icon={cat.icon}
                  />
                );
              }
            )}
            <div className="ml-auto">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-600 font-bold py-2 px-4 rounded-lg hover:border-green-500 hover:text-green-600 transition transform hover:scale-105"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        ) : (
          // Mobile / tablet view
          <>
            <p className="text-lg font-semibold text-gray-700 px-4">
              {filters.category === "guide" ? "Curated Itinerary" : `${displayedPlaces.length} places found`}
            </p>
            <div className="px-4">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 bg-white border-2 border-green-500 text-green-600 font-bold py-2 px-5 rounded-lg hover:bg-green-50 transition transform hover:scale-105"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </>
        )}
      </motion.div>

      {/* AI Curated Guide Panel */}
      {filters.category === "guide" && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column: Summary & Highlights */}
          <div className="lg:col-span-1 space-y-6">
            {/* Overview / Summary Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
                <Compass className="w-5 h-5 text-green-600" />
                Trip Overview
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {tripData.summary}
              </p>
            </div>

            {/* Highlights Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
                <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                Curated Highlights
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {tripData.highlights}
              </p>
              <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100 flex items-start gap-3">
                <span className="text-xl">✨</span>
                <p className="text-xs text-green-700 leading-normal font-medium">
                  SafarNama curates exceptional stops along your route to maximize your travel experience.
                </p>
              </div>
            </div>

            {/* Smart Tips & Recommendations Card */}
            {(vehicleMode || tripPreference || travelCompanions) && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
                  <Sparkles className="w-5 h-5 text-green-600" />
                  SafarNama Smart Tips
                </h3>
                <div className="space-y-3.5">
                  {/* Vehicle specific tip */}
                  {vehicleMode === "Motorcycle" && (
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-xs text-purple-900 leading-relaxed">
                      <span className="font-bold">🏍️ Riding Advisory:</span> A motorcycle trip requires regular rest stops. We suggest stopping every 80-100 km. Ensure your helmet is secure, and watch for gravel or sudden highway dividers.
                    </div>
                  )}
                  {vehicleMode === "Transit" && (
                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                      <span className="font-bold">🚌 Transit Advisory:</span> When using public transit, confirm bus/train timetables in advance. We suggest arriving at stops 15-20 minutes before departure to avoid delays.
                    </div>
                  )}
                  {vehicleMode === "Driving" && (
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-900 leading-relaxed">
                      <span className="font-bold">🚗 Road Trip Alert:</span> Driving conditions on highway segments can change. Check tire pressures and keep emergency contact numbers saved. Enjoy the cruise!
                    </div>
                  )}

                  {/* Preference specific tip */}
                  {tripPreference === "Food-Focused" && (
                    <div className="p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-900 leading-relaxed">
                      <span className="font-bold">🍕 Food Trail Spotlight:</span> Food & Cuisine mode is active! We've prioritized local dhabas, highway restaurants, and iconic sweet stalls on this route. Be sure to try the local specialties!
                    </div>
                  )}
                  {tripPreference === "Nature" && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
                      <span className="font-bold">🍃 Nature Escape:</span> Nature-focused road trip active. We recommend starting early to catch the morning mist. Keep an eye out for scenic forest and lake stopovers!
                    </div>
                  )}
                  {tripPreference === "Heritage" && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs text-amber-900 leading-relaxed">
                      <span className="font-bold">🏛️ Cultural Landmark:</span> Exploring historic India. Take time to read local plaques or hire a certified guide at heritage sites for immersive details.
                    </div>
                  )}
                  {tripPreference === "Scenic" && (
                    <div className="p-3 bg-teal-50 rounded-xl border border-teal-100 text-xs text-teal-900 leading-relaxed">
                      <span className="font-bold">🏞️ Scenic Trail Route:</span> Don't rush! This route is chosen for beautiful countryside views, highway curves, and roadside photopoints. Keep your camera handy!
                    </div>
                  )}

                  {/* Companion specific tip */}
                  {travelCompanions === "Family" && (
                    <div className="p-3 bg-orange-50 rounded-xl border border-orange-100 text-xs text-orange-900 leading-relaxed">
                      <span className="font-bold">👨‍👩‍👧‍👦 Family Travel Tip:</span> Traveling with family? We have highlighted stops with clean restrooms, family dining spaces, and play zones for kids.
                    </div>
                  )}
                  {travelCompanions === "Friends" && (
                    <div className="p-3 bg-pink-50 rounded-xl border border-pink-100 text-xs text-pink-900 leading-relaxed">
                      <span className="font-bold">👥 Group Adventures:</span> Traveling with friends? Share the driving duties, carry multiplayer board games, and create a shared playlist for the drive!
                    </div>
                  )}
                  {travelCompanions === "Couple" && (
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-xs text-rose-900 leading-relaxed">
                      <span className="font-bold">💑 Romantic Getaway:</span> Enjoy the scenic drive! Don't miss romantic roadside cafe options and cozy view points.
                    </div>
                  )}
                  {travelCompanions === "Solo" && (
                    <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-900 leading-relaxed">
                      <span className="font-bold">🙋‍♂️ Solo Voyager:</span> Safe travels! Share your live location with a trusted friend or family member, and ensure your phone power bank is fully charged.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Itinerary Timeline */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2 border-b pb-3 mb-6">
              <Sparkles className="w-5 h-5 text-green-600" />
              Day-by-Day Itinerary
            </h3>

            {/* Timeline */}
            <div className="relative pl-6 border-l-2 border-green-200 space-y-8 py-2">
              {parsedItinerary.map((day) => (
                <div key={day.index} className="relative group">
                  {/* Timeline bullet */}
                  <div className="absolute -left-[33px] top-1.5 w-4 h-4 bg-green-500 rounded-full border-4 border-white group-hover:scale-125 transition-transform duration-200 shadow-sm" />
                  
                  {/* Content card */}
                  <div className="bg-slate-50/60 hover:bg-green-50/40 rounded-xl p-5 border border-slate-100 hover:border-green-100 transition-all duration-200">
                    <h4 className="font-extrabold text-green-700 text-lg mb-2 flex items-center gap-2">
                      {day.title}
                    </h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {day.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Places Grid (shown only if NOT guide category) */}
      {filters.category !== "guide" && (
        displayedPlaces.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={gridVariants}
          >
            <AnimatePresence>
              {displayedPlaces.map((place, idx) => (
                <motion.div
                  key={`${place.name}-${place.location}-${place.coords?.[0] ?? idx}-${place.coords?.[1] ?? idx}-${idx}`}
                  variants={cardVariants}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <PlaceCard place={place} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 bg-white rounded-2xl shadow-md border border-gray-100 max-w-md mx-auto"
          >
            <Compass className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-pulse" />
            <h3 className="text-lg font-bold text-gray-800">No stops found</h3>
            <p className="text-gray-500 text-sm mt-1 px-6">
              There are no items matching the active filters in this area. Try adjusting your filter parameters or select "All Locations".
            </p>
          </motion.div>
        )
      )}

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        tripData={tripData}
        categories={filterCategories}
      />

      {/* Floating filter button (for mobile) */}
      <FloatingFilterButton
        onClick={() => setIsFilterOpen(true)}
        activeFiltersCount={activeFiltersCount}
        isDrawerOpen={isFilterOpen}
      />
    </motion.div>
  );
};
