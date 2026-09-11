import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthComponents/AuthContext';
import { TripService } from '@/Services/Trip/Trip.service';
import { useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import { Flag } from 'lucide-react';
import { useToast } from '../Shared/ToastContext';
import { SavedTripCard } from './SavedTripCard';

export const MyTripsPage = () => {
    const { token } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [trips, setTrips] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            if (!token) { setIsLoading(false); return; }
            try {
                const response = await TripService.myTrips();
                if (!response.ok) throw new Error('Failed to fetch your trips.');
                const data = await response.json();
                setTrips(data.trips || []);
            } catch (error: any) {
                addToast({ message: error.message || "Failed to load trips", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrips();
    }, [token, addToast]);

    const handleDeleteTrip = async (tripId: string) => {
        const originalTrips = trips;
        setTrips(prevTrips => prevTrips.filter(trip => trip._id !== tripId));
        addToast({ message: "Trip deleted successfully!", type: "success" });

        try {
            const response = await TripService.deleteTrip(tripId);
            if (!response.ok) throw new Error("Could not delete trip from server.");
        } catch (error) {
            addToast({ message: "Error deleting trip. Restoring.", type: "error" });
            setTrips(originalTrips);
        }
    };

    const handleViewDetails = (trip: any) => {
        navigate("/results", {
            state: {
                tripData: {
                    source: trip.source,
                    destination: trip.destination,
                    distance: trip.distance,
                    duration: trip.duration,
                    summary: trip.summary,
                    highlights: trip.highlights,
                    itinerary: trip.itinerary,
                    places: trip.places,
                },
                sourceCoords: null,
                destinationCoords: null,
                routePolyline: null,
                fromResultsState: null,
            }
        });
    };

    const [selectedShareTrip, setSelectedShareTrip] = useState<any | null>(null);

    const handleShareTrip = (trip: any) => {
        setSelectedShareTrip(trip);
    };

    const handlePrintTrip = (trip: any) => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) return;
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>SafarNama Trip Itinerary - ${trip.source} to ${trip.destination}</title>
                <style>
                  body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #1e293b; max-w: 800px; margin: 0 auto; }
                  h1 { color: #16a34a; font-size: 28px; margin-bottom: 4px; }
                  .subtitle { color: #64748b; font-size: 14px; margin-bottom: 24px; }
                  .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 24px; }
                  .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 14px; }
                  .place-item { padding: 12px; border-bottom: 1px solid #f1f5f9; }
                  .place-item:last-child { border-bottom: none; }
                </style>
              </head>
              <body>
                <h1>🗺️ SafarNama Travel Itinerary</h1>
                <p class="subtitle">Generated on ${new Date().toLocaleDateString()}</p>
                <div class="card">
                  <div class="meta-grid">
                    <div><strong>From:</strong> ${trip.source}</div>
                    <div><strong>To:</strong> ${trip.destination}</div>
                    <div><strong>Distance:</strong> ${(trip.distance / 1000).toFixed(1)} km</div>
                    <div><strong>Stops Count:</strong> ${trip.places ? trip.places.length : 0}</div>
                  </div>
                </div>
                <h2>Planned Destinations & Sightseeing</h2>
                <div>
                  ${(trip.places || []).map((p: any, idx: number) => `
                    <div class="place-item">
                      <strong>${idx + 1}. ${typeof p === 'string' ? p : p.name || 'Attraction'}</strong>
                      ${p.category ? `<span style="color:#64748b; font-size:12px;"> (${p.category})</span>` : ''}
                      ${p.location ? `<div style="font-size:12px; color:#64748b; margin-top:2px;">${p.location}</div>` : ''}
                    </div>
                  `).join("")}
                </div>
                <script>window.onload = function() { window.print(); }</script>
              </body>
            </html>
        `);
        printWindow.document.close();
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-12 h-12 border-3 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading your saved journeys...</p>
            </div>
        );
    }

    return (
        <motion.div
            className="container mx-auto py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 min-h-screen"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
        >
            <div className="max-w-7xl mx-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold mb-2">
                    Personalized Vault
                </div>
                <motion.h1
                    variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
                    className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
                >
                    My Saved Trips
                </motion.h1>
                <motion.p
                    variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
                    className="text-slate-500 dark:text-slate-400 mt-1 mb-10 text-sm sm:text-base"
                >
                    Review and explore your personalized custom road trip plans.
                </motion.p>

                <AnimatePresence mode="popLayout">
                    {trips.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {trips.map((trip) => (
                                <SavedTripCard
                                    key={trip._id}
                                    trip={trip}
                                    onDelete={handleDeleteTrip}
                                    onView={handleViewDetails}
                                    onShare={handleShareTrip}
                                    onPrint={handlePrintTrip}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 px-4"
                        >
                            <Flag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No trips saved yet</h3>
                            <p className="text-slate-500 dark:text-slate-400 mt-1 mb-6 text-sm">Plan a route from the homepage to save your first trip guide!</p>
                            <button
                                onClick={() => navigate("/")}
                                className="bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 px-6 rounded-xl transition transform hover:scale-105 cursor-pointer shadow-lg shadow-amber-500/25 tracking-wide text-sm"
                            >
                                Start Planning
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Share Modal */}
            <AnimatePresence>
                {selectedShareTrip && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4"
                        onClick={() => setSelectedShareTrip(null)}
                        role="dialog"
                        aria-modal="true"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/80 dark:border-slate-800"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Share Trip Itinerary</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Copy the shareable link below to invite friends to view this route.</p>
                            <div className="flex items-center gap-2 mt-4">
                                <input
                                    type="text"
                                    readOnly
                                    value={`${window.location.origin}/results?share=${selectedShareTrip._id}`}
                                    className="w-full px-3.5 py-2.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden"
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/results?share=${selectedShareTrip._id}`);
                                        addToast({ message: "Share link copied to clipboard!", type: "success" });
                                        setSelectedShareTrip(null);
                                    }}
                                    className="px-4 py-2.5 text-xs font-black bg-linear-to-r from-amber-500 to-amber-400 text-slate-950 rounded-xl hover:from-amber-400 hover:to-amber-500 transition shrink-0 cursor-pointer shadow-sm shadow-amber-500/20"
                                >
                                    Copy
                                </button>
                            </div>
                            <button
                                onClick={() => setSelectedShareTrip(null)}
                                className="w-full mt-4 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold cursor-pointer"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};