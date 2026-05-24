import { env } from "@/config/env";
import { authStorage } from "@/services/auth";
import { ApiError, type ApiResponse } from "@/types/api";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | object | null;
};

const buildUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return `${env.apiBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

const buildHeaders = (body: RequestOptions["body"], headers?: HeadersInit) => {
  const nextHeaders = new Headers(headers);
  nextHeaders.set("Accept", "application/json");

  if (body && !(body instanceof FormData) && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  const token = authStorage.getAccessToken();
  if (token && !nextHeaders.has("Authorization")) {
    nextHeaders.set("Authorization", `Bearer ${token}`);
  }

  return nextHeaders;
};

const parseResponse = async <T>(response: Response) => {
  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? ((await response.json()) as ApiResponse<T>) : null;

  if (!response.ok) {
    if (response.status === 401) {
      authStorage.clearAccessToken();
    }

    throw new ApiError(
      payload?.message || `Request failed with status ${response.status}`,
      response.status,
      payload?.statusCode,
    );
  }

  if (!payload) {
    throw new ApiError("Response is not JSON", response.status);
  }

  if (payload.statusCode !== "200") {
    throw new ApiError(payload.message || "Request failed", response.status, payload.statusCode);
  }

  return payload.data;
};

export const http = {
  async request<T>(path: string, options: RequestOptions = {}) {
    const { body, headers, ...rest } = options;

    const response = await fetch(buildUrl(path), {
      ...rest,
      headers: buildHeaders(body, headers),
      body:
        body && !(body instanceof FormData) && typeof body !== "string"
          ? JSON.stringify(body)
          : (body ?? undefined),
    });

    return parseResponse<T>(response);
  },
  get<T>(path: string, headers?: HeadersInit) {
    return this.request<T>(path, { method: "GET", headers });
  },
  post<T>(path: string, body?: RequestOptions["body"], headers?: HeadersInit) {
    return this.request<T>(path, { method: "POST", body, headers });
  },
  put<T>(path: string, body?: RequestOptions["body"], headers?: HeadersInit) {
    return this.request<T>(path, { method: "PUT", body, headers });
  },
};
