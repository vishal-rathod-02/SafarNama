import React from "react";
import { MapPin, Flag, Clock, Car, Navigation } from "lucide-react";
import { TripSummaryCardProps } from "@/hooks/types";
import WeatherWidget from "./WeatherWidget";
import { motion, AnimatePresence } from "framer-motion";

const TripSummaryCard: React.FC<TripSummaryCardProps> = ({
  tripData,
  sourceCoords: propSourceCoords,
  destinationCoords: propDestinationCoords
}) => {
  const formatDistance = (meters: number) =>
    meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters.toFixed(0)} m`;

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.round((seconds % 3600) / 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m} min`;
  };

  function normalizeCoords(
    coords?: number[]
  ): [number, number] | null {
    if (!coords || coords.length !== 2) return null;
    const [lng, lat] = coords;
    return [lat, lng];
  }

  // Resolve coordinates: props coordinates are already [lat, lng], route coordinates are [lng, lat]
  const resolvedSourceCoords = propSourceCoords || (tripData.route?.[0] ? normalizeCoords(tripData.route[0]) : null);
  const resolvedDestinationCoords = propDestinationCoords || (tripData.route?.[tripData.route.length - 1] ? normalizeCoords(tripData.route[tripData.route.length - 1]) : null);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200/80 dark:border-slate-700 p-6 md:p-8 mb-8 transition-all duration-300 text-left">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">

        {/* Source Panel */}
        <motion.div
          className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 w-full md:w-auto"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-12 h-12 bg-amber-500/15 dark:bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/30">
            <MapPin className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 truncate max-w-[200px]" title={tripData.source}>
              {tripData.source.split(",")[0]}
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Source Point</p>
          </div>
        </motion.div>

        {/* Visual Progress Connector Line */}
        <div className="hidden md:flex flex-col items-center grow mx-6 relative">
          <div className="w-full flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cruising Path</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{formatDistance(tripData.distance)}</span>
          </div>

          {/* Dashed Line */}
          <div className="w-full h-1 bg-linear-to-r from-amber-400 via-emerald-400 to-amber-500 rounded-full relative">
            {/* Animating Car */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900 z-10 font-bold"
              animate={{ left: ["5%", "95%", "5%"] }}
              transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
            >
              <Car className="w-4 h-4" />
            </motion.div>
          </div>

          <div className="flex gap-3 mt-3">
            <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-950/40 px-3 py-1 rounded-xl border border-amber-400/30">
              <Navigation className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                {formatDistance(tripData.distance)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-500/30">
              <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {formatDuration(tripData.duration)}
              </span>
            </div>
          </div>
        </div>

        {/* Mobile Info Badges */}
        <div className="flex md:hidden gap-3 w-full justify-center">
          <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-950/30 px-3 py-1.5 rounded-xl border border-amber-400/30">
            <Car className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-bold text-amber-700 dark:text-amber-300">{formatDistance(tripData.distance)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-500/30">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{formatDuration(tripData.duration)}</span>
          </div>
        </div>

        {/* Destination Panel */}
        <motion.div
          className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 w-full md:w-auto md:text-right"
          whileHover={{ scale: 1.02 }}
        >
          <div className="w-full min-w-0 md:order-1 order-2">
            <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100 truncate max-w-[200px]" title={tripData.destination}>
              {tripData.destination.split(",")[0]}
            </h3>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Destination Point</p>
          </div>
          <div className="w-12 h-12 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0 md:order-2 order-1 border border-emerald-500/30">
            <Flag className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </motion.div>

      </div>

      {/* Weather Indicator Section */}
      <AnimatePresence>
        {(resolvedSourceCoords || resolvedDestinationCoords) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            {resolvedSourceCoords && (
              <WeatherWidget
                label={`${tripData.source.split(",")[0]} Weather`}
                coords={resolvedSourceCoords}
              />
            )}

            {resolvedDestinationCoords && (
              <WeatherWidget
                label={`${tripData.destination.split(",")[0]} Weather`}
                coords={resolvedDestinationCoords}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 💰 Interactive Budget & Expense Estimator */}
      <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700/50">
        <BudgetEstimator distanceMeters={tripData.distance} />
      </div>
    </div>
  );
};

/* ---------------- Budget Estimator Sub-Component ---------------- */
const BudgetEstimator: React.FC<{ distanceMeters: number }> = ({ distanceMeters }) => {
  const [tier, setTier] = React.useState<"budget" | "mid" | "luxury">("mid");
  const [currency, setCurrency] = React.useState<"INR" | "USD" | "EUR">("INR");

  const distanceKm = Math.max(1, distanceMeters / 1000);
  const estimatedDays = Math.max(1, Math.ceil(distanceKm / 300));

  // Base costs in INR
  const stayRateInr = tier === "budget" ? 1200 : tier === "mid" ? 3500 : 9000;
  const transportCostInr = Math.round(distanceKm * 12);
  const foodCostInr = estimatedDays * (tier === "budget" ? 600 : tier === "mid" ? 1500 : 3500);
  const totalInr = stayRateInr * estimatedDays + transportCostInr + foodCostInr;

  // Currency conversions
  const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : "€";
  const rate = currency === "INR" ? 1 : currency === "USD" ? 0.012 : 0.011;

  const fmt = (inrVal: number) => {
    const val = inrVal * rate;
    return `${symbol}${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="bg-slate-50/70 dark:bg-slate-900/40 p-4 sm:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div>
          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>💡 Trip Budget & Expense Estimator</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-md font-bold">
              ~{estimatedDays} Day{estimatedDays > 1 ? "s" : ""} Trip
            </span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">Estimated stay, transport & dining expenses based on route distance</p>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {(["INR", "USD", "EUR"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                currency === c
                  ? "bg-linear-to-r from-amber-500 to-amber-600 text-slate-950 shadow-xs font-black"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {c === "INR" ? "₹ INR" : c === "USD" ? "$ USD" : "€ EUR"}
            </button>
          ))}
        </div>
      </div>

      {/* Tier Selector */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { id: "budget", label: "Budget", desc: "Hostels & Cabs" },
          { id: "mid", label: "Mid-Range", desc: "3★ Stay & Taxi" },
          { id: "luxury", label: "Luxury", desc: "5★ Stay & Flight" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTier(t.id as any)}
            className={`p-2.5 text-left rounded-xl border transition-all cursor-pointer ${
              tier === t.id
                ? "bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 font-bold shadow-xs"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
            }`}
          >
            <div className="text-xs font-extrabold">{t.label}</div>
            <div className="text-[10px] text-slate-400 font-medium">{t.desc}</div>
          </button>
        ))}
      </div>

      {/* Cost Breakdown Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Stay ({estimatedDays} Nights)</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{fmt(stayRateInr * estimatedDays)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Transport (~{Math.round(distanceKm)} km)</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{fmt(transportCostInr)}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">Food & Misc</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{fmt(foodCostInr)}</span>
        </div>
        <div className="border-l border-slate-200 dark:border-slate-700 pl-3">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold uppercase block">Total Estimated</span>
          <span className="text-sm font-black text-amber-600 dark:text-amber-400">{fmt(totalInr)}</span>
        </div>
      </div>
    </div>
  );
};

export default TripSummaryCard;