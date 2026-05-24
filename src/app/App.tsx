import React, { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { Sidebar } from "./components/sidebar";
import { AdminDashboard } from "./components/admin-dashboard";
import { DeviceManagement } from "./components/device-management";
import { IncubatorModelManagement } from "./components/incubator-model-management";  // ← mới
import { SalesOrders } from "./components/sales-orders";
import { TemplateManagement } from "./components/template-management";
import { MaintenanceTickets } from "./components/maintenance-tickets";
import { UserStaffManagement } from "./components/user-staff-management";
import { WarrantyManagement } from "./components/warranty-management";
import { AIChat } from "./components/ai-chat";
import { LoginScreen } from "./components/login-screen";
import { authService, authStorage } from "@/services/auth";
import {
  canAccessPage,
  getNavigationForRole,
  type PageType,
} from "@/config/navigation";

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>("dashboard");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [session, setSession] = useState(() => authStorage.getSession());

  useEffect(() => {
    return authStorage.subscribe(() => {
      setSession(authStorage.getSession());
    });
  }, []);

  const role = session?.role ?? null;
  const allowedNavigation = getNavigationForRole(role);
  const fallbackPage = allowedNavigation[0]?.id ?? "dashboard";
  const canAccessCurrentPage = canAccessPage(currentPage, role);

  useEffect(() => {
    if (session && !canAccessCurrentPage && allowedNavigation.length > 0) {
      setCurrentPage(fallbackPage);
    }
  }, [session, canAccessCurrentPage, fallbackPage, allowedNavigation.length]);

  if (!session) {
    return <LoginScreen />;
  }

  const renderPage = () => {
    if (!canAccessCurrentPage) {
      return <AccessDenied role={role} />;
    }

    switch (currentPage) {
      case "dashboard":
        return <AdminDashboard />;
      case "devices":
        return <DeviceManagement />;
      case "incubator-models":        // ← mới
        return <IncubatorModelManagement />;
      case "sales":
        return <SalesOrders />;
      case "templates":
        return <TemplateManagement />;
      case "maintenance":
        return <MaintenanceTickets />;
      case "users":
        return <UserStaffManagement />;
      case "warranty":
        return <WarrantyManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        currentPage={canAccessCurrentPage ? currentPage : fallbackPage}
        onPageChange={setCurrentPage}
        role={role}
        username={session.username}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-slate-800">
              Hệ Thống Quản Lý Máy Ấp Trứng AI
            </h1>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                AI Assistant
              </button>
              <button
                onClick={() => authService.logout()}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <LogOut size={16} />
                Đăng xuất
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8">{renderPage()}</main>
      </div>

      {isChatOpen && <AIChat onClose={() => setIsChatOpen(false)} />}
    </div>
  );
}

function AccessDenied({ role }: { role: string | null }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Bạn không có quyền truy cập màn hình này</h2>
      <p className="mt-2 text-sm text-slate-600">
        Tài khoản hiện tại thuộc nhóm quyền <span className="font-semibold">{role || "không xác định"}</span>.
        Vui lòng chọn chức năng khác trên thanh menu.
      </p>
    </div>
  );
}
