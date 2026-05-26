import React from "react";
import { motion } from "framer-motion";
import { images } from '@/Assets/index'; 
import type { AboutProps } from "@/hooks/types";

export const AboutSection = React.forwardRef<HTMLDivElement , AboutProps>(({id}, ref ) => {
  return (
    <section ref={ref} id={id} className="py-16 sm:py-20 lg:py-28 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            className="space-y-5 sm:space-y-6"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h3 className="text-green-600 font-bold text-sm sm:text-base md:text-lg">
              ABOUT US
            </h3>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
              Your Smart AI-Powered Travel Guide
            </h2>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Explore your journey like never before with our intelligent travel
              assistant. We provide personalized recommendations of tourist
              attractions, scenic stops, and top-rated food places along your
              route. Plan smarter, travel better, and discover hidden gems
              tailored to your trip.
            </p>

            <ul className="space-y-3 sm:space-y-4">
              {[
                "Personalized route suggestions",
                "Top-rated attractions and eateries",
                "Distance-aware and category-based filtering",
              ].map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-center text-sm sm:text-base"
                  whileHover={{ x: 6 }}
                  transition={{ duration: 0.3 }}
                >
                  <span className="inline-block h-2.5 w-2.5 sm:h-3 sm:w-3 bg-green-500 rounded-full mr-3"></span>
                  {item}
                </motion.li>
              ))}
            </ul>

          </motion.div>

          {/* Dynamic Images */}
          <div className="relative h-full flex justify-center lg:justify-end">
            <motion.img
              src={images.Aboutimg1}
              alt="Traveler exploring"
              className="rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg lg:max-w-full object-cover"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            />

            {/* Floating smaller images */}
            <motion.img
              src={images.Aboutimg2}
              alt="Scenic destination 1"
              className="absolute -bottom-8 sm:-bottom-10 -left-6 sm:-left-10 w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover rounded-xl shadow-lg border-4 border-white"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.5 }}
            />
            <motion.img
              src={images.Aboutimg3}
              alt="Scenic destination 2"
              className="absolute -top-8 sm:-top-10 -right-6 sm:-right-10 w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 object-cover rounded-xl shadow-lg border-4 border-white"
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ duration: 0.5 }}
            />

            {/* Floating circles for dynamic depth */}
            <motion.div
              className="absolute top-6 sm:top-10 left-6 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/20 blur-3xl"
              animate={{ y: [0, 20, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute bottom-12 sm:bottom-20 right-12 sm:right-20 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-blue-500/20 blur-3xl"
              animate={{ y: [0, -20, 0] }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
);
