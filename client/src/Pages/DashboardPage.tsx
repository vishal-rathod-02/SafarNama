import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { RecentTrips } from "../Components/DashboardLayout/RecentTrips";
import { StatsPanel } from "../Components/DashboardLayout/StatsPanel";
import { ActionCards } from "../Components/DashboardLayout/ActionCards";
import { useAuth } from "../Components/AuthComponents/AuthContext";
import { ArrowLeftIcon, HomeIcon, LayoutDashboard } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const userName = user?.fullName?.split(" ")[0] || "Traveler";

  const state = location.state?.fromResultsState;

  // Persist state in localStorage for session preservation
  useEffect(() => {
    if (state) {
      localStorage.setItem("fromResultsState", JSON.stringify(state));
    }
  }, [state]);

  const handleBackToResults = () => {
    if (state) {
      navigate("/results", { state });
    } else {
      const saved = localStorage.getItem("fromResultsState");
      if (saved) {
        navigate("/results", { state: JSON.parse(saved) });
      } else {
        navigate("/");
      }
    }
  };

  const handleGoHome = () => navigate("/#home");

  return (
    <div className="flex flex-col min-h-full pb-10 bg-slate-50 dark:bg-slate-950">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="p-4 sm:p-6 lg:p-10 space-y-8 lg:space-y-10">
          {/* Welcome Card */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden bg-linear-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-8 sm:p-10 flex flex-col justify-between hover:shadow-amber-500/5 transition-all duration-300 bg-premium-grid bg-premium-mesh"
          >
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.15),transparent_60%)] pointer-events-none" />

            <LayoutDashboard className="absolute top-6 right-6 w-20 h-20 text-amber-500/10 hidden sm:block shrink-0 pointer-events-none" />

            <div className="mb-6 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold mb-3">
                Command Center
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Hello, {userName} 👋
              </h2>
              <p className="text-sm sm:text-base text-slate-300 mt-2 font-medium max-w-xl leading-relaxed">
                Your next adventure awaits. Review your travel stats, manage saved timelines, or plan a brand-new route instantly.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4 relative z-10">
              {/* Back to Results */}
              <motion.button
                onClick={handleBackToResults}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition cursor-pointer tracking-wide"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Results
              </motion.button>

              {/* Go Home */}
              <motion.button
                onClick={handleGoHome}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 transition cursor-pointer"
              >
                <HomeIcon className="w-4 h-4" />
                Home
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Panel + Recent Trips */}
          <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-8" variants={itemVariants}>
            <section className="lg:col-span-2">
              <RecentTrips />
            </section>
            <section className="lg:col-span-1">
              <StatsPanel />
            </section>
          </motion.div>

          {/* Quick Actions */}
          <motion.section variants={itemVariants}>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Quick Actions</h3>
            <ActionCards />
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
};
