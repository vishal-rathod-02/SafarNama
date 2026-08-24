import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { PlaceCardProps } from "@/hooks/types";
import { MapPin, Sparkles } from "lucide-react";
import { StarIcon, ClockIcon, LocationMarkerIcon } from "@/Components/Shared/icons";
import placeholderImage from "@/Assets/placeholder.png";
import { useCategoryClass } from "@/hooks/useCategoryClass";

const clientImageCache = new Map<string, string>();

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

    if (clientImageCache.has(apiUrl)) {
      setImageUrl(clientImageCache.get(apiUrl)!);
      return;
    }

    const fetchImage = async () => {
      try {
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Image server error");
        const data = await res.json();

        if (!isMounted) return;

        if (data?.thumbnail) {
          setImageUrl(data.thumbnail);
          clientImageCache.set(apiUrl, data.thumbnail);
        } else {
          setImageUrl(placeholderImage);
        }
      } catch {
        if (isMounted) setImageUrl(placeholderImage);
      }
    };

    fetchImage();
    return () => {
      isMounted = false;
    };
  }, [apiUrl]);

  const handleShowOnMap = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Safe coordinate resolution
    const pAny = place as any;
    const lat = pAny.lat ?? pAny.latitude ?? (Array.isArray(pAny.coords) ? pAny.coords[0] : null);
    const lng = pAny.lng ?? pAny.longitude ?? (Array.isArray(pAny.coords) ? pAny.coords[1] : null);

    if (lat !== null && lng !== null) {
      window.dispatchEvent(
        new CustomEvent("map:focus", {
          detail: { coords: [lat, lng] },
        })
      );

      // Smooth scroll to leaflet map
      const mapElement = document.querySelector(".h-\\[70vh\\]");
      if (mapElement) {
        mapElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  return (
    <motion.div
      onMouseEnter={() => {
        window.dispatchEvent(
          new CustomEvent("map:hover-start", { detail: { name: place.name } })
        );
      }}
      onMouseLeave={() => {
        window.dispatchEvent(new CustomEvent("map:hover-end"));
      }}
      className="group relative bg-white/95 rounded-2xl shadow-md hover:shadow-xl hover:shadow-green-500/5 border border-slate-100 hover:border-green-300 flex flex-col overflow-hidden transition-all duration-300 h-full"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Thumbnail Header with zoom-in & gradient */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 shrink-0">
        <img
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          src={imageUrl}
          alt={place.name}
          onError={() => setImageUrl(placeholderImage)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-transparent opacity-90 transition-opacity duration-300" />

        {/* Rating Floating Badge */}
        <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-lg shadow-sm flex items-center gap-1 text-xs font-bold text-gray-800 border border-white/20">
          <StarIcon className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
          <span>{displayRating}</span>
          {reviewsText && <span className="text-gray-400 font-normal text-[10px]">{reviewsText}</span>}
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 flex flex-col grow">
        {/* Category Label */}
        <div className="mb-2.5 flex items-center justify-between">
          <span
            className={`inline-block px-3 py-1 text-[10px] uppercase tracking-wider font-extrabold rounded-md shadow-xs ${categoryClass}`}
          >
            {category}
          </span>
          {place.rating && place.rating >= 4.5 && (
            <span className="flex items-center gap-0.5 text-emerald-600 font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" /> Highly Rated
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 leading-snug line-clamp-1 mb-2">
          {place.name}
        </h3>

        {/* Description Description */}
        <p className="text-slate-500 text-xs grow leading-relaxed line-clamp-3 mb-4">
          {description}
        </p>

        {/* Action Panel / Bottom Meta */}
        <div className="mt-auto pt-4 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center text-emerald-600 font-semibold shrink-0">
              <ClockIcon className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <span>{place.status || "Open now"}</span>
            </div>

            <div className="flex items-center text-slate-400 truncate max-w-50">
              <LocationMarkerIcon className="w-3.5 h-3.5 mr-1 shrink-0" />
              <span className="truncate">{location.split(",")[0]}</span>
            </div>
          </div>

          <button
            onClick={handleShowOnMap}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-green-500 text-green-600 hover:bg-green-500 hover:text-white rounded-xl font-bold text-xs transition-all duration-300 transform active:scale-97 shadow-xs hover:shadow-md cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>Show on Map</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};