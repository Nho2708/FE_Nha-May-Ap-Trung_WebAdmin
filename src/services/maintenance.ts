import { http } from "@/services/http";
import type { PagedResult } from "@/types/api";
import type {
  CreateMaintenanceTicketPayload,
  MaintenanceLog,
  MaintenanceTicket,
  MaintenanceTicketDetail,
  MaintenanceTicketStatus,
} from "@/types/maintenance";

interface ListMaintenanceParams {
  status?: MaintenanceTicketStatus | "all";
  page?: number;
  pageSize?: number;
}

const buildMaintenanceQuery = ({
  status,
  page = 1,
  pageSize = 10,
}: ListMaintenanceParams) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });

  if (status && status !== "all") {
    params.set("status", status);
  }

  return params.toString();
};

export const maintenanceService = {
  list(params: ListMaintenanceParams = {}) {
    return http.get<PagedResult<MaintenanceTicket>>(
      `/maintenance-tickets?${buildMaintenanceQuery(params)}`,
    );
  },
  getById(id: string) {
    return http.get<MaintenanceTicketDetail>(`/maintenance-tickets/${id}`);
  },
  create(payload: CreateMaintenanceTicketPayload) {
    return http.post<string>("/maintenance-tickets", payload);
  },
  updateStatus(id: string, status: MaintenanceTicketStatus, resolutionSummary?: string) {
    return http.put<boolean>(`/maintenance-tickets/${id}/status`, {
      status,
      resolutionSummary: resolutionSummary?.trim() || undefined,
    });
  },
  addLog(id: string, description: string) {
    return http.post<string>(`/maintenance-tickets/${id}/logs`, {
      description,
    });
  },
  getLogs(id: string) {
    return http.get<MaintenanceLog[]>(`/maintenance-tickets/${id}/logs`);
  },
};
