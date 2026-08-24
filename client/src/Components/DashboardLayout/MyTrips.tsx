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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Loading your saved journeys...</p>
            </div>
        );
    }

    return (
        <motion.div
            className="container mx-auto py-24 px-4 sm:px-6 lg:px-8"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
        >
            <div className="max-w-7xl mx-auto">
                <motion.h1
                    variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
                    className="text-4xl font-extrabold text-gray-900 tracking-tight"
                >
                    My Saved Trips
                </motion.h1>
                <motion.p
                    variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
                    className="text-gray-500 mt-2 mb-10"
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
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 border-2 border-dashed border-gray-200 rounded-3xl bg-white px-4"
                        >
                            <Flag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-800">No trips saved yet</h3>
                            <p className="text-gray-500 mt-1 mb-6">Plan a route from the homepage to save your first trip guide!</p>
                            <button
                                onClick={() => navigate("/")}
                                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-xl transition transform hover:scale-105 cursor-pointer"
                            >
                                Start Planning
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};