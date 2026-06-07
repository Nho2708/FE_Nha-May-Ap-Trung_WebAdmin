import type { UserRole } from "@/types/user";

export type ResourceKey =
  | "users"
  | "incubators"
  | "incubator_models"
  | "orders"
  | "templates"
  | "maintenance"
  | "warranties";

export type PermissionAction = "create" | "edit" | "delete";

const permissions: Record<ResourceKey, Partial<Record<PermissionAction, UserRole[]>>> = {
  users: {
    create: ["ADMIN"],
    edit: ["ADMIN"],
  },
  incubators: {
    create: ["ADMIN", "TECHNICIAN"],
    edit: ["ADMIN", "TECHNICIAN"],
  },
  incubator_models: {
    create: ["ADMIN", "TECHNICIAN"],
    edit: ["ADMIN", "TECHNICIAN"],
    delete: ["ADMIN", "TECHNICIAN"],
  },
  orders: {
    edit: ["ADMIN", "SALES_STAFF"],
  },
  templates: {
    create: ["ADMIN", "TECHNICIAN"],
    edit: ["ADMIN", "TECHNICIAN"],
  },
  maintenance: {
    create: ["ADMIN", "TECHNICIAN"],
    edit: ["ADMIN", "TECHNICIAN"],
  },
  warranties: {
    create: ["ADMIN", "SALES_STAFF"],
  },
};

export const can = (
  role: string | null | undefined,
  resource: ResourceKey,
  action: PermissionAction,
) => {
  const allowedRoles = permissions[resource][action] ?? [];
  return Boolean(role && allowedRoles.includes(role as UserRole));
};