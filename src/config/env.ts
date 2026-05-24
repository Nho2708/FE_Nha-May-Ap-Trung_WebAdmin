const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const readEnv = (key: string, fallback = "") => {
  const value = import.meta.env[key as keyof ImportMetaEnv];
  return typeof value === "string" ? value.trim() : fallback;
};

const apiBaseUrl = trimTrailingSlash(
  readEnv("VITE_API_BASE_URL", "https://api-incusmart.io.vn/api"),
);

const aiApiUrl = trimTrailingSlash(
  readEnv("VITE_AI_API_URL", `${apiBaseUrl}/ai`),
);

export const env = {
  appName: readEnv("VITE_APP_NAME", "Web Admin Dashboard"),
  apiBaseUrl,
  aiApiUrl,
} as const;

export const apiEndpoints = {
  devices: `${env.apiBaseUrl}/devices`,
  orders: `${env.apiBaseUrl}/orders`,
  templates: `${env.apiBaseUrl}/templates`,
  maintenanceTickets: `${env.apiBaseUrl}/maintenance-tickets`,
  users: `${env.apiBaseUrl}/users`,
  warranty: `${env.apiBaseUrl}/warranty`,
  aiChat: env.aiApiUrl,
} as const;
