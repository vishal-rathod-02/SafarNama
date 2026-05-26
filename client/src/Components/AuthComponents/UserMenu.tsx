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
        className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold 
        shadow-md hover:scale-[1.05] hover:shadow-lg transition-transform duration-200"
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
            className="absolute right-0 mt-2 w-72 bg-white/95 shadow-xl rounded-xl overflow-hidden z-50 border border-gray-100 backdrop-blur-md"
          >
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
              <p className="font-semibold text-gray-900">{user.fullName}</p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>

            {/* Dashboard Link */}
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-green-50 transition text-gray-700 font-medium"
            >
              <LayoutDashboard className="w-5 h-5 text-green-600" />
              Dashboard
            </Link>

            {/* Recent Trips */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              {recentTrips.length > 0 ? (
                <>
                  <p className="text-sm text-gray-600 mb-2 font-semibold">Recent Trips</p>
                  <ul className="space-y-1">
                    {recentTrips.slice(0, 3).map((trip) => (
                      <li key={trip._id}>
                        <Link
                          to={`/trips/${trip._id}`}
                          className="block text-sm text-gray-800 truncate hover:text-green-600 transition"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="text-green-600 mr-1">&bull;</span>
                          {trip.destination || "Unnamed Trip"}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-gray-500 italic text-center">No recent trips yet</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
