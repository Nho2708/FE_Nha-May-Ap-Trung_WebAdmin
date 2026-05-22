export type OrderStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "EXPIRED";
export type OrderItemStatus = "PENDING_ASSIGNMENT" | "ASSIGNED" | "CANCELLED";

export interface SalesOrder {
  id: string;
  orderCode: string | null;
  customerId: string | null;
  orderDate: string | null;
  shippingAddress: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentOrderCode: number | null;
  paymentLinkId: string | null;
  checkoutUrl: string | null;
  paymentLinkCreatedAt: string | null;
  paymentLinkExpiredAt: string | null;
  paidAt: string | null;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface SalesOrderItem {
  id: string;
  orderId: string;
  incubatorModelId: string;
  incubatorId: string | null;
  unitPrice: number;
  status: OrderItemStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface SalesOrderDetail {
  order: SalesOrder | null;
  items: SalesOrderItem[];
}

export interface CreateOrderResponse {
  orderId: string;
  orderCode: string | null;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentOrderCode: number | null;
  paymentLinkId: string | null;
  checkoutUrl: string | null;
}

export interface OrderItemPayload {
  incubatorModelId: string;
  quantity: number;
}

export interface CreateOrderByGuestPayload {
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  description?: string;
  verificationPass: string;
  items: OrderItemPayload[];
}

export interface AssignIncubatorPayload {
  orderItemId: string;
  incubatorId: string;
}
