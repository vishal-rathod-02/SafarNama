import React from "react";
import { Outlet } from "react-router-dom";
import { AuthModal } from "@/Components/AuthComponents/AuthModal";
import { LayoutProps } from "@/hooks/types";

export const MainLayout: React.FC<LayoutProps> = ({
  isAuthenticated,
  onOpenAuthModal,
  addToast,
}) => {
  return (
    <>
      <main className="relative z-0">
        <Outlet context={{ onOpenAuthModal, isAuthenticated, addToast }} />
      </main>
      <AuthModal />
    </>
  );
};