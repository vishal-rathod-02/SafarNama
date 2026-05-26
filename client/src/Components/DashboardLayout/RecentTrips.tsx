import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../AuthComponents/AuthContext';
import { Plane, Calendar, ChevronRight, Trash2, Loader2 } from "lucide-react"; 
import { TripService } from "@/Services/Trip/Trip.service";

const TripSkeleton = () => (
    <div className="space-y-3">
        {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-3 bg-gray-100 rounded-lg animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-300"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 w-3/4 rounded"></div>
                    <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
                </div>
            </div>
        ))}
    </div>
);

// Helper function to format date (assuming trip.createdAt is available)
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};


export const RecentTrips: React.FC = () => {
    const { token } = useAuth();
    const [recentTrips, setRecentTrips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchTrips = async () => {
            if (!token) { setLoading(false); return; }
            setLoading(true);
            try {
                const res = await TripService.myTrips();
                if (!res.ok) throw new Error("Failed to fetch trips");
                const data = await res.json();
                setRecentTrips(data.trips.slice(0, 5)); 
            } catch (err) {
                console.error(err);
                setRecentTrips([]); // Ensure state is clean on error
            } finally {
                setLoading(false);
            }
        };
        fetchTrips();
    }, [token]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (deletingId) return;

        setDeletingId(id);
        try {
            const res = await TripService.deleteTrip(id);
            if (!res.ok) throw new Error("Could not delete");
            setRecentTrips((prev) => prev.filter(t => t._id !== id));
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col">
            <h3 className="text-xl font-extrabold text-gray-900 mb-5 border-b pb-3">
                Your Recent Journeys
            </h3>

            {loading ? (
                <TripSkeleton />
            ) : recentTrips.length === 0 ? (
                <div className="text-center py-10">
                    <Plane className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Start planning your first trip!</p>
                </div>
            ) : (
                <ul className="space-y-4 flex-1">
                    {recentTrips.map((trip) => (
                        <div key={trip._id} className="relative group flex items-stretch">
                            <Link 
                                to="/mytrips"
                                className="flex-1 block p-4 bg-green-50 rounded-lg border-l-4 border-green-400 
                                           hover:bg-green-100 transition-all duration-200 shadow-sm pr-12 xl:pr-4"
                            >
                                <div className="flex justify-between items-start">
                                    {/* Title and Details */}
                                    <div className="pr-4 sm:pr-0">
                                        <p className="font-bold text-gray-800 line-clamp-1">
                                            {trip.source} <ChevronRight className="w-4 h-4 inline-block text-green-600 mx-0.5" /> {trip.destination}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {trip.places.length} stops &bull; {trip.distance ? `${Math.round(trip.distance)} km` : 'Distance N/A'}
                                        </p>
                                    </div>
                                    
                                    {/* Date / Status */}
                                    <div className="text-right flex items-center gap-1 text-sm text-green-600 font-semibold mt-1 sm:mt-0 xl:-mr-4">
                                        <Calendar className="w-4 h-4 hidden sm:inline" />
                                        <span className="hidden sm:inline">{trip.createdAt ? formatDate(trip.createdAt) : 'N/A'}</span>
                                    </div>
                                </div>
                            </Link>

                            {/* Delete Button (Modern Overlay) */}
                            <button
                                onClick={(e) => handleDelete(e, trip._id)}
                                disabled={deletingId === trip._id}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-gray-400 hover:text-red-600 bg-white/50 hover:bg-red-100 shadow-sm hover:shadow-md rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 backdrop-blur-sm transform hover:scale-110"
                                title="Delete Trip"
                                aria-label="Delete Trip"
                            >
                                {deletingId === trip._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                                ) : (
                                    <Trash2 className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    ))}
                </ul>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100">
                <Link
                    to="/mytrips"
                    className="flex items-center  justify-center gap-2 w-50 m-auto text-green-600 font-bold py-2 rounded-lg hover:bg-green-50 transition duration-150" >
                    View All Saved Trips <ChevronRight className="w-5 h-5" />
                </Link>
            </div>
        </div>
    );
};
