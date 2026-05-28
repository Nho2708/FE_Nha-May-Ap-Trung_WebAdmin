export type MaintenanceTicketStatus =
  | "PENDING"
  | "ASSIGNED"
  | "AWAITING_PAYMENT"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED"
  | "CANCELLED"
  | "CLOSED";

export type ConfigCondition = "NORMAL" | "USER_DAMAGE" | "MANUFACTURING_DEFECT";

export interface MaintenanceTicket {
  id: string;
  status: MaintenanceTicketStatus | string;
  createdAt: string;
  updatedAt: string | null;
  incubatorId: string;
  warrantyId: string | null;
  requestedByCustomerId: string | null;
  technicianId: string | null;
  issueDescription: string;
  resolutionSummary: string | null;
  assignedAt: string | null;
  startedAt: string | null;
  resolvedAt: string | null;
  rejectedAt: string | null;
  cancelledAt: string | null;
  closedAt: string | null;
  // payment
  totalAmount: number;
  paymentStatus: string | null;
  paymentOrderCode: number | null;
  paymentLinkId: string | null;
  qrCode: string | null;
  paymentLinkCreatedAt: string | null;
  paymentLinkExpiredAt: string | null;
  paidAt: string | null;
}

export interface WarrantySummary {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  incubatorId: string;
  warrantyCode: string | null;
  startDate: string | null;
  endDate: string | null;
  notes: string | null;
}

export interface MaintenanceLog {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  ticketId: string;
  performedByUserId: string | null;
  description: string | null;
}

export interface MaintenanceTicketConfigItem {
  id: string;
  ticketId: string;
  configId: string;
  configName: string;
  configCode: string;
  configUnit: string | null;
  condition: ConfigCondition | string;
  marketPrice: number;
  finalPrice: number;
  note: string | null;
}

export interface MaintenanceTicketDetail {
  ticket: MaintenanceTicket | null;
  warranty: WarrantySummary | null;
  logs: MaintenanceLog[];
  configItems: MaintenanceTicketConfigItem[];
}

export interface ModelConfigWithDetail {
  modelConfigId: string;
  configId: string;
  configCode: string;
  configName: string;
  configType: string | null;
  configUnit: string | null;
  quantity: number | null;
  required: boolean | null;
}

export interface CreateMaintenanceTicketPayload {
  incubatorId: string;
  technicianId?: string;
  issueDescription: string;
}

export interface ConfigAssessmentItem {
  configId: string;
  condition: ConfigCondition;
  marketPrice: number;
  note?: string;
}

export interface AssessConfigsPayload {
  items: ConfigAssessmentItem[];
}

export interface MaintenanceTicketPaymentResponse {
  ticketId: string;
  totalAmount: number;
  requiresPayment: boolean;
  paymentStatus: string | null;
  paymentOrderCode: number | null;
  paymentLinkId: string | null;
  qrCode: string | null;
  paymentLinkExpiredAt: string | null;
}
