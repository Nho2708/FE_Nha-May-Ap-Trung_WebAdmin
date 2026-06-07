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
  totalDays: number;
  eggType?: string;
  createdByType: string;
  batches?: TemplateBatchItemPayload[];
}

export interface UpdateHatchingSeasonTemplatePayload {
  name?: string;
  description?: string;
  totalDays?: number;
  eggType?: string;
  isActive?: boolean;
  batches?: TemplateBatchItemPayload[];
}
