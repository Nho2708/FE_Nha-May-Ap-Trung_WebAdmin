import { http } from "@/services/http";
import type { PagedResult } from "@/types/api";
import type { CreateUserPayload, UpdateUserPayload, User, UserRole, UserStatus } from "@/types/user";

interface ListUsersParams {
  role?: UserRole | "all";
  status?: UserStatus | "all";
  page?: number;
  pageSize?: number;
}

const buildUserQuery = ({ role, status, page = 1, pageSize = 100 }: ListUsersParams) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (role && role !== "all") {
    params.set("role", role);
  }

  if (status && status !== "all") {
    params.set("status", status);
  }

  return params.toString();
};

export const userService = {
  list(params: ListUsersParams = {}) {
    return http.get<PagedResult<User>>(`/users?${buildUserQuery(params)}`);
  },
  create(payload: CreateUserPayload) {
    return http.post<string>("/users", payload);
  },
  update(id: string, payload: UpdateUserPayload) {
    return http.put<boolean>(`/users/${id}`, payload);
  },
};
