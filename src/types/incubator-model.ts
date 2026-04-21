export interface IncubatorModel {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string | null;
  modelCode: string;
  name: string;
  description: string | null;
}
