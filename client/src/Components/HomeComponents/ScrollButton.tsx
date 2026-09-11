import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScrollToTopButtonProps } from '@/hooks/types';
import {ArrowUpIcon}  from 'lucide-react';


export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ isVisible }) => {
  const [isHovered, setIsHovered] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Scroll to Top Button */}
          <motion.button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`
              fixed bottom-6 right-6 md:bottom-8 md:right-8
              z-50 flex items-center justify-center
              rounded-full backdrop-blur-xl
              bg-linear-to-r from-amber-500 to-amber-600 text-slate-950
              shadow-lg shadow-amber-500/35 hover:shadow-amber-500/60
              w-12 h-12 md:w-14 md:h-14
              transition-all duration-300 ease-out
              hover:scale-110 cursor-pointer border border-amber-300/40
              focus:outline-none focus:ring-2 focus:ring-amber-400
            `}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUpIcon className="w-6 h-6 md:w-7 md:h-7 stroke-[2.5]" />
          </motion.button>

          {/* Tooltip */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                key="tooltip"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="
                  fixed bottom-20 right-6 md:bottom-[5.9rem] md:right-8
                  z-50 px-3 py-1.5 rounded-lg
                  text-xs font-bold
                  bg-slate-900/90 text-amber-300 border border-slate-700
                  shadow-lg backdrop-blur-md
                "
              >
                Back to top
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};