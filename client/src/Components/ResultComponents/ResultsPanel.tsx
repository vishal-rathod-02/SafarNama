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
} from "lucide-react";
import useMediaQuery from "@/hooks/useMediaQuery";
import { FloatingFilterButton } from "./FloatingFilter";
import TripSummaryCard from "./TripSummaryCard";

const TabButton: React.FC<{
  label: string;
  count: number;
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
    <span
      className={`ml-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${isActive
          ? "bg-green-500"
          : "bg-gray-300 text-gray-600 group-hover:bg-amber-100"
        }`}
    >
      {count}
    </span>
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

// ---------- MAIN ResultsPanel ----------
export const ResultsPanel: React.FC<ResultsPanelProps> = ({ tripData }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState & { category: string }>({
    location: "all",
    keywords: [],
    minRating: 0,
    category: "all",
  });

  const isDesktop = useMediaQuery("(min-width: 1024px)");

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

  // 🔹 Filtered places (safe for missing location/category/rating)
  const displayedPlaces = useMemo(() => {
    return tripData.places.filter((place) => {
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

      return true;
    });
  }, [tripData, filters, filterCategories]);

  // 🔹 Active filters badge count (for FloatingFilterButton)
  const activeFiltersCount =
    (filters.category !== "all" ? 1 : 0) +
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
        </div>
      </motion.div>

      {/* Summary Card */}
      <motion.div variants={fadeInUp}>
        <TripSummaryCard tripData={tripData} />
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
              label="All"
              count={tripData.places.length}
              isActive={filters.category === "all"}
              onClick={() => setFilters((f) => ({ ...f, category: "all" }))}
              Icon={Compass}
            />
            {filterCategories.map(
              (cat) =>
                cat.count > 0 && (
                  <TabButton
                    key={cat.id}
                    label={cat.label}
                    count={cat.count}
                    isActive={filters.category === cat.id}
                    onClick={() =>
                      setFilters((f) => ({ ...f, category: cat.id }))
                    }
                    Icon={cat.icon}
                  />
                ),
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
              {displayedPlaces.length} places found
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

      {/* Places Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={gridVariants}
      >
        <AnimatePresence>
          {displayedPlaces.map((place) => (
            <motion.div
              key={`${place.name}-${place.location}`}
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
