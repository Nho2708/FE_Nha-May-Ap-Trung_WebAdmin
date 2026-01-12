import React, { useState } from "react";
import { Sidebar } from "./components/layout/sidebar";
import { AdminDashboard } from "./components/dashboard/admin-dashboard";
import { DeviceManagement } from "./components/devices/device-management";
import { SalesOrders } from "./components/orders/sales-orders";
import { TemplateManagement } from "./components/templates/template-management";
import { MaintenanceTickets } from "./components/maintenance/maintenance-tickets";
import { AIChat } from "./components/shared/ai-chat";

type PageType = "dashboard" | "devices" | "sales" | "templates" | "maintenance";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");
  const [isChatOpen, setIsChatOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <AdminDashboard />;
      case "devices":
        return <DeviceManagement />;
      case "sales":
        return <SalesOrders />;
      case "templates":
        return <TemplateManagement />;
      case "maintenance":
        return <MaintenanceTickets />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-800">
              Hệ Thống Quản Lý Máy Ấp Trứng AI
            </h1>
            <button
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>💬</span>
              AI Assistant
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">{renderPage()}</main>
      </div>

      {isChatOpen && <AIChat onClose={() => setIsChatOpen(false)} />}
    </div>
  );
}
