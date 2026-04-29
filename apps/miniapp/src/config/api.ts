type ApiEnv = "dev" | "test" | "prod";

interface RuntimeApiConfig {
  env: ApiEnv;
  baseUrl: string;
}

const env = (import.meta.env.VITE_API_ENV as ApiEnv | undefined) ?? "dev";
const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4100";

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function getOverrideBaseUrl() {
  try {
    const override = uni.getStorageSync("pet-api-base-url");
    return typeof override === "string" && override.trim() ? normalizeBaseUrl(override.trim()) : "";
  } catch {
    return "";
  }
}

const runtimeApiConfig: RuntimeApiConfig = {
  env,
  baseUrl: getOverrideBaseUrl() || normalizeBaseUrl(defaultBaseUrl)
};

export function getApiConfig() {
  return runtimeApiConfig;
}

export function buildApiUrl(path: string) {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return `${runtimeApiConfig.baseUrl}${safePath}`;
}

export function isLocalApi() {
  return /localhost|127\.0\.0\.1/.test(runtimeApiConfig.baseUrl);
}

