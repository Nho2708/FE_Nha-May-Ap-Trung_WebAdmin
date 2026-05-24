export type UserRole = "ADMIN" | "TECHNICIAN" | "SALES_STAFF" | "CUSTOMER";
export type UserStatus = "ACTIVE" | "DEACTIVE";

export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string | null;
  phone: string;
  role: UserRole | string;
  status: UserStatus | string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  phone: string;
  role: UserRole;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
}
