export type IncubatorStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "ACTIVE"
  | "REPLACEMENT_PENDING"
  | "IN_MAINTENANCE"
  | "DAMAGED"
  | "RETIRED";

export interface Incubator {
  id: string;
  status: IncubatorStatus | string;
  createdAt: string;
  updatedAt: string | null;
  qrCode: string;
  modelId: string;
  customerId: string | null;
  activatedAt: string | null;
}

export interface CreateIncubatorPayload {
  modelId: string;
  quantity: number;
}
