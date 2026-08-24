import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TopDestinationsProps } from '@/hooks/types';
import { API_BASE_URLS } from "@/Services/apiClient";
import { MapPin, Star, Sparkles, Compass, Search, Loader2 } from "lucide-react";

interface AttractionModel {
  id?: string;
  name: string;
  category: string;
  rating: number;
  reviews?: number;
  location: string;
}

const STATES_AND_CITIES: Record<string, string[]> = {
  "Rajasthan 🏛️": ["Jaipur", "Udaipur", "Jodhpur", "Jaisalmer"],
  "Maharashtra 🌊": ["Mumbai", "Pune", "Mahabaleshwar", "Nashik"],
  "Uttar Pradesh 🪔": ["Vrindavan", "Varanasi", "Agra", "Mathura"],
  "Himachal Pradesh 🏔️": ["Manali", "Shimla", "Dharamshala", "Dalhousie"],
  "Kerala 🌴": ["Munnar", "Alleppey", "Kochi", "Wayanad"],
  "Goa 🏖️": ["Panaji", "Margao", "Calangute", "Vasco da Gama"]
};

const FALLBACK_ATTRACTIONS: Record<string, AttractionModel[]> = {
  "Jaipur": [
    { name: "Hawa Mahal", category: "Historic Site", rating: 4.6, reviews: 245, location: "Hawa Mahal Rd, Jaipur, Rajasthan" },
    { name: "Amber Palace", category: "Historic Site", rating: 4.7, reviews: 310, location: "Devisinghpura, Amer, Jaipur, Rajasthan" },
    { name: "City Palace", category: "Museum", rating: 4.5, reviews: 180, location: "Tulsi Marg, Gangori Bazaar, Jaipur, Rajasthan" }
  ],
  "Mumbai": [
    { name: "Gateway of India", category: "Historic Site", rating: 4.7, reviews: 520, location: "Apollo Bandar, Colaba, Mumbai, Maharashtra" },
    { name: "Marine Drive Promenade", category: "Sight", rating: 4.8, reviews: 490, location: "Netaji Subhash Chandra Bose Rd, Mumbai, Maharashtra" },
    { name: "Chhatrapati Shivaji Museum", category: "Museum", rating: 4.6, reviews: 155, location: "M.G. Road, Fort, Mumbai, Maharashtra" }
  ],
  "Vrindavan": [
    { name: "Banke Bihari Mandir", category: "Temple", rating: 4.9, reviews: 680, location: "Bihari Pura, Vrindavan, Uttar Pradesh" },
    { name: "Prem Mandir", category: "Temple", rating: 4.8, reviews: 620, location: "Raman Reti, Vrindavan, Uttar Pradesh" },
    { name: "Sri Krishna Balaram Temple", category: "Temple", rating: 4.7, reviews: 412, location: "Bhaktivedanta Swami Marg, Vrindavan, Uttar Pradesh" }
  ]
};

const FALLBACK_CITY_IMAGES: Record<string, string> = {
  "Jaipur": "https://images.unsplash.com/photo-1477584322902-471a53540fc1?w=800&auto=format&fit=crop&q=60",
  "Mumbai": "https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800&auto=format&fit=crop&q=60",
  "Vrindavan": "https://images.unsplash.com/photo-1627894142790-21665a3962dc?w=800&auto=format&fit=crop&q=60",
  "Udaipur": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800&auto=format&fit=crop&q=60"
};

