import React from "react";
import { motion } from "framer-motion";
import type {TopDestinationsProps} from '@/hooks/types';
import { images } from '@/Assets/index';

const destinations = [
  {
    name: "Vrindavan , Uttar Pradesh",
    image:images.Vrindavan,
  },
  {
    name: "Jaipur, Rajasthan",
    image:images.Jaipur,
  },
  {
    name: "Varanasi, Uttar Pradesh",
    image:images.Varanasi,
  },
  {
    name: "Leh Ladakh, J&K",
    image:images.ladak,
  },
  {
    name: "Amritsar, Punjab",
    image:images.Amritsar,
  },
];

const DestinationCard: React.FC<{ name: string; image: string; large?: boolean; onClick: () => void; }> = ({
  name,
  image,
  large = false,
  onClick,
}) => (
   <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ duration: 0.7, ease: "easeOut" }}
    onClick={onClick}
      className={`relative rounded-2xl overflow-hidden group shadow-lg hover:shadow-2xl transition-shadow duration-500 cursor-pointer aspect-[3/4] ${large ? "lg:col-span-2 lg:row-span-2 lg:aspect-square" : ""}`}
  >
    <img
      src={image}
      alt={name}
      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 transform group-hover:scale-110"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

    <div className="absolute bottom-4 left-4 right-4 text-white">
       <h3 className="font-extrabold drop-shadow-lg text-xl md:text-2xl">
        {name}
      </h3>
    </div>
  </motion.div>
);

const headingContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  }as any,
};

const headingItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } } as any,
};

export const TopDestinations = React.forwardRef<HTMLDivElement, TopDestinationsProps>(({ onDestinationClick,id }, ref) => {
  return (
    <section ref={ref} id={id} className="py-16 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Heading */}
            <motion.div
              initial={{ opacity: 0, y: -40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-12"
            >
              <motion.h3 variants={headingItemVariants}  className="text-green-600 font-semibold text-sm sm:text-base md:text-lg mb-2 tracking-wide">
                TOP DESTINATIONS
              </motion.h3>
              <motion.h2 variants={headingItemVariants} className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800">
                Get Inspired for Your Next Journey
              </motion.h2>
              <motion.p variants={headingItemVariants} className="mt-4 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
                Select one of India’s iconic destinations to automatically set your route, or get inspired for your own custom trip.
              </motion.p>
        </motion.div>

           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DestinationCard
            name={destinations[0].name}
            image={destinations[0].image}
            large
            onClick={() => onDestinationClick(destinations[0].name)}
          />
          {destinations.slice(1).map((d, i) => (
            <DestinationCard
              key={`${d.name}-${i}`}
              name={d.name}
              image={d.image}
              onClick={() => onDestinationClick(d.name)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
);
