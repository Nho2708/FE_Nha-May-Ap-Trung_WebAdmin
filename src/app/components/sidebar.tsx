import React from "react";
import { getNavigationForRole, type PageType } from "@/config/navigation";

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  role: string | null;
  username?: string | null;
}

const getRoleLabel = (role?: string | null) => {
  switch (role) {
    case "ADMIN":
      return "Quản trị viên";
    case "SALES_STAFF":
      return "Nhân viên kinh doanh";
    case "TECHNICIAN":
      return "Kỹ thuật viên";
    default:
      return "Người dùng";
  }
};

export function Sidebar({ currentPage, onPageChange, role, username }: SidebarProps) {
  const menuItems = getNavigationForRole(role);

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col">
      <div className="px-4 py-4 border-b border-slate-700 flex items-center justify-center">
        <img src="/logo.png" alt="IncuSmart" className="h-28 w-auto object-contain" />
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto hide-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-sm font-semibold">{username?.slice(0, 2).toUpperCase() || "AD"}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{username || "Tài khoản"}</p>
            <p className="text-xs text-slate-400">{getRoleLabel(role)}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
