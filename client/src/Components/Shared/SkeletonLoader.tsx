import React from "react";
import { motion } from "framer-motion";
import { SkeletonCard } from "./SekeletonCard";

export const SkeletonLoader: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
      },
    }as any,
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    }as any,
  };

  return (
    <motion.div
      className="w-full px-4 sm:px-6 lg:px-8 py-8"
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      variants={containerVariants}
      aria-busy="true"
      role="status"
      aria-label="Loading trip results"
    >
      <div className="max-w-6xl mx-auto space-y-8">
        {/* 🗺 Map section skeleton */}
        <motion.div
          variants={itemVariants}
          className="relative w-full h-[55vh] rounded-2xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 border border-emerald-50 shadow-sm overflow-hidden"
        >
          {/* fake map controls / legend */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <div className="h-8 w-40 rounded-full bg-white/70 animate-pulse" />
            <div className="h-6 w-28 rounded-full bg-white/60 animate-pulse" />
          </div>
          <div className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-white/70 animate-pulse" />
        </motion.div>

        {/* 🧭 Results header & filters skeleton */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div className="space-y-2">
            <div className="h-6 w-40 rounded-md bg-gray-200/90 animate-pulse" />
            <div className="h-4 w-64 rounded-md bg-gray-200/80 animate-pulse" />
          </div>

          <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-8 w-24 rounded-full bg-gray-100 border border-emerald-50 animate-pulse"
              />
            ))}
          </div>
        </motion.div>

        {/* 📍 Places list skeleton (Result cards) */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
        >
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} variants={itemVariants}>
              <SkeletonCard />
            </motion.div>
          ))}
        </motion.div>

        {/* 🎯 Action buttons skeleton */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row justify-center gap-4 pt-4"
        >
          <div className="h-11 w-44 rounded-xl bg-gray-200/90 animate-pulse" />
          <div className="h-11 w-44 rounded-xl bg-gray-200/80 animate-pulse" />
        </motion.div>
      </div>
    </motion.div>
  );
};
