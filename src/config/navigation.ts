import {
  Box,
  FileText,
  Egg,
  LayoutDashboard,
  Settings,
  Shield,
  ShoppingCart,
  Users,
  Wrench,
  Database,
  BrainCircuit,
} from "lucide-react";
import type { ElementType } from "react";
import type { UserRole } from "@/types/user";

export type PageType =
  | "dashboard"
  | "devices"
  | "incubator-models"
  | "sales"
  | "templates"
  | "hatching-seasons"
  | "maintenance"
  | "users"
  | "warranty"
  | "rag-data"
  | "ml-training";

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
    id: "hatching-seasons",
    label: "Mùa Ấp",
    icon: Egg,
    roles: ["ADMIN", "TECHNICIAN"],
  },
  {
    id: "maintenance",
    label: "Hỗ Trợ Kỹ Thuật",
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
  {
    id: "rag-data",
    label: "Dữ Liệu RAG",
    icon: Database,
    roles: ["ADMIN"],
  },
  {
    id: "ml-training",
    label: "ML Training",
    icon: BrainCircuit,
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