export const TopDestinations = React.forwardRef<HTMLDivElement, TopDestinationsProps>(({ onDestinationClick, id }, ref) => {
  const [selectedState, setSelectedState] = useState<string>("Rajasthan 🏛️");
  const [selectedCity, setSelectedCity] = useState<string>("Jaipur");
  const [cityImage, setCityImage] = useState<string>("");
  const [attractions, setAttractions] = useState<AttractionModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    const cities = STATES_AND_CITIES[state];
    if (cities && cities.length > 0) {
      setSelectedCity(cities[0]);
    }
  };

  useEffect(() => {
    const fetchCityDetails = async () => {
      setIsLoading(true);
      const stateName = selectedState.split(" ")[0];
      const query = `${selectedCity}, ${stateName}`;

      try {
        const imgRes = await fetch(
          `${API_BASE_URLS.LOCATION}/api/place-image?query=${encodeURIComponent(selectedCity + " travel")}`
        );
        let resolvedImage = "";
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          resolvedImage = imgData.full || imgData.thumbnail || "";
        }
        setCityImage(resolvedImage || FALLBACK_CITY_IMAGES[selectedCity] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=60");

        const placesRes = await fetch(
          `${API_BASE_URLS.LOCATION}/api/places/search?query=${encodeURIComponent(query)}`
        );
        if (placesRes.ok) {
          const placesData = await placesRes.json();
          if (placesData.success && placesData.places?.length > 0) {
            setAttractions(placesData.places);
            setIsLoading(false);
            return;
          }
        }
        throw new Error("Live search yielded no locations");
      } catch (err) {
        console.warn("Failed to load live data, using local fallback:", err);
        setAttractions(
          FALLBACK_ATTRACTIONS[selectedCity] || [
            { name: `${selectedCity} Fort`, category: "Historic Site", rating: 4.6, reviews: 110, location: `Historic Hilltop Fort, ${selectedCity}` },
            { name: `Famous ${selectedCity} Temple`, category: "Temple", rating: 4.8, reviews: 140, location: `Main spiritual complex, ${selectedCity}` },
            { name: `${selectedCity} Lake Park`, category: "Park", rating: 4.4, reviews: 75, location: `Scenic Lakeside path, ${selectedCity}` }
          ]
        );
        setCityImage(FALLBACK_CITY_IMAGES[selectedCity] || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=60");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCityDetails();
  }, [selectedCity, selectedState]);

  const handlePlanRoute = (destName: string) => {
    const stateName = selectedState.split(" ")[0];
    onDestinationClick(`${destName}, ${stateName}`);
  };

  return (
    <section ref={ref} id={id} className="py-16 sm:py-20 bg-linear-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10">
          <h3 className="text-green-600 font-semibold text-sm sm:text-base md:text-lg mb-2 tracking-wide">
            EXPLORE DYNAMIC DESTINATIONS
          </h3>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800">
            Discover Live Indian Attractions
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
            Select a state and city to dynamically load live sightseeing places. Explore attractions and plan your next route.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto">
            <Compass className="w-5 h-5 text-green-500 shrink-0" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select State:</span>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="bg-transparent border-none text-gray-800 font-bold text-sm focus:outline-none cursor-pointer"
            >
              {Object.keys(STATES_AND_CITIES).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 w-full md:w-auto">
            {STATES_AND_CITIES[selectedState].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition duration-200 cursor-pointer ${selectedCity === city
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-green-50 border border-gray-200"
                  }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          <div className="lg:col-span-5 flex">
            <div className="relative rounded-2xl overflow-hidden shadow-xl w-full flex flex-col justify-end min-h-[350px] lg:min-h-[420px] aspect-4/3 lg:aspect-auto group border border-gray-100">
              <img
                src={cityImage || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=60"}
                alt={selectedCity}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>

              <div className="relative p-6 sm:p-8 text-left text-white mt-auto">
                <span className="text-[10px] bg-green-500/90 text-white font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-3 inline-block">
                  Trending Destination
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 drop-shadow-md">
                  {selectedCity}
                </h3>
                <p className="text-sm text-gray-300 mb-6 drop-shadow-sm line-clamp-3">
                  Explore famous historical monuments, temples, scenic parks, and local street delicacies in {selectedCity}, {selectedState.split(" ")[0]}.
                </p>
                <button
                  onClick={() => handlePlanRoute(selectedCity)}
                  className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:scale-102 cursor-pointer text-sm"
                >
                  <Search className="w-4 h-4" />
                  <span>Plan AI Route to {selectedCity}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-between bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/60 dark:border-gray-700 shadow-lg p-5 sm:p-6 text-left">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3 mb-4">
                <h4 className="text-lg font-bold text-gray-800 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-500 animate-pulse" />
                  <span>Popular Sightseeing in {selectedCity}</span>
                </h4>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Geoapify Live API</span>
              </div>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-16 gap-3"
                    >
                      <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                      <p className="text-sm font-semibold text-gray-400">Fetching local attractions live...</p>
                    </motion.div>
                  ) : attractions.length === 0 ? (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16 text-gray-400 font-semibold"
                    >
                      No local attractions resolved for this city.
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-3"
                    >
                      {attractions.slice(0, 5).map((place, idx) => (
                        <motion.div
                          key={place.name + "-" + idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition duration-150 gap-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-green-50 dark:bg-slate-700 rounded-lg text-green-600 dark:text-green-400 shrink-0 mt-0.5 sm:mt-0">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div className="text-left">
                              <h5 className="font-bold text-gray-800 dark:text-slate-200 text-sm leading-tight line-clamp-1">
                                {place.name}
                              </h5>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300 font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  {place.category || "Attraction"}
                                </span>
                                <div className="flex items-center text-[11px] text-amber-500 font-bold">
                                  <Star className="w-3 h-3 fill-amber-500 mr-0.5" />
                                  <span>{place.rating || "4.5"}</span>
                                  {place.reviews && (
                                    <span className="text-[10px] text-gray-400 font-normal ml-1">
                                      ({place.reviews})
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-1 mt-1">
                                {place.location}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handlePlanRoute(place.name)}
                            className="text-xs font-bold text-green-600 dark:text-green-400 hover:text-green-700 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 px-3.5 py-2 rounded-lg transition shrink-0 cursor-pointer self-end sm:self-center w-full sm:w-auto"
                          >
                            Set Route
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4 flex items-center justify-between text-xs text-gray-400">
              <span>Geoapify spatial indexing &bull; 15km circular bounds</span>
              <span>Showing Top 5 Attractions</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
});
