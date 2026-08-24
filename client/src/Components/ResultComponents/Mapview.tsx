import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, AnimatePresence } from "framer-motion";
import type { MapViewProps } from "@/hooks/types";
import RestaurantIcon from "@/Assets/MapIcons/restaurant.jpg";
import HotelIcon from "@/Assets/MapIcons/hotel.jpg";
import ScenicIcon from "@/Assets/MapIcons/scenic.jpg";
import TempleIcon from "@/Assets/MapIcons/temple.jpg";
import GhatIcon from "@/Assets/MapIcons/ghat.jpg";
import { PolylineDecoratorLayer } from "./PolylineDecoratorLayer";
import { createPinIcon, createPlaceIcon } from "../Shared/icons";
import { Sun, Moon, Play, Pause, Sliders, X } from "lucide-react";
import { DesktopMiniLegend, DesktopRouteInfo, RouteInfoCard } from "./RouteInfoCard";

const normalizeCoords = (c: any): [number, number] =>
  Array.isArray(c) ? [c[0], c[1]] : [c.lat, c.lng];

// Haversine distance formula in meters
const getDistance = (c1: [number, number], c2: [number, number]) => {
  const R = 6371e3; // Earth radius in meters
  const lat1 = c1[0] * (Math.PI / 180);
  const lat2 = c2[0] * (Math.PI / 180);
  const deltaLat = (c2[0] - c1[0]) * (Math.PI / 180);
  const deltaLng = (c2[1] - c1[1]) * (Math.PI / 180);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const AutoFocusButton = ({ bounds }: { bounds: L.LatLngBounds }) => {
  const map = useMap();
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      title="Re-center route"
      onClick={() => map.flyToBounds(bounds, { padding: [60, 60] })}
      className="
        absolute top-3 right-3 z-1000
        w-11 h-11 md:w-12 md:h-12
        rounded-full
        bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
        shadow-lg border border-slate-100 dark:border-gray-700
        flex items-center justify-center cursor-pointer
      "
    >
      <Sun className="w-5 h-5 text-green-600" />
    </motion.button>
  );
};

const ThemeToggleButton = ({ 
  theme, 
  setTheme 
}: { 
  theme: "light" | "dark"; 
  setTheme: (t: "light" | "dark") => void 
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      title={`Switch to ${theme === "light" ? "Dark Map Theme" : "Light Map Theme"}`}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="
        absolute top-3 left-3 z-1000
        w-11 h-11 md:w-12 md:h-12
        rounded-full
        bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
        shadow-lg border border-slate-100 dark:border-gray-700
        flex items-center justify-center cursor-pointer
      "
    >
      {theme === "light" ? (
        <Moon className="w-5 h-5 text-indigo-600" />
      ) : (
        <Sun className="w-5 h-5 text-amber-500" />
      )}
    </motion.button>
  );
};

const TourPlayButton = ({
  isPlaying,
  activeStopIndex,
  onClick,
}: {
  isPlaying: boolean;
  activeStopIndex: number;
  onClick: () => void;
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      title={isPlaying ? "Pause Tour" : activeStopIndex > 0 ? "Resume Tour" : "Start Autopilot Tour"}
      onClick={onClick}
      className={`
        absolute top-16 left-3 z-1000
        px-3.5 py-2 rounded-xl backdrop-blur-xl shadow-lg border
        flex items-center gap-1.5 text-[11px] font-extrabold transition-all cursor-pointer uppercase tracking-wider
        ${
          isPlaying
            ? "bg-red-500 text-white border-red-600 animate-pulse"
            : "bg-white/95 dark:bg-gray-800/95 text-green-600 dark:text-green-400 border-slate-100 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700"
        }
      `}
    >
      {isPlaying ? (
        <>
          <Pause className="w-3.5 h-3.5 fill-current shrink-0" />
          <span>Pause Tour</span>
        </>
      ) : (
        <>
          <Play className="w-3.5 h-3.5 fill-current shrink-0" />
          <span>{activeStopIndex > 0 ? "Resume" : "Tour Route"}</span>
        </>
      )}
    </motion.button>
  );
};

