import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import type { AuthContextType, AuthUser } from "@/hooks/types";
import { AuthService } from "@/Services/Auth/Auth.service";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("safarnama-token")
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------ Fetch User ------------------------ */
  const fetchUserProfile = async () => {
    try {
      const res = await AuthService.me();

      if (!res.ok) {
        throw new Error("AUTH_FAILED");
      }

      const data = await res.json();
      setUser(data.data);
      setError(null);
    } catch (err: any) {
        // console.error("❌ fetchUserProfile failed:", err.message);

        if (
          err?.message === "AUTH_FAILED" ||
          err?.message?.toLowerCase().includes("expired")
        ) {
          setError("Session expired");
          logout();
        }
      }
  };

  /* ------------------------ Init ------------------------ */
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    (async () => {
      await fetchUserProfile();
      setIsLoading(false);
    })();
  }, [token]);

  useEffect(() => {
  const handleSessionExpired = () => {
    setUser(null);
    setToken(null);
  };

  window.addEventListener("auth:expired", handleSessionExpired);
  return () => {
    window.removeEventListener("auth:expired", handleSessionExpired);
  };
}, []);

  /* ------------------------ Login ------------------------ */
  const login = async (newToken: string) => {
    localStorage.setItem("safarnama-token", newToken);
    setToken(newToken);
    setIsLoading(true);
    await fetchUserProfile();
    setIsLoading(false);
  };

  /* ------------------------ Logout ------------------------ */
  const logout = () => {
  localStorage.removeItem("safarnama-token");
  setUser(null);
  setToken(null);
  setError(null);
  setIsLoading(false);
};
  /* ------------------------ Logout All Devices ------------------------ */
  const logoutAll = async () => {
    try {
      await AuthService.logoutAll();
    } catch {
      // ignore
    } finally {
      logout();
    }
  };

  const value: AuthContextType = {
    isAuthenticated: !!user,
    user,
    token,
    isLoading,
    login,
    logout,
    logoutAll,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
