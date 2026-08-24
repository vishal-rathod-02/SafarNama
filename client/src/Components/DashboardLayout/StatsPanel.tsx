import React, { useEffect, useState } from "react";
import { Globe, MapPin, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../AuthComponents/AuthContext";
import { useToast } from "../Shared/ToastContext";
import { StatItem } from "@/hooks/types";
import { TripService } from "@/Services/Trip/Trip.service";

const StatsSkeleton = () => (
  <div className="flex flex-col space-y-4 animate-pulse">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-xl w-full" />
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
        
        const formattedStats: StatItem[] = [
          {
            title: "Total Trips",
            value: data.overview?.totalTrips || 0,
            description: "Total trips you've successfully planned.",
            color: "green",
            icon: Globe,
          },
          {
            title: "Total Distance (km)",
            value: data.overview?.totalDistance ? Math.round(data.overview.totalDistance / 1000) : 0,
            description: "Total travel distance covered.",
            color: "blue",
            icon: TrendingUp,
          },
          {
            title: "Top Destination",
            value: data.overview?.topDestination || "None",
            description: "Your most visited location.",
            color: "yellow",
            icon: MapPin,
          },
        ];
        setStats(formattedStats);
      } catch (error: any) {
        addToast({ message: error.message || "Failed to load stats", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token, addToast]);

  if (loading) return <StatsSkeleton />;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 h-full flex flex-col border border-slate-100/50 dark:border-gray-700">
      <h3 className="text-xl font-extrabold text-gray-900 dark:text-slate-100 mb-5 border-b border-slate-100 dark:border-gray-700 pb-3 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
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
            
            // Dynamic scheme mappings based on stats color category
            const colors = {
              green: {
                icon: "text-green-600 bg-green-50 dark:bg-green-950/20",
                value: "text-green-700 dark:text-green-400",
                hover: "hover:border-green-300 dark:hover:border-green-900 hover:shadow-green-500/5 hover:bg-green-50/50 dark:hover:bg-green-950/5",
              },
              blue: {
                icon: "text-blue-600 bg-blue-50 dark:bg-blue-950/20",
                value: "text-blue-700 dark:text-blue-400",
                hover: "hover:border-blue-300 dark:hover:border-blue-900 hover:shadow-blue-500/5 hover:bg-blue-50/50 dark:hover:bg-blue-950/5",
              },
              yellow: {
                icon: "text-amber-600 bg-amber-50 dark:bg-amber-950/20",
                value: "text-amber-700 dark:text-amber-400",
                hover: "hover:border-amber-300 dark:hover:border-amber-900 hover:shadow-amber-500/5 hover:bg-amber-50/50 dark:hover:bg-amber-950/5",
              },
            };
            const scheme = colors[stat.color as keyof typeof colors] || colors.green;

            return (
              <motion.div
                key={stat.title}
                className={`p-4 rounded-xl border border-slate-100 dark:border-gray-700 transition-all duration-300 ${scheme.hover}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${scheme.icon}`}>
                      <Icon className="w-5 h-5 shrink-0" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{stat.title}</p>
                      <p className={`text-2xl font-extrabold mt-0.5 truncate leading-none ${scheme.value}`}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 font-medium">{stat.description}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-gray-700 pt-4 shrink-0">
        Data last updated today
      </div>
    </div>
  );
};