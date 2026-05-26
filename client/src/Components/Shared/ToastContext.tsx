import React, { createContext, useState, useContext, ReactNode, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, X, AlertCircle } from "lucide-react";
import type { Toast, ToastContextType, ToastType } from "@/hooks/types";

// --- Context Setup ---
const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback(({ message, type }: { message: string; type: ToastType }) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// --- Hook ---
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};

// --- Toast Container ---
const ToastContainer = ({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) => (
  <div className="fixed top-18 right-4 z-9999 flex flex-col space-y-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
      ))}
    </AnimatePresence>
  </div>
);

// --- Toast Message ---
const ToastMessage = ({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) => {
  const toastStyles = {
    success: {
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      accent: "border-green-400 text-green-800",
    },
    error: {
      icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      accent: "border-red-400 text-red-800",
    },
    info: {
      icon: <Info className="w-4 h-4 text-blue-500" />,
      accent: "border-blue-400 text-blue-800",
    },
     warning: {
      icon: <AlertCircle className="w-4 h-4 text-yellow-500" />,
      accent: "border-yellow-400 text-yellow-800",
    },
  }[toast.type || "info"];

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, x: 40, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 40, y: -10 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      className={`pointer-events-auto flex items-center gap-2 
        px-3 py-2 rounded-lg backdrop-blur-md bg-white
        border ${toastStyles.accent} shadow-md`}
    >
      {toastStyles.icon}
      <p className="flex-1 text-sm font-medium truncate">{toast.message}</p>
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};
