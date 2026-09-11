import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAuthModal } from "./AuthModalContext";
import { ForgotPasswordForm } from "./AuthForms";
import { LoginForm, SignupForm } from "./AuthForms";

/* ------------------- Animation Variants ------------------- */
const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const modalVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: "easeOut" }as any },
};
export const AuthModal: React.FC = () => {
  const { isOpen, mode, closeModal, switchMode } = useAuthModal();
  const [localMode, setLocalMode] = useState(mode);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) closeModal();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeModal]);

  useEffect(() => {
    if (isOpen) setLocalMode(mode);
  }, [mode, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-md"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={closeModal}
        >
          <motion.div
            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md m-4 relative overflow-hidden text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Authentication modal"
          >
            <button
              aria-label="Close authentication modal"
              onClick={closeModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <AnimatePresence mode="wait">
              <motion.div
                key={localMode}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="p-8 sm:p-10"
              >
                {localMode === "login" && (
                  <LoginForm
                    switchMode={switchMode}
                    closeModal={closeModal}
                  />
                )}

                {localMode === "signup" && (
                  <SignupForm
                    switchMode={switchMode}
                    closeModal={closeModal}
                  />
                )}

                {localMode === "forgot" && (
                  <ForgotPasswordForm switchMode={switchMode} />
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};



