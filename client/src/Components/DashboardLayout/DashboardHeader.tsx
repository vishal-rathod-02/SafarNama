import React, { useState, useRef, useEffect } from "react";
import { User, LogOutIcon, Settings, Bell, Menu, Sun, Moon, Monitor } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../AuthComponents/AuthContext";
import { useToast } from "../Shared/ToastContext";
import { DashboardHeaderProps } from "@/hooks/types";
import { useTheme } from "@/context/ThemeContext";

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onToggleSidebar,
}) => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Toggle user menu dropdown
  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
  };

  // Close dropdown when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsDropdownOpen(false);
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isDropdownOpen]);

  // Get user initials
  const getInitials = (user: any) => {
    if (!user || !user.fullName) return 'NA';
    const names = user.fullName.split(" ");
    return names.map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Logout handler with toast-messanger
  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    addToast({
      message: `You have successfully logged out, ${user?.fullName?.split(" ")[0] || "Traveler"}.`,
      type: "info",
    });
  };

  // Motion Variants
  const brandVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } } as any,
  };

  const dashboardTextVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.4 } },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { delay: 0.4, duration: 0.3 } },
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xs border-b border-slate-200/80 dark:border-slate-800"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle (mobile) */}
            <motion.button
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl bg-linear-to-r from-amber-500 to-amber-400 text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </motion.button>

            {/* Brand + Dashboard title */}
            <motion.div
              variants={brandVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center space-x-3"
            >
              {/* SafarNama title */}
              <motion.div variants={brandVariants}>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">SafarNama</h1>
                <p className="text-[10px] sm:text-xs text-amber-500 font-extrabold tracking-wide">
                  More than Just Routes
                </p>
              </motion.div>

              {/* Divider */}
              <motion.div
                variants={{
                  hidden: { scaleX: 0 },
                  visible: { scaleX: 1, transition: { duration: 0.4 } },
                }}
                className="h-8 w-[1.5px] bg-slate-200 dark:bg-slate-700 mx-2 rounded-full origin-left"
              />

              {/* Dashboard */}
              <motion.p
                variants={dashboardTextVariants}
                className="text-sm sm:text-base font-bold text-slate-600 dark:text-slate-300 italic"
              >
                Dashboard
              </motion.p>
            </motion.div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3 sm:gap-4 relative">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={`Toggle theme (currently ${theme})`}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-hidden focus:ring-2 focus:ring-amber-500 cursor-pointer"
              title={`Theme: ${theme.toUpperCase()}`}
            >
              {theme === "light" && <Sun className="w-5 h-5 text-amber-500" />}
              {theme === "dark" && <Moon className="w-5 h-5 text-amber-400" />}
              {theme === "system" && <Monitor className="w-5 h-5 text-emerald-500" />}
            </button>

            {/* Notification Bell */}
            <motion.button
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <Bell className="w-5 h-5" />
            </motion.button>

            {/* User Avatar + Dropdown */}
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={toggleDropdown}
                className="w-10 h-10 rounded-full bg-linear-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/25 border-2 border-amber-300 dark:border-amber-400 hover:scale-105 transition duration-200 cursor-pointer"
              >
                {user ? getInitials(user) : <User className="w-5 h-5" />}
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-50 backdrop-blur-md"
                  >
                    <button className="flex items-center gap-2.5 px-4 py-3 w-full text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition cursor-pointer">
                      <User className="w-4 h-4 text-amber-500" /> Profile
                    </button>
                    <button className="flex items-center gap-2.5 px-4 py-3 w-full text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition cursor-pointer">
                      <Settings className="w-4 h-4 text-amber-500" /> Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-4 py-3 w-full text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-950/30 transition border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                    >
                      <LogOutIcon className="w-4 h-4" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};
