import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { PlaceCardProps } from "@/hooks/types";
import { ArrowUpIcon } from "lucide-react";
import { StarIcon, ClockIcon, LocationMarkerIcon } from "@/Components/Shared/icons";
import placeholderImage from "@/Assets/placeholder.png";
import { useCategoryClass } from "@/hooks/useCategoryClass";

export const PlaceCard: React.FC<PlaceCardProps> = ({ place }) => {
  const IMAGE_SERVER_BASE =
    import.meta.env.VITE_IMAGE_SERVER_URL || "http://localhost:3000";

  // ---------- Safe derived values ----------
  const category = place.category || "Point of Interest";
  const location = place.location || "Location details not available";

  // rating might be number | string | undefined
  const numericRating =
    typeof place.rating === "number"
      ? place.rating
      : typeof place.rating === "string"
        ? parseFloat(place.rating)
        : NaN;

  const displayRating = Number.isFinite(numericRating)
    ? numericRating.toFixed(1)
    : "—";

  const reviewsText =
    typeof place.reviews === "number" && place.reviews > 0
      ? `(${place.reviews})`
      : "";

  const description =
    place.description ||
    "No detailed description available for this stop. Explore it on your SafarNama journey!";

  const categoryClass = useCategoryClass(category);

  const searchQuery = `${place.name}, ${category}`;
  const apiUrl = `${IMAGE_SERVER_BASE}/api/place-image?query=${encodeURIComponent(
    searchQuery
  )}`;

  const [imageUrl, setImageUrl] = useState<string>(placeholderImage);

  useEffect(() => {
    let isMounted = true;

    const fetchImage = async () => {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Image server error");
        const data = await res.json();

        if (!isMounted) return;

        if (data?.thumbnail) setImageUrl(data.thumbnail);
        else setImageUrl(placeholderImage);
      } catch {
        if (isMounted) setImageUrl(placeholderImage);
      }
    };

    fetchImage();
    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  return (
    <motion.div
      className="group relative bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col transform transition-transform duration-300 hover:-translate-y-2"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ y: -8 }}
    >
      {/* Image */}
      <img
        className="w-full h-48 object-cover"
        src={imageUrl}
        alt={place.name}
        onError={() => setImageUrl(placeholderImage)}
        loading="lazy"
      />

      {/* Content */}
      <div className="p-5 flex flex-col grow">
        {/* Top row: category + rating */}
        <div className="flex justify-between items-start mb-2">
          <span
            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${categoryClass}`}
          >
            {category}
          </span>

          <div className="flex items-center gap-1 text-sm">
            <StarIcon className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-800 font-bold">{displayRating}</span>
            {reviewsText && (
              <span className="text-gray-500">{reviewsText}</span>
            )}
          </div>
        </div>

        {/* Name */}
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-1 mb-2 line-clamp-2">
          {place.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm grow line-clamp-3">
          {description}
        </p>

        {/* Meta */}
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
          <div className="flex items-center text-green-600 font-semibold">
            <ClockIcon className="w-4 h-4 mr-2 shrink-0" />
            <span>{place.status || "Open now"}</span>
          </div>

          <div className="flex items-start text-gray-600">
            <LocationMarkerIcon className="w-4 h-4 mr-2 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{location}</span>
          </div>
        </div>
      </div>

      {/* Hover hint */}
      <div className="absolute top-3 right-3 p-2 rounded-full bg-black/25 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-2 group-hover:translate-y-0 cursor-pointer">
        <ArrowUpIcon className="w-5 h-5 text-white" />
      </div>
    </motion.div>
  );
};