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
    <div className="flex flex-col min-h-full pb-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="p-4 sm:p-6 lg:p-10 space-y-8 lg:space-y-10">
          {/* Welcome Card */}
          <motion.div
            variants={itemVariants}
            className="relative overflow-hidden bg-linear-to-br from-green-600 to-emerald-700 dark:from-green-700 dark:to-emerald-850 rounded-3xl shadow-xl p-8 flex flex-col justify-between hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300"
          >
            {/* Background mesh bubbles */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="absolute right-1/4 -top-12 w-36 h-36 rounded-full bg-white/5 blur-lg pointer-events-none" />

            <LayoutDashboard className="absolute top-6 right-6 w-16 h-16 text-white/10 hidden sm:block shrink-0" />

            <div className="mb-6 relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Hello, {userName}
              </h2>
              <p className="text-sm sm:text-base text-white/80 mt-2 font-medium max-w-xl leading-relaxed">
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
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-green-700 hover:bg-slate-50 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back to Results
              </motion.button>

              {/* Go Home */}
              <motion.button
                onClick={handleGoHome}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/30 hover:bg-green-500/40 text-white font-bold text-xs border border-white/20 transition-all cursor-pointer"
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
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h3>
            <ActionCards />
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
};
