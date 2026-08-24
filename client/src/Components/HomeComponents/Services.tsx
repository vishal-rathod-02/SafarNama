import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlobeIcon, TicketIcon, HotelIcon } from "@/Components/Shared/icons";
import type { ServicesProps } from "@/hooks/types";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    } as any,
  },
};

const ServiceCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}> = ({ icon, title, description, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6, ease: "easeOut", delay }}
  >
    <div
      className="group relative h-full rounded-2xl p-px
                 bg-linear-to-br from-green-200 via-gray-200 to-gray-200
                 hover:from-green-400 hover:to-emerald-400
                 transition-all duration-300"
    >
      <div className="relative h-full bg-white dark:bg-gray-800 p-6 sm:p-8 text-center rounded-[15px] transition-transform duration-300 group-hover:-translate-y-2">
        <div
          className="absolute inset-0 bg-linear-to-br from-green-300 to-emerald-300 rounded-xl
                     opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl"
        />

        <div className="relative">
          <div className="text-green-500 mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-green-50 dark:bg-gray-700 shadow-inner">
            {icon}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-slate-100 mb-3">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

export const Services = React.forwardRef<HTMLDivElement, ServicesProps>(
  ({ id }, ref) => {
    const [isPremiumPerks, setIsPremiumPerks] = useState(true);

    const premiumServices = [
      {
        title: "Intelligent Stop Suggestions",
        description:
          "SafarNama dynamically scans and filters tourist spots, temples, hidden nature reserves, and roadside dhabas exactly along your selected highway route.",
        icon: <GlobeIcon className="w-8 h-8 sm:w-10 sm:h-10" />,
      },
      {
        title: "Weather-Safe Travel alerts",
        description:
          "Provides real-time climatic overviews of intermediate routing milestones on your travel date, adding advisory tags for road safety.",
        icon: <TicketIcon className="w-8 h-8 sm:w-10 sm:h-10" />,
      },
      {
        title: "Customized Rest Advisories",
        description:
          "Based on travel companions (solo, family, friends) and travel mode (car vs bike), recommends specific stop intervals and safety advice.",
        icon: <HotelIcon className="w-8 h-8 sm:w-10 sm:h-10" />,
      },
    ];

    const standardServices = [
      {
        title: "Point-to-Point Directions",
        description:
          "Calculates simple driving route paths, distance estimations, and travel durations from source to destination.",
        icon: <GlobeIcon className="w-8 h-8 sm:w-10 sm:h-10" />,
      },
      {
        title: "Standard Leaflet Map Plotting",
        description:
          "Draws standard lines on geographic leaflet map containers to visualize routes without intermediate stop tags.",
        icon: <TicketIcon className="w-8 h-8 sm:w-10 sm:h-10" />,
      },
      {
        title: "Trip History Logging",
        description:
          "Saves planned trip information inside your basic user dashboard for simple references later.",
        icon: <HotelIcon className="w-8 h-8 sm:w-10 sm:h-10" />,
      },
    ];

    return (
      <section
        ref={ref}
        id={id}
        className="py-16 sm:py-24 bg-linear-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden"
      >
        {/* Decorative background shapes */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.1, scale: 1 }}
          transition={{ duration: 2 }}
          viewport={{ once: true }}
          className="absolute top-10 left-10 w-32 h-32 sm:w-40 sm:h-40 bg-green-200 rounded-full blur-3xl animate-pulse"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 0.15, scale: 1 }}
          transition={{ duration: 2, delay: 0.3 }}
          viewport={{ once: true }}
          className="absolute bottom-10 right-10 w-40 h-40 sm:w-52 sm:h-52 bg-green-300 rounded-full blur-3xl animate-pulse"
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-8"
          >
            <h3 className="text-green-600 font-bold text-sm sm:text-lg tracking-wide mb-2 sm:mb-3">
              SERVICES
            </h3>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-slate-100 leading-tight">
              Premium Tours & Travel Services
            </h2>
            <p className="mt-3 sm:mt-4 text-gray-600 dark:text-gray-400 max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-base">
              Compare standard maps tools with SafarNama's AI-curated travel
              experiences.
            </p>
          </motion.div>

          {/* Toggle Switch */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-200 dark:bg-gray-800 p-1.5 rounded-full flex gap-1 shadow-inner border border-gray-300 dark:border-gray-700">
              <button
                onClick={() => setIsPremiumPerks(false)}
                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${!isPremiumPerks
                    ? "bg-white text-gray-800 shadow-md"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
              >
                Standard Maps
              </button>
              <button
                onClick={() => setIsPremiumPerks(true)}
                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 cursor-pointer ${isPremiumPerks
                    ? "bg-linear-to-r from-green-500 to-emerald-600 text-white shadow-md"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
              >
                <span>AI-Premium Perks</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full text-white">
                  PRO
                </span>
              </button>
            </div>
          </div>

          {/* Service Cards with AnimatePresence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
            <AnimatePresence mode="wait">
              {(isPremiumPerks ? premiumServices : standardServices).map(
                (service, idx) => (
                  <ServiceCard
                    key={service.title}
                    icon={service.icon}
                    title={service.title}
                    description={service.description}
                    delay={idx * 0.1}
                  />
                ),
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    );
  },
);
