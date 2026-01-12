import React from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  ShoppingCart, 
  FileText, 
  Wrench 
} from 'lucide-react';

type PageType = 'dashboard' | 'devices' | 'sales' | 'templates' | 'maintenance';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const menuItems = [
  { id: 'dashboard' as PageType, label: 'Tổng Quan', icon: LayoutDashboard },
  { id: 'devices' as PageType, label: 'Thiết Bị', icon: Settings },
  { id: 'sales' as PageType, label: 'Đơn Hàng', icon: ShoppingCart },
  { id: 'templates' as PageType, label: 'Template Ấp', icon: FileText },
  { id: 'maintenance' as PageType, label: 'Bảo Trì', icon: Wrench },
];

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-xl font-bold">Admin Panel</h2>
        <p className="text-sm text-slate-400 mt-1">Egg Incubator System</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
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
            <span className="text-sm font-semibold">AD</span>
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-slate-400">admin@system.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
