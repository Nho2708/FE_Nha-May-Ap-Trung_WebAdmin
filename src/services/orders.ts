import { http } from "@/services/http";
import type { PagedResult } from "@/types/api";
import type {
  SalesOrder,
  SalesOrderDetail,
  CreateOrderResponse,
  CreateOrderByGuestPayload,
  AssignIncubatorPayload,
} from "@/types/order";

interface ListOrderParams {
  status?: string;
  customerId?: string;
  page?: number;
  pageSize?: number;
}

const buildQuery = ({ status, customerId, page = 1, pageSize = 10 }: ListOrderParams) => {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  if (status) params.set("status", status);
  if (customerId) params.set("customerId", customerId);
  return params.toString();
};

export const orderService = {
  list(params: ListOrderParams = {}) {
    return http.get<PagedResult<SalesOrder>>(`/orders?${buildQuery(params)}`);
  },
  getById(id: string) {
    return http.get<SalesOrderDetail | null>(`/orders/${id}`);
  },
  createByGuest(payload: CreateOrderByGuestPayload) {
    return http.post<CreateOrderResponse>("/orders/guest", payload);
  },
  ship(orderId: string) {
    return http.post<boolean>(`/orders/${orderId}/ship`);
  },
  complete(orderId: string) {
    return http.post<boolean>(`/orders/${orderId}/complete`);
  },
  cancel(orderId: string) {
    return http.post<boolean>(`/orders/${orderId}/cancel`);
  },
  assignIncubator(orderId: string, payload: AssignIncubatorPayload) {
    return http.post<boolean>(`/orders/${orderId}/items/assign`, payload);
  },
};
