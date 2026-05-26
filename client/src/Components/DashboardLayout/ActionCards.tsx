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
            className={`bg-white shadow-lg rounded-2xl  p-6 flex flex-col justify-start gap-3 text-lefttransition-all duration-300 border-b-4 border-transparent hover:scale-[1.02] hover:shadow-2xl hover:border-green-500 
              ${index === 0 ? 'md:col-span-1' : ''} 
            `}
          >
            <div className="p-3 bg-green-50 rounded-lg self-start mb-2">
                {Icon && <Icon className="w-7 h-7 text-green-600" />}
            </div>

            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              {card.title}
            </h3>
            <p className="text-sm text-gray-500">
              {card.description}
            </p>
              <span className="mt-2 text-sm font-semibold text-green-600 hover:text-green-700 transition">
              Go Now &rarr;
            </span>
          </Link>
        );
      })}
    </div>
  );
};