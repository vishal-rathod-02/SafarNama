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
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.5, ease: "easeOut", delay }}
    className="h-full"
  >
    <div
      className="group relative h-full rounded-3xl p-px
                 bg-linear-to-b from-amber-500/30 via-slate-200/50 dark:via-slate-800 to-emerald-500/20
                 hover:from-amber-400 hover:via-amber-500/40 hover:to-emerald-400
                 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-amber-500/10"
    >
      <div className="relative h-full glass-luxury p-7 sm:p-8 text-center rounded-[23px] transition-transform duration-300 group-hover:-translate-y-1.5 flex flex-col items-center">
        {/* Specular top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-amber-400/50 to-transparent rounded-t-3xl" />

        <div className="text-amber-500 dark:text-amber-400 mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-2xl bg-amber-500/10 dark:bg-slate-800/80 border border-amber-500/20 dark:border-amber-400/20 shadow-xs group-hover:scale-105 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mb-3 tracking-tight">
          {title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
          {description}
        </p>
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
        className="py-16 sm:py-24 bg-slate-100/70 dark:bg-slate-900/50 relative overflow-hidden transition-colors duration-300"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider mb-3.5 shadow-xs">
              Features & Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
              Premium Road Trip Engineering
            </h2>
            <p className="mt-3 sm:mt-4 text-slate-600 dark:text-slate-300 max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
              Compare standard maps tools with SafarNama's AI-curated travel experiences.
            </p>
          </motion.div>

          {/* Toggle Switch */}
          <div className="flex justify-center mb-12">
            <div className="glass-luxury p-1.5 rounded-full flex gap-1 shadow-md">
              <button
                onClick={() => setIsPremiumPerks(false)}
                className={`px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${!isPremiumPerks
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
              >
                Standard Maps
              </button>
              <button
                onClick={() => setIsPremiumPerks(true)}
                className={`px-5 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${isPremiumPerks
                    ? "bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 shadow-md shadow-amber-500/25 border border-amber-300 dark:border-amber-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
              >
                <span>AI-Premium Perks</span>
                <span className="text-[10px] bg-slate-950/20 px-2 py-0.5 rounded-full text-slate-950 font-black">
                  PRO
                </span>
              </button>
            </div>
          </div>

          {/* Service Cards with AnimatePresence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
