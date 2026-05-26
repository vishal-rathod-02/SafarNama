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
  const { user } = useAuth();
  const userName = user?.fullName?.split(" ")[0] || "Traveler";

// On component mount, store the state in localStorage for persistence
const useBackToResults = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state?.fromResultsState;

  useEffect(() => {
    if (state) {
      localStorage.setItem("fromResultsState", JSON.stringify(state));
    }
  }, [state]);

  return () => {
    if (state) navigate("/results", { state });
    else {
      const saved = localStorage.getItem("fromResultsState");
      saved ? navigate("/results", { state: JSON.parse(saved) }) : navigate(-1);
    }
  };
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
              className="relative bg-white/80 backdrop-blur-xl border border-gray-200 rounded-3xl shadow-xl p-8 flex flex-col justify-between transition-transform hover:shadow-2xl"
            >
              <LayoutDashboard className="absolute top-6 right-6 w-14 h-14 text-green-200 hidden sm:block" />

              <div className="mb-6">
                <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                  Hello, {userName} 
                </h2>
                <p className="text-lg text-gray-600 mt-2">
                  Your next adventure awaits. Here’s your personalized SafarNama overview.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 mt-6">
                {/* Back to Results */}
                <motion.button
                  onClick={useBackToResults}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-md hover:shadow-blue-400/40 transition-all duration-100"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Back to Results
                </motion.button>

                {/* Go Home */}
                <motion.button
                  onClick={handleGoHome}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-md hover:shadow-green-400/40 transition-all duration-100"
                >
                  <HomeIcon className="w-5 h-5" />
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
