import React, { useEffect, } from "react";
import { NavLink,} from "react-router-dom";
import { 
    LayoutDashboard, 
    BookMarked, 
    MapPin, 
    Users, 
    Globe, 
    User ,
    
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
    visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } }as any,
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
          className="hidden lg:flex lg:flex-col w-64 h-screen bg-white shadow-lg sticky top-0 z-30 border-r border-gray-100"
        >

          {/* User Info */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 mb-4">
            <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-md shadow-inner">
              {user ? getInitials(user) : <User className="w-5 h-5" />}
            </div>
            <div className="overflow-hidden">
              <p className="font-semibold text-gray-800 truncate">
                {user?.fullName || "Guest Traveler"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || "Welcome!"}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-col gap-1.5 p-2 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 
                    ${
                      isActive
                        ? "bg-green-100 text-green-700 font-bold shadow-inner scale-[1.02]"
                        : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                    }`
                  }
                  end={item.path === "/dashboard" || item.path === "/"}
                >
                  <Icon className="w-5 h-5" />
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
              className="fixed top-0 left-0 z-50 w-64 h-full bg-white shadow-2xl flex flex-col lg:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">SafarNama</h2>
                  <p className="text-xs text-green-700 font-semibold -mt-1">
                    More than Just Routes
                  </p>
                </div>
                <motion.button
                  onClick={onClose}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </motion.button>
              </div>

              {/* User Info */}
              <motion.div
                className="flex items-center gap-3 p-4 border-b border-gray-100 mb-4 flex-shrink-0"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-md shadow-inner">
                  {user ? getInitials(user) : <User className="w-5 h-5" />}
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-gray-800 truncate">
                    {user?.fullName || "Guest Traveler"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || "Welcome!"}
                  </p>
                </div>
              </motion.div>

              {/* Navigation */}
              <motion.nav
                className="flex-1 flex flex-col gap-1.5 p-2 overflow-y-auto"
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
                          `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 
                          ${
                            isActive
                              ? "bg-green-100 text-green-700 font-bold shadow-inner scale-[1.02]"
                              : "text-gray-700 hover:bg-gray-50 hover:text-green-600"
                          }`
                        }
                        end={item.path === "/dashboard" || item.path === "/"}
                      >
                        <Icon className="w-5 h-5" />
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