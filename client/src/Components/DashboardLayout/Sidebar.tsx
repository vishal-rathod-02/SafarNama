import React, { useEffect, } from "react";
import { NavLink, } from "react-router-dom";
import {
  LayoutDashboard,
  BookMarked,
  MapPin,
  Users,
  Globe,
  User,

  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '../AuthComponents/AuthContext';

const getInitials = (user: any) => {
  if (!user || !user.fullName) return 'NA';
  const names = user.fullName.split(" ");
  return names.map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
};


// Define the meaningful navigation items
const navItems = [
  { name: "Overview", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Plan New Trip", icon: MapPin, path: "/" },
  { name: "My Trips", icon: BookMarked, path: "/mytrips" },
  { name: "Settings", icon: Users, path: "/dashboard/settings" },
  { name: "Help & Support", icon: Globe, path: "/dashboard/support" },
];

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const sidebar = document.getElementById("dashboard-sidebar");
      if (sidebar && !sidebar.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const sidebarVariants = {
    hidden: { x: "-100%" },
    visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } } as any,
    exit: { x: "-100%" },
  };

  return (
    <>
      {/* Overlay for mobile/tablet with fade */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      <div className="flex">
        {/* 🖥️ Desktop Sidebar (Always visible) */}
        <aside
          id="dashboard-sidebar"
          className="hidden lg:flex lg:flex-col w-64 h-screen bg-white dark:bg-slate-900 shadow-xl sticky top-0 z-30 border-r border-slate-200/80 dark:border-slate-800"
        >
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                SafarNama
              </h2>
              <p className="text-[11px] text-amber-500 font-extrabold tracking-wide mt-0.5">
                More than Just Routes
              </p>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800 mb-2 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="w-10 h-10 bg-linear-to-tr from-amber-500 to-amber-400 text-slate-950 rounded-full flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/20 border-2 border-amber-300 dark:border-amber-400 shrink-0">
              {user ? getInitials(user) : <User className="w-5 h-5" />}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-slate-900 dark:text-white truncate text-sm">
                {user?.fullName || "Guest Traveler"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email || "Welcome!"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1.5 p-3 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 
                    ${isActive
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold border-l-4 border-amber-500 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
                    }`
                  }
                  end={item.path === "/dashboard" || item.path === "/"}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* 📱 Mobile Sidebar */}
        <AnimatePresence>
          {isOpen && (
            <motion.aside
              id="dashboard-sidebar"
              key="mobile-sidebar"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 left-0 z-50 w-64 h-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col lg:hidden border-r border-slate-200/80 dark:border-slate-800"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">SafarNama</h2>
                  <p className="text-[11px] text-amber-500 font-extrabold -mt-0.5 tracking-wide">
                    More than Just Routes
                  </p>
                </div>
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </motion.button>
              </div>

              {/* User Info */}
              <motion.div
                className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800 mb-4 shrink-0 bg-slate-50/50 dark:bg-slate-800/30"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <div className="w-10 h-10 bg-linear-to-tr from-amber-500 to-amber-400 text-slate-950 rounded-full flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/20 border-2 border-amber-300 dark:border-amber-400 shrink-0">
                  {user ? getInitials(user) : <User className="w-5 h-5" />}
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-900 dark:text-white truncate text-sm">
                    {user?.fullName || "Guest Traveler"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || "Welcome!"}
                  </p>
                </div>
              </motion.div>

              {/* Navigation */}
              <motion.nav
                className="flex-1 flex flex-col gap-1.5 p-3 overflow-y-auto"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {navItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                    >
                      <NavLink
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 
                          ${isActive
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold border-l-4 border-amber-500 shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white"
                          }`
                        }
                        end={item.path === "/dashboard" || item.path === "/"}
                      >
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </NavLink>
                    </motion.div>
                  );
                })}
              </motion.nav>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};