import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthComponents/AuthContext';
import { TripService } from '@/Services/Trip/Trip.service';

import { motion, AnimatePresence } from 'framer-motion';
import { Map, Trash2, Calendar, Flag, Route } from 'lucide-react';
import { useToast } from '../Shared/ToastContext'

// --- THIS IS THE NEW, DYNAMIC SavedTripCard ---
const SavedTripCard = ({ trip, onDelete }: { trip: any; onDelete: (id: string) => void; }) => {

    return (
        <motion.div
            layout
            className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col h-full relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
           whileHover={{ 
                y: -8, 
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)' 
            }}
        >
            <div className="relative h-50">
                {/* <img src={previewImage} alt={trip.source} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-0 right-0 p-2">
                    <button 
                        onClick={() => onDelete(trip._id)}
                        className="p-2 text-white/70 bg-black/20 rounded-full hover:bg-red-500 hover:text-white transition-all transform hover:scale-110"
                        title="Delete Trip"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-800 leading-tight">
                    {trip.source}
                </h3>
                <div className="flex items-center gap-2 my-1 text-gray-500">
                    <Route className="w-4 h-4" />
                    <span className="font-bold">to</span>
                    <Flag className="w-4 h-4" />
                    <h4 className="font-bold text-gray-800">{trip.destination}</h4>
                </div>
                <p className="text-sm text-gray-500 mt-2">{trip.places.length} stops &bull; {trip.distance} km</p>
                <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Saved on: {new Date(trip.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="mt-auto pt-4">
                    <button className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-green-600 transition transform hover:scale-105">
                        <span>View Details</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export const MyTripsPage = () => {
    const { token } = useAuth();
    const { addToast } = useToast();
    const [trips, setTrips] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            if (!token) { setIsLoading(false); return; }
            try {
                const response = await TripService.myTrips();
                if (!response.ok) throw new Error('Failed to fetch your trips.');
                const data = await response.json();
                setTrips(data.trips);
            } catch (error: any) {
                addToast({ message: error.Message, type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchTrips();
    }, [token, addToast]);

    const handleDeleteTrip = async (tripId: string) => {
        // Optimistic UI: remove from state immediately
        const originalTrips = trips;
        setTrips(prevTrips => prevTrips.filter(trip => trip._id !== tripId));
        addToast({message: "Trip deleted successfully!", type: "success"});

        // Then, make the API call to delete from the database
        try {
            const response = await TripService.deleteTrip(tripId);
            if (!response.ok) throw new Error("Could not delete trip from server.");
        } catch (error) {
            addToast({message: "Error deleting trip. Restoring.", type: "error"});
            setTrips(originalTrips); // Revert on error
        }
    };

    if (isLoading) return <div className="text-center py-24">Loading your saved trips...</div>;

    return (
        <motion.div 
            className="container mx-auto py-28 px-4"
            initial="hidden"
            animate="visible"
            variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
        >
            <motion.h1 variants={{hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 }}} className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-2">My Saved Trips</motion.h1>
            <motion.p variants={{hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 }}} className="text-gray-600 mb-12">Your personal collection of planned adventures.</motion.p>
            
            <AnimatePresence>
                {trips.length > 0 ? (
                    <motion.div 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {trips.map((trip) => (
                            <SavedTripCard key={trip._id} trip={trip} onDelete={handleDeleteTrip} />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-20 border-2 border-dashed rounded-2xl"
                    >
                        {/* ... "No trips" message ... */}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};