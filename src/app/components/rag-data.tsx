import React, { useState, useEffect, useRef } from "react";
import { Upload, RefreshCw, AlertCircle, CheckCircle, Database, FileText, Layers } from "lucide-react";
import { aiService, type RagStatus, type RagUploadResponse } from "@/services/ai";

const ACCEPTED = ".txt,.md,.pdf";

export function RagData() {
  const [status, setStatus] = useState<RagStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<RagUploadResponse | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const fetchStatus = async () => {
    setStatusLoading(true);
    setStatusError(null);
    try {
      const data = await aiService.getRagStatus();
      setStatus(data);
    } catch (err: unknown) {
      setStatusError(err instanceof Error ? err.message : "Không thể tải trạng thái RAG");
    } finally {
      setStatusLoading(false);
    }
  };

  useEffect(() => { fetchStatus(); }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadResult(null);
    setUploadError(null);
    setFile(e.target.files?.[0] ?? null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    setUploadError(null);
    try {
      const result = await aiService.uploadRagDocument(file);
      setUploadResult(result);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      fetchStatus();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Upload thất bại");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Dữ Liệu RAG</h2>
        <button
          onClick={fetchStatus}
          disabled={statusLoading}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          title="Làm mới"
        >
          <RefreshCw size={16} className={statusLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Database size={16} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-800">Trạng Thái Collection</h3>
        </div>
        {statusError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle size={14} /> {statusError}
          </div>
        )}
        {statusLoading && !status && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            Đang tải...
          </div>
        )}
        {status && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Collection</p>
              <p className="text-sm font-semibold text-slate-800 break-all">{status.collectionName}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Layers size={12} className="text-blue-500" />
                <p className="text-xs text-slate-500">Tổng chunks</p>
              </div>
              <p className="text-xl font-bold text-blue-700">{status.totalChunks.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Provider</p>
              <p className="text-sm font-semibold text-slate-800">{status.provider}</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Upload size={16} className="text-purple-600" />
          <h3 className="text-sm font-semibold text-slate-800">Upload Tài Liệu</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">Hỗ trợ định dạng: <span className="font-medium">.txt, .md, .pdf</span></p>

        <div
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            file ? "border-purple-400 bg-purple-50" : "border-slate-300 hover:border-purple-400 hover:bg-purple-50/40"
          }`}
        >
          <FileText size={32} className={`mx-auto mb-2 ${file ? "text-purple-500" : "text-slate-300"}`} />
          {file ? (
            <p className="text-sm font-medium text-purple-700">{file.name}</p>
          ) : (
            <p className="text-sm text-slate-500">Nhấn để chọn file</p>
          )}
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {uploadError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <AlertCircle size={14} /> {uploadError}
          </div>
        )}

        {uploadResult && (
          <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-4 space-y-1">
            <div className="flex items-center gap-2 text-green-700 font-medium text-sm mb-2">
              <CheckCircle size={15} /> Upload thành công
            </div>
            <p className="text-xs text-slate-600">File: <span className="font-medium">{uploadResult.filename}</span></p>
            <p className="text-xs text-slate-600">Chunks thêm vào: <span className="font-medium text-blue-700">{uploadResult.chunksAdded}</span></p>
            <p className="text-xs text-slate-600">Tổng chunks hiện tại: <span className="font-medium text-blue-700">{uploadResult.totalChunksInCollection}</span></p>
            <p className="text-xs text-slate-500 italic mt-1">{uploadResult.message}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="mt-4 w-full py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading
            ? <><div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Đang upload...</>
            : <><Upload size={15} /> Upload tài liệu</>}
        </button>
      </div>
    </div>
  );
}
