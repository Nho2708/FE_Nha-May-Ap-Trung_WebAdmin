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

export interface MlSyncResponse {
  clearedCacheGroups: number;
  clearedSyntheticCache: number;
  clearedPrebuiltModelCache: number;
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
  syncTraining() {
    return http.post<MlSyncResponse>("/ai/training/sync");
  },
};
