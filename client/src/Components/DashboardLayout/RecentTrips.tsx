import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../AuthComponents/AuthContext';
import { Plane, Calendar, ChevronRight, Trash2, Loader2 } from "lucide-react"; 
import { TripService } from "@/Services/Trip/Trip.service";

const TripSkeleton = () => (
    <div className="space-y-3">
        {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 w-3/4 rounded-md"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-700 w-1/2 rounded-md"></div>
                </div>
            </div>
        ))}
    </div>
);

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const RecentTrips: React.FC = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
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
                setRecentTrips([]);
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

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 sm:p-8 h-full flex flex-col border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-5 border-b border-slate-100 dark:border-slate-800 pb-3">
                Your Recent Journeys
            </h3>

            {loading ? (
                <TripSkeleton />
            ) : recentTrips.length === 0 ? (
                <div className="text-center py-10 flex-1 flex flex-col justify-center">
                    <Plane className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Start planning your first trip!</p>
                </div>
            ) : (
                <ul className="space-y-4 flex-1">
                    {recentTrips.map((trip, index) => {
                        // Dynamic styling scheme per list item index
                        const colors = [
                          { bg: "bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-950/30 border-amber-400", accent: "text-amber-700 dark:text-amber-400" },
                          { bg: "bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/30 border-emerald-400", accent: "text-emerald-700 dark:text-emerald-400" },
                          { bg: "bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/60 dark:hover:bg-blue-950/30 border-blue-400", accent: "text-blue-700 dark:text-blue-400" },
                          { bg: "bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100/60 dark:hover:bg-indigo-950/30 border-indigo-400", accent: "text-indigo-700 dark:text-indigo-400" },
                          { bg: "bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-950/30 border-amber-400", accent: "text-amber-700 dark:text-amber-400" },
                        ];
                        const scheme = colors[index % colors.length];

                        return (
                            <div key={trip._id} className="relative group flex items-stretch">
                                <button 
                                    onClick={() => handleViewDetails(trip)}
                                    className={`flex-1 text-left block p-4 rounded-2xl border-l-4 transition-all duration-200 shadow-xs pr-12 cursor-pointer ${scheme.bg}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center flex-wrap gap-1 leading-snug">
                                                {trip.source.split(",")[0]} 
                                                <ChevronRight className={`w-3.5 h-3.5 ${scheme.accent}`} /> 
                                                {trip.destination.split(",")[0]}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1 font-semibold">
                                                {trip.places.length} stopovers &bull; {trip.distance ? `${(trip.distance / 1000).toFixed(1)} km` : 'Distance N/A'}
                                            </p>
                                        </div>
                                        
                                        <div className={`text-right flex items-center gap-1 text-[11px] font-bold mt-0.5 ${scheme.accent}`}>
                                            <Calendar className="w-3.5 h-3.5 hidden sm:inline" />
                                            <span className="hidden sm:inline">{trip.createdAt ? formatDate(trip.createdAt) : 'N/A'}</span>
                                        </div>
                                    </div>
                                </button>

                                {/* Delete Overlay Button */}
                                <button
                                    onClick={(e) => handleDelete(e, trip._id)}
                                    disabled={deletingId === trip._id}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-500 bg-white/80 hover:bg-red-50 dark:bg-slate-800/80 dark:hover:bg-red-950/40 shadow-xs hover:shadow-md rounded-xl opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 cursor-pointer"
                                    title="Delete Journey"
                                    aria-label="Delete Journey"
                                >
                                    {deletingId === trip._id ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" />
                                    ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </ul>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <Link
                    to="/mytrips"
                    className="flex items-center justify-center gap-1.5 w-full text-amber-600 dark:text-amber-400 font-black text-sm py-2.5 rounded-xl hover:bg-amber-500/10 dark:hover:bg-amber-500/15 transition duration-150 cursor-pointer" 
                >
                    View All Saved Trips <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
};
