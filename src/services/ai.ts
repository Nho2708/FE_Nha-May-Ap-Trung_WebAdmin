import { http } from "@/services/http";

export interface RagStatus {
  collectionName: string;
  totalChunks: number;
  provider: string;
}

export interface RagUploadResponse {
  filename: string;
  chunksAdded: number;
  totalChunksInCollection: number;
  message: string;
}

export interface MlTrainingPhaseParameter {
  configCode: string;
  targetValue: number;
  minValue: number;
  maxValue: number;
}

export interface MlTrainingPhase {
  phaseIndex: number;
  phaseName: string;
  dayStart: number;
  dayEnd: number;
  parameters: MlTrainingPhaseParameter[];
}

export interface MlTrainingAddRequest {
  eggType: string;
  totalEggs: number;
  expectedSuccessRate: number;
  ambientTemperature?: number;
  ambientHumidity?: number;
  phases: MlTrainingPhase[];
}

export interface MlTrainingAddResponse {
  recordsAdded: number;
  totalRecords: number;
  validationIssues: string[];
  message: string;
}

export const aiService = {
  getRagStatus() {
    return http.get<RagStatus>("/ai/rag/status");
  },
  uploadRagDocument(file: File) {
    const form = new FormData();
    form.append("file", file);
    return http.post<RagUploadResponse>("/ai/rag/upload", form);
  },
  addTrainingData(request: MlTrainingAddRequest) {
    return http.post<MlTrainingAddResponse>("/ai/training/data", request);
  },
};
