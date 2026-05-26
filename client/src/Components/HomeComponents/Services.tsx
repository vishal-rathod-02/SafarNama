import React from "react";
import { motion } from "framer-motion";
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
    transition={{ duration: 0.6, ease: 'easeOut', delay }}
  >
    <div
      className="group relative h-full rounded-2xl p-px
                 bg-gradient-to-br from-green-200 via-gray-200 to-gray-200
                 hover:from-green-400 hover:to-emerald-400
                 transition-all duration-300"
    >
      <div className="relative h-full bg-white p-6 sm:p-8 text-center rounded-[15px] transition-transform duration-300 group-hover:-translate-y-2">
        <div 
          className="absolute inset-0 bg-gradient-to-br from-green-300 to-emerald-300 rounded-xl
                     opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl" 
        />
        
        <div className="relative">
          <div className="text-green-500 mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-full bg-green-50 shadow-inner">
            {icon}
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
            {title}
          </h3>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  </motion.div>
);

export const Services = React.forwardRef<HTMLDivElement, ServicesProps>(({id}, ref) => {
  return (
    <section  ref={ref} id={id} className="py-16 sm:py-24 bg-gradient-to-b from-gray-50 via-white to-gray-50 relative overflow-hidden">
      {/* Decorative background shapes */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 2 }}
        viewport={{ once: true }}
        className="absolute top-10 left-10 w-32 h-32 sm:w-40 sm:h-40 bg-green-200 rounded-full blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 2, delay: 0.3 }}
        viewport={{ once: true }}
        className="absolute bottom-10 right-10 w-40 h-40 sm:w-52 sm:h-52 bg-green-300 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-12 sm:mb-16"
        >
          <h3 className="text-green-600 font-bold text-sm sm:text-lg tracking-wide mb-2 sm:mb-3">
            SERVICES
          </h3>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
            Premium Tours & Travel Services
          </h2>
          <p className="mt-3 sm:mt-4 text-gray-600 max-w-xl sm:max-w-2xl mx-auto text-sm sm:text-base">
          Uncover the soul of your journey with smart suggestions, hidden gems, and experiences curated just for you.
          </p>
        </motion.div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
          <ServiceCard
            icon={<GlobeIcon className="w-8 h-8 sm:w-10 sm:h-10" />}
            title="Intelligent Route Planning"
            description="Discover the best attractions, uncover hidden gems, and savor local cuisines with our smart travel suggestions."
            delay={0.1}
          />
          <ServiceCard
            icon={<TicketIcon className="w-8 h-8 sm:w-10 sm:h-10" />}
            title="Local Event Finder"
            description="Stay connected to the culture with updates on must-visit events, local activities, and entertainment at your destination."
            delay={0.3}
          />
          <ServiceCard
            icon={<HotelIcon className="w-8 h-8 sm:w-10 sm:h-10" />}
            title="Curated Stay Options"
            description="Receive thoughtful recommendations for stays, complete with price comparisons, nearby spots, and comfort ratings."
            delay={0.5}
          />
        </div>
      </div>
    </section>
  );
}
);
