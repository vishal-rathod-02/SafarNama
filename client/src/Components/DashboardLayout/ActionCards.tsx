import React from "react";
import { Link } from "react-router-dom";
import { BookMarked, MapPin, Briefcase } from "lucide-react";

export const ActionCards: React.FC = () => {
  const cards = [
    { title: "Plan New Trip", icon: Briefcase, path: "/", description: "Start crafting your next itinerary from scratch." },
    { title: "Bookmarked Trips", icon: BookMarked, path: "/mytrips", description: "Review, edit, and manage all your saved trips." },
    { title: "Explore Destinations", icon: MapPin, path: "/#destinations", description: "Discover popular places and new travel ideas." },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        
        return (
          <Link
            key={card.title}
            to={card.path}
            className={`group bg-white dark:bg-slate-900 shadow-md hover:shadow-2xl hover:shadow-amber-500/10 rounded-2xl p-6 flex flex-col justify-start gap-3 text-left transition-all duration-300 border border-slate-200/80 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 hover:-translate-y-1
              ${index === 0 ? 'md:col-span-1' : ''} 
            `}
          >
            <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl self-start mb-1 group-hover:bg-amber-500 group-hover:text-slate-950 transition duration-300">
                {Icon && <Icon className="w-6 h-6" />}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {card.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {card.description}
            </p>
            <span className="mt-2 text-sm font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Go Now &rarr;
            </span>
          </Link>
        );
      })}
    </div>
  );
};