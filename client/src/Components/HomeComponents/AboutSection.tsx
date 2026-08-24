import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { images } from '@/Assets/index'; 
import type { AboutProps } from "@/hooks/types";

export const AboutSection = React.forwardRef<HTMLDivElement , AboutProps>(({id}, ref ) => {
  const [activeTab, setActiveTab] = useState<"engine" | "vision" | "perks">("engine");

  const tabContent = {
    engine: {
      title: "Advanced Routing Engine",
      text: "SafarNama utilizes standard geographic routing coupled with AI stop scoring models. We calculate travel distances, identify high-traffic segments, and fetch and verify top-rated stopovers, hotels, and local food venues along your path.",
      points: [
        "Smart intermediate stop discovery",
        "Geocoded waypoint integration",
        "Dhaba & restaurant quality indexation",
      ]
    },
    vision: {
      title: "Deep Cultural Immersion",
      text: "We believe travel is about the journey, not just the destination. Our mission is to promote local Indian tourism, bringing travelers to historic landmarks, local artisans, and peaceful nature reserves that are otherwise hidden from major maps.",
      points: [
        "Promoting rural & regional economies",
        "Highlighting historic roadside temples & forts",
        "Curating nature escapes and photo viewpoints",
      ]
    },
    perks: {
      title: "State-of-the-Art Travel Intelligence",
      text: "Experience customized travel like never before. Based on your companion selections, travel date, and driving preferences, we custom-score every potential hotel and eatery so you only see what is relevant to you.",
      points: [
        "Personalized timeline date offsets",
        "Vehicle-specific rest advisory recommendations",
        "Dynamic companion-focused stop categorization",
      ]
    }
  };

  return (
    <section ref={ref} id={id} className="py-16 sm:py-20 lg:py-28 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            className="space-y-5 sm:space-y-6 text-left"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h3 className="text-green-600 font-bold text-sm sm:text-base md:text-lg">
              ABOUT US
            </h3>
            
            {/* Interactive Tabs Headers */}
            <div className="flex border-b border-gray-200 gap-4 sm:gap-6 text-sm font-semibold mb-4 overflow-x-auto whitespace-nowrap">
              {(["engine", "vision", "perks"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 border-b-2 transition duration-200 cursor-pointer ${
                    activeTab === tab
                      ? "border-green-600 text-green-600 font-bold"
                      : "border-transparent text-gray-500 hover:text-green-500"
                  }`}
                >
                  {tab === "engine" ? "AI Engine" : tab === "vision" ? "Our Vision" : "AI-Premium Perks"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 leading-tight">
                  {tabContent[activeTab].title}
                </h2>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {tabContent[activeTab].text}
                </p>

                <ul className="space-y-2 sm:space-y-3">
                  {tabContent[activeTab].points.map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center text-sm sm:text-base text-gray-700"
                      whileHover={{ x: 6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="inline-block h-2 w-2 bg-green-500 rounded-full mr-3 shrink-0"></span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            {/* Stats Panel */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 mt-6">
              {[
                { val: "10k+", label: "Planned Routes" },
                { val: "500+", label: "Curated Stops" },
                { val: "100%", label: "AI Scored" }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold text-green-600">{stat.val}</p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-semibold uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

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
