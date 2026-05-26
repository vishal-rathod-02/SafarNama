import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { FloatingFilterButtonProps } from "@/hooks/types";

export const FloatingFilterButton: React.FC<FloatingFilterButtonProps> = ({
  onClick,
  activeFiltersCount = 0,
  isDrawerOpen,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      setVisible(scrollTop > 900 && !isDrawerOpen);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDrawerOpen]);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <AnimatePresence>
      {visible && !isDrawerOpen && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.9 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-[60] flex items-center"
        >
          <motion.button
            onClick={onClick}
            aria-label="Open Filters"
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.08 }}
            className={`relative flex items-center justify-center p-4 rounded-full shadow-xl cursor-pointer 
              backdrop-blur-xl border border-white/30 
              transition-all duration-300
              ${hasActiveFilters
                ? "bg-gradient-to-r from-green-600 to-emerald-500 text-white animate-[pulse_3s_infinite]"
                : "bg-white/70 text-gray-700 hover:bg-green-50"
              }`}
          >
            <SlidersHorizontal className="w-6 h-6" />

            {/* Active Filter Count Badge */}
            {hasActiveFilters && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                {activeFiltersCount}
              </span>
            )}
          </motion.button>

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
            className="ml-3 bg-gray-900/90 backdrop-blur-md text-white text-sm font-semibold px-3 py-1.5 rounded-lg shadow-lg hidden sm:block"
          >
            More Filters
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
