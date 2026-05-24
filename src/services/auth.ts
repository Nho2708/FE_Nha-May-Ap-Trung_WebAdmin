import { env } from "@/config/env";
import { ApiError, type ApiResponse } from "@/types/api";
import type { UserRole } from "@/types/user";

const ACCESS_TOKEN_KEY = "incusmart_access_token";
const AUTH_EVENT = "incusmart-auth-changed";

const notifyAuthChanged = () => {
  window.dispatchEvent(new Event(AUTH_EVENT));
};

const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const NAME_CLAIM = "unique_name";
const SUBJECT_CLAIM = "sub";

const decodeJwtPayload = (token: string) => {
  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = window.atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "="));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const getRoleFromToken = (token: string): UserRole | null => {
  const payload = decodeJwtPayload(token);
  const role = payload?.[ROLE_CLAIM] ?? payload?.role;

  return typeof role === "string" ? (role as UserRole) : null;
};

const getUsernameFromToken = (token: string) => {
  const payload = decodeJwtPayload(token);
  const username = payload?.[NAME_CLAIM] ?? payload?.name ?? payload?.username;

  return typeof username === "string" ? username : null;
};

const getUserIdFromToken = (token: string) => {
  const payload = decodeJwtPayload(token);
  const userId = payload?.[SUBJECT_CLAIM];

  return typeof userId === "string" ? userId : null;
};

const postLogin = async (path: string, username: string, password: string) => {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const rawBody = await response.text();
  let payload: ApiResponse<string> | null = null;

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody) as ApiResponse<string>;
    } catch {
      payload = null;
    }
  }

  if (!response.ok || !payload || payload.statusCode !== "200") {
    throw new ApiError(
      payload?.message || `Không thể đăng nhập. Máy chủ trả về trạng thái ${response.status}.`,
      response.status,
      payload?.statusCode,
    );
  }

  return payload.data;
};

export const authStorage = {
  getAccessToken() {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getSession() {
    const token = this.getAccessToken();

    if (!token) {
      return null;
    }

    const role = getRoleFromToken(token);

    if (!role) {
      return null;
    }

    return {
      token,
      role,
      username: getUsernameFromToken(token),
      userId: getUserIdFromToken(token),
    };
  },
  setAccessToken(token: string) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
    notifyAuthChanged();
  },
  clearAccessToken() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    notifyAuthChanged();
  },
  subscribe(listener: () => void) {
    window.addEventListener(AUTH_EVENT, listener);
    window.addEventListener("storage", listener);

    return () => {
      window.removeEventListener(AUTH_EVENT, listener);
      window.removeEventListener("storage", listener);
    };
  },
};

export const authService = {
  async login(username: string, password: string) {
    if (username === "admin" && password === "admin") {
      return postLogin("/auth/admin/login", username, password);
    }

    return postLogin("/auth/login", username, password);
  },
  logout() {
    authStorage.clearAccessToken();
  },
};
