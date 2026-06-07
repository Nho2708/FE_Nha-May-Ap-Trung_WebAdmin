export type BaseStatus = "ACTIVE" | "INACTIVE" | "DELETED";

export interface HatchingSeasonTemplate {
  id: string;
  customerId: string | null;
  name: string;
  description: string | null;
  totalDays: number;
  eggType: string | null;
  isActive: boolean;
  createdByType: string;
  status: BaseStatus;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface HatchingSeasonTemplateBatch {
  id: string;
  templateId: string;
  batchIndex: number;
  name: string | null;
  numberOfDays: number;
  notes: string | null;
  status: BaseStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface HatchingSeasonTemplateBatchConfig {
  id: string;
  templateBatchId: string;
  configId: string;
  targetValue: number | null;
  minValue: number | null;
  maxValue: number | null;
  status: BaseStatus;
}

export interface TemplateBatchDetail {
  batch: HatchingSeasonTemplateBatch | null;
  configs: HatchingSeasonTemplateBatchConfig[];
}

export interface HatchingSeasonTemplateDetail {
  template: HatchingSeasonTemplate | null;
  batches: TemplateBatchDetail[];
}

export interface BatchConfigItemPayload {
  configId: string;
  targetValue?: number;
  minValue?: number;
  maxValue?: number;
}

export interface TemplateBatchItemPayload {
  batchIndex: number;
  name?: string;
  numberOfDays: number;
  notes?: string;
  configs?: BatchConfigItemPayload[];
}

export interface CreateHatchingSeasonTemplatePayload {
  customerId?: string;
  name: string;
  description?: string;
  eggType?: string;
  createdByType: string;
  batches?: TemplateBatchItemPayload[];
}

export interface UpdateHatchingSeasonTemplatePayload {
  name?: string;
  description?: string;
  eggType?: string;
  isActive?: boolean;
  batches?: TemplateBatchItemPayload[];
}

// ─── HatchingSeason (thực tế khách dùng) ─────────────────────────────────────

export type HatchingSeasonStatus = "ACTIVE" | "COMPLETED" | "FAILED" | "CANCELLED";

export interface HatchingSeason {
  id: string;
  incubatorId: string;
  templateId: string | null;
  seasonCode: string;
  name: string | null;
  eggType: string | null;
  startDate: string;
  endDate: string | null;
  totalEggs: number | null;
  successCount: number;
  failCount: number;
  notes: string | null;
  status: HatchingSeasonStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface HatchingBatch {
  id: string;
  seasonId: string;
  batchIndex: number;
  name: string | null;
  dayStart: number;
  dayEnd: number;
  actualStartAt: string | null;
  actualEndAt: string | null;
  status: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface HatchingBatchConfig {
  id: string;
  batchId: string;
  configId: string;
  targetValue: number | null;
  minValue: number | null;
  maxValue: number | null;
  status: string;
}

export interface HatchingBatchDetail {
  batch: HatchingBatch;
  configs: HatchingBatchConfig[];
}

export interface HatchingSeasonDetail {
  season: HatchingSeason;
  template: HatchingSeasonTemplate | null;
  batches: HatchingBatchDetail[];
}

export interface CreateHatchingSeasonPayload {
  incubatorId: string;
  templateId?: string;
  name?: string;
  eggType?: string;
  startDate: string;
  totalEggs?: number;
  notes?: string;
}

export interface UpdateHatchingSeasonPayload {
  endDate?: string;
  totalEggs?: number;
  successCount?: number;
  failCount?: number;
  notes?: string;
}

export interface UpdateHatchingSeasonStatusPayload {
  status: string;
}

export interface BatchConfigPayload {
  configId: string;
  targetValue?: number;
  minValue?: number;
  maxValue?: number;
}

export interface CreateHatchingBatchPayload {
  seasonId: string;
  batchIndex: number;
  name?: string;
  dayStart: number;
  dayEnd: number;
  notes?: string;
  configs: BatchConfigPayload[];
}

export interface UpdateHatchingBatchPayload {
  name?: string;
  dayStart?: number;
  dayEnd?: number;
  actualStartAt?: string;
  actualEndAt?: string;
  status?: string;
  configs?: BatchConfigPayload[];
}