const RadiusSliderOverlay = ({ 
  radius, 
  setRadius 
}: { 
  radius: number; 
  setRadius: (r: number) => void 
}) => {
  return (
    <div className="absolute top-16 right-3 z-1000 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl px-4 py-2.5 rounded-2xl shadow-lg border border-slate-100 dark:border-gray-700 flex flex-col gap-1.5 w-40">
      <div className="flex justify-between items-center text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">
        <span className="flex items-center gap-1"><Sliders className="w-3 h-3 text-slate-400" /> Radius</span>
        <span className="text-green-600">{(radius / 1000).toFixed(0)} km</span>
      </div>
      <input 
        type="range" 
        min="3000" 
        max="25000" 
        step="1000"
        value={radius} 
        onChange={(e) => setRadius(parseInt(e.target.value))}
        className="w-full h-1 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
      />
    </div>
  );
};

// Map focus controller component to handle fly-to events from place cards
const MapController: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    const handleFocus = (e: any) => {
      const { coords } = e.detail;
      if (coords && Array.isArray(coords) && coords.length === 2) {
        map.flyTo(coords as [number, number], 15, { animate: true, duration: 1.2 });
      }
    };
    window.addEventListener("map:focus", handleFocus);
    return () => window.removeEventListener("map:focus", handleFocus);
  }, [map]);
  return null;
};

// Map boundary resetter component to dynamically update center/zoom on trip updates
const MapResetter = ({ bounds }: { bounds: L.LatLngBounds }) => {
  const map = useMap();
  const boundsStr = bounds.isValid() ? bounds.toBBoxString() : "";
  
  useEffect(() => {
    if (bounds.isValid()) {
      map.flyToBounds(bounds, { padding: [60, 60], animate: true, duration: 1.5 });
    }
  }, [boundsStr, map]); // depend strictly on bbox representation
  return null;
};

