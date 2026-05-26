import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapView } from "../Components/ResultComponents/Mapview";
import { ResultsPanel } from "../Components/ResultComponents/ResultsPanel";
import { SkeletonLoader } from "../Components/Shared/SkeletonLoader";
import { ErrorMessage } from "../Components/Shared/ErrorMessage";
import type { TripData, Coordinates, PlaceWithCoords, } from "@/hooks/types";
import { PageStatus } from "./PageStatus";
import { useToast } from "../Components/Shared/ToastContext";
import { useAuthModal } from "../Components/AuthComponents/AuthModalContext";
import { useAuth } from "../Components/AuthComponents/AuthContext";
import { Header } from "@/Components/HomeComponents/Header";
import { TripService } from "@/Services/Trip/Trip.service";

export const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { isAuthenticated } = useAuth();
  const { openModal } = useAuthModal();
  const { addToast } = useToast();

  const tripData: TripData | undefined = location.state?.tripData;
  const sourceCoords: Coordinates | null = location.state?.sourceCoords || null;
  const destinationCoords: Coordinates | null =
    location.state?.destinationCoords || null;
  const routePolyline: Coordinates[] | null =
    location.state?.routePolyline || null;

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Redirect if no data ---------------- */
  useEffect(() => {
    if (!tripData) {
      setError("No trip data found. Redirecting to home...");
      const t = setTimeout(() => navigate("/"), 2500);
      return () => clearTimeout(t);
    }
  }, [tripData, navigate]);

  const isLoading = !tripData && !error;

  /* ---------------- Normalize places safely ---------------- */
  const placesWithCoords: PlaceWithCoords[] = useMemo(() => {
    if (!tripData?.places) return [];

    return tripData.places
      .filter((p: any) => Array.isArray(p.coords))
      .map((p: any) => ({
        ...p,
        coords: p.coords as Coordinates,
      }));
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
    <section className="container space-x-4 py-10 space-y-10 w-screen z-0">
      <Header />
      <PageStatus isLoading={isLoading} error={error} onRetry={() => navigate("/")} />

      {!isLoading && !error && (
        <>
          {/* Map */}
          <div className="h-[70vh] w-full rounded-xl overflow-x-hidden px-6 ">
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
              <SkeletonLoader />
            )}
          </div>

          {/* Panels */}
          <ResultsPanel tripData={tripData} />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button
              onClick={() => navigate("/#home")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="px-6 py-3 rounded-xl font-semibold text-white bg-linear-to-r from-green-500 to-emerald-600"
            >
              Plan Another Trip
            </motion.button>

            <motion.button
              onClick={handleSaveTrip}
              disabled={isSaving || !!error}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className={`px-6 py-3 rounded-xl font-semibold text-white ${isSaving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-linear-to-r from-blue-500 to-indigo-600"
                }`}
            >
              {isSaving ? "Saving..." : "Save Trip"}
            </motion.button>
          </div>
        </>
      )}
    </section>
  );
};