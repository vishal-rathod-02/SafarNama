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
    <section ref={ref} id={id} className="py-16 sm:py-24 lg:py-28 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            className="space-y-5 sm:space-y-6 text-left"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-2 shadow-xs">
              About SafarNama
            </div>
            
            {/* Interactive Tabs Headers */}
            <div className="flex border-b border-slate-200/80 dark:border-slate-800 gap-4 sm:gap-6 text-sm font-bold mb-4 overflow-x-auto whitespace-nowrap">
              {(["engine", "vision", "perks"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 border-b-2 transition-all duration-200 cursor-pointer ${
                    activeTab === tab
                      ? "border-amber-500 text-amber-600 dark:text-amber-400 font-black scale-102"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab === "engine" ? "AI Routing Engine" : tab === "vision" ? "Our Vision" : "AI-Premium Perks"}
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
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                  {tabContent[activeTab].title}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
                  {tabContent[activeTab].text}
                </p>

                <ul className="space-y-2.5 sm:space-y-3">
                  {tabContent[activeTab].points.map((item, i) => (
                    <motion.li
                      key={i}
                      className="flex items-center text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium"
                      whileHover={{ x: 6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="inline-block h-2 w-2 bg-amber-500 rounded-full mr-3 shrink-0 shadow-xs shadow-amber-500/80"></span>
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            {/* Stats Panel */}
            <div className="grid grid-cols-3 gap-3.5 pt-6 border-t border-slate-200/80 dark:border-slate-800 mt-6">
              {[
                { val: "10k+", label: "Planned Routes" },
                { val: "500+", label: "Curated Stops" },
                { val: "100%", label: "AI Scored" }
              ].map((stat, i) => (
                <div key={i} className="text-center p-3.5 rounded-2xl glass-luxury">
                  <p className="text-2xl sm:text-3xl font-black text-amber-500 dark:text-amber-400">{stat.val}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

          </motion.div>

          {/* Dynamic Images */}
          <div className="relative h-full flex justify-center lg:justify-end">
            <motion.img
              src={images.Aboutimg1}
              alt="Traveler exploring"
              className="rounded-3xl shadow-2xl w-full max-w-md sm:max-w-lg lg:max-w-full object-cover border border-slate-200/80 dark:border-white/10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            />

            {/* Floating smaller images */}
            <motion.img
              src={images.Aboutimg2}
              alt="Scenic destination 1"
              className="absolute -bottom-6 sm:-bottom-8 -left-4 sm:-left-8 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 object-cover rounded-2xl shadow-2xl border-4 border-white dark:border-slate-900"
              whileHover={{ scale: 1.05, rotate: 2 }}
              transition={{ duration: 0.3 }}
            />
            <motion.img
              src={images.Aboutimg3}
              alt="Scenic destination 2"
              className="absolute -top-6 sm:-top-8 -right-4 sm:-right-8 w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 object-cover rounded-2xl shadow-2xl border-4 border-white dark:border-slate-900"
              whileHover={{ scale: 1.05, rotate: -2 }}
              transition={{ duration: 0.3 }}
            />

          </div>
        </div>
      </div>
    </section>
  );
}
);