// Tour Autopilot fly-through coordinator
const TourAutopilot = ({
  isPlaying,
  stops,
  activeStopIndex,
  onStopChange,
  onComplete,
}: {
  isPlaying: boolean;
  stops: any[];
  activeStopIndex: number;
  onStopChange: (index: number) => void;
  onComplete: () => void;
}) => {
  const map = useMap();
  const indexRef = useRef(activeStopIndex);

  useEffect(() => {
    indexRef.current = activeStopIndex;
  }, [activeStopIndex]);

  useEffect(() => {
    if (!isPlaying || stops.length === 0) return;

    const playNextStop = () => {
      if (indexRef.current >= stops.length) {
        onComplete();
        return;
      }

      onStopChange(indexRef.current);
      map.flyTo(stops[indexRef.current].coords, 15.5, { animate: true, duration: 1.5 });
      indexRef.current++;
    };

    // Run first step immediately if starting/resuming
    playNextStop();

    // Trigger timer loops
    const timerId = setInterval(playNextStop, 5000);

    return () => clearInterval(timerId);
  }, [isPlaying, stops, map, onStopChange, onComplete]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({
  source,
  destination,
  places = [],
}) => {
  const [route, setRoute] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");
  const [activeLegendCategory, setActiveLegendCategory] = useState<string | null>(null);
  const [hoveredPlaceName, setHoveredPlaceName] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState<number>(10000); // 10 km default

  // Autopilot Tour states
  const [isPlayingTour, setIsPlayingTour] = useState(false);
  const [activeTourStopIndex, setActiveTourStopIndex] = useState(0);
  const [hasStartedTour, setHasStartedTour] = useState(false);

  // Extract coordinate values as primitives so useMemo doesn't re-trigger on inline object ref changes
  const sourceCoordsStr = JSON.stringify(source.coords);
  const destCoordsStr = JSON.stringify(destination.coords);

  const coords = useMemo(
    () => [normalizeCoords(source.coords), normalizeCoords(destination.coords)],
    [sourceCoordsStr, destCoordsStr]
  );

  useEffect(() => {
    (async () => {
      const q = coords.map(([lat, lng]) => `${lng},${lat}`).join(";");
      const r = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${q}?geometries=geojson`
      );
      const d = await r.json();
      const g = d.routes[0].geometry.coordinates.map(
        ([lng, lat]: any) => [lat, lng]
      );
      setRoute(g);
      setRouteInfo(d.routes[0]);
    })();
  }, [coords]); // only fetch on true coordinate changes

  // Card hover synchronization listeners
  useEffect(() => {
    const handleHoverStart = (e: any) => setHoveredPlaceName(e.detail?.name || null);
    const handleHoverEnd = () => setHoveredPlaceName(null);

    window.addEventListener("map:hover-start", handleHoverStart);
    window.addEventListener("map:hover-end", handleHoverEnd);

    return () => {
      window.removeEventListener("map:hover-start", handleHoverStart);
      window.removeEventListener("map:hover-end", handleHoverEnd);
    };
  }, []);

  const bounds = L.latLngBounds(route.length ? route : coords);

  // Filter stopover markers based on radius search and category selectors
  const filteredPlaces = useMemo(() => {
    return places.filter((p) => {
      // 1. Haversine distance verification checks
      const pCoords = normalizeCoords(p.coords);
      const distToSource = getDistance(coords[0], pCoords);
      const distToDest = getDistance(coords[1], pCoords);

      if (distToSource > searchRadius && distToDest > searchRadius) {
        return false;
      }

      // 2. Legend category filter checks
      if (!activeLegendCategory) return true;
      const cat = (p.category || "").toLowerCase();
      if (activeLegendCategory === "restaurants") {
        return cat.includes("restaurant") || cat.includes("food") || cat.includes("cafe");
      }
      if (activeLegendCategory === "hotels") {
        return cat.includes("hotel");
      }
      if (activeLegendCategory === "scenic") {
        return (
          cat.includes("scenic") ||
          cat.includes("museum") ||
          cat.includes("historic") ||
          cat.includes("park") ||
          cat.includes("temple") ||
          cat.includes("landmark") ||
          cat.includes("attraction")
        );
      }
      return true;
    });
  }, [places, activeLegendCategory, searchRadius, coords]);

  // Tour stops compiler: Source -> stopovers inside radius -> Destination
  const tourStops = useMemo(() => {
    const sourceStop = {
      name: `Departure: ${source.name.split(",")[0]}`,
      coords: coords[0],
      place: {
        name: source.name.split(",")[0],
        location: source.name,
        category: "Departure Point",
        description: "Departure Point of your SafarNama travel guide route.",
      },
    };
    
    const destinationStop = {
      name: `Arrival: ${destination.name.split(",")[0]}`,
      coords: coords[1],
      place: {
        name: destination.name.split(",")[0],
        location: destination.name,
        category: "Final Stop",
        description: "Final Stop of your SafarNama travel guide route.",
      },
    };

    return [
      sourceStop,
      ...filteredPlaces.map((p) => ({
        name: p.name,
        coords: normalizeCoords(p.coords),
        place: p,
      })),
      destinationStop,
    ];
  }, [coords, source, destination, filteredPlaces]);

  const handleLegendCategoryToggle = (category: string) => {
    setActiveLegendCategory((prev) => (prev === category ? null : category));
  };

  const getIcon = (c: string, isHovered: boolean) => {
    const cat = c.toLowerCase();
    let imgSource = GhatIcon;
    if (cat.includes("restaurant")) imgSource = RestaurantIcon;
    else if (cat.includes("hotel")) imgSource = HotelIcon;
    else if (cat.includes("scenic")) imgSource = ScenicIcon;
    else if (cat.includes("temple")) imgSource = TempleIcon;

    return createPlaceIcon(imgSource, isHovered);
  };

  const handleTourPlayToggle = () => {
    if (!hasStartedTour) {
      setHasStartedTour(true);
    }
    setIsPlayingTour((prev) => !prev);
  };

  const handleTourReset = () => {
    setIsPlayingTour(false);
    setHasStartedTour(false);
    setActiveTourStopIndex(0);
  };

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden z-0 shadow-lg border border-slate-100">
      <MapContainer
        bounds={bounds}
        className="w-full h-full"
        scrollWheelZoom="center"
        doubleClickZoom={false}
        touchZoom={true}
        zoomControl={false}
      >
        {mapTheme === "light" ? (
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
        ) : (
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
        )}

        <MapController />
        <MapResetter bounds={bounds} />
        <TourAutopilot
          isPlaying={isPlayingTour}
          stops={tourStops}
          activeStopIndex={activeTourStopIndex}
          onStopChange={setActiveTourStopIndex}
          onComplete={handleTourReset}
        />
        
        <ThemeToggleButton theme={mapTheme} setTheme={setMapTheme} />
        <TourPlayButton 
          isPlaying={isPlayingTour} 
          activeStopIndex={activeTourStopIndex} 
          onClick={handleTourPlayToggle} 
        />

        <AutoFocusButton bounds={bounds} />
        <RadiusSliderOverlay radius={searchRadius} setRadius={setSearchRadius} />

        {/* Dynamic Search Area Circle Polygons */}
        <Circle 
          center={coords[0]} 
          radius={searchRadius}
          pathOptions={{ 
            color: "#2563eb", 
            fillColor: "#2563eb", 
            fillOpacity: mapTheme === "light" ? 0.05 : 0.08, 
            weight: 1.5, 
            dashArray: "6, 6" 
          }} 
        >
          <Popup>
            <div className="p-1.5 text-xs text-slate-600">
              <span className="font-extrabold text-blue-600 block mb-0.5">Departure Search Area</span>
              SafarNama scanned coordinates inside this {(searchRadius / 1000).toFixed(0)} km radius to index stopovers.
            </div>
          </Popup>
        </Circle>

        <Circle 
          center={coords[1]} 
          radius={searchRadius}
          pathOptions={{ 
            color: "#dc2626", 
            fillColor: "#dc2626", 
            fillOpacity: mapTheme === "light" ? 0.05 : 0.08, 
            weight: 1.5, 
            dashArray: "6, 6" 
          }} 
        >
          <Popup>
            <div className="p-1.5 text-xs text-slate-600">
              <span className="font-extrabold text-red-600 block mb-0.5">Arrival Search Area</span>
              SafarNama scanned coordinates inside this {(searchRadius / 1000).toFixed(0)} km radius to index final stops.
            </div>
          </Popup>
        </Circle>

        {/* Route layers with neon glow effect (stronger opacity halo in dark mode) */}
        <Polyline 
          positions={route} 
          pathOptions={{ 
            color: mapTheme === "light" ? "#bbf7d0" : "#22c55e", 
            weight: mapTheme === "light" ? 9 : 12, 
            opacity: mapTheme === "light" ? 0.4 : 0.25 
          }} 
        />
        <Polyline positions={route} pathOptions={{ color: "#22c55e", weight: 5 }} />
        <PolylineDecoratorLayer positions={route} color="#22c55e" />

        {/* Source marker */}
        <Marker position={coords[0]} icon={createPinIcon("#2563eb")}>
          <Popup>
            <div className="p-1 space-y-1">
              <span className="inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold bg-blue-100 text-blue-700 rounded">
                Departure Point
              </span>
              <h4 className="font-extrabold text-sm text-slate-800 leading-snug m-0 mt-1">
                {source.name.split(",")[0]}
              </h4>
              <p className="text-xs text-slate-500 m-0 truncate max-w-[200px]">
                {source.name}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Destination marker */}
        <Marker position={coords[1]} icon={createPinIcon("#dc2626")}>
          <Popup>
            <div className="p-1 space-y-1">
              <span className="inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold bg-red-100 text-red-700 rounded">
                Final Stop
              </span>
              <h4 className="font-extrabold text-sm text-slate-800 leading-snug m-0 mt-1">
                {destination.name.split(",")[0]}
              </h4>
              <p className="text-xs text-slate-500 m-0 truncate max-w-[200px]">
                {destination.name}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* Curated Route Stopover Places (reactive hover-sync style applied) */}
        {filteredPlaces.map((p, i) => {
          const isHovered = hoveredPlaceName === p.name;
          return (
            <Marker
              key={`${p.name}-${i}`}
              position={normalizeCoords(p.coords)}
              icon={getIcon(p.category, isHovered)}
            >
              <Popup>
                <div className="p-1 space-y-1">
                  <span className="inline-block px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold bg-green-100 text-green-700 rounded">
                    {p.category}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-800 leading-snug m-0 mt-1">
                    {p.name}
                  </h4>
                  <p className="text-xs text-slate-500 m-0 truncate max-w-[200px]">
                    {p.location || "Curated stopover"}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {hasStartedTour && tourStops[activeTourStopIndex] && (
          <Popup
            position={tourStops[activeTourStopIndex].coords}
            closeButton={false}
            offset={
              activeTourStopIndex === 0 || activeTourStopIndex === tourStops.length - 1
                ? [0, -38]
                : [0, -30]
            }
          >
            <div className="p-1 text-center min-w-32">
              <span className="inline-block px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-bold bg-green-500 text-white rounded animate-pulse">
                Tour Focus
              </span>
              <h5 className="font-extrabold text-xs text-slate-800 mt-1 m-0">
                {tourStops[activeTourStopIndex].place.name}
              </h5>
            </div>
          </Popup>
        )}
      </MapContainer>

      {/* Autopilot Tour Overlay Panel Card */}
      <AnimatePresence mode="wait">
        {hasStartedTour && tourStops[activeTourStopIndex] && (
          <motion.div
            key={activeTourStopIndex} // triggers slide animation on step transitions
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="
              absolute bottom-4 left-1/2 -translate-x-1/2 z-1000
              w-[92%] sm:w-[400px]
              bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl
              rounded-3xl border border-slate-100 dark:border-gray-700
              shadow-[0_15px_45px_rgba(0,0,0,0.18)]
              p-5 flex flex-col gap-2.5
            "
          >
            {/* Header info */}
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="inline-block px-2.5 py-0.5 text-[8px] uppercase tracking-widest font-extrabold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-md">
                  Stop {activeTourStopIndex + 1} of {tourStops.length}
                </span>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 leading-snug mt-1.5 line-clamp-1">
                  {tourStops[activeTourStopIndex].place.name}
                </h3>
              </div>
              
              <button
                onClick={handleTourReset}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-400 hover:text-slate-600 transition shrink-0 cursor-pointer"
                title="Exit Tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Address & Meta */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="truncate max-w-[240px]">
                {tourStops[activeTourStopIndex].place.location || "Route point"}
              </span>
              {(tourStops[activeTourStopIndex].place as any).rating && (
                <span className="flex items-center gap-0.5 font-bold text-slate-700 dark:text-slate-200 shrink-0 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded-md border border-amber-100/50">
                  ★ {(tourStops[activeTourStopIndex].place as any).rating}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-slate-400 dark:text-slate-300 text-xs leading-relaxed line-clamp-2">
              {(tourStops[activeTourStopIndex].place as any).description || "Explore this highlights stopover curated on your SafarNama itinerary."}
            </p>

            {/* Navigation Progress bar (only animating when active) */}
            <div className="w-full h-1 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
              <motion.div 
                key={`${activeTourStopIndex}-${isPlayingTour}`} // resets animation on play/pause
                className="h-full bg-green-500"
                initial={{ width: "0%" }}
                animate={{ width: isPlayingTour ? "100%" : "100%" }}
                transition={isPlayingTour ? { duration: 5, ease: "linear" } : { duration: 0.1 }}
              />
            </div>

            {/* Autopilot Controls */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-gray-700">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isPlayingTour ? "bg-green-500 animate-ping" : "bg-amber-500"}`} />
                {isPlayingTour ? "Auto Cruising..." : "Tour Paused"}
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTourReset}
                  className="py-1 px-2.5 border border-slate-200 dark:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-600 dark:text-slate-300 font-extrabold text-[9px] rounded-lg cursor-pointer uppercase transition"
                >
                  Reset
                </button>
                <button
                  onClick={handleTourPlayToggle}
                  className="py-1 px-3 bg-green-500 hover:bg-green-600 text-white font-extrabold text-[9px] rounded-lg cursor-pointer uppercase transition shadow-sm"
                >
                  {isPlayingTour ? "Pause" : "Resume"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {routeInfo && (
        <>
          <DesktopRouteInfo
            distance={routeInfo.distance}
            duration={routeInfo.duration} />
          <DesktopMiniLegend 
            activeCategory={activeLegendCategory}
            onCategoryToggle={handleLegendCategoryToggle}
          />
        </>
      )}

      {routeInfo && (
        <RouteInfoCard
          distance={routeInfo.distance}
          duration={routeInfo.duration}
          activeCategory={activeLegendCategory}
          onCategoryToggle={handleLegendCategoryToggle}
        />
      )}
    </div>
  );
};