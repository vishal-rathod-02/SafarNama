import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, History, Flame, Loader2, XIcon, Trash2 } from "lucide-react";
import type { Suggestion, AutocompleteInputProps } from "@/hooks/types";
import { LocationService } from "@/Services/Location/Location.service";
function useDebouncedCallback(cb: (...args: any[]) => void, delay = 300) {
  const cbRef = useRef(cb);
  const tRef = useRef<number | null>(null);

  // Keep latest callback reference
  cbRef.current = cb;

  useEffect(
    () => () => {
      if (tRef.current) window.clearTimeout(tRef.current);
    },
    []
  );

  return useCallback(
    (...args: any[]) => {
      if (tRef.current) window.clearTimeout(tRef.current);
      tRef.current = window.setTimeout(() => {
        cbRef.current(...args);
      }, delay);
    },
    [delay]
  );
}

/* -----------------------------
   Highlight matched substring
------------------------------*/
const HighlightMatch = React.memo(
  ({ text, query }: { text: string; query: string }) => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <strong key={i} className="font-bold text-green-700">
              {part}
            </strong>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  }
);

/* -----------------------------
   Main component — Option A
------------------------------*/
export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  value,
  onChange,
  placeholder,
  icon: InputIcon,
  iconColor,
  type, // "source" | "destination"
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSelection, setIsValidSelection] = useState(false);

  // Keyboard navigation
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);
  const itemsRef = useRef<Array<HTMLLIElement | null>>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const mapPinColorClass = useMemo(
    () => (type === "source" ? "text-blue-500" : "text-red-500"),
    [type]
  );

  const HISTORY_KEY = type === "source" ? "sourceHistory" : "destinationHistory";

  // Debounced fetch
  const fetchSuggestionsDebounced = useDebouncedCallback(
    (q: string) => fetchSuggestions(q),
    300
  );

  /* -----------------------------
     Load per-field history once when 'type' changes
  ------------------------------*/
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      setRecentSearches(Array.isArray(stored) ? stored : []);
    } catch {
      setRecentSearches([]);
    }
  }, [HISTORY_KEY]);

  /* -----------------------------
     Click outside closes the dropdown
  ------------------------------*/
  useEffect(() => {
    function handleDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setIsActive(false);
        setHighlightIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  /* -----------------------------
     Watch `value` and fetch suggestions with debounce
  ------------------------------*/
  useEffect(() => {
    setHighlightIndex(-1);
    setIsValidSelection(false);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    fetchSuggestionsDebounced(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  /* -----------------------------
     Fetch function
  ------------------------------*/
  async function fetchSuggestions(q: string) {
    setIsLoading(true);
    try {
      const res = await LocationService.autocomplete(q);
      if (!res.ok) throw new Error("Failed to fetch suggestions");
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Autocomplete fetch error:", err);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }

  /* -----------------------------
     Save selection -> update history and validation
  ------------------------------*/
  const handleSelect = (s: Suggestion | { short_name: string }) => {
    const short =
      (s as Suggestion).short_name || (s as { short_name: string }).short_name;
    onChange(short);
    setIsValidSelection(true);
    setIsActive(false);
    setHighlightIndex(-1);

    const updated = Array.from(new Set([short, ...recentSearches])).slice(0, 6);
    setRecentSearches(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));

    if ((s as Suggestion).place_id) {
      const sug = s as Suggestion;
      localStorage.setItem(
        "lastSelectedPlace",
        JSON.stringify({
          id: sug.place_id,
          name: sug.full_name,
          short: sug.short_name,
          lat: sug.lat,
          lon: sug.lon,
          type: sug.type,
        })
      );
    }
  };

  /* -----------------------------
     Geolocation using OSM Nominatim API + IP Lookup Fallback
  ------------------------------*/
  const handleUseCurrentLocation = async () => {
    setIsLoading(true);
    
    const fallbackToIpLookup = async () => {
      try {
        const ipRes = await fetch("https://ipapi.co/json/");
        if (!ipRes.ok) throw new Error("IP lookup response bad");
        const ipData = await ipRes.json();
        if (ipData.city) {
          const resolved = `${ipData.city}, ${ipData.region || ipData.country_name}`;
          onChange(resolved);
          setIsValidSelection(true);
          setIsActive(false);
        } else {
          throw new Error("No city in IP data");
        }
      } catch (e) {
        console.error("IP lookup failed:", e);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
            );
            if (!geoRes.ok) throw new Error("Reverse geocode response bad");
            const geoData = await geoRes.json();
            const address = geoData.address || {};
            const resolvedCity = address.city || address.town || address.village || address.state || "";
            const resolvedState = address.state || "";
            const name = resolvedCity && resolvedState && resolvedCity !== resolvedState
              ? `${resolvedCity}, ${resolvedState}`
              : resolvedCity || resolvedState;
            
            if (name) {
              onChange(name);
              setIsValidSelection(true);
              setIsActive(false);
            } else {
              await fallbackToIpLookup();
            }
          } catch (err) {
            console.error("OSM Nominatim failed, falling back to IP:", err);
            await fallbackToIpLookup();
          } finally {
            setIsLoading(false);
          }
        },
        async (error) => {
          console.warn("GPS Geolocation failed or denied, falling back to IP:", error.message);
          await fallbackToIpLookup();
          setIsLoading(false);
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      await fallbackToIpLookup();
      setIsLoading(false);
    }
  };

  /* -----------------------------
     Clear input
  ------------------------------*/
  const clearInput = () => {
    onChange("");
    setIsValidSelection(false);
    setSuggestions([]);
    setHighlightIndex(-1);
  };

  /* -----------------------------
     Clear all history
  ------------------------------*/
  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setRecentSearches([]);
  };

  /* -----------------------------
     Remove a single history entry
  ------------------------------*/
  const removeHistoryItem = (item: string) => {
    const updated = recentSearches.filter((h) => h !== item);
    setRecentSearches(updated);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  };

  /* -----------------------------
     Keyboard handling on input
  ------------------------------*/
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    const list = value.length < 2 ? recentSearches : suggestions;
    const max = Math.max(0, list.length - 1);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev < max ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => (prev > 0 ? prev - 1 : max));
    } else if (e.key === "Enter") {
      if (highlightIndex >= 0 && list[highlightIndex]) {
        const item = list[highlightIndex];
        if (typeof item === "string") handleSelect({ short_name: item });
        else handleSelect(item as Suggestion);
      }
    } else if (e.key === "Escape") {
      setIsActive(false);
      setHighlightIndex(-1);
    } else if (e.key === "Tab") {
      if (highlightIndex >= 0 && list[highlightIndex]) {
        e.preventDefault();
        const item = list[highlightIndex];
        if (typeof item === "string") handleSelect({ short_name: item });
        else handleSelect(item as Suggestion);
      }
    }
  };

  // auto-scroll highlighted item into view
  useEffect(() => {
    const el = itemsRef.current[highlightIndex];
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightIndex]);

  /* -----------------------------
     Render component
  ------------------------------*/
  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative group rounded-lg shadow-sm focus-within:shadow-md transition-shadow duration-200">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <InputIcon
            className={`w-5 h-5 transition-colors duration-300 ${iconColor.default} group-focus-within:${iconColor.focused}`}
          />
        </div>

        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsActive(true);
            setIsValidSelection(false);
            setHighlightIndex(-1);
          }}
          onFocus={() => {
            setIsActive(true);
            setHighlightIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label={placeholder}
          autoComplete="off"
          className="w-full bg-white text-gray-800 placeholder-gray-500 pl-12 pr-10 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
        />

        {/* Clear or loader */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
          <AnimatePresence mode="wait">
            {value && !isLoading ? (
              <motion.button
                key="clear"
                onClick={clearInput}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                aria-label="Clear input"
              >
                <XIcon className="w-5 h-5" />
              </motion.button>
            ) : isLoading ? (
              <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isActive && (value.length >= 2 || recentSearches.length > 0 || type === "source") && (
          <motion.ul
            className="absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {/* Geolocation Button when input is empty/short for source field */}
            {value.length < 2 && type === "source" && (
              <div className="border-b border-gray-100 p-2 bg-slate-50/50">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50/85 hover:bg-green-100/85 border border-green-200/50 rounded-lg shadow-2xs hover:shadow-xs transition duration-150 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-green-500 animate-bounce" />
                  <span>Use Current Location</span>
                </button>
              </div>
            )}

            {/* Recent searches when input is empty/short */}
            {value.length < 2 && recentSearches.length > 0 && (
              <>
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                  <div className="text-xs text-gray-500 font-semibold">
                    Recently searched
                  </div>
                  <button
                    className="text-xs text-red-500 hover:text-red-600 cursor-pointer inline-flex items-center gap-1"
                    onClick={clearHistory}
                    aria-label="Clear all history"
                  >
                    Clear all
                  </button>
                </div>

                {recentSearches.map((item, idx) => (
                  <motion.li
                    key={item}
                    ref={(el) => {
                      itemsRef.current[idx] = el;
                    }}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    onClick={() => handleSelect({ short_name: item })}
                    className={`flex items-center justify-between gap-3 px-4 py-3 cursor-pointer border-b last:border-0 transition-colors
                      ${highlightIndex === idx
                        ? "bg-green-100"
                        : "hover:bg-green-50"
                      }`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <History className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-800 text-sm truncate">
                        {item}
                      </span>
                    </div>

                    {/* Per-item delete button */}
                    <button
                      className="shrink-0 text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent selecting
                        removeHistoryItem(item);
                      }}
                      aria-label={`Remove ${item} from history`}
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </motion.li>
                ))}
              </>
            )}

            {/* Live suggestions when input length >= 2 */}
            {value.length >= 2 &&
              (suggestions.length > 0 ? (
                suggestions.map((s, idx) => (
                  <motion.li
                    key={s.place_id}
                    ref={(el) => {
                      itemsRef.current[idx] = el;
                    }}
                    onMouseEnter={() => setHighlightIndex(idx)}
                    onClick={() => handleSelect(s)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b last:border-0 transition-colors
                      ${highlightIndex === idx
                        ? "bg-green-100"
                        : "hover:bg-green-50"
                      }`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                  >
                    <MapPin className={`w-5 h-5 mt-1 ${mapPinColorClass}`} />

                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 font-medium text-sm leading-tight">
                        <HighlightMatch text={s.short_name} query={value} />
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[260px]">
                        {s.full_name}
                      </div>
                    </div>
                  </motion.li>
                ))
              ) : (
                <motion.li
                  className="px-4 py-4 text-center text-gray-500 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  No matching locations found.
                </motion.li>
              ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};
