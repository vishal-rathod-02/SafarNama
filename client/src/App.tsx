import React, { useCallback, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Dashboard } from "./Pages/DashboardPage";
import { HomePage } from "./Pages/HomePage";
import { ResultsPage } from "./Pages/ResultPage";
import { ProtectedRoute } from "./Components/Shared/ProtectedRoute";
import { MainLayout } from "./Components/Shared/Layout/MainLayout";
import { ResetPasswordPage } from "./Components/AuthComponents/ResetPasswordPage";
import { VerifyEmailPage } from "./Components/AuthComponents/VerifyEmailPage";
import { DashboardLayout } from "./Components/Shared/Layout/DashboardLayout";
import { MyTripsPage } from "./Components/DashboardLayout/MyTrips";
import { ToastType } from "./hooks/types";
import { useAuth } from "./Components/AuthComponents/AuthContext";
import { useAuthModal } from "./Components/AuthComponents/AuthModalContext";

const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { openModal } = useAuthModal();

  const addToast = useCallback(
    (toast: { message: string; type: ToastType }) => {
      console.log(`[${toast.type.toUpperCase()}] ${toast.message}`);
    },
    []
  );

  /* ------------------ EMAIL VERIFICATION HANDLER ------------------ */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verified = params.get("verified");

    if (!verified) return;

    if (verified === "success") {
      addToast({
        message: "Email verified successfully! Please login.",
        type: "success",
      });
      openModal("login");
    }

    if (verified === "expired") {
      addToast({
        message: "Verification link expired. Please resend verification email.",
        type: "error",
      });
    }

    if (verified === "invalid") {
      addToast({
        message: "Invalid verification link.",
        type: "error",
      });
    }

    // Clean URL after handling
    window.history.replaceState({}, "", "/");
  }, [openModal, addToast]);

  useEffect(() => {
  const onExpired = () => {
    openModal("login");
    addToast({
      message: "Session expired. Please login again.",
      type: "warning",
    });
  };

  window.addEventListener("auth:expired", onExpired);
  return () => window.removeEventListener("auth:expired", onExpired);
}, [openModal, addToast]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 overflow-x-hidden transition-colors duration-300">
      <Routes>

        {/* ---------------- PUBLIC ROUTES ---------------- */}
        <Route
          element={
            <MainLayout
              isAuthenticated={isAuthenticated}
              onOpenAuthModal={openModal}
              addToast={addToast}
            />
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordPage />}
          />
          <Route
            path="/verify-email/:token"
            element={<VerifyEmailPage />}
          />
        </Route>

        {/* ---------------- PROTECTED ROUTES ---------------- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/mytrips" element={<MyTripsPage />} />
          </Route>
        </Route>

      </Routes>
    </div>
  );
};

export default App;
