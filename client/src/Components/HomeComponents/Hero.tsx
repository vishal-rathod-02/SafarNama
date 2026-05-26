import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown } from "lucide-react";
import type { HeroProps } from "@/hooks/types";
import { MapPinIcon, DestinationIcon, SearchArrowIcon } from "@/Components/Shared/icons";
import { AutocompleteInput } from "./Autocomplete";
import { images } from "@/Assets/index";

/* ----------------------------------------------------
   🧠 Typing Loop FIXED — No dependency explosion
----------------------------------------------------- */
const TAGLINES = [
  "Discover the hidden gems between here and there.",
  "Craft your perfect road trip, one amazing stop at a time.",
  "Intelligently planned routes for your most memorable journey.",
  "The open road, simplified. Your next great story awaits.",
];

const useTypingLoop = (
  typingSpeed = 70,
  deletingSpeed = 40,
  pauseDuration = 2000
) => {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = TAGLINES[index];
    const timeout = setTimeout(() => {
      if (deleting) {
        setText((prev) => prev.slice(0, -1));
        if (text === "") {
          setDeleting(false);
          setIndex((i) => (i + 1) % TAGLINES.length);
        }
      } else {
        setText((prev) => current.slice(0, prev.length + 1));
        if (text === current) {
          setTimeout(() => setDeleting(true), pauseDuration);
        }
      }
    }, deleting ? deletingSpeed : typingSpeed);

    return () => clearTimeout(timeout);
  }, [text, deleting, index, typingSpeed, deletingSpeed, pauseDuration]);

  return text;
};

export const Hero = React.forwardRef<HTMLDivElement, HeroProps>(
  ({ onSearch, destinationValue, onDestinationChange, isLoading, id }, ref) => {
    const [start, setStart] = useState("");

    const [isSwapping, setIsSwapping] = useState(false);
    const [isSwapHovered, setIsSwapHovered] = useState(false);

    const [showValidation, setShowValidation] = useState(false);

    const typedText = useTypingLoop();

    const isSwapDisabled = !start.trim() || !destinationValue.trim();
    const isSearchDisabled =
      !start.trim() || !destinationValue.trim() || isLoading;

    /* --------- Swap Handler----------*/

    const handleSwap = () => {
      if (isSwapDisabled) return;

      const temp = start;
      setStart(destinationValue);
      onDestinationChange(temp);

      setIsSwapping((prev) => !prev);
    };

    /* ------ Submit Handler-------  */
   const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (isSearchDisabled) {
    setShowValidation(true);
    setTimeout(() => setShowValidation(false), 2200);
    return;
  }
  onSearch({
    start: start.trim(),
    end: destinationValue.trim(),
  });
};

    const formItemVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    };

    return (
      <div
        ref={ref}
        id={id}
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Background Animation */}
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${images.herobg})` }}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "linear",
          }}
        />
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        <motion.div
          className="relative z-10 text-center px-4 w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {/* Heading */}
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 drop-shadow-xl text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            Let's Discover India Together
          </motion.h1>

          {/* Typing Effect */}
          <motion.p
            className="text-lg md:text-xl mb-5 max-w-2xl mx-auto text-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1.2 }}
          >
            {typedText}
            <span className="animate-pulse text-green-400 font-bold">|</span>
          </motion.p>

          {/* Search Box */}
          <motion.div
            className="bg-white/1 backdrop-blur-md p-6 rounded-2xl w-full max-w-md mx-auto border border-white/15 shadow-2xl"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1, delayChildren: 1 }}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative">
              {/* Source Field */}
              <motion.div variants={formItemVariants}>
                <AutocompleteInput
                  value={start}
                  onChange={setStart}
                  placeholder="Enter Source"
                  icon={MapPinIcon}
                  iconColor={{
                    default: "text-blue-400",
                    focused: "text-blue-600",
                  }}
                  type="source"
                />
              </motion.div>

              {/* Swap Button + Tooltip on hover when disabled */}
              <motion.div
                className="flex justify-center -my-2 relative"
                variants={formItemVariants}
              >
                <motion.button
                  type="button"
                  onClick={!isSwapDisabled ? handleSwap : undefined}
                  onMouseEnter={() => setIsSwapHovered(true)}
                  onMouseLeave={() => setIsSwapHovered(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 ${
                    isSwapDisabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:scale-105"
                  }`}
                  whileTap={{ scale: isSwapDisabled ? 1 : 0.95 }}
                >
                  <ArrowUpDown
                    className={`w-5 h-5 transition-all duration-300 ${
                      isSwapping && !isSwapDisabled
                        ? "rotate-180 text-green-400"
                        : ""
                    }`}
                  />
                  <span>Swap Locations</span>
                </motion.button>

                {/* Tooltip for swap (only when disabled & hovered) */}
                <AnimatePresence>
                  {isSwapHovered && isSwapDisabled && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.25 }}
                       className="pointer-events-none absolute z-100 top-full  left-1/2 -translate-x-1/2  group-hover:opacity-100 ">
                       <div className="relative bg-gray-900 text-white text-xs px-5 py-1 rounded shadow-md border border-gray-700">
                      <span>Please fill both Source and Destination to swap.</span>
                      <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900 border-l border-t border-gray-700" />
                    </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Destination Field */}
              <motion.div variants={formItemVariants}>
                <AutocompleteInput
                  value={destinationValue}
                  onChange={onDestinationChange}
                  placeholder="Enter Destination"
                  icon={DestinationIcon}
                  iconColor={{
                    default: "text-red-400",
                    focused: "text-red-600",
                  }}
                  type="destination"
                />
              </motion.div>

              {/* Search Button + Tooltip on invalid submit */}
              <motion.div variants={formItemVariants} className="relative">
                  <motion.button
                  type="submit"
                  disabled={isSearchDisabled}
                  whileTap={!isSearchDisabled ? { scale: 0.96 } : undefined}
                  whileHover={
                    !isSearchDisabled && !isLoading ? { scale: 1.02 } : undefined
                  }
                  className={`group w-full flex justify-center items-center gap-3 py-3 rounded-lg text-lg font-semibold text-white transition-all
                    ${
                      isSearchDisabled
                        ? "bg-linear-to-r from-green-400/60 to-emerald-500/60 cursor-not-allowed"
                        : "bg-linear-to-r from-green-500 to-emerald-600 shadow-md hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                    }`}
                >
                  <span>{isLoading ? "Planning Route..." : "Search Route"}</span>
                  {!isLoading && !isSearchDisabled && (
                    <span className="inline-flex transform transition-transform duration-200 group-hover:translate-x-1">
                      <SearchArrowIcon className="w-5 h-5" />
                    </span>
                  )}
                </motion.button>

                {/* Tooltip for submit when user clicks with invalid data */}
                <AnimatePresence>
                  {showValidation && (
                     <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18 }}
                       className="pointer-events-none absolute top-full mt-2 left-1/2 -translate-x-1/2 opacity-group-hover:opacity-100 transition"
                    >
                      <div className="relative bg-gray-900 text-white text-xs px-3 py-1 rounded shadow-md border border-gray-700">
                        <span>Please fill both Source and Destination to search.</span>
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900 border-l border-t border-gray-700" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    );
  }
);