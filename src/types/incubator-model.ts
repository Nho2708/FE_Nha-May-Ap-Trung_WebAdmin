export interface IncubatorModelConfig {
  configId: string;
  configCode: string | null;
  configName: string | null;
  configUnit: string | null;
  quantity: number | null;
  required: boolean | null;
  absoluteMin: number | null;
  absoluteMax: number | null;
}

export interface IncubatorModel {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  modelCode: string;
  name: string;
  description: string | null;
  unitPrice: number;
  imageUrl: string | null;
  configs?: IncubatorModelConfig[];
}
