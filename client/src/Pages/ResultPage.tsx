import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapView } from "../Components/ResultComponents/Mapview";
import { ResultsPanel } from "../Components/ResultComponents/ResultsPanel";
import { SkeletonLoader } from "../Components/Shared/SkeletonLoader";
import { ErrorMessage } from "../Components/Shared/ErrorMessage";
import type { TripData, Coordinates, PlaceWithCoords, Place } from "@/hooks/types";
import { PageStatus } from "./PageStatus";
import { useToast } from "../Components/Shared/ToastContext";
import { useAuthModal } from "../Components/AuthComponents/AuthModalContext";
import { useAuth } from "../Components/AuthComponents/AuthContext";
import { Header } from "@/Components/HomeComponents/Header";
import { TripService } from "@/Services/Trip/Trip.service";
import { geocodeSinglePlace, fetchRoute } from "@/hooks/geoUtils";

export const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const { openModal } = useAuthModal();
  const { addToast } = useToast();

  const [tripData, setTripData] = useState<TripData | null>(null);
  const [sourceCoords, setSourceCoords] = useState<Coordinates | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
  const [routePolyline, setRoutePolyline] = useState<Coordinates[] | null>(null);

  // Preference details passed from Home search
  const [travelDate, setTravelDate] = useState<string | null>(null);
  const [travelCompanions, setTravelCompanions] = useState<string | null>(null);
  const [vehicleMode, setVehicleMode] = useState<string | null>(null);
  const [tripPreference, setTripPreference] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvingDetails, setResolvingDetails] = useState(false);

  /* ---------------- Sync state with location and save/load from localStorage ---------------- */
  useEffect(() => {
    if (location.state?.tripData) {
      const state = location.state;
      setTripData(state.tripData);
      setSourceCoords(state.sourceCoords || null);
      setDestinationCoords(state.destinationCoords || null);
      setRoutePolyline(state.routePolyline || null);
      setTravelDate(state.travelDate || null);
      setTravelCompanions(state.travelCompanions || null);
      setVehicleMode(state.vehicleMode || null);
      setTripPreference(state.tripPreference || null);

      localStorage.setItem("lastTripData", JSON.stringify(state.tripData));
      localStorage.setItem("lastSourceCoords", JSON.stringify(state.sourceCoords || null));
      localStorage.setItem("lastDestinationCoords", JSON.stringify(state.destinationCoords || null));
      localStorage.setItem("lastRoutePolyline", JSON.stringify(state.routePolyline || null));
      localStorage.setItem("lastTravelDate", JSON.stringify(state.travelDate || null));
      localStorage.setItem("lastTravelCompanions", JSON.stringify(state.travelCompanions || null));
      localStorage.setItem("lastVehicleMode", JSON.stringify(state.vehicleMode || null));
      localStorage.setItem("lastTripPreference", JSON.stringify(state.tripPreference || null));
    } else {
      const savedTripData = localStorage.getItem("lastTripData");
      const savedSourceCoords = localStorage.getItem("lastSourceCoords");
      const savedDestinationCoords = localStorage.getItem("lastDestinationCoords");
      const savedRoutePolyline = localStorage.getItem("lastRoutePolyline");
      const savedTravelDate = localStorage.getItem("lastTravelDate");
      const savedTravelCompanions = localStorage.getItem("lastTravelCompanions");
      const savedVehicleMode = localStorage.getItem("lastVehicleMode");
      const savedTripPreference = localStorage.getItem("lastTripPreference");

      if (savedTripData) {
        setTripData(JSON.parse(savedTripData));
        if (savedSourceCoords) setSourceCoords(JSON.parse(savedSourceCoords));
        if (savedDestinationCoords) setDestinationCoords(JSON.parse(savedDestinationCoords));
        if (savedRoutePolyline) setRoutePolyline(JSON.parse(savedRoutePolyline));
        if (savedTravelDate) setTravelDate(JSON.parse(savedTravelDate));
        if (savedTravelCompanions) setTravelCompanions(JSON.parse(savedTravelCompanions));
        if (savedVehicleMode) setVehicleMode(JSON.parse(savedVehicleMode));
        if (savedTripPreference) setTripPreference(JSON.parse(savedTripPreference));
      } else {
        setError("No trip data found. Redirecting to home...");
        const t = setTimeout(() => navigate("/"), 2500);
        return () => clearTimeout(t);
      }
    }
  }, [location.state, navigate]);

  /* ---------------- Resolve coordinates and routes if missing (from Saved Trips) ---------------- */
  useEffect(() => {
    if (!tripData || resolvingDetails) return;

    const resolveCoordsAndRoute = async () => {
      let src = sourceCoords;
      let dest = destinationCoords;
      let route = routePolyline;

      // 1. Geocode endpoints if missing
      if (!src || !dest) {
        setResolvingDetails(true);
        try {
          const [sCoordData, dCoordData] = await Promise.all([
            !src ? geocodeSinglePlace({ name: tripData.source, location: "" } as Place) : Promise.resolve(null),
            !dest ? geocodeSinglePlace({ name: tripData.destination, location: "" } as Place) : Promise.resolve(null),
          ]);
          if (sCoordData?.coords) {
            src = sCoordData.coords;
            setSourceCoords(src);
            localStorage.setItem("lastSourceCoords", JSON.stringify(src));
          }
          if (dCoordData?.coords) {
            dest = dCoordData.coords;
            setDestinationCoords(dest);
            localStorage.setItem("lastDestinationCoords", JSON.stringify(dest));
          }
        } catch (e) {
          console.error("Failed to geocode saved trip endpoints:", e);
        }
      }

      // 2. Fetch routing polyline if missing
      if (src && dest && (!route || route.length === 0)) {
        setResolvingDetails(true);
        try {
          const routeResult = await fetchRoute(src, dest);
          if (routeResult?.route) {
            route = routeResult.route;
            setRoutePolyline(route);
            localStorage.setItem("lastRoutePolyline", JSON.stringify(route));
          }
        } catch (e) {
          console.error("Failed to fetch route for saved trip:", e);
        }
      }
      setResolvingDetails(false);
    };

    resolveCoordsAndRoute();
  }, [tripData, sourceCoords, destinationCoords, routePolyline, resolvingDetails]);

  const isLoading = !tripData && !error;

  /* ---------------- Normalize places safely ---------------- */
  const placesWithCoords: PlaceWithCoords[] = useMemo(() => {
    if (!tripData?.places) return [];

    return tripData.places
      .map((p: any) => {
        const lat = p.lat ?? p.latitude ?? (Array.isArray(p.coords) ? p.coords[0] : null);
        const lng = p.lng ?? p.longitude ?? (Array.isArray(p.coords) ? p.coords[1] : null);
        return {
          ...p,
          coords: (lat !== null && lng !== null ? [lat, lng] : p.coords) as Coordinates,
        };
      })
      .filter((p: any) => Array.isArray(p.coords) && p.coords.length === 2);
  }, [tripData]);

  /* ---------------- Save Trip ---------------- */
  const handleSaveTrip = async () => {
    if (!isAuthenticated) {
      openModal("login");
      addToast({ message: "Please login to save trips.", type: "info" });
      return;
    }

    if (!tripData) return;

    setIsSaving(true);
    try {
      const res = await TripService.save({
        source: tripData.source,
        destination: tripData.destination,
        distance: tripData.distance,
        duration: tripData.duration,
        summary: tripData.summary,
        highlights: tripData.highlights,
        itinerary: tripData.itinerary,
        places: placesWithCoords,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to save trip");
      }

      addToast({ message: "Trip saved successfully!", type: "success" });
      navigate("/dashboard");
    } catch (err: any) {
      addToast({ message: err.message, type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------- UI ---------------- */
  if (!tripData) {
    return (
      <div className="relative">
        {error && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <ErrorMessage message={error} />
          </div>
        )}
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-gray-900/50 pb-20">
      <Header />
      <PageStatus isLoading={isLoading} error={error} onRetry={() => navigate("/")} />

      {!isLoading && !error && (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 space-y-8">
          
          {/* Header Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-6 rounded-3xl border border-slate-100 dark:border-gray-700 shadow-sm gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">
                Your Travel Guide
              </h1>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Explore custom timeline directions, stopovers, and weather highlights.
              </p>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <motion.button
                onClick={() => navigate("/#home")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="py-2.5 px-5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-gray-700 hover:bg-slate-200 dark:hover:bg-gray-600 transition cursor-pointer text-center"
              >
                Plan Another Trip
              </motion.button>

              <motion.button
                onClick={handleSaveTrip}
                disabled={isSaving || !!error}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`py-2.5 px-5 rounded-xl font-bold text-xs text-white transition cursor-pointer text-center ${
                  isSaving
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 shadow-md shadow-green-500/10"
                }`}
              >
                {isSaving ? "Saving Plan..." : "Save Trip"}
              </motion.button>
            </div>
          </div>

          {/* Map Section (Top Placement) */}
          <div className="h-[60vh] md:h-[65vh] w-full rounded-3xl overflow-hidden shadow-xl border border-slate-100/50 dark:border-gray-800 bg-white dark:bg-gray-800 p-2">
            {sourceCoords && destinationCoords && routePolyline ? (
              <MapView
                source={{ name: tripData.source, coords: sourceCoords }}
                destination={{
                  name: tripData.destination,
                  coords: destinationCoords,
                }}
                places={placesWithCoords}
                route={routePolyline}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50/50 dark:bg-gray-800/50 rounded-2xl">
                <SkeletonLoader />
              </div>
            )}
          </div>

          {/* Results Panel: Itinerary Timelines & Stop Cards (Bottom Placement) */}
          <ResultsPanel
            tripData={tripData}
            sourceCoords={sourceCoords}
            destinationCoords={destinationCoords}
            travelDate={travelDate}
            travelCompanions={travelCompanions}
            vehicleMode={vehicleMode}
            tripPreference={tripPreference}
          />

        </main>
      )}
    </div>
  );
};