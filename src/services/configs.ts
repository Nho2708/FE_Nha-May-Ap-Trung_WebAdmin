import { http } from "@/services/http";
import type { PagedResult } from "@/types/api";

export interface Config {
  id: string;
  code: string;
  name: string;
  type: string | null;
  unit: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export const configService = {
  list(params: { search?: string; page?: number; pageSize?: number } = {}) {
    const p = new URLSearchParams({
      page: String(params.page ?? 1),
      pageSize: String(params.pageSize ?? 20),
    });
    if (params.search?.trim()) p.set("search", params.search.trim());
    return http.get<PagedResult<Config>>(`/configs?${p.toString()}`);
  },
};