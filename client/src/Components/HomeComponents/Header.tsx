import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Info,
  Briefcase,
  MapPin,
  Mail,
  Menu,
  X,
  LogInIcon,
  UserPlusIcon,
  LayoutDashboard,
} from "lucide-react";
import type { HeaderProps } from "@/hooks/types";
import { useAuth } from "../AuthComponents/AuthContext";
import { useAuthModal } from "../AuthComponents/AuthModalContext";
import { UserMenu } from "../AuthComponents/UserMenu";
import { useNavigate } from "react-router-dom";

export const Header: React.FC<HeaderProps> = ({ onNavLinkClick, activeSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const { openModal } = useAuthModal();

  // Close mobile menu when clicked outside or pressing Esc
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuPanelRef.current &&
        !menuPanelRef.current.contains(event.target as Node) &&
        !menuButtonRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  // Nav items (match HomePage IDs)
  const navItems = [
    { name: "Home", id: "home", icon: Home },
    { name: "Destinations", id: "destinations", icon: MapPin },
    { name: "Services", id: "services", icon: Briefcase },
    { name: "About Us", id: "about", icon: Info },
    { name: "Contact Us", id: "contact", icon: Mail },
  ];

  const handleLinkClick = (sectionId: string) => {
    if (window.location.pathname !== "/") {
      navigate(`/#${sectionId}`);
    } else {
      onNavLinkClick?.(sectionId);
    }
    setIsOpen(false);
  };

  // Mobile animation variants
  const mobileNavContainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };
  const mobileNavItemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.header className="fixed top-0 w-full z-50" role="banner">
      <div className="backdrop-blur-xl bg-white/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-wide leading-none">
                  SafarNama
                </h1>
                <p className="text-[10px] sm:text-xs text-green-700 font-semibold tracking-wide">
                  More than Just Routes
                </p>
              </div>
            </div>

            {/* Desktop Nav */}
            <nav aria-label="Primary navigation" className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleLinkClick(item.id)}
                  className={`relative font-medium transition-colors py-2 cursor-pointer ${
                    activeSection === item.id
                      ? "text-green-600"
                      : "text-gray-700 hover:text-green-600"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-green-500 transform transition-transform duration-300 ease-out ${
                      activeSection === item.id
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </button>
              ))}

              {/* Auth Buttons / User Menu */}
              <div className="ml-4 flex items-center gap-2">
                {isLoading ? (
                  <div className="flex items-center justify-center w-24 h-9 rounded-full bg-gray-100 animate-pulse" />
                ) : isAuthenticated ? (
                  <UserMenu user={user} logout={logout} />
                ) : (
                  <>
                    <button
                      onClick={() => openModal("signup")}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-green-600 text-white shadow-md hover:bg-green-700 transition"
                    >
                      <UserPlusIcon className="w-5 h-5" /> Signup
                    </button>
                  </>
                )}
              </div>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              ref={menuButtonRef}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle mobile menu"
              className="lg:hidden text-gray-700 hover:text-green-600 transition"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isOpen ? "x" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
                </motion.div>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuPanelRef}
            variants={mobileNavContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="lg:hidden bg-white/95 backdrop-blur-lg shadow-lg absolute top-16 left-0 w-full"
          >
            <nav aria-label="Mobile navigation" className="flex flex-col p-6 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleLinkClick(item.id)}
                    variants={mobileNavItemVariants}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors ${
                      activeSection === item.id
                        ? "bg-green-100 text-green-700 font-semibold"
                        : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                    }`}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {item.name}
                  </motion.button>
                );
              })}

              {/* Auth Section */}
              <motion.div variants={mobileNavItemVariants} className="pt-4 border-t border-gray-200">
                {isLoading ? (
                  <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse" />
                ) : isAuthenticated && user ? (
                  <div className="space-y-3 py-3 px-3">
                    <p className="font-semibold text-gray-800">{user.fullName}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition"
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      My Dashboard
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 py-3">
                    <button
                      onClick={() => openModal("signup")}
                      className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg font-semibold bg-green-600 text-white shadow-sm hover:bg-green-700 transition"
                    >
                      <UserPlusIcon className="w-5 h-5" /> Signup
                    </button>
                  </div>
                )}
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
