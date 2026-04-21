export type MaintenanceTicketStatus =
  | "PENDING"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED"
  | "CANCELLED"
  | "CLOSED";

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
}

export interface WarrantySummary {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  incubatorId: string;
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

export interface MaintenanceTicketDetail {
  ticket: MaintenanceTicket | null;
  warranty: WarrantySummary | null;
  logs: MaintenanceLog[];
}

export interface CreateMaintenanceTicketPayload {
  incubatorId: string;
  technicianId?: string;
  issueDescription: string;
}
