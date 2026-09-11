import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserMenuProps } from "@/hooks/types";
import { useAuth } from "./AuthContext";
import { TripService } from "@/Services/Trip/Trip.service";

export const UserMenu: React.FC<UserMenuProps> = ({ user, logout }) => {
  const { token } = useAuth();
  const [recentTrips, setRecentTrips] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  if (!user) return null;

  /* ------------------------ Fetch Recent Trips ------------------------ */
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        if (!token) return;
        const response = await TripService.myTrips();

        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || "Failed to fetch trips");
        setRecentTrips(data.trips?.slice(0, 5) || []);
      } catch (err: any) {
        console.error("❌ Recent Trips Fetch Error:", err.message);
        setRecentTrips([]);
      }
    };
    fetchTrips();
  }, [token]);

  /* ------------------------ Handle Outside Click & Escape ------------------------ */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    const handleEsc = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  /* ------------------------ Helper: Get User Initials ------------------------ */
  const getUserInitials = (fullName: string) => {
    if (!fullName) return "";
    const names = fullName.trim().split(/\s+/);
    return (names[0]?.[0] + (names[1]?.[0] || "")).toUpperCase();
  };

  /* ------------------------ Animation Variants ------------------------ */
  const menuVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -6, transition: { duration: 0.15 } },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } as any },
    exit: { opacity: 0, scale: 0.95, y: -4, transition: { duration: 0.2 } },
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-linear-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black 
        shadow-md shadow-amber-500/25 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30 transition duration-200 border-2 border-amber-300 dark:border-amber-400"
        title={`Account Menu for ${user.fullName}`}
      >
        {getUserInitials(user.fullName)}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute right-0 mt-2.5 w-72 bg-white/95 dark:bg-slate-900/95 shadow-2xl rounded-2xl overflow-hidden z-50 border border-slate-200/80 dark:border-slate-800 backdrop-blur-md"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
              <p className="font-bold text-slate-900 dark:text-white">{user.fullName}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
            </div>

            {/* Dashboard Link */}
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-amber-500/10 dark:hover:bg-amber-500/15 transition text-slate-700 dark:text-slate-200 font-semibold group"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              Dashboard
            </Link>

            {/* Recent Trips */}
            <div className="px-4 py-3 bg-slate-50/60 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
              {recentTrips.length > 0 ? (
                <>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Recent Trips</p>
                  <ul className="space-y-1">
                    {recentTrips.slice(0, 3).map((trip) => (
                      <li key={trip._id}>
                        <Link
                          to={`/trips/${trip._id}`}
                          className="block text-xs text-slate-700 dark:text-slate-300 truncate hover:text-amber-600 dark:hover:text-amber-400 transition font-medium"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="text-amber-500 mr-1.5">•</span>
                          {trip.destination || "Unnamed Trip"}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center">No recent trips yet</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
