import {
  Box,
  FileText,
  LayoutDashboard,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  Wrench,
} from "lucide-react";
import type { ElementType } from "react";
import type { UserRole } from "@/types/user";

export type PageType =
  | "dashboard"
  | "devices"
  | "incubator-models"   // ← mới thêm
  | "sales"
  | "templates"
  | "maintenance"
  | "users"
  | "warranty";

export interface NavigationItem {
  id: PageType;
  label: string;
  icon: ElementType;
  roles: UserRole[];
}

export const navigationItems: NavigationItem[] = [
  {
    id: "dashboard",
    label: "Tổng Quan",
    icon: LayoutDashboard,
    roles: ["ADMIN", "SALES_STAFF", "TECHNICIAN"],
  },
  {
    id: "devices",
    label: "Máy Ấp",
    icon: Settings,
    roles: ["ADMIN", "SALES_STAFF", "TECHNICIAN"],
  },
  {
    id: "incubator-models",
    label: "Dòng Máy",
    icon: Box,
    roles: ["ADMIN", "TECHNICIAN"],  // chỉ ADMIN & TECHNICIAN
  },
  {
    id: "sales",
    label: "Đơn Hàng",
    icon: ShoppingCart,
    roles: ["ADMIN", "SALES_STAFF"],
  },
  {
    id: "templates",
    label: "Template Ấp",
    icon: FileText,
    roles: ["ADMIN", "TECHNICIAN"],
  },
  {
    id: "maintenance",
    label: "Bảo Trì",
    icon: Wrench,
    roles: ["ADMIN", "TECHNICIAN"],
  },
  {
    id: "warranty",
    label: "Bảo Hành",
    icon: Shield,
    roles: ["ADMIN", "SALES_STAFF", "TECHNICIAN"],
  },
  {
    id: "users",
    label: "Người Dùng",
    icon: Users,
    roles: ["ADMIN"],
  },
];

export const getNavigationForRole = (role?: string | null) => {
  return navigationItems.filter((item) => role && item.roles.includes(role as UserRole));
};

export const canAccessPage = (page: PageType, role?: string | null) => {
  const item = navigationItems.find((navItem) => navItem.id === page);
  return Boolean(item && role && item.roles.includes(role as UserRole));
};