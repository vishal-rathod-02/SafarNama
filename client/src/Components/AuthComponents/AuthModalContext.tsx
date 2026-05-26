import { AuthModalContextType } from "@/hooks/types";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export const AuthModalProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback((m: "login" | "signup" | "forgot" = "login") => {
    setMode(m);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => setIsOpen(false), []);

  const switchMode = useCallback((m: "login" | "signup" | "forgot") => setMode(m), []);

  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);

  const resetModal = useCallback(() => {
    setMode("login");
    setIsOpen(false);
  }, []);

  const value: AuthModalContextType = {
    isOpen,
    mode,
    openModal,
    closeModal,
    switchMode,
    toggleModal,
    resetModal,
  };

  return <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>;
};

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) throw new Error("useAuthModal must be used within AuthModalProvider");
  return context;
};
