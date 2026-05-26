import React, { useEffect, useState } from "react";
import { Globe, Heart, MapPin, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../AuthComponents/AuthContext";
import { useToast } from "../Shared/ToastContext";
import { StatItem } from "@/hooks/types";
import { TripService } from "@/Services/Trip/Trip.service";

const StatsSkeleton = () => (
  <div className="flex flex-col space-y-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-28 bg-gray-200 rounded-xl w-full" />
    ))}
  </div>
);

export const StatsPanel: React.FC = () => {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return setLoading(false);
      setLoading(true);
      try {
        const res = await TripService.overview();
        if (!res.ok) throw new Error("Failed to fetch stats");

        const data = await res.json();
        
        // Map server response { success, overview: { totalTrips, totalDistance, topDestination } } to StatItem[]
        const formattedStats: StatItem[] = [
          {
            title: "Total Trips",
            value: data.overview?.totalTrips || 0,
            description: "Total trips you've planned.",
            color: "green",
            icon: Globe,
          },
          {
            title: "Total Distance (km)",
            value: data.overview?.totalDistance ? Math.round(data.overview.totalDistance) : 0,
            description: "Total travel distance covered.",
            color: "blue",
            icon: TrendingUp,
          },
          {
            title: "Top Destination",
            value: data.overview?.topDestination ? 1 : 0,
            description: `Most visited: ${data.overview?.topDestination || "None"}`,
            color: "yellow",
            icon: MapPin,
          },
        ];
        setStats(formattedStats);
      } catch (error: any) {
       addToast({ message: error.Message, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, addToast]);

  if (loading) return <StatsSkeleton />;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 h-full flex flex-col">
      <h3 className="text-xl font-extrabold text-gray-900 mb-5 border-b pb-3 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-600" />
        Your Travel Stats
      </h3>

      <AnimatePresence>
        <motion.div
          className="flex flex-col space-y-4 flex-1"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
          }}
        >
          {stats.map((stat) => {
            const Icon = stat.icon;
            const iconColor =
              stat.color === "green"
                ? "text-green-600 bg-green-50"
                : stat.color === "blue"
                ? "text-blue-600 bg-blue-50"
                : "text-yellow-600 bg-yellow-50";
            const valueColor =
              stat.color === "green"
                ? "text-green-700"
                : stat.color === "blue"
                ? "text-blue-700"
                : "text-yellow-700";

            return (
              <motion.div
                key={stat.title}
                className={`p-4 rounded-xl border border-gray-100 transition-all duration-200 hover:shadow-md ${
                  stat.title === "Total Trips" ? "ring-2 ring-green-200" : ""
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className={`text-2xl font-extrabold mt-1 ${valueColor}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-2">{stat.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 text-center text-sm text-gray-500 border-t pt-4">
        Data last updated today
      </div>
    </div>
  );
};