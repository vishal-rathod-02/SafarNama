import { Outlet } from "react-router-dom";
import { DashboardHeader } from "@/Components/DashboardLayout/DashboardHeader";
import { Sidebar } from "@/Components/DashboardLayout/Sidebar";
import { useState } from "react";

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />

        <main className="flex-1 overflow-y-auto bg-gray-50 relative z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
